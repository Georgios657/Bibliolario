package bookClubWebseite.BookClubDTO;

import java.util.List;

import bookClubWebseite.BookClubGroup.Group;
import bookClubWebseite.BookClubRating.RatingClass;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {
    private Long id;
    private String name;
    private String email;
    private String role;


}
