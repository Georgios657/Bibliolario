package bookClubWebseite;

import org.springframework.context.annotation.Lazy;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

//@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final @Lazy UserDetailsService userDetailsService;


		@Override
		protected boolean shouldNotFilter(HttpServletRequest request) {
		    String path = request.getRequestURI();
		    System.out.println("PATH: '" + path + "'");

		    if (path == null || path.isEmpty() || path.equals("/")) {
		        return true;
		    }

		    return path.startsWith("/health")
		        || path.startsWith("/ws")
		        || path.startsWith("/api/auth");

		}


    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String path = request.getRequestURI();

        // 1. WebSocket komplett ignorieren (WICHTIG)
        if (isWebSocketRequest(path)) {
            filterChain.doFilter(request, response);
            return;
        }

        // 2. Token extrahieren
        String authHeader = request.getHeader("Authorization");

        if (!hasBearerToken(authHeader)) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = extractToken(authHeader);

        // 3. Username aus Token holen
        String username;
        try {
            username = jwtService.extractUsername(token);
        } catch (Exception e) {
            filterChain.doFilter(request, response);
            return;
        }

        // 4. SecurityContext nur setzen wenn nötig
        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {

            UserDetails userDetails = userDetailsService.loadUserByUsername(username);

            if (jwtService.isTokenValid(token, userDetails)) {

                UsernamePasswordAuthenticationToken authToken =
                        new UsernamePasswordAuthenticationToken(
                                userDetails,
                                null,
                                userDetails.getAuthorities()
                        );

                authToken.setDetails(
                        new WebAuthenticationDetailsSource().buildDetails(request)
                );

                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }

        filterChain.doFilter(request, response);
    }
    
    private boolean isWebSocketRequest(String path) {
        return path.startsWith("/ws");
    }

    private boolean hasBearerToken(String header) {
        return header != null && header.startsWith("Bearer ");
    }

    private String extractToken(String header) {
        return header.substring(7);
    }
}