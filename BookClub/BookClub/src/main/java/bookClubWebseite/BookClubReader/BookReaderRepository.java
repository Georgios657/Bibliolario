package bookClubWebseite.BookClubReader;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import bookClubWebseite.BookClubDTO.UserDTO;

public interface BookReaderRepository extends JpaRepository<BookReader, Long> {
	

	@Query("SELECT b FROM BookReader b WHERE b.email NOT LIKE 'placeholder' AND b.username NOT LIKE 'deleted-%'")
	List<BookReader> findAllActiveUsers();


	 BookReader findByUsername(String username);

	 BookReader findByEmail(String email);
	 
	 Optional<BookReader> findById(Long id);
	 
	 boolean existsByUsername(String username);
	 
	 boolean existsByEmail(String email);
	 
	 @Query("SELECT new bookClubWebseite.BookClubDTO.UserDTO(u.id, u.username, u.email, u.role) " +
		       "FROM BookReader u")
		List<UserDTO> findAllUsersForAdmin();
	 
	 @Query("SELECT new bookClubWebseite.BookClubDTO.UserDTO(u.id, u.username, u.email, u.role) " +
		       "FROM BookReader u " +
		       "WHERE u.id <> :currentUserId " +
		       "AND u.role <> 'BLOCKED' " +
		       "AND NOT EXISTS (" +
		       "   SELECT g FROM Group g WHERE g MEMBER OF u.groups AND g.id = :groupId" +
		       ")")
		List<UserDTO> findInvitableUsers(@Param("currentUserId") Long currentUserId,
		                                       @Param("groupId") Long groupId);
}
