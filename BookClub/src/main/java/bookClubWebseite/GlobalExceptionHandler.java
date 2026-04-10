package bookClubWebseite;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import bookClubWebseite.BookClubBook.BookAlreadySuggestedException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(BookAlreadySuggestedException.class)
    public ResponseEntity<Map<String, String>> handleBookAlreadySuggested(BookAlreadySuggestedException ex) {

        Map<String, String> error = new HashMap<>();
        error.put("message", ex.getMessage());

        return ResponseEntity
                .badRequest()
                .body(error);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleBadRequest(IllegalArgumentException ex) {

        Map<String, String> error = new HashMap<>();
        error.put("message", ex.getMessage());

        return ResponseEntity
                .badRequest()
                .body(error);
    }
}