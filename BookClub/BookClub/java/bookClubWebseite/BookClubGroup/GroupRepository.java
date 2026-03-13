package bookClubWebseite.BookClubGroup;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import bookClubWebseite.BookClubReader.BookReader;

public interface GroupRepository extends JpaRepository<Group, Long>
{

	List<Group> findByMembersContaining(BookReader bookReader);

}
