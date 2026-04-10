package bookClubWebseite.BookClubDTO;

public class JoinRequestDTOSelfInvite {
    private Long id;
    private String name;

    public JoinRequestDTOSelfInvite(Long id, String name) {
        this.id = id;
        this.name = name;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
}
