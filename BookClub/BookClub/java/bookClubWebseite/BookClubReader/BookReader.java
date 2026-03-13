package bookClubWebseite.BookClubReader;

import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import bookClubWebseite.BookClubGroup.Group;
import bookClubWebseite.BookClubRating.RatingClass;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.OneToMany;

@Entity

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

    public List<Group> getGroups() {
		return groups;
	}


	public void setGroups(List<Group> groups) {
		this.groups = groups;
	}


	public void setRatings(List<RatingClass> ratings) {
		this.ratings = ratings;
	}


	public List<RatingClass> getRatings(){
    	return ratings;
    }
    
    public String getRole() {
    	return role;
    }
    
	public Long getId() {
		return id;
	}


	public void setId(Long id) {
		this.id = id;
	}


	public String getUsername() {
		return username;
	}


	public void setUsername(String username) {
		this.username = username;
	}


	public String getPassword() {
		return password;
	}


	public void setPassword(String password) {
		this.password = password;
	}


	public String getEmail() {
		return email;
	}


	public void setEmail(String email) {
		this.email = email;
	}


	public void setRole(String string) {
		this.role = string;
	}

    
    

}
