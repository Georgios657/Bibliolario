package bookClubWebseite.BookClubSuggestionBook;

import bookClubWebseite.BookClubBook.Book;
import bookClubWebseite.BookClubDTO.BookBasicDTO;
import bookClubWebseite.BookClubDTO.GroupDetailDTO.BookDTO;

public class BookMapper {

	public static BookBasicDTO toDTO(BookSuggestion sug) {
	    return BookBasicDTO.builder()
	            .title(sug.getBookName())
	            .authors(sug.getAuthors())
	            .isbn(sug.getISBN())
	            .language(sug.getLanguage())
	            .publishedDate(
	                sug.getPublishDate() != null
	                    ? String.valueOf(sug.getPublishDate().getYear())
	                    : null
	            )
	            .build();
	}
}
