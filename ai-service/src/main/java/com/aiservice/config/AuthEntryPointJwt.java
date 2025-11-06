package com.aiservice.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.buffer.DataBufferFactory;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.server.ServerAuthenticationEntryPoint;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@Component
public class AuthEntryPointJwt implements ServerAuthenticationEntryPoint {

    private static final Logger logger = LoggerFactory.getLogger(AuthEntryPointJwt.class);

    @Override
    public Mono<Void> commence(ServerWebExchange exchange, AuthenticationException ex) {
        logger.error("Unauthorized error: {}", ex.getMessage());
        return Mono.fromRunnable(() -> {
            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
            exchange.getResponse().getHeaders().add("Content-Type", "application/json");
            String errorBody = "{\"status\":401,\"error\":\"Unauthorized\",\"message\":\"Full authentication is required to access this resource\"}";
            exchange.getResponse().writeWith(Mono.just(exchange.getResponse().bufferFactory().wrap(errorBody.getBytes()))).subscribe();
        });
    }
}
