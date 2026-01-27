package bookClubWebseite.BookClubMessage;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import bookClubWebseite.BookClubGroup.Group;
import bookClubWebseite.BookClubReader.BookReader;

@Service
public class MessageService {
		@Autowired
		private MessageRepository messageRepository;
		

	    public void sendMessage(BookReader sender, BookReader recipient, String subject, String content, Boolean invitation, Long groupId) {
	        Message message = new Message();
	        message.setSender(sender);
	        message.setRecipient(recipient);
	        message.setSubject(subject);
	        message.setContent(content);
	        message.setGroupId(groupId);
	        message.setInvitation(invitation);
	        System.out.println(message.isInvitation()+"Nachricht gespcierht");
	        messageRepository.save(message);
	    }

	    public List<Message> getInbox(BookReader user) {
	        return messageRepository.findByRecipientOrderBySentAtDesc(user);
	    }

		public void inviteMembertoGroup(Group groupJoin, BookReader invitee, String message, BookReader inviter) {
			sendMessage(inviter, invitee, "Einladung in Buchgruppe "+groupJoin.getName() , message, true, groupJoin.getId());
			System.out.print("Nachricht versendet");
		}

		public Message findById(Long id) {
			// TODO Auto-generated method stub
			return messageRepository.findById(id).orElseThrow();
		}

		public Message acceptInvitation(Long id) {
			return findById(id);
			// TODO Auto-generated method stub
			
		}

		public void deleteMessage(Long id) {
			messageRepository.deleteById(id);
			
		}


}
