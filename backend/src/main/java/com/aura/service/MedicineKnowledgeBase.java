package com.aura.service;

import org.springframework.stereotype.Component;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

/**
 * MedicineKnowledgeBase — Java translation of medicine_kb.pl
 *
 * Encodes safe medicine substitutions for when an item is out of stock.
 * Uses a static Map (equivalent to Prolog's substitute/3 facts) and
 * a static Set for no-substitute critical drugs (no_substitute/1 facts).
 */
@Component
public class MedicineKnowledgeBase {

    // substitute(requested, substitute, reason). — Prolog facts
    private static final Map<String, String[]> SUBSTITUTES = Map.of(
        "paracetamol",            new String[]{"ibuprofen",     "Ibuprofen reduces fever and pain similarly. Avoid in children under 6 months."},
        "ibuprofen",              new String[]{"paracetamol",   "Paracetamol is safer for children and those with stomach sensitivity."},
        "amoxicillin",            new String[]{"ampicillin",    "Ampicillin covers a similar spectrum of bacterial infections."},
        "ampicillin",             new String[]{"amoxicillin",   "Amoxicillin is better absorbed orally and has similar coverage."},
        "oral_rehydration_salts", new String[]{"coconut_water", "Emergency hydration alternative. Also prepare home ORS: 1L water, 6 tsp sugar, 0.5 tsp salt."},
        "metronidazole",          new String[]{"tinidazole",    "Tinidazole is effective against similar anaerobic and parasitic infections."},
        "chloroquine",            new String[]{"artemether",    "Artemether-based therapy is recommended for malaria in Sri Lanka where resistance is present."},
        "cetirizine",             new String[]{"loratadine",    "Loratadine is a non-drowsy antihistamine effective for similar allergy symptoms."},
        "omeprazole",             new String[]{"ranitidine",    "Ranitidine reduces stomach acid through a different mechanism but is a viable short-term substitute."}
    );

    // no_substitute(insulin). no_substitute(epinephrine). etc.
    private static final Set<String> NO_SUBSTITUTE = Set.of("insulin", "epinephrine", "morphine", "warfarin");

    /**
     * Looks up a medicine substitute.
     * Mirrors the get_substitute/2 Prolog predicate.
     *
     * @param drug   The drug name (will be normalized to lowercase with underscores)
     * @return       SubstituteResult — either found(substitute, reason) or none(drug)
     */
    public SubstituteResult getSubstitute(String drug) {
        String key = drug.toLowerCase().replace(" ", "_");
        if (SUBSTITUTES.containsKey(key)) {
            String[] info = SUBSTITUTES.get(key);
            return SubstituteResult.found(info[0], info[1]);
        }
        // Covers both no_substitute/1 and unknown drugs
        return SubstituteResult.none(drug);
    }

    // ── Inner result type ────────────────────────────────────────────────────
    public record SubstituteResult(boolean hasSubstitute, String drug, String substitute, String reason) {
        public static SubstituteResult found(String substitute, String reason) {
            return new SubstituteResult(true, null, substitute, reason);
        }
        public static SubstituteResult none(String drug) {
            return new SubstituteResult(false, drug, null, null);
        }
    }
}
