package bookClubWebseite.Chat;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface GroupMessageRepository extends JpaRepository<ChatMessage, Long> {

	List<ChatMessage> findByGroup_IdOrderByTimestampAsc(Long groupId);

}