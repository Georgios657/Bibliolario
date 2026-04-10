package bookClubWebseite.BookClubDTO;

import java.time.LocalDateTime;

//DTO für Posteingang und Nachrichtendetails
public record MessageDTO(
        Long id,
        String senderName,
        String receiverName,
        String subject,
        String content,
        LocalDateTime timestamp,
        boolean isRead,
        boolean invitation,
        Long groupId
) {}