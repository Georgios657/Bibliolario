package bookClubWebseite;

import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import bookClubWebseite.BookClubBook.Book;
import bookClubWebseite.BookClubBook.BookService;
import bookClubWebseite.BookClubDTO.BookAverageDTO;
import bookClubWebseite.BookClubDTO.BookBasicDTO;
import bookClubWebseite.BookClubDTO.BookResponseDTO;
import bookClubWebseite.BookClubDTO.CommentDTO;
import bookClubWebseite.BookClubDTO.GroupDetailDTO.BookDTO;
import bookClubWebseite.BookClubDTO.MessageDTO;
import bookClubWebseite.BookClubDTO.PersonalBookDTO;
import bookClubWebseite.BookClubDTO.RatingRequest;
import bookClubWebseite.BookClubDTO.UserDTO;
import bookClubWebseite.BookClubGroup.Group;
import bookClubWebseite.BookClubGroup.GroupService;
import bookClubWebseite.BookClubMessage.EmailService;
import bookClubWebseite.BookClubMessage.Message;
import bookClubWebseite.BookClubMessage.MessageService;
import bookClubWebseite.BookClubRating.RatingClass;
import bookClubWebseite.BookClubRating.RatingService;
import bookClubWebseite.BookClubReader.BookReader;
import bookClubWebseite.BookClubReader.BookReaderService;
import bookClubWebseite.BookClubSuggestionBook.BookSuggestion;
import bookClubWebseite.BookClubSuggestionBook.BookSuggestionService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.Data;

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
	
	@Autowired
	private BookSuggestionService bookSuggestionService;



	@ResponseBody
    @GetMapping("/health")
    public Map<String, Object> health() {
        return Map.of(
            "status", "UP",
            "application", "BookClub API"
        );
    }


	

	
	@GetMapping("/csrf-token")
	@ResponseBody
	public Map<String, String> csrf(CsrfToken token) {
	    return Map.of(
	        "token", token.getToken(),
	        "headerName", token.getHeaderName()
	    );
	}

	@PostMapping("/books/add/{isbn}")
	public ResponseEntity<?> addBook(@PathVariable String isbn) {
	    bookService.registerBook(isbn);

	    return ResponseEntity.ok("Book erfolgreich übernommen");
	}	
	
	@PostMapping("/settings/email") //Email wird geändert
	public String setNewMail(@RequestParam String email, Authentication authentication) {
		String username = authentication.getName(); // aktueller Benutzername
		bookReaderService.changeMail(bookReaderService.findByUsername(username), email);
		
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
	

    @GetMapping("/ownCollection")
    @ResponseBody
    public List<PersonalBookDTO> ownCollection(Authentication authentication) {
        String username = authentication.getName();
        System.out.println("Collection von:"+username);
        List<RatingClass> ratings = ratingService.findPersonalCollection(username);

        return ratings.stream().map(r -> 
            PersonalBookDTO.builder()
                .bookId(r.getBook().getISBN())
                .title(r.getBook().getBookName())
                .authors(r.getBook().getAuthors())
                .language(r.getBook().getLanguage())
                .publishedDate(r.getBook().getPublishDate().toString())
                .ratings(PersonalBookDTO.Ratings.builder()
                    .stars(r.getStars())
                    .quality(r.getStoryQuality())
                    .fetish(r.getFetish())
                    .cover(r.getCoverArt())
                    .build()
                )
                .myComment(r.getComment() != null ? r.getComment() : "")
                .build()
        ).collect(Collectors.toList());
    }
    
    
    @PostMapping("/ownCollection/rate/{ISBN}")
    public ResponseEntity<?> rateBook(
            @PathVariable String ISBN,
            @RequestBody RatingRequest request,
            Authentication authentication
    ) {

        String username = authentication.getName();

        ratingService.saveOrUpdateRating(username, ISBN, request);

        System.out.println("Speicherte Rating für:"+username+" "+ISBN);
        return ResponseEntity.ok().build();
    }
   
     
     
    @PostMapping("/collectionSearch")
    @ResponseBody
    public List<BookResponseDTO> collectionSearch(@RequestBody Map<String, String> body, Authentication authentication) {
        String search = body.get("search");
        String username = authentication.getName();

        // 1️⃣ Alle Bücher im Suchstring abrufen
        List<Book> books = bookService.findByISBNORTitel(search);

        // 2️⃣ ISBNs der vom Nutzer bereits bewerteten Bücher abrufen
        Set<String> ratedBookISBNs = ratingService.findPersonalCollection(username)
                                                 .stream()
                                                 .map(r -> r.getBook().getISBN())
                                                 .collect(Collectors.toSet());

        // 3️⃣ Filter: nur Bücher, die der Nutzer noch nicht bewertet hat
        List<Book> filteredBooks = books.stream()
                                        .filter(b -> !ratedBookISBNs.contains(b.getISBN()))
                                        .toList();

        // 4️⃣ DTOs bauen
        return filteredBooks.stream()
                .map(book -> BookResponseDTO.builder()
                        .id(book.getISBN())
                        .title(book.getBookName())
                        .authors(book.getAuthors())
                        .language(book.getLanguage())
                        .publishedDate(book.getPublishDate() != null ? book.getPublishDate().toString() : "")
                        .ratings(BookResponseDTO.Ratings.builder()
                                 .stars(0)
                                 .quality(0)
                                 .fetish(0)
                                 .cover(0)
                                 .build())
                        .build()
                ).toList();
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


@GetMapping("/books")
public ResponseEntity<List<BookResponseDTO>> getAllBooks() {

    List<BookAverageDTO> source = ratingService.getAllBooksAverage();

    List<BookResponseDTO> response = source.stream().map(book -> {
        List<BookResponseDTO.ReviewDTO> reviews = book.getReviews().stream()
            .map(r -> BookResponseDTO.ReviewDTO.builder()
                .userName(r.getUserName()) // Name des Benutzers
                .comment(r.getComment())   // Kommentar
                .build())
            .toList();

        return BookResponseDTO.builder()
            .id(book.getIsbn())
            .title(book.getBookName())
            .authors(book.getAuthor())
            .language(book.getLanguage())
            .publishedDate(book.getPublishDate().toString())
            .ratings(BookResponseDTO.Ratings.builder()
                .stars(book.getAvgStars())
                .quality(book.getAvgStoryQuality())
                .fetish(book.getAvgOrginality())
                .cover(book.getAvgWritingStyle())
                .build())
            .reviews(reviews) // 🔹 Hier die Reviews einfügen
            .build();
    }).toList();

    return ResponseEntity.ok(response);
}

@PostMapping("/api/user/change-email")
public ResponseEntity<?> changeEmail(@RequestBody ChangeEmailRequest request, Authentication authentication) {
    String username = authentication.getName();
    try {
    	bookReaderService.changeEmail(request.getNewEmail(), request.getPassword(), username);
        return ResponseEntity.ok().build();
    } catch (Exception e) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", e.getMessage()));
    }
}

@PostMapping("/api/user/change-password")
public ResponseEntity<?> changePassword(@RequestBody ChangePasswordRequest request, Authentication authentication) {
    String username = authentication.getName();
    try {
        bookReaderService.changePassword(username, request.currentPassword(), request.newPassword());
        return ResponseEntity.ok().build();
    } catch (Exception e) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", e.getMessage()));
    }
}

