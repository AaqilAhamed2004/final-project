package com.aura.service;

import org.springframework.stereotype.Service;

/**
 * PriorityRulesService — Java translation of priority_rules.pl
 *
 * Determines the priority color (red/orange/yellow) for a relief request
 * based on its category, road status, population size, and stock level.
 *
 * Logic is a direct, ordered rule-for-rule translation from Prolog.
 * "First match wins" — identical to Prolog's top-to-bottom clause evaluation with cut (!).
 */
@Service
public class PriorityRulesService {

    /**
     * Determines the priority color for a relief request.
     *
     * @param category     medicine | food | shelter | other
     * @param roadStatus   blocked | partial | flooded | clear
     * @param popSize      large | medium | small
     * @param stockLevel   empty | low | available
     * @return             red | orange | yellow
     */
    public String assignPriority(String category, String roadStatus, String popSize, String stockLevel) {

        // ── RED RULES ──────────────────────────────────────────────────────
        // Medicine + roads blocked → RED (patients cannot reach hospital)
        if ("medicine".equals(category) && "blocked".equals(roadStatus)) return "red";

        // Medicine + zero stock → RED (no supply available at all)
        if ("medicine".equals(category) && "empty".equals(stockLevel)) return "red";

        // Medicine + large population + low stock → RED (will run out fast)
        if ("medicine".equals(category) && "large".equals(popSize) && "low".equals(stockLevel)) return "red";

        // Food + blocked roads + large population → RED (mass starvation risk)
        if ("food".equals(category) && "blocked".equals(roadStatus) && "large".equals(popSize)) return "red";

        // Any category + blocked roads + zero stock → RED
        if ("blocked".equals(roadStatus) && "empty".equals(stockLevel)) return "red";

        // ── ORANGE RULES ───────────────────────────────────────────────────
        // Medicine + low stock (roads clear) → ORANGE
        if ("medicine".equals(category) && "low".equals(stockLevel)) return "orange";

        // Medicine + partially blocked or flooded roads → ORANGE
        if ("medicine".equals(category) && isDegradedRoad(roadStatus)) return "orange";

        // Food + large population (roads not blocked) → ORANGE
        if ("food".equals(category) && "large".equals(popSize)) return "orange";

        // Food + blocked roads (smaller population) → ORANGE
        if ("food".equals(category) && "blocked".equals(roadStatus)) return "orange";

        // Food + partially blocked or flooded roads → ORANGE
        if ("food".equals(category) && isDegradedRoad(roadStatus)) return "orange";

        // Shelter + blocked, partially blocked or flooded roads → ORANGE
        if ("shelter".equals(category) && ("blocked".equals(roadStatus) || isDegradedRoad(roadStatus))) return "orange";

        // Any category + degraded roads + empty stock → ORANGE
        if (isDegradedRoad(roadStatus) && "empty".equals(stockLevel)) return "orange";

        // ── YELLOW (default fallback) ──────────────────────────────────────
        return "yellow";
    }

    /**
     * Maps priority color to the display label used in the frontend.
     * Mirrors the _map_priority_label function in prolog_worker_cli.py.
     */
    public String mapPriorityLabel(String color) {
        return switch (color.toLowerCase()) {
            case "red"    -> "Critical";
            case "orange" -> "Urgent";
            default       -> "Standard";
        };
    }

    /**
     * Maps priority color to a numeric score for sorting.
     * Mirrors the _priority_to_score function in prolog_worker_cli.py.
     */
    public int priorityToScore(String color) {
        return switch (color.toLowerCase()) {
            case "red"    -> 90;
            case "orange" -> 60;
            default       -> 30;
        };
    }

    // degraded_road(partial). degraded_road(flooded). — from Prolog
    private boolean isDegradedRoad(String road) {
        return "partial".equals(road) || "flooded".equals(road);
    }
}
