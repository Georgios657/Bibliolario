package bookClubWebseite.BookClubDTO;

public class CommentDTO {
	public CommentDTO(String userName, String comment) {
		super();
		this.userName = userName;
		this.comment = comment;
	}
	private String userName;
	private String comment;
	public String getUserName() {
		return userName;
	}
	public void setUserName(String userName) {
		this.userName = userName;
	}
	public String getComment() {
		return comment;
	}
	public void setComment(String comment) {
		this.comment = comment;
	}

}
