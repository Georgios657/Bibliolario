package bookClubWebseite.BookClubSuggestionBook;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import bookClubWebseite.BookClubBook.Book;
import bookClubWebseite.BookClubBook.BookService;
import bookClubWebseite.BookClubDTO.BookAverageDTO;
import bookClubWebseite.BookClubDTO.BookBasicDTO;
import bookClubWebseite.BookClubDTO.BookResponseDTO;
import bookClubWebseite.BookClubDTO.GroupDetailDTO.BookDTO;

@RestController
public class BookSuggestionController {

	@Autowired
	private BookService bookService;
	
	@Autowired
	private BookSuggestionService bookSuggestionService;

	@Autowired
	private SimpMessagingTemplate messagingTemplate;
	
	@PostMapping("/books/suggest")
	public ResponseEntity<?> suggestBook(@RequestBody Map<String, String> request) {
		System.out.println("Request:"+request);
	    String isbn = request.get("isbn");

	    BookSuggestion book = bookSuggestionService.addNewSuggestion(isbn);
	    BookBasicDTO bookDTO = BookMapper.toDTO(book);
        // 🔥 WICHTIG: gruppenspezifischer Channel!
        messagingTemplate.convertAndSend(
                "/topic/admin/suggestions",
                new SuggestionEvent("CREATE", bookDTO)
        );

	    return ResponseEntity.ok().build();
	}
	
	@GetMapping("/books/suggest/getAll")
    public List<BookBasicDTO> getAllSuggestedBooks() {
        return bookSuggestionService.getAllBooks();
    }
	
	
	@DeleteMapping("/books/suggest/register/{isbn}")
	public ResponseEntity<?> deleteSuggestion(@PathVariable String isbn) {
	    BookSuggestion sug = bookSuggestionService.findByISBN(isbn);
	    sug.getAuthors().size(); 
	    BookBasicDTO bookDTO = BookMapper.toDTO(sug);
	    bookSuggestionService.deleteBySuggestion(sug);
	    	
	    messagingTemplate.convertAndSend(
	            "/topic/admin/suggestions",
	            new SuggestionEvent("DELETE", bookDTO)
	    );
	    
	    return ResponseEntity.ok("Vorschlag erfolgreich gelöscht");
	}	
	
	@PutMapping("/books/suggest/register/{isbn}")
	public ResponseEntity<?> addSuggestion(@PathVariable String isbn) {
	    BookSuggestion sug = bookSuggestionService.findByISBN(isbn);
	    sug.getAuthors().size(); 
	    BookBasicDTO bookDTO = BookMapper.toDTO(sug);		
		
	    Book book = bookSuggestionService.addBookFromSuggestion(sug);

	    bookService.addBookSug(book);
	    bookSuggestionService.deleteBySuggestion(sug);	    
	    
	    messagingTemplate.convertAndSend(
	            "/topic/admin/suggestions",
	            new SuggestionEvent("PUT", bookDTO)
	    );
	    
	    

	    return ResponseEntity.ok("Vorschlag erfolgreich übertrtagen");
	}	
	
	public class SuggestionEvent {
	    private String type; // CREATE, DELETE, UPDATE
	    private Object payload;

	    public SuggestionEvent(String type, Object payload) {
	        this.type = type;
	        this.payload = payload;
	    }

	    public String getType() { return type; }
	    public Object getPayload() { return payload; }
	}
}


