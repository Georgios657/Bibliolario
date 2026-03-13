package bookClubWebseite;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import bookClubWebseite.BookClubBook.Book;
import bookClubWebseite.BookClubBook.BookService;
import bookClubWebseite.BookClubDTO.BookAverageDTO;
import bookClubWebseite.BookClubDTO.CommentDTO;
import bookClubWebseite.BookClubDTO.MessageDTO;
import bookClubWebseite.BookClubGroup.Group;
import bookClubWebseite.BookClubGroup.GroupService;
import bookClubWebseite.BookClubMessage.EmailService;
import bookClubWebseite.BookClubMessage.Message;
import bookClubWebseite.BookClubMessage.MessageService;
import bookClubWebseite.BookClubRating.RatingClass;
import bookClubWebseite.BookClubRating.RatingService;
import bookClubWebseite.BookClubReader.BookReader;
import bookClubWebseite.BookClubReader.BookReaderService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Controller
public class BookClubController {
	@Autowired 
	private MessageService messageService;
	
	@Autowired
	private EmailService mailService;
	
	@Autowired
	private BookReaderService bookReaderService;
	
	@Autowired
	private BookService bookService;
	
	@Autowired
	private GroupService groupService;
	
	@Autowired
	private RatingService ratingService;

	@PostMapping("/messages/{id}/accept")
	@ResponseBody
	public void acceptInvite(@PathVariable Long id, Authentication auth) {
		System.out.println("Füge Benutzer hinzu");
	    BookReader user = bookReaderService.findByUsername(auth.getName());
	    Message msg= messageService.acceptInvitation(id);
	    groupService.addNewMember(user, msg.getGroupId());
	    messageService.deleteMessage(id);
	}
	
	@PostMapping("/messages/{id}/decline")
	@ResponseBody
	public void declineInvite(@PathVariable Long id, Authentication auth) {
		System.out.println("Lösche Nachricht");
	    messageService.deleteMessage(id);
	}
	
	@GetMapping("/headerData")
	public void headerData(Model model, Authentication auth) {
	    BookReader user = bookReaderService.findByUsername(auth.getName());
	    model.addAttribute("messages", messageService.getInbox(user));
	}
	
	@GetMapping("/csrf-token")
	@ResponseBody
	public Map<String, String> csrf(CsrfToken token) {
	    return Map.of(
	        "token", token.getToken(),
	        "headerName", token.getHeaderName()
	    );
	}

	@GetMapping("/messages/inbox")
	@ResponseBody
	public List<MessageDTO> getInbox(Authentication auth) {
	    BookReader user = bookReaderService.findByUsername(auth.getName());
	    List<Message> inbox = messageService.getInbox(user);

	    // DTO nur mit benötigten Feldern
	    return inbox.stream()
	                .map(msg -> new MessageDTO(
	                        msg.getId(),
	                        msg.getSender().getUsername(),
	                        msg.getSubject(),
	                        msg.getSentAt(),
	                        msg.getContent(),
	                        msg.isInvitation(),
	                        msg.getGroupId()
	                        
	                ))
	                .collect(Collectors.toList());
	}

	@GetMapping("/messages/{id}")
	@ResponseBody
	public MessageDTO getMessage(@PathVariable Long id) {
	    Message msg = messageService.findById(id);
	    return new MessageDTO(msg.getId(), msg.getSender().getUsername(), msg.getSubject(), msg.getSentAt(), msg.getContent(), msg.isInvitation(), msg.getGroupId());
	}
	
	@PostMapping("/groups/{id}/invite")
	public String inviteMember(@PathVariable Long id,
	                           @RequestParam String username,
	                           @RequestParam String message,
	                           Authentication authentication,
	                           RedirectAttributes redirectAttributes) {
	    BookReader inviter = bookReaderService.findByUsername(authentication.getName());
	    BookReader invitee = bookReaderService.findByUsername(username);
	    Group groupJoin = groupService.findById(id);
	    messageService.inviteMembertoGroup(groupJoin, invitee, message, inviter);
	    redirectAttributes.addFlashAttribute("success", "Einladung gesendet!");
	    return "redirect:/groups/" + id;
	}
	
	@GetMapping("/groupMain")
	public String groupMain(Model model,Authentication authentication) {
		String name = authentication.getName();
		List<Group> groups = groupService.findGroupWhereMember(bookReaderService.findByUsername(name));
        model.addAttribute("groups", groups);
		return "groupMain";
	}

