package bookClubWebseite.BookClubRating;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import bookClubWebseite.BookClubBook.Book;
import bookClubWebseite.BookClubReader.BookReader;

public interface RatingRepository extends JpaRepository<RatingClass, Long> {

	List<RatingClass> findByReaderUsername(String username);
	
	Optional<RatingClass> findByBookAndReader(Book book, BookReader reader);

	List<RatingClass> findByBookISBN(String iSBN);

	@Query("""
		    SELECT r FROM RatingClass r
		    WHERE r.reader IN :readers
		    AND r.book IN :books
		""")
	List<RatingClass> findAllByReaderInAndBookIn(
	        @Param("readers") List<BookReader> readers,
	        @Param("books") List<Book> books
	);
}
