package bookClubWebseite.BookClubDTO;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

import com.fasterxml.jackson.annotation.JsonProperty;

import bookClubWebseite.BookClubBook.Book;
import bookClubWebseite.BookClubGroup.Group;
import bookClubWebseite.BookClubReader.BookReader;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GroupDetailDTO {
    private Long id;
    private String name;
    private String description;
    private MemberDTO  admin;
    private List<MemberDTO> members;
    private List<GroupBookDTO> books;
    private boolean isJoined;
    
 

    public record MemberDTO(Long id, String name, String email, boolean isAdmin) {}
    
    public record BookDTO(String id, String title, ArrayList<String> authors) {}
}

