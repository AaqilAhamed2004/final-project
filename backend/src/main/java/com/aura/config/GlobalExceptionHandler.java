package com.aura.config;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authorization.AuthorizationDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, String>> handleResponseStatusException(ResponseStatusException ex) {
        Map<String, String> body = new HashMap<>();
        body.put("detail", ex.getReason());
        return new ResponseEntity<>(body, ex.getStatusCode());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidationException(MethodArgumentNotValidException ex) {
        Map<String, String> body = new HashMap<>();
        String errorMsg = ex.getBindingResult().getFieldErrors().stream()
                .map(error -> error.getField() + ": " + error.getDefaultMessage())
                .reduce((first, second) -> first + ", " + second)
                .orElse("Validation error");
        body.put("detail", errorMsg);
        return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
    }

    /**
     * Handles @PreAuthorize / @PostAuthorize authorization failures in Spring Security.
     * Maps both legacy AccessDeniedException and modern AuthorizationDeniedException to 403 Forbidden.
     */
    @ExceptionHandler({AccessDeniedException.class, AuthorizationDeniedException.class})
    public ResponseEntity<Map<String, String>> handleAccessDeniedException(Exception ex) {
        Map<String, String> body = new HashMap<>();
        body.put("detail", "Access denied: you do not have permission to perform this action");
        return new ResponseEntity<>(body, HttpStatus.FORBIDDEN);
    }

    /**
     * Handles authentication failures (invalid/missing credentials).
     */
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<Map<String, String>> handleAuthenticationException(AuthenticationException ex) {
        Map<String, String> body = new HashMap<>();
        body.put("detail", "Authentication required");
        return new ResponseEntity<>(body, HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleGeneralException(Exception ex) {
        Map<String, String> body = new HashMap<>();
        body.put("detail", "Internal server error: " + ex.getMessage());
        return new ResponseEntity<>(body, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
