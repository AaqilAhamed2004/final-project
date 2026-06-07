package com.aura.service;

import com.aura.dto.PrologAnalysisResponseDto;
import com.aura.repository.AnalysisRepository;
import com.aura.repository.RequestRepository;
import com.aura.schema.PrologAnalysis;
import com.aura.schema.ReliefRequest;
import com.aura.schema.RequestItem;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

/**
 * Unit tests for AnalysisService — the AI pipeline orchestrator.
 *
 * Uses Mockito to mock repositories and inject real PriorityRulesService
 * and RiskAssessmentService, so the logic chain is fully exercised without
 * a MongoDB connection or Spring context.
 *
 * Test scenarios:
 *  - Critical request (medicine + blocked roads) → red priority → "Critical" label
 *  - Urgent request (medicine + low stock) → orange priority → "Urgent" label
 *  - Standard request (shelter + clear roads) → yellow priority → "Standard" label
 *  - Risk flags are populated correctly in the saved document
 *  - toResponseDto() maps snake_case fields for frontend compatibility
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("AnalysisService — AI pipeline orchestration tests")
public class AnalysisServiceTest {

    @Mock
    private RequestRepository requestRepository;

    @Mock
    private AnalysisRepository analysisRepository;

    // Use real implementations — these are already fully tested individually
    private PriorityRulesService priorityRulesService;
    private RiskAssessmentService riskAssessmentService;

    @InjectMocks
    private AnalysisService analysisService;

    @BeforeEach
    public void setUp() {
        // Manually inject real service instances since @InjectMocks only handles @Mock fields
        priorityRulesService = new PriorityRulesService();
        riskAssessmentService = new RiskAssessmentService();
        analysisService = new AnalysisService();

        // Use reflection-friendly setters via Spring's ReflectionTestUtils or just set fields directly
        org.springframework.test.util.ReflectionTestUtils.setField(analysisService, "requestRepository", requestRepository);
        org.springframework.test.util.ReflectionTestUtils.setField(analysisService, "analysisRepository", analysisRepository);
        org.springframework.test.util.ReflectionTestUtils.setField(analysisService, "priorityRulesService", priorityRulesService);
        org.springframework.test.util.ReflectionTestUtils.setField(analysisService, "riskAssessmentService", riskAssessmentService);
    }

    // ── Helper: build a ReliefRequest with a single item ────────────────────

    private ReliefRequest buildRequest(String id, String roadStatus, String popSize,
                                       String itemCategory, int stock) {
        RequestItem item = new RequestItem();
        item.setItemName("Test Item");
        item.setCategory(itemCategory);
        item.setCurrentStock(stock);

        return ReliefRequest.builder()
                .id(id)
                .roadStatus(roadStatus)
                .populationSize(popSize)
                .items(List.of(item))
                .build();
    }

    // ── Priority level mapping ────────────────────────────────────────────────

    @Test
    @DisplayName("Medicine + blocked roads → Critical priority (red)")
    public void testCriticalPriorityAssigned() {
        // Arrange
        ReliefRequest request = buildRequest("req-001", "blocked", "small", "medicine", 50);
        when(requestRepository.findById("req-001")).thenReturn(Optional.of(request));
        when(analysisRepository.findByRequestId("req-001")).thenReturn(Optional.empty());
        when(analysisRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(requestRepository.save(any())).thenReturn(request);

        // Act
        PrologAnalysis result = analysisService.analyzeRequestSync("req-001");

        // Assert
        assertEquals("red", result.getPriorityColor(), "Medicine + blocked → red");
        assertEquals("Critical", result.getPriorityLevel(), "Label should be 'Critical'");
        assertEquals(90, result.getPriorityScore(), "Score for red = 90");
        assertNotNull(result.getRiskFlags(), "Risk flags should not be null");
        assertFalse(result.getRiskFlags().isEmpty(), "Should have at least one risk flag for blocked road");
    }

    @Test
    @DisplayName("Medicine + low stock + clear road → Urgent priority (orange)")
    public void testUrgentPriorityAssigned() {
        // Arrange — stock = 5 (< 10 → "low"), road = clear, category = medicine
        ReliefRequest request = buildRequest("req-002", "clear", "small", "medicine", 5);
        when(requestRepository.findById("req-002")).thenReturn(Optional.of(request));
        when(analysisRepository.findByRequestId("req-002")).thenReturn(Optional.empty());
        when(analysisRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(requestRepository.save(any())).thenReturn(request);

        // Act
        PrologAnalysis result = analysisService.analyzeRequestSync("req-002");

        // Assert
        assertEquals("orange", result.getPriorityColor(), "Medicine + low stock → orange");
        assertEquals("Urgent", result.getPriorityLevel());
        assertEquals(60, result.getPriorityScore());
    }

    @Test
    @DisplayName("Shelter + clear road + adequate stock → Standard priority (yellow)")
    public void testStandardPriorityAssigned() {
        // Arrange — stock = 100 (≥ 10 → "available"), road = clear, category = shelter
        ReliefRequest request = buildRequest("req-003", "clear", "small", "shelter", 100);
        when(requestRepository.findById("req-003")).thenReturn(Optional.of(request));
        when(analysisRepository.findByRequestId("req-003")).thenReturn(Optional.empty());
        when(analysisRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(requestRepository.save(any())).thenReturn(request);

        // Act
        PrologAnalysis result = analysisService.analyzeRequestSync("req-003");

        // Assert
        assertEquals("yellow", result.getPriorityColor(), "Shelter + clear + adequate stock → yellow");
        assertEquals("Standard", result.getPriorityLevel());
        assertEquals(30, result.getPriorityScore());
    }

    // ── Repository interaction ────────────────────────────────────────────────

    @Test
    @DisplayName("Analysis document is saved to the repository after analysis")
    public void testAnalysisIsSavedToRepository() {
        // Arrange
        ReliefRequest request = buildRequest("req-004", "clear", "small", "food", 50);
        when(requestRepository.findById("req-004")).thenReturn(Optional.of(request));
        when(analysisRepository.findByRequestId("req-004")).thenReturn(Optional.empty());
        when(analysisRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(requestRepository.save(any())).thenReturn(request);

        // Act
        analysisService.analyzeRequestSync("req-004");

        // Assert — verify the analysis was persisted exactly once
        verify(analysisRepository, times(1)).save(any(PrologAnalysis.class));
    }

    @Test
    @DisplayName("Request priority_level field is updated after analysis")
    public void testRequestPriorityLevelIsUpdated() {
        // Arrange
        ReliefRequest request = buildRequest("req-005", "blocked", "large", "food", 0);
        when(requestRepository.findById("req-005")).thenReturn(Optional.of(request));
        when(analysisRepository.findByRequestId("req-005")).thenReturn(Optional.empty());
        when(analysisRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(requestRepository.save(any())).thenReturn(request);

        // Act
        analysisService.analyzeRequestSync("req-005");

        // Assert — request should be saved with updated priority_level
        verify(requestRepository, times(1)).save(argThat(r ->
            "Critical".equals(r.getPriorityLevel())
        ));
    }

    @Test
    @DisplayName("Request not found throws ResponseStatusException")
    public void testRequestNotFoundThrowsException() {
        // Arrange
        when(requestRepository.findById("missing-id")).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(org.springframework.web.server.ResponseStatusException.class,
            () -> analysisService.analyzeRequestSync("missing-id"),
            "Should throw ResponseStatusException when request not found"
        );
    }

    // ── DTO mapping ───────────────────────────────────────────────────────────

    @Test
    @DisplayName("toResponseDto() maps PrologAnalysis to snake_case DTO correctly")
    public void testToResponseDto() {
        // Arrange
        PrologAnalysis analysis = PrologAnalysis.builder()
                .id("analysis-001")
                .requestId("req-001")
                .priorityLevel("Critical")
                .priorityColor("red")
                .priorityScore(90)
                .riskFlags(List.of("ROAD BLOCKED: Consider aerial drop.", "ZERO STOCK: Raise immediate resupply."))
                .build();

        // Act
        PrologAnalysisResponseDto dto = analysisService.toResponseDto(analysis);

        // Assert
        assertNotNull(dto);
        assertEquals("analysis-001", dto.getId());
        assertEquals("req-001", dto.getRequestId());
        assertEquals("Critical", dto.getPriorityLevel());
        assertEquals("red", dto.getPriorityColor());
        assertEquals(90, dto.getPriorityScore());
        assertNotNull(dto.getRiskFlags());
        assertFalse(dto.getRiskFlags().isEmpty());
        assertNotNull(dto.getRationale(), "Rationale should be auto-generated");
        assertFalse(dto.getRationale().isEmpty());
    }
}
