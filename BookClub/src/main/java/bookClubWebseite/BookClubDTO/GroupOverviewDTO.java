package bookClubWebseite.BookClubDTO;

import java.util.List;

public class GroupOverviewDTO {

    private List<GroupDTO> myGroups;
    private List<GroupDTO> availableGroups;

    public GroupOverviewDTO(List<GroupDTO> myGroups, List<GroupDTO> availableGroups) {
        this.myGroups = myGroups;
        this.availableGroups = availableGroups;
    }

    public List<GroupDTO> getMyGroups() {
        return myGroups;
    }

    public List<GroupDTO> getAvailableGroups() {
        return availableGroups;
    }
}