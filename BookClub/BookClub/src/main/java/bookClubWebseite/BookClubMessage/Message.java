package bookClubWebseite.BookClubMessage;

import java.time.LocalDateTime;

import bookClubWebseite.BookClubReader.BookReader;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;

@Entity
public class Message {

    public Message() {
		super();
	}

	public Message(Long id, BookReader sender, BookReader recipient, String subject, String content, boolean read,
			LocalDateTime sentAt) {
		super();
		this.id = id;
		this.sender = sender;
		this.recipient = recipient;
		this.subject = subject;
		this.content = content;
		this.read = read;
		this.sentAt = sentAt;
	}

	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private BookReader sender;

    @ManyToOne
    private BookReader recipient;

    private String subject;   // Betreff
    private String content;   // Nachrichtentext
    private boolean read = false;
    private boolean invitation = false;
    private Long groupId = null;

    private LocalDateTime sentAt = LocalDateTime.now();

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public BookReader getSender() {
		return sender;
	}

	public void setSender(BookReader sender) {
		this.sender = sender;
	}

	public BookReader getRecipient() {
		return recipient;
	}

	public void setRecipient(BookReader recipient) {
		this.recipient = recipient;
	}

	public String getSubject() {
		return subject;
	}

	public void setSubject(String subject) {
		this.subject = subject;
	}

	public String getContent() {
		return content;
	}

	public void setContent(String content) {
		this.content = content;
	}

	public boolean isRead() {
		return read;
	}

	public void setRead(boolean read) {
		this.read = read;
	}

	public LocalDateTime getSentAt() {
		return sentAt;
	}

	public void setSentAt(LocalDateTime sentAt) {
		this.sentAt = sentAt;
	}


	public boolean isInvitation() {
		return invitation;
	}

	public void setInvitation(boolean invitation) {
		this.invitation = invitation;
	}

	public Long getGroupId() {
		return groupId;
	}

	public void setGroupId(Long groupId) {
		this.groupId = groupId;
	}

    // Getter und Setter
}