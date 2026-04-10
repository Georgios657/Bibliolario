package bookClubWebseite.Chat;

import java.time.LocalDateTime;

import bookClubWebseite.BookClubGroup.Group;
import bookClubWebseite.BookClubReader.BookReader;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private Group group;

    @ManyToOne
    private BookReader sender;

    private String content;

    private LocalDateTime timestamp;

}
