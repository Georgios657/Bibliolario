package bookClubWebseite.BookClubDTO;

public class UserDTO {
    private Long id;
    private String name;
    private String email;

    public UserDTO(Long id, String username, String email) {
        this.id = id;
        this.name = username;
        this.email = email;
    }

    // Getter & Setter
    public Long getId() { return id; }
    public String getName() { return name; }
    public String getEmail() { return email; }
    public void setId(Long id) { this.id = id; }
    public void setUsername(String username) { this.name = username; }
    public void setEmail(String email) { this.email = email; }
}
