package bookClubWebseite.BookClubGroup;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import bookClubWebseite.BookClubDTO.GroupDTO;
import bookClubWebseite.BookClubReader.BookReader;

public interface GroupRepository extends JpaRepository<Group, Long>
{

	List<Group> findByMembersContaining(BookReader bookReader);
	

}
