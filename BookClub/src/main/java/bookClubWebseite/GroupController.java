package bookClubWebseite;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import bookClubWebseite.BookClubBook.Book;
import bookClubWebseite.BookClubBook.BookService;
import bookClubWebseite.BookClubDTO.BookAverageDTO;
import bookClubWebseite.BookClubDTO.CreateGroupDTO;
import bookClubWebseite.BookClubDTO.GroupBookDTO;
import bookClubWebseite.BookClubDTO.GroupDTO;
import bookClubWebseite.BookClubDTO.GroupDetailDTO;
import bookClubWebseite.BookClubDTO.GroupDetailDTO.BookDTO;
import bookClubWebseite.BookClubDTO.GroupDetailDTO.MemberDTO;
import bookClubWebseite.BookClubDTO.GroupOverviewDTO;
import bookClubWebseite.BookClubDTO.JoinRequestDTOSelfInvite;
import bookClubWebseite.BookClubDTO.JoinRequestDto;
import bookClubWebseite.BookClubDTO.RatingRequest;
import bookClubWebseite.BookClubGroup.Group;
import bookClubWebseite.BookClubGroup.GroupService;
import bookClubWebseite.BookClubMessage.EmailService;
import bookClubWebseite.BookClubMessage.MessageService;
import bookClubWebseite.BookClubRating.RatingClass;
import bookClubWebseite.BookClubRating.RatingService;
import bookClubWebseite.BookClubReader.BookReader;
import bookClubWebseite.BookClubReader.BookReaderService;


@RestController
public class GroupController {

    
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
	
	@PutMapping("/{groupId}/toggle-privacy")
	public ResponseEntity<?> toggleGroupPrivacy(
	        @PathVariable Long groupId,
	        Authentication authentication) {

	    String username = authentication.getName();
	    BookReader currentUser = bookReaderService.findByUsername(username);

	    try {
	        boolean newPrivacy = groupService.togglePrivacy(groupId, currentUser);
	        groupService.findById(groupId).ifPresent(x -> System.out.println("Privat"+x.isPrivate()));
	        return ResponseEntity.ok("Gruppe ist jetzt " + (newPrivacy ? "privat" : "öffentlich"));
	    } catch (AccessDeniedException e) {
	        return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Nur der Admin kann die Privatsphäre ändern");
	    } catch (NoSuchElementException e) {
	        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Gruppe nicht gefunden");
	    }
	}
	
	@PutMapping("/{groupId}/transfer-admin/{newAdminId}")
	public ResponseEntity<?> transferAdmin(
	        @PathVariable Long groupId,
	        @PathVariable Long newAdminId,
	        Authentication authentication) {

	    String username = authentication.getName();
	    BookReader currentUser = bookReaderService.findByUsername(username);
	    BookReader newAdmin = bookReaderService.findById(newAdminId);
	    
	    try {
	        groupService.transferAdmin(groupId, newAdmin, currentUser);
	        return ResponseEntity.ok().body("Admin erfolgreich übertragen");
	    } catch (AccessDeniedException e) {
	        return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Nur der aktuelle Admin kann Adminrechte übertragen");
	    } catch (NoSuchElementException e) {
	        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Gruppe oder Mitglied nicht gefunden");
	    } catch (IllegalArgumentException e) {
	        return ResponseEntity.badRequest().body(e.getMessage());
	    }
	}	

	  @DeleteMapping("/{groupId}")
	    public ResponseEntity<?> deleteGroup(@PathVariable Long groupId, Authentication authentication) {
	        String username = authentication.getName();
	        BookReader currentUser = bookReaderService.findByUsername(username);

	        try {
	            groupService.deleteGroup(groupId, currentUser);
	            return ResponseEntity.ok("Gruppe erfolgreich gelöscht");
	        } catch (AccessDeniedException e) {
	            return ResponseEntity.status(HttpStatus.FORBIDDEN)
	                    .body("Nur der Admin der Gruppe kann die Gruppe löschen");
	        } catch (NoSuchElementException e) {
	            return ResponseEntity.status(HttpStatus.NOT_FOUND)
	                    .body("Gruppe nicht gefunden");
	        }
	    }
	  
	@DeleteMapping("/{groupId}/members/{memberId}")
    public ResponseEntity<?> removeMember(
            @PathVariable Long groupId,
            @PathVariable Long memberId,
            Authentication authentication) {

        String username = authentication.getName();
        BookReader currentUser = bookReaderService.findByUsername(username);
        BookReader toDelete = bookReaderService.findById(memberId);

        try {
            groupService.removeMember(groupId, toDelete, currentUser);
            return ResponseEntity.noContent().build(); // 204
        } catch (AccessDeniedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Nur Admins können Mitglieder entfernen");
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Gruppe oder Mitglied nicht gefunden");
        }
    }	
	
