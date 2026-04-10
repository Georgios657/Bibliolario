package bookClubWebseite.BookClubGroup;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import bookClubWebseite.BookClubBook.Book;
import bookClubWebseite.BookClubReader.BookReader;
import bookClubWebseite.Chat.ChatMessage;
import jakarta.persistence.*;

import lombok.*;

@Entity
@Table(name = "book_groups")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Group {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(nullable = false, length = 1000)
    private String description; // NEU: Beschreibung der Gruppe

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "group_admin_id", nullable = false)
    private BookReader admin;

    @ManyToMany
    @JoinTable(	
        name = "group_members",
        joinColumns = @JoinColumn(name = "group_id"),
        inverseJoinColumns = @JoinColumn(name = "reader_id")
    )
    private Set<BookReader> members = new HashSet<>();
    
    
    @ManyToMany
    @JoinTable(
        name = "group_join_requests",
        joinColumns = @JoinColumn(name = "group_id"),
        inverseJoinColumns = @JoinColumn(name = "reader_id")
    )
    private Set<BookReader> joinRequests = new HashSet<>();    

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "group_books",
        joinColumns = @JoinColumn(name = "group_id"),
        inverseJoinColumns = @JoinColumn(name = "book_id")
    )
    private List<Book> booklist = new ArrayList<>();

    @Column(nullable = false)
    private boolean isPrivate;
    
    @OneToMany(mappedBy = "group")
    private List<ChatMessage> messages;

    // Utility-Methoden
    public void addNewMember(BookReader bookReader) {
        members.add(bookReader);
    }

    public void deleteMember(BookReader reader) {
        System.out.println("Versuche zu löschen: " + reader.getUsername() + " aus Gruppe: " + this.getName());
        members.remove(reader);
    }

    public void addBook(Book book) {
        booklist.add(book);
    }

	public void addRequest(BookReader reader) {
		joinRequests.add(reader);
		
	}

	public void removeJoiningList(BookReader joning) {
		joinRequests.remove(joning);
		
	}
}