
package bookClubWebseite.BookClubDTO;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;


public class RatingRequest {

	  public int getStars() {
		return stars;
	}

	public void setStars(int stars) {
		this.stars = stars;
	}

	public int getQuality() {
		return quality;
	}

	public int getCover() {
		return cover;
	}

	public void setCover(int coverArt) {
		this.cover = coverArt;
	}

	public int getFetish() {
		return fetish;
	}

	public void setFetish(int fetish) {
		this.fetish = fetish;
	}

	public void setQuality(int storyQuality) {
		this.quality = storyQuality;
	}

	public String getComment() {
		return comment;
	}

	public void setComment(String comment) {
		this.comment = comment;
	}

	  @Min(1) @Max(5)
	    private int stars;

	    @Min(1) @Max(5)
	    private int quality;

	    @Min(1) @Max(5)
	    private int cover;

	    @Min(1) @Max(5)
	    private int fetish;

	    @NotBlank
	    @Size(max = 1000)
	    private String comment;


}
