package bookClubWebseite.BookClubReader;

import java.security.SecureRandom;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class BookReaderService {
	@Autowired
	private BookReaderRepository bookReaderRepository;
	
	@Autowired
	private PasswordEncoder passwordEncoder;
	

    public void registerBookReader(BookReader bookReader) { //Fügt neuen User hinzu, codiert das Password
    	String hashPw = passwordEncoder.encode(bookReader.getPassword());
    	bookReader.setPassword(hashPw);
    	bookReaderRepository.save(bookReader);
    }
    
    public void setPassword(BookReader bookReader, String password) {
    	bookReader.setPassword(passwordEncoder.encode(password));
    	bookReaderRepository.save(bookReader); // Speichert die Änderung
    }
    
    public BookReader findByUsername(String username) { //Findest Benutzer bei Benutzernamen
    	return bookReaderRepository.findByUsername(username);
    }
    
    public List<BookReader> findAllUsers(){ //Gibt alle benutzer zurück die nicht placeholder sind
    	 return bookReaderRepository.findAllActiveUsers();
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

	public boolean changePassword(String oldPassword, String newPassword, String username) {
		BookReader reader = bookReaderRepository.findByUsername(username);
		if (passwordEncoder.matches(oldPassword, reader.getPassword())) {
			System.out.println("Setze neues Password");
			setPassword(reader, newPassword);
			return true;
		}
		return false;
		
		
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
	

	
}
