package bookClubWebseite.BookClubGroup;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import bookClubWebseite.BookClubReader.BookReader;
import jakarta.transaction.Transactional;

@Service
public class GroupService {
	@Autowired
	private GroupRepository groupRepository;

	public void addNewGroup(String groupName, BookReader bookReader) {
		Group newGroup = new Group();
		newGroup.setAdmin(bookReader);
		newGroup.setName(groupName);
		newGroup.addNewMember(bookReader);
		groupRepository.save(newGroup);
		System.out.println("Neue Gruppe angelegt:"+groupName);
	}
	
	public List<Group> findGroupWhereMember(BookReader bookReader){
		return groupRepository.findByMembersContaining(bookReader);
	}

	public Group findById(Long id) {

		return groupRepository.findById(id).orElseThrow();
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
	public void transferAdmin(Long groupId, BookReader admin) {
		Group workGroup = groupRepository.findById(groupId).orElseThrow();
		workGroup.setAdmin(admin);
		
	}

	public void save(Group groupBook) {
		groupRepository.save(groupBook);
		
	}


}

