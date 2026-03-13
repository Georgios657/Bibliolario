package bookClubWebseite.BookClubReader;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface BookReaderRepository extends JpaRepository<BookReader, Long> {
	

	@Query("SELECT b FROM BookReader b WHERE b.email NOT LIKE 'placeholder' AND b.username NOT LIKE 'deleted-%'")
	List<BookReader> findAllActiveUsers();


	 BookReader findByUsername(String username);

	 BookReader findByEmail(String email);
	 
	 Optional<BookReader> findById(Long id);
}
