package bookClubWebseite;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.user.SimpUserRegistry;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import bookClubWebseite.BookClubBook.BookService;
import bookClubWebseite.BookClubDTO.CreateInvitationDTO;
import bookClubWebseite.BookClubDTO.MessageDTO;
import bookClubWebseite.BookClubDTO.NewMessageDTO;
import bookClubWebseite.BookClubGroup.Group;
import bookClubWebseite.BookClubGroup.GroupService;
import bookClubWebseite.BookClubMessage.EmailService;
import bookClubWebseite.BookClubMessage.Message;
import bookClubWebseite.BookClubMessage.MessageService;
import bookClubWebseite.BookClubRating.RatingService;
import bookClubWebseite.BookClubReader.BookReader;
import bookClubWebseite.BookClubReader.BookReaderService;

@RestController
public class MessageController {

    private final SimpUserRegistry simpUserRegistry;
    
    
	@Autowired
	private SimpMessagingTemplate messagingTemplate;
	
	@Autowired 
	private MessageService messageService;
	
	@Autowired
	private EmailService mailService;
	
	@Autowired
	private BookReaderService bookReaderService;
	
	@Autowired
	private BookService bookService;
	
	@Autowired
	private GroupService groupService;
	
	@Autowired
	private RatingService ratingService;


    public MessageController(SimpUserRegistry simpUserRegistry) {
        this.simpUserRegistry = simpUserRegistry;
    }

    
	@PutMapping("/messages/{id}/read")
	public ResponseEntity<Void> markAsRead(@PathVariable Long id) {
	    messageService.markAsRead(id);
	    return ResponseEntity.ok().build();
	}
	
	@PostMapping("/messages/invitations")
    public ResponseEntity<MessageDTO> createInvitation(
            @RequestBody CreateInvitationDTO dto,
            Authentication authentication
    ) {

	    // Prüfen, ob der User authentifiziert ist
	    if (authentication == null || !authentication.isAuthenticated()) {
	        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
	    }
		BookReader currentUser = bookReaderService.findByUsername(authentication.getName());
    	Group group = groupService.findById(dto.getGroupId()).get();
        BookReader recipient = bookReaderService.findById(dto.getRecipientId());
        Message msg = messageService.createGroupInvitation(currentUser, recipient, group, dto);
        // In DTO konvertieren, damit keine rekursive Serialisierung passiert
        MessageDTO messageDTO = new MessageDTO(
                msg.getId(),
                msg.getSender().getUsername(),
                msg.getRecipient().getUsername(),
                msg.getSubject(),
                msg.getContent(),
                msg.getSentAt(),
                msg.isRead(),
                msg.isInvitation(),
                msg.getGroupId()
        );
        

        // ✅ LIVE an Empfänger senden
        messagingTemplate.convertAndSendToUser(
            recipient.getUsername(),
            "/queue/messages",
            messageDTO
        );


        return ResponseEntity.ok(messageDTO);
    }	

	@PostMapping("/messages/{id}/accept")
	@ResponseBody
	public void acceptInvite(@PathVariable Long id, Authentication auth) {
		System.out.println("Füge Benutzer hinzu");
	    BookReader user = bookReaderService.findByUsername(auth.getName());
	    Message msg= messageService.acceptInvitation(id);
	    groupService.addNewMember(user, msg.getGroupId());
	    messageService.deleteMessage(id);
	}
	
	@PostMapping("/messages/{id}/decline")
	@ResponseBody
	public void declineInvite(@PathVariable Long id, Authentication auth) {
		System.out.println("Lösche Nachricht");
	    messageService.deleteMessage(id);
	}
	
	@GetMapping("/headerData")
	public void headerData(Model model, Authentication auth) {
	    BookReader user = bookReaderService.findByUsername(auth.getName());
	    model.addAttribute("messages", messageService.getInbox(user));
	}
	


	@GetMapping("/messages/inbox")
	@ResponseBody
	public List<MessageDTO> getInbox(Authentication auth) {
	    BookReader user = bookReaderService.findByUsername(auth.getName());
	    List<Message> inbox = messageService.getInbox(user);
	    List<Message> outbox = messageService.getOutbox(user);
	    
	    inbox.addAll(outbox);
	    // DTO nur mit benötigten Feldern
	    return inbox.stream()
	                .map(msg -> new MessageDTO(
	                        msg.getId(),
	                        msg.getSender().getUsername(),
	                        msg.getRecipient().getUsername(),
	                        msg.getSubject(),
	                        msg.getContent(),
	                        msg.getSentAt(),
	                        msg.isRead(),
	                        msg.isInvitation(),
	                        msg.getGroupId()
	                        
	                ))
	                .collect(Collectors.toList());
	}

	@GetMapping("/messages/{id}")
	@ResponseBody
	public MessageDTO getMessage(@PathVariable Long id) {
	    Message msg = messageService.findById(id);
	    return new MessageDTO(                      msg.getId(),
                msg.getSender().getUsername(),
                msg.getRecipient().getUsername(),
                msg.getSubject(),
                msg.getContent(),
                msg.getSentAt(),
                msg.isRead(),
                msg.isInvitation(),
                msg.getGroupId());
	}
	
    // Nachrichten senden
    @PostMapping("messages/send")
    @ResponseBody
    public NewMessageDTO sendMessage(@RequestBody NewMessageDTO newMessage) {
    	
    	BookReader sender = bookReaderService.findByUsername(newMessage.getSenderName());
    	BookReader recipient = bookReaderService.findByUsername(newMessage.getReceiverName());
    	NewMessageDTO dt = messageService.sendMessage(newMessage, sender, recipient);
    	

        System.out.println("BROKER USERS:");
        simpUserRegistry.getUsers()
            .forEach(u -> System.out.println(" - " + u.getName()));

    	System.out.println("SEND WS TO USER = " + recipient.getUsername());
        messagingTemplate.convertAndSendToUser(
            recipient.getUsername(),          // 👈 EMPFÄNGER
            "/queue/messages",                 // 👈 PRIVATE QUEUE
            dt                               // 👈 DTO
        );

        
        return dt;
    }

}
