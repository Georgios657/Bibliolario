package bookClubWebseite.BookClubDTO;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PersonalBookDTO {
    private String bookId; // z.B. ISBN
    private String title;
    private List<String> authors;
    private String language;
    private String publishedDate;
    
    private Ratings ratings;
    
    private String myComment; // Optional
    private String ratedDate; // Optional
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Ratings {
        private int stars;
        private int quality;
        private int fetish;
        private int cover;
    }
}