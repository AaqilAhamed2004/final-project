package com.aura.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertEquals;

public class PriorityRulesServiceTest {

    private PriorityRulesService priorityRulesService;

    @BeforeEach
    public void setUp() {
        priorityRulesService = new PriorityRulesService();
    }

    @Test
    public void testCriticalMedicineBlockedRoads() {
        // Medicine + roads blocked -> red
        String priority = priorityRulesService.assignPriority("medicine", "blocked", "small", "available");
        assertEquals("red", priority);
    }

    @Test
    public void testCriticalMedicineEmptyStock() {
        // Medicine + zero stock -> red
        String priority = priorityRulesService.assignPriority("medicine", "clear", "small", "empty");
        assertEquals("red", priority);
    }

    @Test
    public void testCriticalMedicineLargePopulationLowStock() {
        // Medicine + large population + low stock -> red
        String priority = priorityRulesService.assignPriority("medicine", "clear", "large", "low");
        assertEquals("red", priority);
    }

    @Test
    public void testCriticalFoodBlockedRoadsLargePopulation() {
        // Food + blocked roads + large population -> red
        String priority = priorityRulesService.assignPriority("food", "blocked", "large", "available");
        assertEquals("red", priority);
    }

    @Test
    public void testCriticalBlockedRoadsEmptyStock() {
        // Any category (e.g., shelter) + blocked roads + zero stock -> red
        String priority = priorityRulesService.assignPriority("shelter", "blocked", "small", "empty");
        assertEquals("red", priority);
    }

    @Test
    public void testUrgentMedicineLowStock() {
        // Medicine + low stock (roads clear) -> orange
        String priority = priorityRulesService.assignPriority("medicine", "clear", "small", "low");
        assertEquals("orange", priority);
    }

    @Test
    public void testUrgentMedicineDegradedRoad() {
        // Medicine + partially blocked or flooded roads -> orange
        String priority1 = priorityRulesService.assignPriority("medicine", "partial", "small", "available");
        String priority2 = priorityRulesService.assignPriority("medicine", "flooded", "small", "available");
        assertEquals("orange", priority1);
        assertEquals("orange", priority2);
    }

    @Test
    public void testUrgentFoodLargePopulation() {
        // Food + large population (roads not blocked) -> orange
        String priority = priorityRulesService.assignPriority("food", "clear", "large", "available");
        assertEquals("orange", priority);
    }

    @Test
    public void testUrgentShelterBlockedOrDegradedRoad() {
        // Shelter + blocked, partial, or flooded roads -> orange
        String priority1 = priorityRulesService.assignPriority("shelter", "blocked", "small", "available");
        String priority2 = priorityRulesService.assignPriority("shelter", "partial", "small", "available");
        assertEquals("orange", priority1);
        assertEquals("orange", priority2);
    }

    @Test
    public void testStandardFallback() {
        // Shelter with clear/accessible roads -> yellow
        String priority = priorityRulesService.assignPriority("shelter", "clear", "small", "available");
        assertEquals("yellow", priority);
    }

    @Test
    public void testMapPriorityLabel() {
        assertEquals("Critical", priorityRulesService.mapPriorityLabel("red"));
        assertEquals("Urgent", priorityRulesService.mapPriorityLabel("orange"));
        assertEquals("Standard", priorityRulesService.mapPriorityLabel("yellow"));
    }

    @Test
    public void testPriorityToScore() {
        assertEquals(90, priorityRulesService.priorityToScore("red"));
        assertEquals(60, priorityRulesService.priorityToScore("orange"));
        assertEquals(30, priorityRulesService.priorityToScore("yellow"));
    }
}
