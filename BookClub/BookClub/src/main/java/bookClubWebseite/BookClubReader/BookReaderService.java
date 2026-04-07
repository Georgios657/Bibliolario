package bookClubWebseite.BookClubReader;

import java.security.SecureRandom;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import bookClubWebseite.BookClubDTO.UserDTO;

@Service
public class BookReaderService {
	@Autowired
	private BookReaderRepository bookReaderRepository;
	
	@Autowired
	private PasswordEncoder passwordEncoder;
	

    public BookReader registerBookReader(BookReader bookReader) { //Fügt neuen User hinzu, codiert das Password
    	String hashPw = passwordEncoder.encode(bookReader.getPassword());
    	bookReader.setPassword(hashPw);
    	return bookReaderRepository.save(bookReader);
    	
    	
    }
    
    public void setPassword(BookReader bookReader, String password) {
    	bookReader.setPassword(passwordEncoder.encode(password));
    	bookReaderRepository.save(bookReader); // Speichert die Änderung
    }
    
    public BookReader findByUsername(String username) { //Findest Benutzer bei Benutzernamen
    	return bookReaderRepository.findByUsername(username);
    }
    


	public void promoteToAdmin(Long id) { //Setzt Benutzer auf Admin
		  BookReader user = bookReaderRepository.findById(id).orElseThrow();
		    user.setRole("ADMIN");
		    bookReaderRepository.save(user);
	}
    
	public void demoteToUser(Long id) { //Degradiert Admin zu einem Benutzer
	    BookReader user = bookReaderRepository.findById(id).orElseThrow();
	    if (user.getRole() == "ADMIN") {
		    user.setRole("USER");
		    bookReaderRepository.save(user);	    	
	    }

	}

	public BookReader findByEmail(String email) {
		return bookReaderRepository.findByEmail(email);
		
	}
	

    public String generateStrongPassword(int length) {
        if (length < 8) length = 8;

        String UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        String LOWER = "abcdefghijklmnopqrstuvwxyz";
        String DIGITS = "0123456789";
        String SPECIAL = "!@#$%^&*()-_=+[]{}";
        String ALL = UPPER + LOWER + DIGITS + SPECIAL;

        SecureRandom rnd = new SecureRandom();
        List<Character> chars = new ArrayList<>();

        // mindestens je 1 aus jeder Kategorie
        chars.add(UPPER.charAt(rnd.nextInt(UPPER.length())));
        chars.add(LOWER.charAt(rnd.nextInt(LOWER.length())));
        chars.add(DIGITS.charAt(rnd.nextInt(DIGITS.length())));
        chars.add(SPECIAL.charAt(rnd.nextInt(SPECIAL.length())));

        // Rest auffüllen
        for (int i = chars.size(); i < length; i++) {
            chars.add(ALL.charAt(rnd.nextInt(ALL.length())));
        }

        // mischen
        Collections.shuffle(chars, rnd);

        StringBuilder sb = new StringBuilder(length);
        for (char c : chars) sb.append(c);
        return sb.toString();
    }

	public void changeMail(BookReader byUsername, String email) {
		byUsername.setEmail(email);
		bookReaderRepository.save(byUsername);
		
	}

	public BookReader findByUsernameOrMail(String username) {
		if ( bookReaderRepository.findByUsername(username) == null) {
			return bookReaderRepository.findByEmail(username);
		}
		return   bookReaderRepository.findByUsername(username);
		
	}

	public void deleteUser(Long id) {
		Optional<BookReader> opreader = bookReaderRepository.findById(id);
		
		if(opreader.isPresent()) {
			BookReader reader = opreader.get();
			reader.setEmail("placeholder");
			reader.setUsername("deleted"+id);
			String newPW = String.valueOf(id);
			setPassword(reader, newPW);				
		}

	}

	public BookReader findById(Long adminId) {
		// TODO Auto-generated method stub
		return bookReaderRepository.findById(adminId).orElseThrow();
	}

	public boolean existsByUsername(String username) {
	    return bookReaderRepository.existsByUsername(username);
	}

	public boolean existsByEmail(String email) {
				  return bookReaderRepository.existsByEmail(email);
	}

	public void changeEmail(String newEmail, String password, String username) {
	    BookReader user = bookReaderRepository.findByUsername(username);
	    if (!passwordEncoder.matches(password, user.getPassword())) {
	        throw new RuntimeException("Passwort stimmt nicht");
	    }
	    user.setEmail(newEmail);
	    bookReaderRepository.save(user);
	}
	
	public void changePassword(String username, String currentPassword, String newPassword) {
	    BookReader user = bookReaderRepository.findByUsername(username);
	    if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
	        throw new RuntimeException("Aktuelles Passwort stimmt nicht");
	    }
	    user.setPassword(passwordEncoder.encode(newPassword));
	    bookReaderRepository.save(user);
	}

	public void softDeleteUser(Long userId) {
	    BookReader user = bookReaderRepository.findById(userId)
	            .orElseThrow(() -> new RuntimeException("User nicht gefunden"));

	    // Random Passwort
	    String randomPassword = UUID.randomUUID().toString();
	    user.setPassword(passwordEncoder.encode(randomPassword));

	    // Name und Email anonymisieren
	    user.setUsername("deleted" + System.currentTimeMillis());
	    user.setEmail("deleted_" + System.currentTimeMillis() + "@deleted.local");
	    user.setRole("DELETED");

	    bookReaderRepository.save(user);
	}

	@Transactional
	public List<UserDTO> getAllInvitable(BookReader reader, Long groupId) {
	    return bookReaderRepository.findInvitableUsers(reader.getId(), groupId);
	}
	
    public List<UserDTO> findAllUsers(){ //Gibt alle benutzer zurück die nicht placeholder sind
   	 return bookReaderRepository.findAllUsersForAdmin();
   }

	public void blockUnblock(Long id) {
		BookReader reader = bookReaderRepository.findById(id)
			    .orElseThrow(() -> new RuntimeException("User nicht gefunden"));
		System.out.println("Blocking:"+reader.getUsername());
		if (!"BLOCKED".equals(reader.getRole())) {
			reader.setRole("BLOCKED");
		}
		else {
			reader.setRole("USER");
		}
		bookReaderRepository.save(reader);
		
	}

	public void adminUnadmin(Long id) {
		BookReader reader = bookReaderRepository.findById(id)
			    .orElseThrow(() -> new RuntimeException("User nicht gefunden"));
		if (reader.getRole().equals("BLOCKED")) {
			 new RuntimeException("User gesperrt");
		}
		System.out.println("Admin:"+reader.getUsername());
		if (!"ADMIN".equals(reader.getRole())) {
			reader.setRole("ADMIN");
		}
		else {
			reader.setRole("USER");
		}
		bookReaderRepository.save(reader);
		
	}

	
}
