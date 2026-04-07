package bookClubWebseite.BookClubSuggestionBook;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.ResponseStatus;

import bookClubWebseite.BookClubBook.Book;
import bookClubWebseite.BookClubBook.BookAlreadySuggestedException;
import bookClubWebseite.BookClubBook.BookService;
import bookClubWebseite.BookClubDTO.BookBasicDTO;
import bookClubWebseite.BookClubDTO.GroupDetailDTO.BookDTO;

@Service
public class BookSuggestionService {

		@Autowired
		private BookSuggestionRepository bookSuggestionRepository;
		
		@Autowired
		private BookService bookService;

		public void addNewSuggestion(String isbn) {

			isbn = bookService.checkIsbn(isbn);
			System.out.println("ISBN ist:"+ isbn);
			
			if (isbn == null) {
		        throw new BookAlreadySuggestedException("Keine gültige ISBN eingegeben!");				
			}
			
		    // 🔥 1. Schon als fertiges Buch vorhanden?
		    if (bookService.findByISBN(isbn) != null) {
		        throw new BookAlreadySuggestedException("Buch existiert bereits in der Datenbank");
		    }

		    // 🔥 2. Schon vorgeschlagen?
		    if (bookSuggestionRepository.existsById(isbn)) {
		        throw new BookAlreadySuggestedException("Buch wurde bereits vorgeschlagen");
		    }

		    // 🔥 3. Neu speichern
		    
		    Book book = bookService.registerBookAPI(isbn);

		    BookSuggestion bookSug = new BookSuggestion();
		    bookSug.setISBN(book.getISBN());
		    bookSug.setBookName(book.getBookName());
		    bookSug.setBookPicURL(book.getBookPicURL());
		    bookSug.setAuthors(book.getAuthors());
		    bookSug.setPublishDate(book.getPublishDate());
		    bookSug.setLanguage(book.getLanguage());
		    
		    System.out.println("Vorschlag zur Datenbank hinzugefügt");

		    bookSuggestionRepository.save(bookSug);
		}

		public List<BookBasicDTO> getAllBooks() {
		    return bookSuggestionRepository.findAll()
		            .stream()
		            .map(BookMapper::toDTO) // ✅ richtige Methodenreferenz
		            .toList();
		}

		public BookSuggestion findByISBN(String iSBN) {
			return bookSuggestionRepository.findByISBN(iSBN);
			
		}

		public void deleteByISBN(BookSuggestion book) {
			bookSuggestionRepository.delete(book);
			
		}
		
		

}

