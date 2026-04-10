package bookClubWebseite.BookClubReader;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import bookClubWebseite.BookClubGroup.Group;
import bookClubWebseite.BookClubRating.RatingClass;
import bookClubWebseite.Chat.ChatMessage;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.OneToMany;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@AllArgsConstructor
@Builder
public class BookReader {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String email;
    
    @Column(nullable = false)
     private String role;
           

	@OneToMany(mappedBy = "reader")
	private List<RatingClass> ratings;
	
	  @ManyToMany(mappedBy = "members", fetch = FetchType.LAZY)
	private List<Group> groups;


    public BookReader() {
    	 this.role = "USER"; // Standardrolle
    	 this.ratings = new ArrayList<RatingClass>();
    }
    

    public BookReader(String username, String password, String email, String role) {
        this.username = username;
        this.password = password;
        this.email = email;
        this.role = role;
        this.ratings = new ArrayList<RatingClass>();
        this.groups = new ArrayList<Group>();
    }

    
    

}