	@GetMapping("/groups/{id}/addBook")
	public String addAllGroupBooks(@PathVariable Long id, Authentication authentication) {
		String name = authentication.getName();
		BookReader reader = bookReaderService.findByUsername(name);
		
		List<Book> bookListe = groupService.findById(id).getBooklist();
		
		bookListe.forEach(b -> ratingService.addRating(b, reader));
		
	    return "redirect:/groupMain";
	}
	
	@PostMapping("/groups/{id}/leave")
	public String leaveGroup(@PathVariable Long id, Authentication authentication) {
		System.out.println("Verlasse Gruppe");
		String name = authentication.getName();
		BookReader reader = bookReaderService.findByUsername(name);

		groupService.deleteMember(reader, id);
	    return "redirect:/groupMain";
	}

    @PostMapping("/groups/{id}") //Anhand des Such Strings fügt er das Buch zu der Ratingliste hinzu und initialisert es mit 0 Werten, danach wird zurück auf die Seite verlinkt, sodass sie dort bewertet werden kann
    public String collectionAddToGroup(@PathVariable Long id, @RequestParam("search") String search, Model model) {
    	Group groupBook = groupService.findById(id);
    	
    	List<Book> book = bookService.findByISBNORTitel(search);
    	
    	if (book.size() == 1) {
        	groupBook.addBook(book.getFirst());
        	System.out.println(book.get(0).getBookName()+" hinzugefügt");
        	groupService.save(groupBook);
        	return "redirect:/groups/"+id;    				
    	}
    	
    	if (book.size() > 1) {
    		model.addAttribute("books", book);
    		return "selectBookGroup";
    	}
    	

        model.addAttribute("errorMessage", "Kein Buch gefunden");
    	return "redirect:/groups/"+id;   
    }
    
    @PostMapping("/collectionAddMultipleGroup") //Auswahl an Büchern hinzufügen
    public String addMultipleToGroup(@RequestParam("selectedBooks") List<String> selectedBooks,
            @RequestParam("redirectPath") String redirectPath,
            @RequestParam(name="groupId", required=false) Long groupId,
            Authentication authentication) {
    	
        Group bookGroup = groupService.findById(groupId);

        for (String bookId : selectedBooks) {
            Book book = bookService.findByISBN(bookId);
            bookGroup.addBook(book);
        }

        return "redirect:" + redirectPath;
    }
    
    
	@PostMapping("/groups/{id}/delete")
	public String deleteGroup(@PathVariable Long id) {
		groupService.deleteGroupById(id);
		return "redirect:/groupMain";
	}
	
	@PostMapping("/groups/{groupId}/transferAdmin/{newAdminId}")
	public ResponseEntity<?>  transferAdmin(@PathVariable Long groupId, @PathVariable Long newAdminId) {
		BookReader admin = bookReaderService.findById(newAdminId);
		System.out.println("Übertrage Admin auf..."+admin.getUsername());
		groupService.transferAdmin(groupId, admin);
		 return ResponseEntity.ok("Admin erfolgreich übertragen");
	}	
	
	@GetMapping("/groups/{id}")
	public String loadParticularGroup (@PathVariable Long id, Model model, Authentication authentication) {
		


    	
    	
		String name = authentication.getName();
		Group group = groupService.findById(id);
	    if (group == null) {
	        throw new RuntimeException("Group with id " + id + " not found");
	    }
		List<BookAverageDTO> averageBook = ratingService.getAllBooksAverageOfList(group.getMembers(), group.getBooklist());
	    System.out.println("Liste hat länge von"+ group.getBooklist().size());
		model.addAttribute("group", group);
		model.addAttribute("currentUser", bookReaderService.findByUsername(name));
    	model.addAttribute("avgBook", averageBook);
		return "groupPage";
		
	}
	
	@PostMapping("/groupmain/new")
	public String settingUpNewGroup(@RequestParam String groupName, Authentication authentication) {
		String name = authentication.getName();
		groupService.addNewGroup(groupName, bookReaderService.findByUsername(name));
	    return "redirect:/groupMain";
		
	}
	
	@GetMapping("/userSettings")
	public String userSettings() {

		return "userSettings";
	}

