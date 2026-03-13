package bookClubWebseite.BookClubDTO;

import lombok.Builder;
import lombok.Value;
import lombok.extern.jackson.Jacksonized;
import java.util.List;

@Value
@Builder
@Jacksonized
public class BookBasicDTO {
    private String title;
    private List<String> authors;
    private String isbn;
    private String publishedDate; // Erscheinungsjahr
    private String language;
}