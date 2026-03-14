package bookClubWebseite.BookClubBook;



import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.retry.annotation.Retryable;
import org.springframework.retry.annotation.Backoff;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import bookClubWebseite.BookClubDTO.BookResponseDTO;

@Service
public class BookService {
	@Autowired
	private BookRepository bookRepository;
	

    private final RestTemplate restTemplate = new RestTemplate();

    

    	//Ruft GoogleBook und/oder OpenBooks auf um die Informationen zu generieren um das Buchobjekt anzulegen
	public void registerBook(String isbn) {
		Book book = registerBookAPI(isbn);
		if (book.getBookPicURL().equalsIgnoreCase("https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/480px-No_image_available.svg.png")) {
			System.out.println("Checke für Bilder:");
			book.setBookPicURL(openBookPic(isbn));
		}
		
        bookRepository.save(book);
	
	}


	//Anahnd der ISBN wird nun über googleBooks und danach über OpenBooks versucht die Inhalte auszulesen
	private Book registerBookAPI(String isbn){
		JsonNode responseGoogle = null;
		//Google Books
		try {
			 responseGoogle = registerBookGoogle(isbn);
		}
		catch (RestClientException e) {
			System.out.println("Google Books error, trying open books");
		}
		
    if (responseGoogle != null && responseGoogle.size() > 0) {
        return getGoogleInfo(responseGoogle, isbn);
    }

		
		JsonNode responseOpenBook = null;
		
		//Open Book
		try {
			responseOpenBook = registerBookOpen(isbn);
		}
		catch (RestClientException e) {
			System.out.println("Open Books error, trying open books");
		}
		
		if (responseOpenBook != null) {
			return getOpenInfo(responseOpenBook, isbn);
		}
		return null;
	}
	

	//Checks and gets the cover picture from open book if google books did not have any
	private String openBookPic(String isbn) {
				JsonNode response = registerBookOpen(isbn);
				String coverId = null;
				
		
		if (response.isArray() && response.size() > 0) {
		    coverId = response.get(0).asText();
		}


			if (coverId == null) {
			    return "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/480px-No_image_available.svg.png";
			}


			// Wenn coverId vorhanden ist, baue die URL
			return "https://covers.openlibrary.org/b/id/" + coverId + "-L.jpg";


		}

	
	//Verabreite den JSON Node vom Aufruf der OpenBook API
	private Book getOpenInfo(JsonNode root, String isbn) {		
	    JsonNode bookNode = root.path("ISBN:" + isbn);

	    if (bookNode.isMissingNode()) {
	        throw new RuntimeException("Kein Buch gefunden für ISBN: " + isbn);
	    }

		

	    Book book = new Book(isbn);
	     book.setBookName(bookNode.path("title").asText("Unbekannt"));
	     String langKey = root
	    	        .path("languages")
	    	        .path(0)
	    	        .path("key")
	    	        .asText();          // z. B. "/languages/eng"
	     
	     langKey = langKey.replace("/languages/", "");
	     langKey = LanguageMapper.toIso639(langKey);
	     book.setLanguage(langKey);
	     // Autoren extrahieren
	     List<String> authors = StreamSupport.stream(bookNode.path("authors").spliterator(), false)
	             .map(a -> a.path("name").asText())
	             .collect(Collectors.toList());
	     book.setAuthors(authors);

	     // Veröffentlichungsdatum
	     String date = bookNode.path("publish_date").asText("");
	     LocalDate publishedDate = null;
	     

	     try {
	            if (date.length() == 10) { // yyyy-MM-dd
	            	publishedDate = LocalDate.parse(date);
	            } else if (date.length() == 7) { // yyyy-MM
	            	publishedDate = LocalDate.parse(date + "-01");
	            } else if (date.length() == 4) { // yyyy
	            	publishedDate = LocalDate.of(Integer.parseInt(date), 1, 1);
	            }
	     } 
	     catch (DateTimeParseException e) {
	         // Optional: Logging oder Fallback
	         System.err.println("Ungültiges Datumsformat: " + date);
	     }


	     
	     book.setPublishDate(publishedDate);

	     // Cover oder Platzhalter
	     JsonNode coverNode = bookNode.path("cover").path("small");
	     if (coverNode.isMissingNode()) {
	         book.setBookPicURL("https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/480px-No_image_available.svg.png");
	     } else {
	         book.setBookPicURL(coverNode.asText(""));
	     }

	     return book;

	}
	
	//Verarbeite die Informationen von GoogleBook
	private Book getGoogleInfo(JsonNode items, String isbn) {
		if (items == null || items.isEmpty()) {
		throw new RuntimeException("Kein Buch gefunden für ISBN: " + isbn);
		}
		
		JsonNode volumeInfo = items.get(0).get("volumeInfo");
		
		Book book = new Book(isbn);
		book.setBookName(volumeInfo.get("title").asText());
		book.setLanguage(volumeInfo.get("language").asText());
		book.setAuthors(StreamSupport.stream(volumeInfo.get("authors").spliterator(), false)
		    .map(JsonNode::asText)
		    .collect(Collectors.toList()));
		
		String date = volumeInfo.get("publishedDate").asText("");
		LocalDate publishedDate = null;
		
		if (!date.isEmpty()) {
		try {
		    if (date.length() == 10) { // yyyy-MM-dd
		        publishedDate = LocalDate.parse(date);
		    } else if (date.length() == 7) { // yyyy-MM
		        publishedDate = LocalDate.parse(date + "-01");
		    } else if (date.length() == 4) { // yyyy
		        publishedDate = LocalDate.of(Integer.parseInt(date), 1, 1);
		    }
		} catch (DateTimeParseException e) {
		    // Optional: Loggen oder Exception behandeln
		    e.printStackTrace();
		}
		}
		
		
		book.setPublishDate(publishedDate);
		 
		if (volumeInfo.get("imageLinks") == null) {
		book.setBookPicURL("https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/480px-No_image_available.svg.png");
		}
		else {
		book.setBookPicURL(volumeInfo.get("imageLinks").get("thumbnail").asText(""));      	
		}

		return book;
	}

