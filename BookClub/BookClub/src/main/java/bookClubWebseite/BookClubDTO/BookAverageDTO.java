package bookClubWebseite.BookClubDTO;

import java.time.LocalDate;
import java.util.ArrayList;

public class BookAverageDTO {
		public BookAverageDTO(double avgStars, double avgStoryQuality, double avgWritingStyle, double avgOrginality,
			int numOfRating, String bookName, ArrayList<String> author, LocalDate publishDate, String isbn, String language) {
		super();
		this.avgStars = avgStars;
		this.avgStoryQuality = avgStoryQuality;
		this.avgWritingStyle = avgWritingStyle;
		this.avgOrginality = avgOrginality;
		this.numOfRating = numOfRating;
		this.bookName = bookName;
		this.author = author;
		this.publishDate = publishDate;
		this.setIsbn(isbn);
		this.language = language;
	}
		private double avgStars;
		private double avgStoryQuality;
		private double avgWritingStyle;
		private double avgOrginality;
		private int numOfRating;
		private String bookName;	
		private String language;
		private String isbn;
		private ArrayList<String> author;
		private LocalDate publishDate;
		
		public double getAvgStars() {
			return avgStars;
		}
		public void setAvgStars(double avgStars) {
			this.avgStars = avgStars;
		}
		public double getAvgStoryQuality() {
			return avgStoryQuality;
		}
		public void setAvgStoryQuality(double avgStoryQuality) {
			this.avgStoryQuality = avgStoryQuality;
		}
		public double getAvgWritingStyle() {
			return avgWritingStyle;
		}
		public void setAvgWritingStyle(double avgWritingStyle) {
			this.avgWritingStyle = avgWritingStyle;
		}
		public double getAvgOrginality() {
			return avgOrginality;
		}
		public void setAvgOrginality(double avgOrginality) {
			this.avgOrginality = avgOrginality;
		}
		public int getNumOfRating() {
			return numOfRating;
		}
		public void setNumOfRating(int numOfRating) {
			this.numOfRating = numOfRating;
		}
		public String getBookName() {
			return bookName;
		}
		public void setBookName(String bookName) {
			this.bookName = bookName;
		}
		public ArrayList<String> getAuthor() {
			return author;
		}
		public void setAuthor(ArrayList<String> author) {
			this.author = author;
		}
		public LocalDate getPublishDate() {
			return publishDate;
		}
		public void setPublishDate(LocalDate publishDate) {
			this.publishDate = publishDate;
		}
		public String getIsbn() {
			return isbn;
		}
		public void setIsbn(String isbn) {
			this.isbn = isbn;
		}
		public String getLanguage() {
			return language;
		}
		public void setLanguage(String language) {
			this.language = language;
		}

}
