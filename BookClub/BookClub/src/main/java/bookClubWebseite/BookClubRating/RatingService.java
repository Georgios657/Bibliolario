package bookClubWebseite.BookClubRating;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collector;
import java.util.stream.Collectors;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;


import bookClubWebseite.BookClubBook.Book;
import bookClubWebseite.BookClubBook.BookRepository;
import bookClubWebseite.BookClubDTO.BookAverageDTO;
import bookClubWebseite.BookClubDTO.RatingRequest;
import bookClubWebseite.BookClubGroup.Group;
import bookClubWebseite.BookClubReader.BookReader;
import bookClubWebseite.BookClubReader.BookReaderRepository;
import jakarta.validation.Valid;

@Service
public class RatingService {


    private final RatingRepository ratingRepository;
    private final BookReaderRepository bookReaderRepository;
    private final BookRepository bookRepository;


    public RatingService(RatingRepository ratingRepository,
                         BookRepository bookRepository,
                         BookReaderRepository bookReaderRepository) {
        this.ratingRepository = ratingRepository;
        this.bookRepository = bookRepository;
        this.bookReaderRepository = bookReaderRepository;
    }

    
    public boolean existsRating(Book book, BookReader bookReaoder) { //Falls das Buch von diesem Leser nicht schon bewertet wurde füge es hinzu
    	return  ratingRepository.findByBookAndReader(book, bookReaoder).isPresent();
    }

	public void addRating(Book book, BookReader bookReader) {
		
		if (existsRating(book, bookReader) == false) {
			RatingClass rating = new RatingClass();
		    rating.setReader(bookReader);
		    rating.setBook(book);
		    rating.setStars(5); // Default
		    rating.setStoryQuality(5);
		    rating.setCoverArt(5);;
		    rating.setFetish(5);
		    rating.setComment("No Comment");
		    bookReader.getRatings().add(rating);
		    book.getRatings().add(rating);
		    ratingRepository.save(rating);			
		}

	}


	public List<RatingClass> findPersonalCollection(String username) {
		return ratingRepository.findByReaderUsername(username);
	}


	public void changeRating(Long id, RatingRequest ratingRequest) {
		RatingClass rating = ratingRepository.findById(id).get();
		rating.setStars(ratingRequest.getStars());
		rating.setStoryQuality(ratingRequest.getQuality());
		rating.setCoverArt(ratingRequest.getCover());
		rating.setFetish(ratingRequest.getFetish());	
		rating.setComment(ratingRequest.getComment());
		ratingRepository.save(rating);
	}
	
	public List<BookAverageDTO> getAllBooksAverageOfList(List<BookReader> readerList, List<Book> bookList) {
	    // 1️⃣ Alle Ratings für die ausgewählten Leser und Bücher abrufen
	    List<RatingClass> allRatings = ratingRepository.findAllByReaderInAndBookIn(readerList, bookList);

	    // 2️⃣ Gruppieren nach Buch
	    Map<Book, List<RatingClass>> grouped = allRatings.stream()
	            .collect(Collectors.groupingBy(RatingClass::getBook));

	    List<BookAverageDTO> result = new ArrayList<>();

	    for (Map.Entry<Book, List<RatingClass>> entry : grouped.entrySet()) {
	        Book book = entry.getKey();
	        List<RatingClass> bookRatings = entry.getValue();

	        int numOfRating = bookRatings.size();

	        double avgStars = bookRatings.stream().mapToInt(RatingClass::getStars).average().orElse(0.0);
	        double avgStoryQuality = bookRatings.stream().mapToInt(RatingClass::getStoryQuality).average().orElse(0.0);
	        double avgCover = bookRatings.stream().mapToInt(RatingClass::getCoverArt).average().orElse(0.0);
	        double avgFetish = bookRatings.stream().mapToInt(RatingClass::getFetish).average().orElse(0.0);

	        // 🔹 Reviews mappen
	        List<BookAverageDTO.ReviewDTO> reviews = bookRatings.stream()
	                .filter(r -> r.getComment() != null && !r.getComment().isBlank())
	                .map(r -> BookAverageDTO.ReviewDTO.builder()
	                        .userName(r.getReader().getUsername())
	                        .comment(r.getComment())
	                        .build())
	                .toList();

	        // 🔹 BookAverageDTO mit Reviews erstellen
	        BookAverageDTO dto = BookAverageDTO.builder()
	                .avgStars(avgStars)
	                .avgStoryQuality(avgStoryQuality)
	                .avgWritingStyle(avgCover) // ggf. Cover/WritingStyle anpassen
	                .avgOrginality(avgFetish)
	                .numOfRating(numOfRating)
	                .bookName(book.getBookName())
	                .author(new ArrayList<>(book.getAuthors()))
	                .publishDate(book.getPublishDate())
	                .isbn(book.getISBN())
	                .language(book.getLanguage())
	                .reviews(reviews)
	                .build();

	        result.add(dto);
	    }

	    return result;
	}

