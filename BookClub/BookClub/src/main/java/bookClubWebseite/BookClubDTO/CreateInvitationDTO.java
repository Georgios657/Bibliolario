package bookClubWebseite.BookClubDTO;

public class CreateInvitationDTO {
    private Long recipientId;
    private Long groupId;

    // Optional: subject/content, falls du vom Frontend gesetzt werden willst
    private String subject;
    private String content;

    // Getter & Setter
    public Long getRecipientId() { return recipientId; }
    public void setRecipientId(Long recipientId) { this.recipientId = recipientId; }

    public Long getGroupId() { return groupId; }
    public void setGroupId(Long groupId) { this.groupId = groupId; }

    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
}