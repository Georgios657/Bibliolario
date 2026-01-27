package bookClubWebseite;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;

@Configuration
@EnableWebSecurity
public class SecurityConfig {
	
    
	@Bean
	public AuthenticationManager authManager(AuthenticationConfiguration config) throws Exception {
	    return config.getAuthenticationManager();
	}
	
@Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
        	.csrf(csrf -> csrf
                // CSRF-Token in Cookie speichern
                .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
            )
            .authorizeHttpRequests(auth -> auth
            		.requestMatchers("/css/**", "/picture/**").permitAll() // CSS & Bilder freigeben
                .requestMatchers("/", "/register", "/passwordReset").permitAll() //Jeder darf auf die Registierungswebseite
                .requestMatchers("/admin/**").hasAnyRole("ADMIN", "SUPERADMIN") //Nur Admin darf auf die Admin Seiten
                .requestMatchers("/ownCollection/**").authenticated() 
                .anyRequest().authenticated()
            )
            .formLogin(form -> form
                .loginPage("/login") //Hier erfolgt Login
                .defaultSuccessUrl("/mainpage", true) // Nach erfolgreichen Login wird zu dieser Seite geleitet
                .permitAll()
            )
            .logout(logout -> logout.permitAll())


            ;
        return http.build();
    }


@Bean
public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
}


}
