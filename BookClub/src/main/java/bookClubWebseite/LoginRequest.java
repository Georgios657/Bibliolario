package bookClubWebseite;

import org.jspecify.annotations.Nullable;

import lombok.Data;

@Data
public class LoginRequest {
    private String username;
    private String password;
	
}
