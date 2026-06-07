package com.aura.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import java.util.List;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.assertFalse;

public class RiskAssessmentServiceTest {

    private RiskAssessmentService riskAssessmentService;

    @BeforeEach
    public void setUp() {
        riskAssessmentService = new RiskAssessmentService();
    }

    @Test
    public void testRoadBlockedFlag() {
        List<String> flags = riskAssessmentService.getAllFlags("blocked", "small", "other", "available");
        assertTrue(flags.stream().anyMatch(f -> f.contains("ROAD BLOCKED")));
    }

    @Test
    public void testMedicineLargePopulationFlag() {
        List<String> flags = riskAssessmentService.getAllFlags("clear", "large", "medicine", "available");
        assertTrue(flags.stream().anyMatch(f -> f.contains("LARGE POPULATION + MEDICINE")));
    }

    @Test
    public void testZeroStockFlag() {
        List<String> flags = riskAssessmentService.getAllFlags("clear", "small", "other", "empty");
        assertTrue(flags.stream().anyMatch(f -> f.contains("ZERO STOCK")));
    }

    @Test
    public void testMultipleFlagsFire() {
        List<String> flags = riskAssessmentService.getAllFlags("blocked", "large", "medicine", "empty");
        // Should trigger ROAD BLOCKED, LARGE POPULATION + MEDICINE, ZERO STOCK, LARGE ISOLATED POPULATION, MEDICINE + BLOCKED ROADS
        assertTrue(flags.size() >= 4);
        assertTrue(flags.stream().anyMatch(f -> f.contains("ROAD BLOCKED")));
        assertTrue(flags.stream().anyMatch(f -> f.contains("ZERO STOCK")));
        assertTrue(flags.stream().anyMatch(f -> f.contains("MEDICINE + BLOCKED ROADS")));
    }
}
