package com.aura.service;

import com.aura.repository.AnalysisRepository;
import com.aura.repository.RequestRepository;
import com.aura.schema.PrologAnalysis;
import com.aura.schema.ReliefRequest;
import com.aura.schema.RequestItem;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

/**
 * AnalysisService — Orchestrates the AI priority pipeline.
 *
 * Replaces prolog_worker_cli.py + prolog_engine.py subprocess approach.
 * Runs as an @Async background task triggered on request creation
 * — equivalent to BackgroundTasks in FastAPI.
 */
@Service
public class AnalysisService {

    private static final Logger log = LoggerFactory.getLogger(AnalysisService.class);

    @Autowired
    private RequestRepository requestRepository;

    @Autowired
    private AnalysisRepository analysisRepository;

    @Autowired
    private PriorityRulesService priorityRulesService;

    @Autowired
    private RiskAssessmentService riskAssessmentService;

    /**
     * Runs the full AI analysis pipeline for a given relief request.
     * Annotated with @Async — Spring executes this in a separate thread.
     * Equivalent to BackgroundTasks.add_task(analyze_request, id) in FastAPI.
     */
    @Async
    public void analyzeRequest(String requestId) {
        try {
            analyzeRequestSync(requestId);
        } catch (Exception e) {
            log.error("[AnalysisService] Async analysis failed for request " + requestId, e);
        }
    }

    /**
     * Synchronous version of the AI analysis pipeline.
     * Used by manual triggers and logic API.
     */
    public PrologAnalysis analyzeRequestSync(String requestId) {
        log.info("[AnalysisService] Starting synchronous analysis for request: {}", requestId);

        ReliefRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                        org.springframework.http.HttpStatus.NOT_FOUND, "Request not found: " + requestId));

        List<RequestItem> items = request.getItems();

        // 1. Extract request parameters
        String road = Optional.ofNullable(request.getRoadStatus()).orElse("clear");
        String pop = Optional.ofNullable(request.getPopulationSize()).orElse("medium");
        String category = dominantCategory(items);
        String stockLevel = stockLevel(minStock(items, category));

        log.info("[AnalysisService] Params — cat:{}, road:{}, pop:{}, stock:{}", category, road, pop, stockLevel);

        // 2. Run Priority Rules (Java translation of priority_rules.pl)
        String priorityColor = priorityRulesService.assignPriority(category, road, pop, stockLevel);
        String priorityLabel = priorityRulesService.mapPriorityLabel(priorityColor);
        int priorityScore = priorityRulesService.priorityToScore(priorityColor);

        // 3. Run Risk Assessment (Java translation of risk_assessment.pl)
        List<String> riskFlags = riskAssessmentService.getAllFlags(road, pop, category, stockLevel);

        log.info("[AnalysisService] Priority: {} ({}), Flags: {}", priorityLabel, priorityColor, riskFlags.size());

        // 4. Save / upsert analysis document
        Optional<PrologAnalysis> existing = analysisRepository.findByRequestId(requestId);
        PrologAnalysis analysis = existing.orElse(PrologAnalysis.builder().requestId(requestId).build());
        analysis.setPriorityLevel(priorityLabel);
        analysis.setPriorityColor(priorityColor);
        analysis.setPriorityScore(priorityScore);
        analysis.setRiskFlags(riskFlags);
        analysis.setAnalyzedAt(Instant.now());
        PrologAnalysis savedAnalysis = analysisRepository.save(analysis);

        // 5. Update priority_level on the request document itself
        request.setPriorityLevel(priorityLabel);
        requestRepository.save(request);

        log.info("[AnalysisService] Analysis saved successfully.");
        return savedAnalysis;
    }

    /**
     * Converts a PrologAnalysis document into a PrologAnalysisResponseDto.
     * Automatically generates a human-friendly expert rationale for the frontend.
     */
    public com.aura.dto.PrologAnalysisResponseDto toResponseDto(PrologAnalysis analysis) {
        if (analysis == null) return null;

        // Generate dynamic professional rationale based on priority & flags
        String rationale = generateRationale(analysis);

        return com.aura.dto.PrologAnalysisResponseDto.builder()
                .id(analysis.getId())
                .requestId(analysis.getRequestId())
                .priorityLevel(analysis.getPriorityLevel())
                .priorityColor(analysis.getPriorityColor())
                .priorityScore(analysis.getPriorityScore())
                .riskFlags(analysis.getRiskFlags())
                .riskFactors(analysis.getRiskFlags()) // duplicate for backward compatibility
                .rationale(rationale)
                .analyzedAt(analysis.getAnalyzedAt())
                .build();
    }

    private String generateRationale(PrologAnalysis analysis) {
        String level = Optional.ofNullable(analysis.getPriorityLevel()).orElse("Standard").toLowerCase();
        List<String> flags = analysis.getRiskFlags();

        if ("critical".equals(level) || "red".equals(analysis.getPriorityColor())) {
            if (flags.stream().anyMatch(f -> f.contains("ROAD BLOCKED") && f.contains("MEDICINE"))) {
                return "Critical priority level assigned. Sector accessibility is completely blocked and requested items include critical medical supplies. Direct emergency coordination with nearest hospital is active.";
            }
            if (flags.stream().anyMatch(f -> f.contains("ZERO STOCK"))) {
                return "Critical action required. Requested supplies are completely depleted from local warehouses. Immediate replenishment order has been issued.";
            }
            return "Critical intervention level. Road closures, low resources, and high population risk require immediate regional deployment.";
        }

        if ("urgent".equals(level) || "moderate".equals(level) || "orange".equals(analysis.getPriorityColor())) {
            if (flags.stream().anyMatch(f -> f.contains("PARTIAL/FLOODED ACCESS"))) {
                return "Urgent priority assigned due to partial road blockages. Deploying motorcycle couriers and off-road vehicles for last-mile logistics.";
            }
            return "Urgent allocation required. Delivery routes are compromised or warehouse quantities are low under high population demands.";
        }

        return "Standard monitoring. Ground routes are clear, resources are available, and allocation will proceed according to normal scheduling.";
    }

    // ── Helpers — mirrors prolog_worker_cli.py helper functions ─────────────

    /**
     * Returns the dominant (most critical) category from the items list.
     * Order of precedence: medicine > food > shelter > other
     * Mirrors _dominant_category() in prolog_worker_cli.py.
     */
    private String dominantCategory(List<RequestItem> items) {
        List<String> order = List.of("medicine", "food", "shelter", "other");
        for (String cat : order) {
            boolean found = items.stream().anyMatch(item -> cat.equals(item.getCategory()));
            if (found) return cat;
        }
        return "other";
    }

    /**
     * Returns the minimum current stock for items of the dominant category.
     */
    private int minStock(List<RequestItem> items, String category) {
        return items.stream()
                .filter(item -> category.equals(item.getCategory()))
                .mapToInt(item -> item.getCurrentStock() != null ? item.getCurrentStock() : 0)
                .min()
                .orElse(0);
    }

    /**
     * Converts raw stock number to a Prolog-compatible stock level atom.
     * Mirrors _stock_level() in prolog_worker_cli.py.
     */
    private String stockLevel(int quantity) {
        if (quantity == 0) return "empty";
        if (quantity < 10) return "low";
        return "available";
    }
}