	@PostMapping("/settings/delete")
	public String deleteUser(Authentication authentication, HttpServletRequest request, HttpServletResponse response) {
		String name = authentication.getName();
		bookReaderService.deleteUser(bookReaderService.findByUsername(name).getId());

	    // Spring Security Logout
	    new SecurityContextLogoutHandler().logout(request, response, authentication);

	    return "redirect:/login?logout";

	}
	
	@PreAuthorize("hasAuthority('SUPERADMIN')")
	@PostMapping("/admin/delete/{id}")
	public String deleteUser(@PathVariable  Long id, Authentication authentication) {

		bookReaderService.deleteUser(id);
		return "redirect:/admin";
	}
	
	@PostMapping("/settings/email") //Email wird geändert
	public String setNewMail(@RequestParam String email, Authentication authentication) {
		String username = authentication.getName(); // aktueller Benutzername
		bookReaderService.changeMail(bookReaderService.findByUsername(username), email);
		
		return "userSettings";	
	}

	@PostMapping("/settings/password")//Password wird geändert
	public String setNewPassword(@RequestParam String oldPassword, @RequestParam String newPassword, Authentication authentication,  Model model) {
		String username = authentication.getName(); // aktueller Benutzername
		
		if (bookReaderService.changePassword(oldPassword, newPassword, username) == false) {
	        model.addAttribute("errorMessage", "Password ist falsch!");			
	        return "userSettings";
		}

		return "userSettings";	
	}
	
	@GetMapping("/mainpage/{ISBN}/comments")
	@ResponseBody
	public List<CommentDTO> getComments(@PathVariable String ISBN) {
		List<RatingClass> allRatings =  ratingService.getAllComments(ISBN);
		
		return allRatings.stream().filter(r-> r.getComment() != null && !r.getComment().isBlank())
				.map(r -> new CommentDTO(
						r.getReader().getUsername(),
						r.getComment()
						))
				.toList();
		
	}
	
    @GetMapping("/")
    public String home() {
        return "home"; // Zeigt home.html
    }

    @GetMapping("/login")
    public String login() {
        return "login"; // Zeigt login.html
    }
    
    @GetMapping("/passwordReset")
    public String passwordReset() {
        return "passwordReset"; // Zeigt login.html
    }
    
    @PostMapping("/passwordReset") //Setzt das Passwort zurück und sendet eine Mail mit dem neuen Password
    public String passwordResetSend(@RequestParam String email) {
    	String newPw = bookReaderService.generateStrongPassword(12);
    	mailService.sendEmail(email, "Password Rest", "Hallo, dein Password wurde zurückgesetzt. Bitte melde dich mit diesem Password an:/n"+newPw+" und ändere es in deinen Benutzereinstellungen danach");
    	bookReaderService.setPassword(bookReaderService.findByEmail(email), newPw);
    	return "login"; // Zeigt login.html
    }    
    
    @GetMapping("/ownCollection") //Muss ergänzen: Zeige mir alle Bücher an die ich schon bewertet habe
    public String ownCollection(Model model,  Authentication authentication) {
    	String username = authentication.getName(); // aktueller Benutzername

		System.out.println("Username: " + username);
		System.out.println("Ratings: " + ratingService.findPersonalCollection(username));

    	model.addAttribute("myCollection", ratingService.findPersonalCollection(username));
    	return "ownCollection";
    }
    
     @PostMapping("/ownCollection/rate/{id}")
     public String rateABook (@PathVariable Long id,
             @RequestParam int stars,
             @RequestParam int storyQuality,
             @RequestParam int writingStyle,
             @RequestParam int originality,
             @RequestParam String comment) 
     {
		ratingService.changeRating(id, stars, storyQuality, writingStyle, originality, comment);
		return "redirect:/ownCollection";

    	 
     }
    
