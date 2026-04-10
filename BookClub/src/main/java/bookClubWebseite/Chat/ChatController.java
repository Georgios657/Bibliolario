package bookClubWebseite.Chat;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import bookClubWebseite.BookClubGroup.Group;
import bookClubWebseite.BookClubGroup.GroupService;
import bookClubWebseite.BookClubReader.BookReader;
import bookClubWebseite.BookClubReader.BookReaderService;

@RestController
@RequestMapping("/chat")
public class ChatController {

	@Autowired
	private SimpMessagingTemplate messagingTemplate;
	
	@Autowired
    private GroupMessageService groupMessageService;
	
	@Autowired
	private BookReaderService bookReaderService;
	
	@Autowired
	private GroupService groupService;
	
    @GetMapping("/group/{groupId}")
    public List<ChatMessageFrontDTO> findByGroupIdOrderByTimestamp(@PathVariable Long groupId) {

        List<ChatMessage> messages = groupMessageService.findByGroupIdOrderByTimestamp(groupId);
        System.out.println(groupId);
        return messages.stream()
                .map(msg -> new ChatMessageFrontDTO(
                        msg.getSender().getUsername(),
                        msg.getContent(),
                        msg.getTimestamp()
                ))
                .toList();
    }
    
    
    @PostMapping("/group/{groupId}/send")
    public ChatMessageFrontDTO sendMessage(
    	    @PathVariable Long groupId,
    		@RequestBody ChatMessageDTO dto) {
    	
    	System.out.println("Meine Group id ist..."+groupId);

        Group group = groupService.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));
        

        BookReader sender = bookReaderService.findByUsername(dto.getSenderName());

        ChatMessage chat = new ChatMessage();
        chat.setContent(dto.getContent());
        chat.setTimestamp(LocalDateTime.now());
        chat.setSender(sender);
        chat.setGroup(group);

        ChatMessage saved = groupMessageService.save(chat);

        System.out.println("Kommentar "+saved.getContent());
        System.out.println("Gruppe "+saved.getGroup().getName());
        
        // 👉 DTO erstellen
        ChatMessageFrontDTO response = new ChatMessageFrontDTO(
                sender.getUsername(),
                saved.getContent(),
                saved.getTimestamp()
        );

        // 🔥 WICHTIG: gruppenspezifischer Channel!
        messagingTemplate.convertAndSend(
                "/topic/group/" + groupId,
                response
        );

        return response;
    }
}