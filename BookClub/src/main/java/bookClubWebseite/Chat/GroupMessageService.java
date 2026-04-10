package bookClubWebseite.Chat;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import bookClubWebseite.BookClubMessage.MessageRepository;

@Service
public class GroupMessageService {
	@Autowired
	private GroupMessageRepository groupMessageRepository;

	public List<ChatMessage> findByGroupIdOrderByTimestamp(Long groupId) {
		
		return groupMessageRepository.findByGroup_IdOrderByTimestampAsc(groupId);
	}

	public ChatMessage save(ChatMessage chat) {
		
		return groupMessageRepository.save(chat);
	}


}