	public List<BookAverageDTO> getAllBooksAverage() {
	    List<RatingClass> allRatings = ratingRepository.findAll();

	    // Ratings nach Buch gruppieren
	    Map<Book, List<RatingClass>> grouped = allRatings.stream()
	        .collect(Collectors.groupingBy(RatingClass::getBook));

	    List<BookAverageDTO> result = new ArrayList<>();

	    for (Map.Entry<Book, List<RatingClass>> entry : grouped.entrySet()) {
	        Book book = entry.getKey();
	        List<RatingClass> bookRatings = entry.getValue();

	        int numOfRating = bookRatings.size();

	        double avgStars = bookRatings.stream().mapToInt(RatingClass::getStars).average().orElse(0.0);
	        double avgStoryQuality = bookRatings.stream().mapToInt(RatingClass::getStoryQuality).average().orElse(0.0);
	        double avgCover = bookRatings.stream().mapToInt(RatingClass::getCoverArt).average().orElse(0.0);
	        double avgFetish = bookRatings.stream().mapToInt(RatingClass::getFetish).average().orElse(0.0);

	        // 🔹 Reviews aus den Ratings bauen
	        List<BookAverageDTO.ReviewDTO> reviews = bookRatings.stream()
	            .filter(r -> r.getComment() != null && !r.getComment().isBlank())
	            .map(r -> BookAverageDTO.ReviewDTO.builder()
	                .userName(r.getReader().getUsername()) // Name des Benutzers
	                .comment(r.getComment())           // Kommentartext
	                .build())
	            .toList();

	        // 🔹 DTO mit Builder erzeugen
	        BookAverageDTO dto = BookAverageDTO.builder()
	            .avgStars(avgStars)
	            .avgStoryQuality(avgStoryQuality)
	            .avgWritingStyle(avgCover)    // ggf. umbenennen, falls Cover = WritingStyle
	            .avgOrginality(avgFetish)     // ggf. umbenennen
	            .numOfRating(numOfRating)
	            .bookName(book.getBookName())
	            .author(new ArrayList<>(book.getAuthors()))
	            .publishDate(book.getPublishDate())
	            .isbn(book.getISBN())
	            .language(book.getLanguage())
	            .reviews(reviews)
	            .build();

	        result.add(dto);
	    }

	    return result;
	}


	public List<RatingClass> getAllComments(String ISBN) {
		return ratingRepository.findByBookISBN(ISBN);
		
		
	}


	
	public RatingClass saveOrUpdateRating(String username, String isbn, RatingRequest request) {
		
	    BookReader reader = bookReaderRepository.findByUsername(username);

	    Book book = bookRepository.findByISBN(isbn);

	    Optional<RatingClass> existingRating =
	            ratingRepository.findByReaderAndBook(reader, book);

	    RatingClass rating;

	    if (existingRating.isPresent()) {
	    	System.out.println("Es gibt schon ein Rating!");
	        // 🔁 UPDATE
	        rating = existingRating.get();
	        System.out.println(rating.toString());
	    } else {
	        // 🆕 CREATE
	        rating = new RatingClass();
	        rating.setReader(reader);
	        rating.setBook(book);
	    }

	    rating.setStars(request.getStars());
	    rating.setStoryQuality(request.getQuality());
	    rating.setCoverArt(request.getCover());
	    rating.setFetish(request.getFetish());
	    rating.setComment(request.getComment());
	    rating.setRated(true);

        System.out.println("Ich speicher da"+rating.toString());
	    ratingRepository.save(rating);
		return rating;
	}


    public List<RatingClass> findByBook(Book book) {
        return ratingRepository.findByBook(book);
    }

    public RatingClass findByBookAndUser(Book book, BookReader user) {
        // Repository-Methode gibt Optional zurück oder null
        return ratingRepository.findByBookAndReader(book, user).get();
    }






    

}
