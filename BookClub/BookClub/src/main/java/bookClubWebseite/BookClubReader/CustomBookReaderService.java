package bookClubWebseite.BookClubReader;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class CustomBookReaderService implements UserDetailsService  {
	@Autowired
	@Lazy
	private BookReaderService bookReaderService;

	
	@Override
	public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
		BookReader user = bookReaderService.findByUsernameOrMail(username);
        if (user == null) {
            throw new UsernameNotFoundException("Benutzer nicht gefunden");
        }
        return org.springframework.security.core.userdetails.User
                .withUsername(user.getUsername())
                .password(user.getPassword()) // BCrypt Passwort
                .roles(user.getRole()) // oder Rollen aus DB
                .build();
	}

}