	@GetMapping("/groups")
	public GroupOverviewDTO getGroups(Authentication authentication) {

	    String username = authentication.getName();
	    BookReader reader = bookReaderService.findByUsername(username);

	    List<GroupDTO> allGroups = groupService.findAllGroupsWithMembership(reader);

	    List<GroupDTO> myGroups = allGroups.stream()
	            .filter(GroupDTO::isJoined)
	            .toList();

	    System.out.println("Hier bin ich Mitglied:");
	    myGroups.forEach(a -> System.out.print(a.getName()));
	    List<GroupDTO> availableGroups = allGroups.stream()
	            .filter(g -> !g.isJoined())
	            .toList();

	    return new GroupOverviewDTO(myGroups, availableGroups);
	}
	
	//Join Request for a Group
    @PostMapping("/{groupId}/join-request")
    public ResponseEntity<Void> requestJoinGroup(
            @PathVariable Long groupId,
            @RequestBody JoinRequestDto dto,
            Authentication authentication
    ) {

    	JoinRequestDTOSelfInvite dt = groupService.requestJoin(groupId, bookReaderService.findByUsername(authentication.getName()));

    	messagingTemplate.convertAndSend(
    		    "/topic/group/" + groupId + "/join-requests",
    		    dt
    		);
        
        return ResponseEntity.ok().build();
    }
    
	@PostMapping("/{groupId}/books")
	public ResponseEntity<GroupDetailDTO.BookDTO> addBookByIsbn(
	        @PathVariable Long groupId,
	        @RequestParam String isbn) {

	    Book book = bookService.findByISBN(isbn);
	    if (book == null) {
	        return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
	    }

	    groupService.addBook(groupId, book);

	    GroupDetailDTO.BookDTO addedBook = new GroupDetailDTO.BookDTO(
	            book.getISBN(),
	            book.getBookName(),
	            new ArrayList<>(book.getAuthors())
	    );

	    return ResponseEntity.ok(addedBook);
	}
	
	//Handles accepted invite from admin
	@PostMapping("/groups/{groupId}/join-requests/{requestId}/accept")
	public ResponseEntity<Void> acceptJoinRequest(
	        @PathVariable Long groupId,
	        @PathVariable Long requestId,
	        Authentication authentication) {
		
		BookReader joning = bookReaderService.findById(requestId);

	    groupService.acceptJoinRequest(groupId, joning);

	    return ResponseEntity.ok().build();
	}
	
	//Handle deciline from admin
	@PostMapping("/groups/{groupId}/join-requests/{requestId}/reject")
	public ResponseEntity<Void> rejectJoinRequest(
	        @PathVariable Long groupId,
	        @PathVariable Long requestId,
	        Authentication authentication) {
		
		BookReader declined = bookReaderService.findById(requestId);

	    groupService.rejectJoinRequest(groupId, declined);

	    return ResponseEntity.ok().build();
	}
    
