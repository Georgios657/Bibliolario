package bookClubWebseite.BookClubBook;

import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.http.HttpStatus;

@ResponseStatus(HttpStatus.CONFLICT)
public class BookAlreadySuggestedException extends RuntimeException {
    public BookAlreadySuggestedException(String message) {
        super(message);
    }
}		