    @PostMapping("/collectionSearch") //Anhand des Such Strings fügt er das Buch zu der Ratingliste hinzu und initialisert es mit 0 Werten, danach wird zurück auf die Seite verlinkt, sodass sie dort bewertet werden kann
    public String collectionAdd(@RequestParam String search,  Authentication authentication, Model model) {
    	String username = authentication.getName();
    	List<Book> book = bookService.findByISBNORTitel(search);
    	
    	if (book.size() == 1) {
        	BookReader bookReader = bookReaderService.findByUsername(username);
        	ratingService.addRating(book.get(0), bookReader);
        	System.out.println(book.get(0).getBookName()+" hinzugefügt");
        	return "redirect:/ownCollection";    				
    	}
    	
    	if (book.size() > 1) {
    		model.addAttribute("books", book);
    		return "selectBook";
    	}
    	

        model.addAttribute("errorMessage", "Kein Buch gefunden");
        return "ownCollection";
    }
    

@PostMapping("/collectionAddMultiple") //Auswahl an Büchern hinzufügen
public String addMultiple(@RequestParam List<String> selectedBooks, Authentication authentication) {
    String username = authentication.getName();
    BookReader bookReader = bookReaderService.findByUsername(username);

    for (String bookId : selectedBooks) {
        Book book = bookService.findByISBN(bookId);
        ratingService.addRating(book, bookReader);
    }

    return "redirect:/ownCollection";
}


    @GetMapping("/mainpage")
    public String mainpaige(Model model) {
    	List<BookAverageDTO> averageBook = ratingService.getAllBooksAverage();
    	model.addAttribute("avgBook", averageBook);
    	return "mainpage"; //Mainpage nach Login wo alle bewerteten Bücher allgemein in einer Tabelle sichtbar sind
    }

    @GetMapping("/admin") //Zeigt Admin Seite mit allen Benutzern
    public String adminPage(Model model) {
    	model.addAttribute("users", bookReaderService.findAllUsers());
    	return "admin";
    }
    
    @GetMapping("/admin/AdminBook") //Betrete Book Admin Seite
    public String adminBook(Model model) {
    	model.addAttribute("books", bookService.findAllBooks());
    	return "AdminBook";
    }
    
    @PostMapping("/admin/AdminBook/delete/{isbn}") //Wir fügen hier ein Buch hinzu
    public String deleteBook(@PathVariable String isbn) {
    	bookService.deleteById(isbn);
    	return "redirect:/admin/AdminBook";
    }
    
    @PostMapping("/admin/AdminBook") //Wir fügen hier ein Buch hinzu
    public String registerBook(@RequestParam String isbn, Model model) {
    	isbn = bookService.checkIsbn(isbn);
    	Book existingBook = bookService.findByISBN(isbn);
    	
    	if (existingBook != null) {
    		System.out.println("Double!");
    		model.addAttribute("errorMessage", "Buch bereits vorhanden");
    	    model.addAttribute("books", bookService.findAllBooks());
    		return "AdminBook";
    	}
    	
    	else {
        	
        	if (isbn == null) { //Falls die Isbn nicht stimmt dann geben wir eine Fehlermeldung und laden alle Bücher
        	    model.addAttribute("errorMessage", "Falsche ISBN eingegeben");
        	    model.addAttribute("books", bookService.findAllBooks());
            	return "AdminBook";   		
        	}
        	
        	bookService.registerBook(isbn);
        	System.out.println(bookService.findByISBN(isbn).getBookName());
        	return "redirect:/admin/AdminBook";   		
    		
    	}
    	

    }
    
    @PostMapping("/admin/promote/{id}") //Verabreitet Beförderung von Usern
    public String promoteUser(@PathVariable Long id) {
        bookReaderService.promoteToAdmin(id);
        return "redirect:/admin";
    }

    @PostMapping("/admin/demote/{id}") //Verarbeitet Degradierung
    public String demoteUser(@PathVariable Long id) {
    	
        bookReaderService.demoteToUser(id);
        return "redirect:/admin";
    }
    
    @GetMapping("/register") //Bereitet Registierung von einem neuen Benutzer vor
    public String register(Model model) {
    	model.addAttribute("bookReader", new BookReader());


        return "register"; // Zeigt register.html
    }
    
    @PostMapping("/register") //Fügt einen neuen Benutzer hinzu
    public String registerAdvance(@ModelAttribute("bookReader") BookReader bookReader) {
    	mailService.sendEmail(bookReader.getEmail(), "Deine Registierung auf der Buchwebseite", "Hallo, schön das du da bist: Dein Benutzname ist:"+bookReader.getUsername());
    	bookReaderService.registerBookReader(bookReader);
    	System.out.println(bookReaderService.findByUsername(bookReader.getUsername()).getUsername());
    	return "home";
    }

}