	@GetMapping("/groups/{id}")
	public ResponseEntity<GroupDetailDTO> getGroupById(@PathVariable Long id, Authentication authentication) {

	    String username = authentication.getName();
	    BookReader reader = bookReaderService.findByUsername(username);

	    return groupService.findById(id)
	        .map(group -> {

	            GroupDetailDTO dto = new GroupDetailDTO();
	            dto.setId(group.getId());
	            dto.setName(group.getName());
	            dto.setDescription(group.getDescription());
	            // Admin
	            BookReader admin = group.getAdmin();
	            dto.setAdmin(new MemberDTO(
	                    admin.getId(),
	                    admin.getUsername(),
	                    admin.getEmail(),
	                    true
	            ));

	            // Members
	            List<MemberDTO> memberDTOs = group.getMembers().stream()
	                    .map(m -> new MemberDTO(
	                            m.getId(),
	                            m.getUsername(),
	                            m.getEmail(),
	                            m.equals(admin)))
	                    .toList();

	            dto.setMembers(memberDTOs);
	            
	            // Join Reqpuest
	            List<JoinRequestDTOSelfInvite> selfInvite = group.getJoinRequests().stream()
	            		.map(m -> new JoinRequestDTOSelfInvite(
	            				m.getId(),
	            				m.getUsername()
	            				))
	            				.toList();
	            
	            dto.setJoinRequests(selfInvite);

	            // 📚 BOOKS MIT RATINGS
	            List<GroupBookDTO> bookDTOs = group.getBooklist().stream()
	                .map(book -> {

	                    // Alle Ratings für dieses Buch
	                    List<RatingClass> allRatings = ratingService.findByBook(book);

	                    // Nur Ratings von Gruppenmitgliedern (optional)
	                    List<RatingClass> ratingsForGroup = allRatings.stream()
	                        .filter(r -> group.getMembers().contains(r.getReader()))
	                        .toList();

	                    // Eigene Bewertung
	                    RatingClass myRating = allRatings.stream()
	                        .filter(r -> r.getReader().equals(reader))
	                        .findFirst()
	                        .orElse(null);

	                    // Durchschnitt berechnen
	                    double avgStars = ratingsForGroup.stream()
	                        .mapToDouble(RatingClass::getStars)
	                        .average()
	                        .orElse(0.0);

	                    double avgQuality = ratingsForGroup.stream()
	                        .mapToDouble(RatingClass::getStoryQuality)
	                        .average()
	                        .orElse(0.0);

	                    double avgFetish = ratingsForGroup.stream()
	                        .mapToDouble(RatingClass::getFetish)
	                        .average()
	                        .orElse(0.0);

	                    double avgCover = ratingsForGroup.stream()
	                        .mapToDouble(RatingClass::getCoverArt)
	                        .average()
	                        .orElse(0.0);

	                    // Eigene Bewertung DTO
	                    GroupBookDTO.MyRatingDTO myRatingDTO = null;
	                    if (myRating != null) {
	                        myRatingDTO = new GroupBookDTO.MyRatingDTO(
	                                myRating.getStars(),
	                                myRating.getStoryQuality(),
	                                myRating.getFetish(),
	                                myRating.getCoverArt(),
	                                myRating.getComment()
	                        );
	                    }

	                    return GroupBookDTO.builder()
	                            .bookId(book.getISBN())
	                            .isbn(book.getISBN())
	                            .title(book.getBookName())
	                            .authors(List.copyOf(book.getAuthors()))
	                            .publishedDate(book.getPublishDate() != null ? book.getPublishDate().toString() : null)
	                            .language(book.getLanguage())
	                            .groupRatings(new GroupBookDTO.RatingsDTO(
	                                    avgStars,
	                                    avgQuality,
	                                    avgFetish,
	                                    avgCover
	                            ))
	                            .reviewCount(ratingsForGroup.size())
	                            .myRating(myRatingDTO)
	                            .build();
	                })
	                .toList();

	            dto.setBooks(bookDTOs);

	            dto.setJoined(group.getMembers().contains(reader));

	            return ResponseEntity.ok(dto);
	        })
	        .orElse(ResponseEntity.notFound().build());
	}
	
	@PostMapping("/groups")
	public ResponseEntity<GroupDTO> createGroup(
	        @RequestBody CreateGroupDTO dto,
	        Authentication authentication) {

	    String username = authentication.getName();
	    BookReader bookReader = bookReaderService.findByUsername(username);

	    Group newGroup = groupService.createGroup(dto, bookReader);

	    // 🔥 JoinRequests mappen (BookReader → DTO)
	    Set<JoinRequestDTOSelfInvite> joinRequests = newGroup.getJoinRequests()
	            .stream()
	            .map(user -> new JoinRequestDTOSelfInvite(
	                    user.getId(),
	                    user.getUsername()
	            ))
	            .collect(Collectors.toSet());

	    // 🔥 DTO korrekt bauen
	    GroupDTO groupDTO = new GroupDTO(
	            newGroup.getId(),
	            newGroup.getName(),
	            newGroup.getAdmin().getUsername(),
	            newGroup.getMembers().size(),
	            newGroup.getBooklist().size(),
	            true,                  // joined (Admin ist Mitglied)
	            newGroup.isPrivate(),  // isPrivate
	            false,                 // joining
	            joinRequests
	    );

	    System.out.println("Gruppe angelegt mit: Privat: " + newGroup.isPrivate());

	    return ResponseEntity.ok(groupDTO);
	}
	
	
    // Endpoint zum Verlassen einer Gruppe
    @PostMapping("/{groupId}/leave")
    public ResponseEntity<?> leaveGroup(
            @PathVariable("groupId") Long groupId,
            Authentication authentication
    ) {
        try {

        	BookReader groupUser = bookReaderService.findByUsername(authentication.getName());
        		
            // Service ruft Logik auf, um den aktuellen Nutzer aus der Gruppe zu entfernen
            groupService.leaveGroup(groupId, groupUser);

            return ResponseEntity.ok().body("Gruppe erfolgreich verlassen.");
        } catch (Exception e) {
            return ResponseEntity.status(400).body("Fehler beim Verlassen der Gruppe: " + e.getMessage());
        }
    }
	
}
