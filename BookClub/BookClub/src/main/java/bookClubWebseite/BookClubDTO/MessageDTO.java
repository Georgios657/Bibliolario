package bookClubWebseite.BookClubDTO;

import java.time.LocalDateTime;

//DTO für Posteingang und Nachrichtendetails
public record MessageDTO(
     Long id,
     String sender,
     String subject,
     LocalDateTime sentAt,
     String content,
     boolean invitation,
     Long groupId
) {}