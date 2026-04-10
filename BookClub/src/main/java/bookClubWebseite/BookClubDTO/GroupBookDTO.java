package bookClubWebseite.BookClubDTO;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GroupBookDTO {

    private String bookId;
    private String title;
    private List<String> authors;
    private String isbn;
    private String publishedDate;
    private String language;

    private RatingsDTO groupRatings;
    private int reviewCount;

    private MyRatingDTO myRating;

    @Getter
    @Setter
    @AllArgsConstructor
    @NoArgsConstructor
    public static class RatingsDTO {
        private double stars;
        private double quality;
        private double fetish;
        private double cover;
    }

    @Getter
    @Setter
    @AllArgsConstructor
    @NoArgsConstructor
    public static class MyRatingDTO {
        private double stars;
        private double quality;
        private double fetish;
        private double cover;
        private String comment;
    }
}