	@Retryable(
		    value = { RestClientException.class },
		    maxAttempts = 3,
		    backoff = @Backoff(delay = 2000, multiplier = 2) // 2s → 4s → 8s
		)
	//Probiere dreimal die Daten von GoogleBook zu erhalten
	private JsonNode registerBookGoogle(String isbn) {
		String apiKey = 
		String url = "https://www.googleapis.com/books/v1/volumes?q=isbn:" + isbn+ "&key=" + apiKey;
		ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
		
	    if (response.getStatusCode().is4xxClientError()) {
	        // z.B. 404 oder 400 → keine Retry nötig
	        return null;
	    }
	    
		ObjectMapper mapper = new ObjectMapper();
    	JsonNode root =null;


		try {
		root = mapper.readTree(response.getBody());
		} catch (JsonProcessingException e) {
		e.printStackTrace();
		// Optional: Fehlerbehandlung oder Rückgabe einer Fehlermeldung
		}
		
		
		
		
		JsonNode items = root.get("items");
		return items;
	}
	

	@Retryable(
		    value = { RestClientException.class },
		    maxAttempts = 3,
		    backoff = @Backoff(delay = 1000)
		)
	//Probiere dreimal von openBook die Daten zu erhalten
	private JsonNode registerBookOpen(String isbn) {

		String url = "https://openlibrary.org/api/books?bibkeys=ISBN:" + isbn + "&format=json&jscmd=data";

    	ObjectMapper mapper = new ObjectMapper();
    	JsonNode root =null;


		try {
		root = mapper.readTree(restTemplate.getForEntity(url, String.class).getBody());
		} catch (JsonProcessingException e) {
		e.printStackTrace();
		// Optional: Fehlerbehandlung oder Rückgabe einer Fehlermeldung
		}
		
		return root;
	}
	
	
	public List<Book> findAllBooks() {
		// TODO Auto-generated method stub
		return bookRepository.findAll();
	}
	
	public Book findByISBN(String isbn) {
		
		return bookRepository.findByISBN(isbn);
	}

	public void deleteById(String isbn) {
		bookRepository.delete(bookRepository.findByISBN(isbn));
		
	}

	public List<Book> findByISBNORTitel(String search) {

		 if (search.matches("\\d{10,13}")) {
			 List<Book> list=new ArrayList<Book>();
			 list.add(bookRepository.findByISBN(search));
		            return list;
		        } else {
		            return bookRepository.findByBookNameContainingIgnoreCase(search);
		        }

		
	}

	public String checkIsbn(String isbn) {
		if (isbn.length() == 10) {
			isbn = toIsbn13(isbn);
		}
		else {
			System.out.println("Tada: "+isbn);
			isbn = isbn.replaceAll("[\\s-]", "");
			System.out.println("Tada: "+isbn);
		}
		
		if (!isValidIsbn13(isbn)) {
			return null;			
		}
		else {
			return isbn;			
		}
		
		
	}
	


public static boolean isValidIsbn13(String isbn) {
    if (isbn == null) return false;
    String clean = isbn.replaceAll("[\\s-]", "");
    if (!clean.matches("\\d{13}")) return false;

    int sum = 0;
    for (int i = 0; i < 12; i++) {
        int digit = clean.charAt(i) - '0';
        sum += (i % 2 == 0) ? digit : 3 * digit;
    }
    int expectedCheckDigit = (10 - (sum % 10)) % 10;
    int actualCheckDigit = clean.charAt(12) - '0';

    return expectedCheckDigit == actualCheckDigit;
}



	private String toIsbn13(String isbn10) {

	    if (isbn10 == null) throw new IllegalArgumentException("ISBN-10 darf nicht null sein");
	        String clean = isbn10.replaceAll("[\\s-]", "");
	        // Grundformat prüfen: 10 Zeichen, letzte evtl. X
	        if (!clean.matches("^\\d{9}[\\dXx]$")) {
	            throw new IllegalArgumentException("Ungültiges ISBN-10-Format: " + isbn10);
	        }

	        // Nur 978-konvertierbar: Es gibt keine ISBN-10-Entsprechung für 979
	        // (die Konvertierung selbst setzt 978 vor die ersten 9 Ziffern)
	        String core9 = clean.substring(0, 9);
	        String first12 = "978" + core9;  // 12 Ziffern

	        int sum = 0;
	        for (int i = 0; i < 12; i++) {
	            int digit = first12.charAt(i) - '0';
	            sum += (i % 2 == 0) ? digit : 3 * digit;
	        }
	        int check = (10 - (sum % 10)) % 10;

	        return first12 + check;

	}


	public List<BookResponseDTO> findBooksDTOBySearch(String search) {
	    List<Book> books = findByISBNORTitel(search);
	    return books.stream().map(book -> BookResponseDTO.builder()
	            .id(book.getISBN())
	            .title(book.getBookName())
	            .authors(book.getAuthors())
	            .language(book.getLanguage())
	            .publishedDate(book.getPublishDate() != null ? book.getPublishDate().toString() : "")
	            .ratings(BookResponseDTO.Ratings.builder().stars(0).quality(0).fetish(0).cover(0).build())
	            .build()
	    ).toList();
	}


}
