package com.aura.controller;

import com.aura.dto.LoginResponseDto;
import com.aura.dto.RegisterRequest;
import com.aura.dto.UserResponseDto;
import com.aura.service.AuthService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.server.ResponseStatusException;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration tests for AuthController using full Spring Boot context + MockMvc.
 *
 * Uses @SpringBootTest + @AutoConfigureMockMvc — loads the complete security filter chain
 * (CORS, JWT filter, role guards) and exercises real HTTP request/response serialization.
 *
 * NOTE: We do NOT mock JwtAuthFilter here. We let the real filter run.
 * - For public endpoints (/register, /login): no auth token needed
 * - For protected endpoints (/me): we use @WithMockUser to inject a security principal
 *   directly into the Spring Security context, bypassing the JWT filter
 *
 * Tests cover:
 *  - POST /api/auth/register → 200 OK with sanitized user data (no password field)
 *  - POST /api/auth/register (duplicate email) → 400 Bad Request
 *  - POST /api/auth/register (invalid email format) → 400 validation error
 *  - POST /api/auth/register (password too short) → 400 validation error
 *  - POST /api/auth/login → 200 OK with access_token + nested user object
 *  - POST /api/auth/login (bad credentials) → 401 Unauthorized
 *  - GET  /api/auth/me (authenticated via @WithMockUser) → 200 OK
 *  - GET  /api/auth/me (no credentials) → 403 Forbidden
 */
@SpringBootTest
@AutoConfigureMockMvc
@DisplayName("AuthController — HTTP integration tests")
public class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    // Mock only the service layer — let the real security filters run
    @MockitoBean
    private AuthService authService;

    // Use a standard ObjectMapper instance configured with snake_case naming strategy
    private final ObjectMapper objectMapper = new ObjectMapper()
            .setPropertyNamingStrategy(com.fasterxml.jackson.databind.PropertyNamingStrategies.SNAKE_CASE);

    private RegisterRequest validRegisterRequest;
    private UserResponseDto mockUserResponse;
    private LoginResponseDto mockLoginResponse;

    @BeforeEach
    public void setUp() {
        // Valid registration payload
        validRegisterRequest = new RegisterRequest();
        validRegisterRequest.setEmail("gnofficer@aura.gov");
        validRegisterRequest.setPassword("securePass123");
        validRegisterRequest.setFullName("GN Officer Prime");
        validRegisterRequest.setRole("gn_officer");

        // Mock user response from service
        mockUserResponse = UserResponseDto.builder()
                .id("user-001")
                .email("gnofficer@aura.gov")
                .fullName("GN Officer Prime")
                .role("gn_officer")
                .isActive(true)
                .build();

        // Mock login response from service
        mockLoginResponse = LoginResponseDto.builder()
                .accessToken("mock.jwt.token.here")
                .tokenType("bearer")
                .user(LoginResponseDto.UserDetailsDto.builder()
                        .id("user-001")
                        .email("gnofficer@aura.gov")
                        .fullName("GN Officer Prime")
                        .role("gn_officer")
                        .build())
                .build();
    }

    // ── POST /api/auth/register ───────────────────────────────────────────────

    @Test
    @DisplayName("POST /register → 200 OK with user data on valid input")
    public void testRegisterSuccess() throws Exception {
        when(authService.register(any())).thenReturn(mockUserResponse);

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(validRegisterRequest)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.email").value("gnofficer@aura.gov"))
            .andExpect(jsonPath("$.role").value("gn_officer"))
            .andExpect(jsonPath("$.id").value("user-001"))
            // Password must NEVER appear in a registration response
            .andExpect(jsonPath("$.password").doesNotExist());
    }

    @Test
    @DisplayName("POST /register → 400 Bad Request when email already exists")
    public void testRegisterDuplicateEmail() throws Exception {
        when(authService.register(any()))
            .thenThrow(new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email already registered"));

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(validRegisterRequest)))
            .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("POST /register → 400 Bad Request when email format is invalid")
    public void testRegisterInvalidEmail() throws Exception {
        RegisterRequest badRequest = new RegisterRequest();
        badRequest.setEmail("not-an-email");
        badRequest.setPassword("securePass123");
        badRequest.setFullName("Bad User");

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(badRequest)))
            .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("POST /register → 400 Bad Request when password is too short (< 6 chars)")
    public void testRegisterPasswordTooShort() throws Exception {
        RegisterRequest badRequest = new RegisterRequest();
        badRequest.setEmail("test@aura.gov");
        badRequest.setPassword("123"); // < 6 characters — fails @Size(min=6) constraint
        badRequest.setFullName("Short Pass User");

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(badRequest)))
            .andExpect(status().isBadRequest());
    }

    // ── POST /api/auth/login ─────────────────────────────────────────────────

    @Test
    @DisplayName("POST /login → 200 OK with access_token and nested user object")
    public void testLoginSuccess() throws Exception {
        when(authService.login(any())).thenReturn(mockLoginResponse);

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .param("username", "gnofficer@aura.gov")
                .param("password", "securePass123"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.access_token").value("mock.jwt.token.here"))
            .andExpect(jsonPath("$.token_type").value("bearer"))
            .andExpect(jsonPath("$.user.email").value("gnofficer@aura.gov"))
            .andExpect(jsonPath("$.user.role").value("gn_officer"))
            .andExpect(jsonPath("$.access_token").isNotEmpty());
    }

    @Test
    @DisplayName("POST /login → 401 Unauthorized with invalid credentials")
    public void testLoginInvalidCredentials() throws Exception {
        when(authService.login(any()))
            .thenThrow(new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .param("username", "wrong@aura.gov")
                .param("password", "wrongpass"))
            .andExpect(status().isUnauthorized());
    }

    // ── GET /api/auth/me ─────────────────────────────────────────────────────

    @Test
    @DisplayName("GET /me → 200 OK when authenticated via @WithMockCustomUser")
    @WithMockCustomUser(role = "gn_officer")
    public void testGetMeAuthenticated() throws Exception {
        // @WithMockCustomUser injects a domain User principal directly into the SecurityContext,
        // matching the type expected by @AuthenticationPrincipal in AuthController.getMe().
        mockMvc.perform(get("/api/auth/me"))
            .andExpect(status().isOk());
    }

    @Test
    @DisplayName("GET /me → 403 Forbidden when not authenticated")
    public void testGetMeUnauthenticated() throws Exception {
        // No token, no @WithMockUser → real JWT filter runs → finds no token → 403
        mockMvc.perform(get("/api/auth/me"))
            .andExpect(status().isForbidden());
    }
}
