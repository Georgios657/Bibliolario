package bookClubWebseite.BookClubMessage;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import bookClubWebseite.BookClubReader.BookReader;

public interface MessageRepository extends JpaRepository<Message, Long> {

	 List<Message> findByRecipientOrderBySentAtDesc(BookReader recipient);
}
