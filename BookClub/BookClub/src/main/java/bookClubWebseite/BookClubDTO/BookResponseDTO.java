package bookClubWebseite.BookClubDTO;

import java.util.List;
import lombok.Builder;
import lombok.Value;
import lombok.extern.jackson.Jacksonized;

@Value
@Builder
@Jacksonized
public class BookResponseDTO {

    private String id;          // isbn
    private String title;       
    private List<String> authors;
    private String language;
    private String publishedDate;   
    
    private Ratings ratings;
    private List<ReviewDTO> reviews; // 🔹 Neu: Kommentare

    @Value
    @Builder
    @Jacksonized    
    public static class Ratings {
        private double stars;
        private double quality;
        private double fetish;
        private double cover;
    }

    @Value
    @Builder
    @Jacksonized
    public static class ReviewDTO {
        private String userName;
        private String comment;
    }
}