package bookClubWebseite.BookClubDTO;

import java.time.LocalDate;
import java.util.List;

import lombok.Builder;
import lombok.Value;
import lombok.extern.jackson.Jacksonized;

@Value
@Builder
@Jacksonized
public class BookAverageDTO {

    private String isbn;
    private String bookName;
    private List<String> author;
    private String language;
    private LocalDate publishDate;

    private double avgStars;
    private double avgStoryQuality;
    private double avgWritingStyle;
    private double avgOrginality;
    private int numOfRating;

    // 🔹 Neu: Liste der Kommentare/Reviews
    private List<ReviewDTO> reviews;

    
    @Value
    @Builder
    @Jacksonized
    public static class ReviewDTO {
        private String userName;
        private String comment;
    }
}