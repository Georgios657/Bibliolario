package bookClubWebseite.BookClubDTO;

public class GroupDTO {

    private Long id;
    private String name;
    private String adminName;
    private int memberCount;
    private int bookCount;
    private boolean joined;
    private boolean isPrivate;

    public GroupDTO(Long id, String name, String adminName, int memberCount, int bookCount, boolean joined, boolean isPrivate) {
        this.id = id;
        this.name = name;
        this.adminName = adminName;
        this.memberCount = memberCount;
        this.bookCount = bookCount;
        this.joined = joined;
        this.isPrivate = isPrivate;
    }

    public Long getId() { return id; }

    public String getName() { return name; }

    public String getAdminName() { return adminName; }

    public int getMemberCount() { return memberCount; }

    public int getBookCount() { return bookCount; }

    public boolean isJoined() { return joined; }
    
    public boolean isPrivate() {return isPrivate;}
}