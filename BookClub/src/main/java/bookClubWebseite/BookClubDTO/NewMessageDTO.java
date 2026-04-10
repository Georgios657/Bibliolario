package bookClubWebseite.BookClubDTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data               // erzeugt Getter, Setter, toString, equals, hashCode
@NoArgsConstructor  // erzeugt einen parameterlosen Konstruktor
@AllArgsConstructor // erzeugt einen Konstruktor mit allen Feldern
public class NewMessageDTO {
    private String senderName;
    private String receiverName; // noch keine receiverId
    private String subject;
    private String content;

    // Getter und Setter
}