package bookClubWebseite;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketTransportRegistration;
import jakarta.annotation.PostConstruct;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
	
    private final AuthChannelInterceptor interceptor;

    public WebSocketConfig(AuthChannelInterceptor interceptor) {
        this.interceptor = interceptor;
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(interceptor);
    }
    
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOrigins(
                        "http://localhost:5173",
                        "https://corrections-maintenance-eat-educational.trycloudflare.com"
                    )
                .withSockJS(); // ✅ Wichtig, weil dein React SockJS verwendet
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic", "/queue");
        config.setApplicationDestinationPrefixes("/app");
        config.setUserDestinationPrefix("/user");
    }

    @Override
    public void configureWebSocketTransport(WebSocketTransportRegistration registry) {
        registry.setMessageSizeLimit(200000);
        registry.setSendBufferSizeLimit(512 * 1024);
        registry.setSendTimeLimit(20000);
    }

    @PostConstruct
    public void init() {
        System.out.println("✅ WebSocketConfig LOADED");
    }
    


}