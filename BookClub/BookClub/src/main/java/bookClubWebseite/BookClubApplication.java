package bookClubWebseite;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.retry.annotation.EnableRetry;

@EnableRetry
@SpringBootApplication
public class BookClubApplication {

	public static void main(String[] args) {
		SpringApplication.run(BookClubApplication.class, args);
	}

}
