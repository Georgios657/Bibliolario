package bookClubWebseite.BookClubSuggestionBook;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface BookSuggestionRepository extends JpaRepository<BookSuggestion, String> {

	BookSuggestion findByISBN(String iSBN);

}
