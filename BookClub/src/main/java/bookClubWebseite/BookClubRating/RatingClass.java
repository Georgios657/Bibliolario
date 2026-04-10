package bookClubWebseite.BookClubRating;

import bookClubWebseite.BookClubBook.Book;
import bookClubWebseite.BookClubReader.BookReader;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;

@Entity
public class RatingClass {
		public RatingClass() {
			setRated(false);			
		}
	
	  public RatingClass(BookReader reader, Book book, int stars, int storyQuality, int coverArt, int fetish) {
		super();
		this.reader = reader;
		this.book = book;
		this.stars = stars;
		this.storyQuality = storyQuality;
		this.coverArt = coverArt;
		this.fetish = fetish;
		setRated(false);
	}
	  @Id @GeneratedValue
	    private Long id;

	    @ManyToOne
	    private BookReader reader;

	    @ManyToOne
	    private Book book;

	    private int stars;
	    private int storyQuality;
	    private int coverArt; //Formerly: writingStyle
	    private int fetish; //Formelry: Orignality
	    
	    private boolean rated;
	    
	    private String comment;
		public Long getId() {
			return id;
		}
		public void setId(Long id) {
			this.id = id;
		}

		public boolean isRated() {
			return rated;
		}

		public void setRated(boolean rated) {
			this.rated = rated;
		}

		public String getComment() {
			return comment;
		}

		public void setComment(String comment) {
			this.comment = comment;
		}

		public BookReader getReader() {
			return reader;
		}

		public void setReader(BookReader reader) {
			this.reader = reader;
		}

		public Book getBook() {
			return book;
		}

		public void setBook(Book book) {
			this.book = book;
		}

		public int getStars() {
			return stars;
		}

		public void setStars(int stars) {
			this.stars = stars;
		}

		public int getStoryQuality() {
			return storyQuality;
		}

		public void setStoryQuality(int storyQuality) {
			this.storyQuality = storyQuality;
		}

		public int getCoverArt() {
			return coverArt;
		}

		public void setCoverArt(int coverArt) {
			this.coverArt = coverArt;
		}

		public int getFetish() {
			return fetish;
		}

		public void setFetish(int fetish) {
			this.fetish = fetish;
		}

		@Override
		public String toString() {
			return "RatingClass [id=" + id + ", reader=" + reader + ", book=" + book + ", stars=" + stars
					+ ", storyQuality=" + storyQuality + ", coverArt=" + coverArt + ", fetish=" + fetish + ", rated="
					+ rated + ", comment=" + comment + "]";
		}


}
