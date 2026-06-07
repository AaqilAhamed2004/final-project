package com.aura.controller;

import com.aura.dto.LoginRequest;
import com.aura.dto.LoginResponseDto;
import com.aura.dto.RegisterRequest;
import com.aura.dto.UserResponseDto;
import com.aura.schema.User;
import com.aura.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public UserResponseDto register(@Valid @RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    @PostMapping(value = "/login", consumes = MediaType.APPLICATION_FORM_URLENCODED_VALUE)
    public LoginResponseDto login(
            @RequestParam("username") String username,
            @RequestParam("password") String password) {
        LoginRequest request = new LoginRequest();
        request.setEmail(username);
        request.setPassword(password);
        return authService.login(request);
    }

    @GetMapping("/me")
    public UserResponseDto getMe(@AuthenticationPrincipal User currentUser) {
        return UserResponseDto.builder()
                .id(currentUser.getId())
                .email(currentUser.getEmail())
                .fullName(currentUser.getFullName())
                .role(currentUser.getRole())
                .isActive(currentUser.isActive())
                .build();
    }
}
