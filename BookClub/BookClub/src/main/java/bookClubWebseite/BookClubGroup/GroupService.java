package bookClubWebseite.BookClubGroup;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import bookClubWebseite.BookClubBook.Book;
import bookClubWebseite.BookClubDTO.CreateGroupDTO;
import bookClubWebseite.BookClubDTO.GroupDTO;
import bookClubWebseite.BookClubDTO.JoinRequestDTOSelfInvite;
import bookClubWebseite.BookClubReader.BookReader;
import jakarta.transaction.Transactional;

@Service
public class GroupService {
	@Autowired
	private GroupRepository groupRepository;

    public Group createGroup(CreateGroupDTO dto, BookReader creator) {

        Group group = new Group();
        group.setName(dto.getName());
        group.setDescription(dto.getDescription());
        group.setPrivate(dto.isPrivate());
        group.setAdmin(creator);
        group.getMembers().add(creator); // Admin ist automatisch Mitglied

        return groupRepository.save(group);
    }
	
    public Optional<Group> findById(Long id) {
        return groupRepository.findById(id);
    }
    
	public List<Group> findGroupWhereMember(BookReader bookReader){
		return groupRepository.findByMembersContaining(bookReader);
	}

	public void deleteGroupById(Long id) {
		groupRepository.deleteById(id);
		
	}

	public void addNewMember(BookReader user, Long groupId) {
		Group group = groupRepository.findById(groupId).orElseThrow();
		group.addNewMember(user);
		groupRepository.save(group);
	}
	
	@Transactional
	public void deleteMember(BookReader member, Long groupId) {
		Group deleteMemberGroup = groupRepository.findById(groupId).orElseThrow();
		deleteMemberGroup.deleteMember(member);
	}

	@Transactional
	public void transferAdmin(Long groupId, BookReader newAdmin, BookReader currentUser) {
	    Group group = groupRepository.findById(groupId)
	            .orElseThrow(() -> new NoSuchElementException("Gruppe nicht gefunden"));

	    // Nur aktueller Admin darf übertragen
	    if (!group.getAdmin().getId().equals(currentUser.getId())) {
	        throw new AccessDeniedException("Nur der aktuelle Admin kann Adminrechte übertragen");
	    }

	    // Prüfen, ob der neue Admin überhaupt Mitglied der Gruppe ist
	    if (!group.getMembers().contains(newAdmin)) {
	        throw new IllegalArgumentException("Neuer Admin muss Mitglied der Gruppe sein");
	    }

	    // Admin übertragen
	    BookReader oldAdmin = group.getAdmin();
	    group.setAdmin(newAdmin);

	    // Optional: bisheriger Admin bleibt Mitglied
	    if (!group.getMembers().contains(oldAdmin)) {
	        group.getMembers().add(oldAdmin);
	    }

	    groupRepository.save(group);
	}

	public void save(Group groupBook) {
		groupRepository.save(groupBook);
		
	}

	public List<Group> findAll() {
		
		return groupRepository.findAll();
	}

	public List<GroupDTO> findAllGroupsWithMembership(BookReader reader) {

	    List<Group> groups = groupRepository.findAll();
	    Long readerId = reader.getId();

	    return groups.stream().map(group -> {

	        boolean joined = group.getMembers()
	                .stream()
	                .anyMatch(m -> m.getId().equals(readerId));

	        boolean joining = group.getJoinRequests()
	                .stream()
	                .anyMatch(r -> r.getId().equals(readerId));

	        // 🔥 JoinRequests mappen (BookReader → DTO)
	        Set<JoinRequestDTOSelfInvite> joinRequests = group.getJoinRequests()
	                .stream()
	                .map(user -> new JoinRequestDTOSelfInvite(
	                        user.getId(),
	                        user.getUsername()
	                ))
	                .collect(Collectors.toSet());

	        // 🔥 DTO bauen
	        return new GroupDTO(
	                group.getId(),
	                group.getName(),
	                group.getAdmin().getUsername(),
	                group.getMembers().size(),
	                group.getBooklist().size(),
	                joined,
	                group.isPrivate(),
	                joining,
	                joinRequests
	        );

	    }).toList();
	}

	public void addBook(Long groupId, Book book) {
	    Group group = groupRepository.findById(groupId)
	                     .orElseThrow(() -> new RuntimeException("Gruppe nicht gefunden"));

	    group.addBook(book); // getBooks() liefert List<Book>
	    groupRepository.save(group);
	}


    @Transactional
    public void removeMember(Long groupId, BookReader toDelete, BookReader currentUser) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new NoSuchElementException("Gruppe nicht gefunden"));

        // Prüfen, ob der aktuelle User Admin ist
        if (!group.getAdmin().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("Nur Admins können Mitglieder entfernen");
        }


        // Admin kann sich selbst nicht entfernen
        if (group.getAdmin().getId().equals(toDelete)) {
            throw new IllegalArgumentException("Admin kann sich selbst nicht entfernen");
        }

        // Mitglied entfernen
        group.getMembers().remove(toDelete);
        groupRepository.save(group);
    }

    @Transactional
    public boolean togglePrivacy(Long groupId, BookReader currentUser) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new NoSuchElementException("Gruppe nicht gefunden"));

        // Nur Admin darf Privatsphäre ändern
        if (!group.getAdmin().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("Nur der Admin kann die Privatsphäre ändern");
        }

        // Toggle: wenn privat -> öffentlich, wenn öffentlich -> privat
        group.setPrivate(!group.isPrivate());

        groupRepository.save(group);

        return group.isPrivate();
    }

	public void leaveGroup(Long groupId, BookReader groupUser) {
		Group group = groupRepository.findById(groupId).get();
		group.deleteMember(groupUser);
		groupRepository.save(group);
		
	}

	public void deleteGroup(Long groupId, BookReader currentUser) {
		Group group = groupRepository.findById(groupId).get();
		groupRepository.delete(group);
		
	}

	public void requestJoin(Long groupId, BookReader reader) {
		Group group = groupRepository.findById(groupId).get();
		group.addRequest(reader);
		System.out.println("Versuche Gruppe beizureten:"+group.getName());
		groupRepository.save(group);
		
	}

	public void acceptJoinRequest(Long groupId, BookReader joning) {
		Group group = groupRepository.findById(groupId).get();
		group.addNewMember(joning);
		group.removeJoiningList(joning);
		groupRepository.save(group);
		
	}

	public void rejectJoinRequest(Long groupId, BookReader declined) {
		Group group = groupRepository.findById(groupId).get();
		group.removeJoiningList(declined);
		groupRepository.save(group);
		
		// TODO Auto-generated method stub
		
	}


}

