package bookClubWebseite;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import bookClubWebseite.BookClubReader.BookReader;
import bookClubWebseite.BookClubReader.BookReaderService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    
	@Autowired
	private BookReaderService bookReaderService;

    public AuthController(AuthenticationManager authenticationManager,
                          JwtService jwtService) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {

        // 1. User holen (vor Auth)
        BookReader user = bookReaderService.findByUsername(request.getUsername());

        // 2. BLOCKED check VOR Auth
        if (user != null && "BLOCKED".equals(user.getRole())) {
            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body("Account ist gesperrt");
        }

        // 3. erst jetzt authentifizieren
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                    request.getUsername(),
                    request.getPassword()
            )
        );

        // 4. Token erzeugen
        String token = jwtService.generateToken(authentication);

        System.out.println("token ist: " + token);

        // 5. Response
        return ResponseEntity.ok(
            new JwtResponse(
                token,
                user.getId(),
                user.getUsername(),
                user.getRole()
            )
        );
    }
}

