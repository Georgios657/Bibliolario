package bookClubWebseite;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

import bookClubWebseite.BookClubBook.Book;
import bookClubWebseite.BookClubBook.BookService;
import bookClubWebseite.BookClubGroup.GroupService;
import bookClubWebseite.BookClubMessage.EmailService;
import bookClubWebseite.BookClubMessage.MessageService;
import bookClubWebseite.BookClubRating.RatingService;
import bookClubWebseite.BookClubReader.BookReader;
import bookClubWebseite.BookClubReader.BookReaderService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Controller
public class RegistrationAndAdminController {

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
    
    
    @PostMapping("/register")//Neuen Benutzer registieren
    public ResponseEntity<?> register(@RequestBody BookReader bookReader) {

    	bookReader.setRole("USER");
        if (bookReaderService.existsByUsername(bookReader.getUsername())) {
            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body("Benutzername ist bereits vergeben");
        }

        if (bookReaderService.existsByEmail(bookReader.getEmail())) {
            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body("E-Mail ist bereits registriert");
        }

        BookReader savedUser = bookReaderService.registerBookReader(bookReader);

        mailService.sendEmail(
                savedUser.getEmail(),
                "Deine Registrierung",
                "Hallo " + savedUser.getUsername()
        );

        // WICHTIG: JSON zurückgeben
        return ResponseEntity.ok(savedUser);
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
}
