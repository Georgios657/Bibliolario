package bookClubWebseite.BookClubSuggestionBook;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

import bookClubWebseite.BookClubBook.Book;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookSuggestion {

    @Id
    @GeneratedValue
    private Long id;

    private String ISBN;
    private String bookName;
    private String bookPicURL;

    @ElementCollection
    private List<String> authors;

    private LocalDate publishDate;
    private String language;

    private boolean approved;
}

