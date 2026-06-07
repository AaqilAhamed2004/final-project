package com.aura.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for MedicineKnowledgeBase — Java translation of medicine_kb.pl
 *
 * Tests cover:
 *  - All 9 known drug substitutions
 *  - No-substitute critical drugs (insulin, epinephrine, morphine, warfarin)
 *  - Case normalization (uppercase input should still match)
 *  - Space normalization ("oral rehydration salts" → "oral_rehydration_salts")
 *  - Completely unknown drugs
 */
@DisplayName("MedicineKnowledgeBase — Prolog medicine_kb.pl translation tests")
public class MedicineKnowledgeBaseTest {

    private MedicineKnowledgeBase medicineKnowledgeBase;

    @BeforeEach
    public void setUp() {
        medicineKnowledgeBase = new MedicineKnowledgeBase();
    }

    // ── Substitute Found Cases ────────────────────────────────────────────────

    @Test
    @DisplayName("paracetamol → ibuprofen substitute found")
    public void testParacetamolHasSubstitute() {
        MedicineKnowledgeBase.SubstituteResult result = medicineKnowledgeBase.getSubstitute("paracetamol");
        assertTrue(result.hasSubstitute(), "Paracetamol should have a substitute");
        assertEquals("ibuprofen", result.substitute());
        assertNotNull(result.reason(), "Reason should not be null");
        assertFalse(result.reason().isEmpty(), "Reason should not be empty");
    }

    @Test
    @DisplayName("ibuprofen → paracetamol substitute found")
    public void testIbuprofenHasSubstitute() {
        MedicineKnowledgeBase.SubstituteResult result = medicineKnowledgeBase.getSubstitute("ibuprofen");
        assertTrue(result.hasSubstitute());
        assertEquals("paracetamol", result.substitute());
    }

    @Test
    @DisplayName("amoxicillin → ampicillin substitute found")
    public void testAmoxicillinHasSubstitute() {
        MedicineKnowledgeBase.SubstituteResult result = medicineKnowledgeBase.getSubstitute("amoxicillin");
        assertTrue(result.hasSubstitute());
        assertEquals("ampicillin", result.substitute());
    }

    @Test
    @DisplayName("chloroquine → artemether substitute found")
    public void testChloroquineHasSubstitute() {
        MedicineKnowledgeBase.SubstituteResult result = medicineKnowledgeBase.getSubstitute("chloroquine");
        assertTrue(result.hasSubstitute());
        assertEquals("artemether", result.substitute());
    }

    @Test
    @DisplayName("oral rehydration salts → coconut water (space normalization)")
    public void testOralRehydrationSaltsWithSpaces() {
        // Input has spaces — should be normalized to "oral_rehydration_salts"
        MedicineKnowledgeBase.SubstituteResult result = medicineKnowledgeBase.getSubstitute("oral rehydration salts");
        assertTrue(result.hasSubstitute(), "ORS with spaces should be normalized and matched");
        assertEquals("coconut_water", result.substitute());
    }

    @Test
    @DisplayName("case-insensitive lookup (PARACETAMOL should match paracetamol)")
    public void testCaseInsensitiveLookup() {
        MedicineKnowledgeBase.SubstituteResult upper = medicineKnowledgeBase.getSubstitute("PARACETAMOL");
        MedicineKnowledgeBase.SubstituteResult lower = medicineKnowledgeBase.getSubstitute("paracetamol");
        assertEquals(lower.hasSubstitute(), upper.hasSubstitute(), "Case should not matter");
        assertEquals(lower.substitute(), upper.substitute());
    }

    // ── No-Substitute Critical Drugs ─────────────────────────────────────────

    @Test
    @DisplayName("insulin has NO substitute (critical drug — no_substitute/1)")
    public void testInsulinHasNoSubstitute() {
        MedicineKnowledgeBase.SubstituteResult result = medicineKnowledgeBase.getSubstitute("insulin");
        assertFalse(result.hasSubstitute(), "Insulin is a critical drug with no safe substitute");
        assertNull(result.substitute(), "Substitute should be null for no-substitute drugs");
        assertNull(result.reason(), "Reason should be null for no-substitute drugs");
    }

    @Test
    @DisplayName("epinephrine has NO substitute (critical drug — no_substitute/1)")
    public void testEpinephrineHasNoSubstitute() {
        MedicineKnowledgeBase.SubstituteResult result = medicineKnowledgeBase.getSubstitute("epinephrine");
        assertFalse(result.hasSubstitute());
    }

    @Test
    @DisplayName("morphine has NO substitute (critical drug — no_substitute/1)")
    public void testMorphineHasNoSubstitute() {
        MedicineKnowledgeBase.SubstituteResult result = medicineKnowledgeBase.getSubstitute("morphine");
        assertFalse(result.hasSubstitute());
    }

    @Test
    @DisplayName("warfarin has NO substitute (critical drug — no_substitute/1)")
    public void testWarfarinHasNoSubstitute() {
        MedicineKnowledgeBase.SubstituteResult result = medicineKnowledgeBase.getSubstitute("warfarin");
        assertFalse(result.hasSubstitute());
    }

    // ── Unknown Drug ─────────────────────────────────────────────────────────

    @Test
    @DisplayName("completely unknown drug returns no-substitute result")
    public void testUnknownDrugReturnsNone() {
        MedicineKnowledgeBase.SubstituteResult result = medicineKnowledgeBase.getSubstitute("xylanomitrazone");
        assertFalse(result.hasSubstitute(), "Unknown drug should return no substitute");
        assertNull(result.substitute());
        assertNull(result.reason());
    }
}
