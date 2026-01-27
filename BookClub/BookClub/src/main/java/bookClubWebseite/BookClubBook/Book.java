package bookClubWebseite.BookClubBook;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import bookClubWebseite.BookClubRating.RatingClass;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;

@Entity
public class Book {
	public Book(String bookName, String bookPicURL, ArrayList<String> author, LocalDate  publishDate, String language) {
		super();
		this.bookName = bookName;
		this.bookPicURL = bookPicURL;
		this.authors = new ArrayList<String>();
		this.publishDate = publishDate;
		this.ratings = new ArrayList<RatingClass>();
		this.language = language;
	}
	
	public Book(String isbn) {
		this.ISBN = isbn;
		this.authors = new ArrayList<String>();
		this.ratings = new ArrayList<RatingClass>();
	}
	
	public Book() {
		this.authors = new ArrayList<String>();
		this.ratings = new ArrayList<RatingClass>();
	}
	

	@Id
    @Column(nullable = false, unique = true)
	private String ISBN;

    @Column(nullable = false)
	private String bookName;
	
    @Column
	private String bookPicURL;

    @Column
	private ArrayList<String> authors;
	
    @Column
	private LocalDate publishDate;
    
    @Column
    private String language;
    

	public String getLanguage() {
		return language;
	}

	public void setLanguage(String language) {
		this.language = language;
	}


	@OneToMany(mappedBy = "book")
	private List<RatingClass> ratings;

    public List<RatingClass> getRatings(){
    	return ratings;
    }
    
	public String getBookName() {
		return bookName;
	}
	public void setBookName(String bookName) {
		this.bookName = bookName;
	}
	public String getBookPicURL() {
		return bookPicURL;
	}
	public void setBookPicURL(String bookPicURL) {
		this.bookPicURL = bookPicURL;
	}
	public ArrayList<String> getAuthors() {
		return authors;
	}
	public void addAuthor(String author) {
		authors.add(author);
	}
	public void setAuthors(List<String> authors) {
		this.authors = new ArrayList<>(authors);
	}
	public LocalDate  getPublishDate() {
		return publishDate;
	}
	public void setPublishDate(LocalDate  publishDate) {
		this.publishDate = publishDate;
	}
	
	public String getISBN() {
		return ISBN;
	}
}
