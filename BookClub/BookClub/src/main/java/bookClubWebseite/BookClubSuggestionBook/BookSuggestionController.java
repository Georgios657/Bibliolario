package bookClubWebseite.BookClubSuggestionBook;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import bookClubWebseite.BookClubBook.Book;
import bookClubWebseite.BookClubDTO.BookAverageDTO;
import bookClubWebseite.BookClubDTO.BookBasicDTO;
import bookClubWebseite.BookClubDTO.BookResponseDTO;
import bookClubWebseite.BookClubDTO.GroupDetailDTO.BookDTO;

@RestController
public class BookSuggestionController {
	
	@Autowired
	private BookSuggestionService bookSuggestionService;

	
	@PostMapping("/books/suggest")
	public ResponseEntity<?> suggestBook(@RequestBody Map<String, String> request) {
		System.out.println("Request:"+request);
	    String isbn = request.get("isbn");

	    bookSuggestionService.addNewSuggestion(isbn);

	    return ResponseEntity.ok().build();
	}
	
	@GetMapping("/books/suggest/getAll")
    public List<BookBasicDTO> getAllSuggestedBooks() {
        return bookSuggestionService.getAllBooks();
    }
	
	
	@DeleteMapping("/books/suggest/register/{isbn}")
	public ResponseEntity<?> deleteSuggestion(@PathVariable String isbn) {
	    BookSuggestion sug = bookSuggestionService.findByISBN(isbn);

	    if (sug == null) {
	        return ResponseEntity.status(HttpStatus.NOT_FOUND)
	                .body("Suggestion nicht gefunden");
	    }
	    bookSuggestionService.deleteByISBN(sug);

	    return ResponseEntity.ok("Vorschlag erfolgreich gelöscht");
	}	
}
