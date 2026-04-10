package bookClubWebseite.BookClubDTO;

import com.fasterxml.jackson.annotation.JsonProperty;

public class CreateGroupDTO {
    private String name;
    private String description;
    
    @JsonProperty("isPrivate")
    private boolean isPrivate;

    // Getter & Setter
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public boolean isPrivate() { return isPrivate; }
    public void setPrivate(boolean isPrivate) { this.isPrivate = isPrivate; }
}
