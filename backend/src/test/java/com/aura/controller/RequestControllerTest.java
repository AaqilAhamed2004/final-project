package com.aura.controller;

import com.aura.dto.ReliefRequestCreateDto;
import com.aura.dto.UpdateStatusDto;
import com.aura.schema.ReliefRequest;
import com.aura.schema.RequestItem;
import com.aura.service.RequestService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration tests for RequestController — Role-based access control.
 *
 * Uses @SpringBootTest + @AutoConfigureMockMvc to load the full security chain,
 * ensuring that @PreAuthorize guards are enforced exactly as in production.
 *
 * Key design decisions:
 * - We do NOT mock JwtAuthFilter. The real filter runs.
 * - For unauthenticated tests: no token provided → real filter → 403
 * - For authenticated tests: @WithMockUser injects principal directly into SecurityContext
 * - Only RequestService is mocked via @MockitoBean to isolate the HTTP layer from DB
 *
 * Tests cover:
 *  - GET  /api/requests → 200 OK with list (Donor role — any authenticated user)
 *  - GET  /api/requests → 403 Forbidden (unauthenticated)
 *  - POST /api/requests → 200 OK (GN Officer role — authorised by @PreAuthorize)
 *  - POST /api/requests → 200 OK (Super Admin role — authorised by @PreAuthorize)
 *  - POST /api/requests → 403 Forbidden (Donor role — blocked by @PreAuthorize)
 *  - POST /api/requests → 403 Forbidden (unauthenticated)
 *  - PATCH /api/requests/{id}/status → 200 OK (Super Admin — authorised)
 *  - PATCH /api/requests/{id}/status → 403 Forbidden (Donor role — blocked)
 */
@SpringBootTest
@AutoConfigureMockMvc
@DisplayName("RequestController — Role-based access control integration tests")
public class RequestControllerTest {

    @Autowired
    private MockMvc mockMvc;

    // Mock only the service layer — real security filters run
    @MockitoBean
    private RequestService requestService;

    // Use a standard ObjectMapper instance configured with snake_case naming strategy
    private final ObjectMapper objectMapper = new ObjectMapper()
            .setPropertyNamingStrategy(com.fasterxml.jackson.databind.PropertyNamingStrategies.SNAKE_CASE);

    private ReliefRequest mockRequest;
    private ReliefRequestCreateDto createDto;

    @BeforeEach
    public void setUp() {
        // Build a mock relief request returned by the service
        RequestItem item = new RequestItem();
        item.setItemName("Paracetamol");
        item.setCategory("medicine");
        item.setQuantity(200);
        item.setCurrentStock(5);

        mockRequest = ReliefRequest.builder()
                .id("req-001")
                .title("Medical Supply Request — Sector 7")
                .location("Gampaha District")
                .roadStatus("blocked")
                .populationSize("large")
                .items(List.of(item))
                .status("pending")
                .priorityLevel("Critical")
                .build();

        // Build a valid create request DTO
        createDto = new ReliefRequestCreateDto();
        createDto.setTitle("Medical Supply Request — Sector 7");
        createDto.setDescription("Critical medicine shortage after flooding");
        createDto.setLocation("Gampaha District");
        createDto.setRoadStatus("blocked");
        createDto.setPopulationSize("large");
        createDto.setItems(List.of(item));
    }

    // ── GET /api/requests ─────────────────────────────────────────────────────

    @Test
    @DisplayName("GET /api/requests → 200 OK with list for authenticated Donor")
    @WithMockUser(username = "donor-001", roles = {"DONOR"})
    public void testGetAllRequestsAsAuthenticatedDonor() throws Exception {
        when(requestService.getAllRequests()).thenReturn(List.of(mockRequest));

        mockMvc.perform(get("/api/requests"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(1)))
            .andExpect(jsonPath("$[0].id").value("req-001"))
            .andExpect(jsonPath("$[0].status").value("pending"))
            // Verify snake_case JSON output (Jackson SNAKE_CASE naming strategy)
            .andExpect(jsonPath("$[0].priority_level").value("Critical"))
            .andExpect(jsonPath("$[0].road_status").value("blocked"));
    }

    @Test
    @DisplayName("GET /api/requests → 403 Forbidden for unauthenticated requests")
    public void testGetAllRequestsUnauthenticated() throws Exception {
        mockMvc.perform(get("/api/requests"))
            .andExpect(status().isForbidden());
    }

    // ── POST /api/requests ────────────────────────────────────────────────────

    @Test
    @DisplayName("POST /api/requests → 200 OK for GN Officer (authorised role)")
    @WithMockUser(username = "gn-001", roles = {"GN_OFFICER"})
    public void testCreateRequestAsGnOfficer() throws Exception {
        when(requestService.createRequest(any(), any())).thenReturn(mockRequest);

        mockMvc.perform(post("/api/requests")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createDto)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value("req-001"))
            .andExpect(jsonPath("$.title").value("Medical Supply Request — Sector 7"));
    }

    @Test
    @DisplayName("POST /api/requests → 200 OK for Super Admin (authorised role)")
    @WithMockUser(username = "admin-001", roles = {"SUPER_ADMIN"})
    public void testCreateRequestAsSuperAdmin() throws Exception {
        when(requestService.createRequest(any(), any())).thenReturn(mockRequest);

        mockMvc.perform(post("/api/requests")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createDto)))
            .andExpect(status().isOk());
    }

    @Test
    @DisplayName("POST /api/requests → 403 Forbidden for Donor role — cannot create requests")
    @WithMockUser(username = "donor-001", roles = {"DONOR"})
    public void testCreateRequestAsDonorIsForbidden() throws Exception {
        // CRITICAL SECURITY TEST: Donors must NEVER be able to create relief requests.
        // @PreAuthorize("hasAnyRole('GN_OFFICER', 'SUPER_ADMIN')") must block this.
        mockMvc.perform(post("/api/requests")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createDto)))
            .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("POST /api/requests → 403 Forbidden when unauthenticated")
    public void testCreateRequestUnauthenticated() throws Exception {
        mockMvc.perform(post("/api/requests")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createDto)))
            .andExpect(status().isForbidden());
    }

    // ── PATCH /api/requests/{id}/status ──────────────────────────────────────

    @Test
    @DisplayName("PATCH /api/requests/{id}/status → 200 OK for Super Admin")
    @WithMockUser(username = "admin-001", roles = {"SUPER_ADMIN"})
    public void testUpdateStatusAsSuperAdmin() throws Exception {
        ReliefRequest approvedRequest = ReliefRequest.builder()
                .id("req-001")
                .title("Medical Supply Request — Sector 7")
                .status("approved")
                .priorityLevel("Critical")
                .build();

        when(requestService.updateStatus(eq("req-001"), any())).thenReturn(approvedRequest);

        UpdateStatusDto statusDto = new UpdateStatusDto();
        statusDto.setStatus("approved");

        mockMvc.perform(patch("/api/requests/req-001/status")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(statusDto)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("approved"));
    }

    @Test
    @DisplayName("PATCH /api/requests/{id}/status → 403 Forbidden for Donor — cannot change status")
    @WithMockUser(username = "donor-001", roles = {"DONOR"})
    public void testUpdateStatusAsDonorIsForbidden() throws Exception {
        // CRITICAL SECURITY TEST: Donors must NEVER be able to change request statuses.
        UpdateStatusDto statusDto = new UpdateStatusDto();
        statusDto.setStatus("approved");

        mockMvc.perform(patch("/api/requests/req-001/status")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(statusDto)))
            .andExpect(status().isForbidden());
    }
}