@GetMapping("/api/user/me")
public ResponseEntity<?> getCurrentUser(Authentication authentication) {
    String username = authentication.getName();
    BookReader user = bookReaderService.findByUsername(username);
    if (user == null) return ResponseEntity.notFound().build();
    
    Map<String, Object> result = Map.of(
        "email", user.getEmail(),
        "username", user.getUsername()
    );
    return ResponseEntity.ok(result);
}


@GetMapping("/api/groups/{groupId}/invitable-users")
public ResponseEntity<List<UserDTO>> getAllInvitableUsers(
        @PathVariable Long groupId,
        Authentication authentication) {

    String username = authentication.getName();
    BookReader reader = bookReaderService.findByUsername(username);

    List<UserDTO> invitableUsers = bookReaderService.getAllInvitable(reader, groupId);
    return ResponseEntity.ok(invitableUsers);
}

@GetMapping("/users")
public ResponseEntity<List<UserDTO>> getAllUsers() {
    List<UserDTO> users = bookReaderService.findAllUsers();
    return ResponseEntity.ok(users);
}

@PutMapping("/users/blocking/{id}")
public ResponseEntity<?> blockUnblock(@PathVariable Long id) {
	bookReaderService.blockUnblock(id);
    return ResponseEntity.ok(
            Map.of("message", "Account Status erfolgreich geändert")
        );
}

@PutMapping("/users/admin/{id}")
public ResponseEntity<?> adminUnadmin(@PathVariable Long id) {
	bookReaderService.adminUnadmin(id);
    return ResponseEntity.ok(
            Map.of("message", "Account Status erfolgreich geändert")
        );
}

@PostMapping("/api/user/soft-delete")
public ResponseEntity<?> softDeleteUser(Authentication authentication) {
    String username = authentication.getName();
    BookReader user = bookReaderService.findByUsername(username);
    if (user == null) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "User nicht gefunden"));
    }

    bookReaderService.softDeleteUser(user.getId());
    return ResponseEntity.ok(Map.of("message", "Account erfolgreich gelöscht"));
}

@PostMapping("/users/admin/{id}")
public ResponseEntity<?> softDeleteUserByID(
        @PathVariable Long id,
        Authentication authentication
) {
    BookReader user = bookReaderService.findById(id);

    if (user == null) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("message", "User nicht gefunden"));
    }

    bookReaderService.softDeleteUser(id);

    return ResponseEntity.ok(
            Map.of("message", "Account erfolgreich gelöscht")
    );
}

@GetMapping("books/search")
public ResponseEntity<BookBasicDTO> searchBookByIsbn(@RequestParam String isbn) {
    if (isbn == null || isbn.isBlank()) {
        return ResponseEntity.badRequest().build();
    }

    Book book = bookService.findByISBN(isbn); // Service liefert Book oder null

    if (book == null) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
    }

    BookBasicDTO dto = BookBasicDTO.builder()
            .title(book.getBookName())
            .authors(book.getAuthors())
            .isbn(book.getISBN())
            .publishedDate(book.getPublishDate() != null
                ? book.getPublishDate().format(DateTimeFormatter.ofPattern("yyyy"))
                : "")
            .language(book.getLanguage())
            .build();

    return ResponseEntity.ok(dto);
}



public record ChangePasswordRequest(String currentPassword, String newPassword) {}

@Data
public static class ChangeEmailRequest {
    private String newEmail;
    private String password;
}

}
