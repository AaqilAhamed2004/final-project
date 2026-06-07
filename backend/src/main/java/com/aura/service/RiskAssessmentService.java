package com.aura.service;

import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.List;

/**
 * RiskAssessmentService — Java translation of risk_assessment.pl
 *
 * Detects all actionable risk factors for a relief request and returns
 * them as a list of human-readable flag strings.
 *
 * Critical difference from PriorityRulesService:
 * Risk flags have NO cut (!). MULTIPLE flags can fire simultaneously.
 * In Java this maps to a List — we add all matching flags, not just the first.
 */
@Service
public class RiskAssessmentService {

    /**
     * Evaluates all risk flag rules and returns every flag that matches.
     *
     * @param road     blocked | partial | flooded | clear
     * @param pop      large | medium | small
     * @param category medicine | food | shelter | other
     * @param stock    empty | low | available
     * @return         List of all applicable risk flag strings (may be empty)
     */
    public List<String> getAllFlags(String road, String pop, String category, String stock) {
        List<String> flags = new ArrayList<>();

        // is_risk_flag(blocked, _, _, _, "ROAD BLOCKED...").
        if ("blocked".equals(road))
            flags.add("ROAD BLOCKED: Consider aerial drop or boat delivery.");

        // is_risk_flag(_, large, medicine, _, "LARGE POPULATION + MEDICINE...").
        if ("large".equals(pop) && "medicine".equals(category))
            flags.add("LARGE POPULATION + MEDICINE: Coordinate multiple distribution points.");

        // is_risk_flag(_, _, _, empty, "ZERO STOCK...").
        if ("empty".equals(stock))
            flags.add("ZERO STOCK: Raise immediate resupply order — do not wait.");

        // is_risk_flag(Road, large, _, _, "PARTIAL/FLOODED ACCESS...") :- degraded_road(Road).
        if (isDegradedRoad(road) && "large".equals(pop))
            flags.add("PARTIAL/FLOODED ACCESS + LARGE CROWD: Deploy motorbike couriers for last mile.");

        // is_risk_flag(_, large, food, empty, "FOOD SHORTAGE (LARGE)...").
        if ("large".equals(pop) && "food".equals(category) && "empty".equals(stock))
            flags.add("FOOD SHORTAGE (LARGE): Risk of civil unrest — prioritise security escort.");

        // is_risk_flag(blocked, large, _, _, "LARGE ISOLATED POPULATION...").
        if ("blocked".equals(road) && "large".equals(pop))
            flags.add("LARGE ISOLATED POPULATION: Notify District Secretariat and NDRRMC immediately.");

        // is_risk_flag(blocked, _, medicine, _, "MEDICINE + BLOCKED ROADS...").
        if ("blocked".equals(road) && "medicine".equals(category))
            flags.add("MEDICINE + BLOCKED ROADS: Coordinate with nearest hospital for emergency dispatch.");

        return flags;
    }

    // degraded_road(partial). degraded_road(flooded). — shared helper
    private boolean isDegradedRoad(String road) {
        return "partial".equals(road) || "flooded".equals(road);
    }
}
