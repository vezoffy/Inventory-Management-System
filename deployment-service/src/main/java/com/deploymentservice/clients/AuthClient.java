package com.deploymentservice.clients;

import com.deploymentservice.exceptions.ServiceCommunicationException;
import lombok.AllArgsConstructor;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Component
public class AuthClient {

    private final WebClient.Builder webClientBuilder;

    @Autowired
    public AuthClient(WebClient.Builder webClientBuilder) {
        this.webClientBuilder = webClientBuilder;
    }

    public Mono<Void> registerUser(AuthServiceUserRequest request) {
        return webClientBuilder.build().post()
                .uri("lb://auth-micro-service/api/auth/register-internal") // Corrected service name
                .bodyValue(request)
                .retrieve()
                .onStatus(HttpStatusCode::isError, response ->
                        response.bodyToMono(String.class)
                                .flatMap(errorBody -> Mono.error(new ServiceCommunicationException("Failed to register user in Auth Service: " + errorBody)))
                )
                .bodyToMono(Void.class);
    }

    @Data
    @AllArgsConstructor
    public static class AuthServiceUserRequest {
        private String username;
        private String password;
        private String role;
    }
}
