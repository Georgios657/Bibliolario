package bookClubWebseite.BookClubGroup;

import java.nio.channels.MembershipKey;
import java.util.ArrayList;
import java.util.List;

import org.aspectj.weaver.Member;

import bookClubWebseite.BookClubBook.Book;
import bookClubWebseite.BookClubReader.BookReader;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.transaction.Transactional;

@Entity
@Table(name ="book_groups")
public class Group {
	
	public Group() {
		members = new ArrayList<BookReader>();
		booklist = new ArrayList<Book>();
	}


	public Group(Long id, String name, BookReader admin, List<BookReader> members, List<Book> booklist) {
		super();
		this.id = id;
		this.name = name;
		this.admin = admin;
		this.members = members;
		this.booklist = booklist;
	}


	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
    @Column(nullable = false, unique = true)
	private String name;
	
	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn (name = "group_admin_id", nullable = false)
	private BookReader admin;
	
	 @ManyToMany
	 @JoinTable(name = "group_members",
	 joinColumns =  @JoinColumn(name ="group_id"),
     inverseJoinColumns = @JoinColumn(name = "reader_id")
	 )	 
	 private List<BookReader> members;
	 

	    @ManyToMany(fetch = FetchType.LAZY)
	    @JoinTable(
	        name = "group_books",
	        joinColumns = @JoinColumn(name = "group_id"),
	        inverseJoinColumns = @JoinColumn(name = "book_id")
	    )
	 private List<Book> booklist;


		public Long getId() {
			return id;
		}


		public void setId(Long id) {
			this.id = id;
		}


		public String getName() {
			return name;
		}


		public void setName(String name) {
			this.name = name;
		}


		public BookReader getAdmin() {
			return admin;
		}


		public void setAdmin(BookReader admin) {
			this.admin = admin;
		}


		public List<BookReader> getMembers() {
			return members;
		}


		public void setMembers(List<BookReader> members) {
			this.members = members;
		}


		public List<Book> getBooklist() {
			return booklist;
		}


		public void setBooklist(List<Book> booklist) {
			this.booklist = booklist;
		}


		public void addNewMember(BookReader bookReader) {
			members.add(bookReader);
			
		}


		public void deleteMember(BookReader reader) {
			System.out.println("Versuche zu löschen: "+reader.getUsername()+" aus Gruppe:"+this.getName());
			members.remove(reader); // Entfernt aus der Collection
		}


		public void addBook(Book book) {
			booklist.add(book);
			
		}

}
