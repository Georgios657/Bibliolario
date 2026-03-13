package bookClubWebseite;

import java.util.ArrayList;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import bookClubWebseite.BookClubBook.BookRepository;
import bookClubWebseite.BookClubBook.BookService;
import bookClubWebseite.BookClubReader.BookReader;
import bookClubWebseite.BookClubReader.BookReaderRepository;

@Configuration
public class DataInitializer {


    @Bean
    CommandLineRunner initAdmin(BookReaderRepository bookReaderRepository,
                                PasswordEncoder passwordEncoder, BookRepository bookRepository,
                                BookService bookService) {
        return args -> {
        //     Prüfen, ob schon ein Buch existiert
           if(bookRepository.findByISBN("9783755800545") == null) {
           	bookService.registerBook("9783755800545");
               System.out.println("Buch angelegt");
           }        	

           if(bookReaderRepository.findByUsername("superadmin") == null) {
               BookReader admin = new BookReader();
               admin.setUsername("superadmin");
               admin.setEmail("admin@example.com");
               admin.setPassword(passwordEncoder.encode("superadmin")); // initiales Passwort
               admin.setRole("SUPERADMIN"); // Rolle ADMIN
               bookReaderRepository.save(admin);
               System.out.println("Superadmin user angelegt: superadmin / superadmin");
           }
           
            if(bookReaderRepository.findByUsername("admin") == null) {
                BookReader admin = new BookReader();
                admin.setUsername("admin");
                admin.setEmail("admin@example.com");
                admin.setPassword(passwordEncoder.encode("admin")); // initiales Passwort
                admin.setRole("ADMIN"); // Rolle ADMIN
                bookReaderRepository.save(admin);
                System.out.println("Admin user angelegt: admin / admin");
            }
            
            if(bookReaderRepository.findByUsername("user") == null) {
                BookReader user = new BookReader();
                user.setUsername("user");
                user.setEmail("usern@example.com");
                user.setPassword(passwordEncoder.encode("user")); // initiales Passwort
                user.setRole("USER"); // Rolle ADMIN
                bookReaderRepository.save(user);
                System.out.println("User user angelegt: user / user");
            }
            
            
            
        };
    }
}










