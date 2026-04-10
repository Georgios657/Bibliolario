package bookClubWebseite.BookClubDTO;

import java.util.List;
import java.util.Set;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class GroupDTO {

    private Long id;
    private String name;
    private String adminName;
    private int memberCount;
    private int bookCount;
    private boolean joined;
    private boolean isPrivate;
    private boolean joining;
    private Set<JoinRequestDTOSelfInvite> joinRequests;

}