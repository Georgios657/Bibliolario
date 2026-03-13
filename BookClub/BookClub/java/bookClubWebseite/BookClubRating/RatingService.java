package bookClubWebseite.BookClubRating;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collector;
import java.util.stream.Collectors;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import bookClubWebseite.BookClubBook.Book;
import bookClubWebseite.BookClubBook.BookRepository;
import bookClubWebseite.BookClubDTO.BookAverageDTO;
import bookClubWebseite.BookClubReader.BookReader;
import bookClubWebseite.BookClubReader.BookReaderRepository;

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
		    rating.setStars(0); // Default
		    rating.setStoryQuality(0);
		    rating.setCoverArt(0);;
		    rating.setFetish(0);
		    rating.setComment("No Comment");
		    bookReader.getRatings().add(rating);
		    book.getRatings().add(rating);
		    ratingRepository.save(rating);			
		}

	}


	public List<RatingClass> findPersonalCollection(String username) {
		return ratingRepository.findByReaderUsername(username);
	}


	public void changeRating(Long id, int stars, int storyQuality, int writingStyle, int originality, String comment) {
		RatingClass rating = ratingRepository.findById(id).get();
		rating.setStars(stars);
		rating.setStoryQuality(storyQuality);
		rating.setCoverArt(writingStyle);
		rating.setFetish(originality);	
		rating.setComment(comment);
		ratingRepository.save(rating);
	}
	
	public List<BookAverageDTO> getAllBooksAverageOfList(List<BookReader> readerList, List<Book> bookList){
		List<RatingClass> allRatings = ratingRepository.findAllByReaderInAndBookIn(readerList, bookList);
	    	    
		
		Map<Book, List<RatingClass>> grouped = allRatings.stream()
			.collect(Collectors.groupingBy(RatingClass::getBook));
		
		List<BookAverageDTO> result = new ArrayList<BookAverageDTO>();
		

	    for (Map.Entry<Book, List<RatingClass>> entry : grouped.entrySet()) {
	        Book book = entry.getKey();
	        List<RatingClass> bookRatings = entry.getValue();

	        int numOfRating = bookRatings.size();

	        double avgStars = bookRatings.stream().mapToInt(RatingClass::getStars).average().orElse(0.0);
	        double avgStoryQuality = bookRatings.stream().mapToInt(RatingClass::getStoryQuality).average().orElse(0.0);
	        double avgCover = bookRatings.stream().mapToInt(RatingClass::getCoverArt).average().orElse(0.0);
	        double avgFetish = bookRatings.stream().mapToInt(RatingClass::getFetish).average().orElse(0.0);

	        result.add(new BookAverageDTO(
	            avgStars,
	            avgStoryQuality,
	            avgCover,
	            avgFetish,
	            numOfRating,
	            book.getBookName(),
	            new ArrayList<>(book.getAuthors()), // falls Book eine Liste hat
	            book.getPublishDate(),
	            book.getISBN(),
	            book.getLanguage()
	        ));
	    }

		return result;		
	}

	public List<BookAverageDTO> getAllBooksAverage() {
		List<RatingClass> allRatings = ratingRepository.findAll();
		
		Map<Book, List<RatingClass>> grouped = allRatings.stream()
			.collect(Collectors.groupingBy(RatingClass::getBook));
		
		List<BookAverageDTO> result = new ArrayList<BookAverageDTO>();
		

	    for (Map.Entry<Book, List<RatingClass>> entry : grouped.entrySet()) {
	        Book book = entry.getKey();
	        List<RatingClass> bookRatings = entry.getValue();

	        int numOfRating = bookRatings.size();

	        double avgStars = bookRatings.stream().mapToInt(RatingClass::getStars).average().orElse(0.0);
	        double avgStoryQuality = bookRatings.stream().mapToInt(RatingClass::getStoryQuality).average().orElse(0.0);
	        double avgCover = bookRatings.stream().mapToInt(RatingClass::getCoverArt).average().orElse(0.0);
	        double avgFetish = bookRatings.stream().mapToInt(RatingClass::getFetish).average().orElse(0.0);

	        result.add(new BookAverageDTO(
	            avgStars,
	            avgStoryQuality,
	            avgCover,
	            avgFetish,
	            numOfRating,
	            book.getBookName(),
	            new ArrayList<>(book.getAuthors()), // falls Book eine Liste hat
	            book.getPublishDate(),
	            book.getISBN(),
	            book.getLanguage()
	        ));
	    }

		return result;
	}


	public List<RatingClass> getAllComments(String ISBN) {
		return ratingRepository.findByBookISBN(ISBN);
		
		
	}



    

}
