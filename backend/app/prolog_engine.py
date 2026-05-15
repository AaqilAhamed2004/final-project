"""
This is the very importand file that connects the FastAPI backend to the SWI-Prolog engine using the pyswip library. 
It loads the Prolog files, defines helper functions to convert data between Python and Prolog formats, and implements the main analyze_request function that runs the Prolog analysis on a given request. 
The results are saved back to MongoDB and returned as a Python dict.

prolog_engine.py
Connects FastAPI to SWI-Prolog using pyswip.

This module:
1. Loads all three .pl files once at startup
2. Provides analyze_request(request_id, db) which:
   - Reads the request from MongoDB
   - Calls Prolog to get priority level, substitutes, risk flags
   - Saves results to prolog_analysis collection
   - Returns a result dict
"""

import os
from datetime import datetime
from pyswip import Prolog
from bson import ObjectId
from .database import requests_col, analysis_col, inventory_col

# ── Load Prolog files ──────────────────────────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PRIORITY_PL   = os.path.join(BASE_DIR, "prolog", "priority_rules.pl")
MEDICINE_PL   = os.path.join(BASE_DIR, "prolog", "medicine_kb.pl")
RISK_PL       = os.path.join(BASE_DIR, "prolog", "risk_assessment.pl")

# Global instance and flag to prevent double-initialization
_prolog_instance = None
_is_initialized = False

def get_prolog():
    """
    Thread-safe lazy initialization of the Prolog engine.
    This prevents the 'Assertion failed' crash common with FastAPI's --reload.
    """
    global _prolog_instance, _is_initialized
    
    if not _is_initialized:
        print("[AURA] Initializing Prolog Logic Engine...")
        try:
            _prolog_instance = Prolog()
            _prolog_instance.consult(PRIORITY_PL)
            _prolog_instance.consult(MEDICINE_PL)
            _prolog_instance.consult(RISK_PL)
            _is_initialized = True
            print("[AURA] Prolog Logic Engine ready.")
        except Exception as e:
            print(f"[AURA ERROR] Failed to initialize Prolog: {e}")
            raise RuntimeError("Prolog engine could not be started. Ensure SWI-Prolog is installed.")
            
    return _prolog_instance


# ── Helper functions ───────────────────────────────────────────────────────────

def _stock_level(quantity: int) -> str:
    """Convert a raw quantity number to a Prolog stock level atom."""
    if quantity == 0:
        return "empty"
    elif quantity < 10:
        return "low"
    return "available"


def _priority_to_score(priority: str) -> int:
    """Map a priority level string to a numeric score for sorting."""
    return {"red": 90, "orange": 60, "yellow": 30}.get(priority, 30)


def _dominant_category(items: list) -> str:
    """
    Find the most urgent category in the request's item list.
    Order of urgency: medicine > food > shelter > other
    """
    order = ["medicine", "food", "shelter", "other"]
    categories = [item.get("category", "other") for item in items]
    for cat in order:
        if cat in categories:
            return cat
    return "other"


def _build_reasoning(priority: str, category: str, road: str, pop: str, stock: str) -> str:
    """Build a human-readable explanation of the Prolog decision."""
    level_text = {
        "red":    "CRITICAL (Red) — Immediate action required.",
        "orange": "URGENT (Orange) — Action needed within hours.",
        "yellow": "STANDARD (Yellow) — Schedule within days.",
    }.get(priority, "STANDARD (Yellow).")

    return (
        f"Prolog Analysis: {level_text} "
        f"Category: {category}. Road status: {road}. "
        f"Population: {pop}. Stock level: {stock}."
    )


# ── Main analysis function ─────────────────────────────────────────────────────

def analyze_request(request_id: str) -> dict:
    """
    Run Prolog analysis on a request.

    Steps:
    1. Load the request document from MongoDB
    2. Determine dominant category and stock level
    3. Query assign_priority → priority_level
    4. If medicine: query get_substitute for each item → substitutes list
    5. Query get_all_flags → risk_flags list
    6. Save/update the prolog_analysis document in MongoDB
    7. Return result dict

    Args:
        request_id: MongoDB ObjectId string of the request

    Returns:
        dict with priority_level, priority_score, reasoning,
        suggested_substitutes, risk_flags

    Raises:
        ValueError: if request not found
        RuntimeError: if Prolog query fails
    """
    # Step 1: Load the request
    request = requests_col.find_one({"_id": ObjectId(request_id)})
    if not request:
        raise ValueError(f"Request '{request_id}' not found in MongoDB")

    items = request.get("items", [])
    road  = request.get("road_status", "clear")
    pop   = request.get("population_size", "medium")

    # Step 2: Determine category and stock level
    category = _dominant_category(items)

    # Find the minimum stock level across category-matching items
    cat_stocks = [
        item.get("current_stock", 0)
        for item in items
        if item.get("category") == category
    ]
    min_stock = min(cat_stocks) if cat_stocks else 0
    stock_level = _stock_level(min_stock)

    prolog = get_prolog()
    
    # Step 3: Query priority classification
    priority_query = (
        f"assign_priority({category}, {road}, {pop}, {stock_level}, P)"
    )
    try:
        results = list(prolog.query(priority_query))
        priority_level = str(results[0]["P"]) if results else "yellow"
    except Exception as e:
        print(f"[Prolog ERROR] Priority query failed: {e}")
        priority_level = "yellow"   # safe fallback — never crash the API

    # Step 4: Medicine substitutes
    substitutes = []
    if category == "medicine":
        for item in items:
            key = item.get("prolog_item_key")
            if not key:
                continue
            try:
                sub_results = list(prolog.query(f"get_substitute({key}, Result)"))
                if sub_results:
                    term = sub_results[0].get("Result")
                    # pyswip returns compound terms — check it's a result/2 functor
                    if term and hasattr(term, "name") and term.name == "result":
                        args = term.args
                        substitutes.append({
                            "requested":  key,
                            "substitute": str(args[0]),
                            "reason":     str(args[1])
                        })
            except Exception as e:
                print(f"[Prolog WARNING] Substitute query failed for '{key}': {e}")

    # Step 5: Risk flags
    risk_flags = []
    try:
        flag_query = f"get_all_flags({road}, {pop}, {category}, {stock_level}, Flags)"
        flag_results = list(get_prolog().query(flag_query))
        if flag_results and "Flags" in flag_results[0]:
            risk_flags = [str(f) for f in flag_results[0]["Flags"]]
    except Exception as e:
        print(f"[Prolog WARNING] Risk flag query failed: {e}")

    # Step 6: Save to MongoDB (upsert — replace if exists)
    analysis_doc = {
        "request_id":           request_id,
        "priority_level":       priority_level,
        "priority_score":       _priority_to_score(priority_level),
        "reasoning":            _build_reasoning(priority_level, category, road, pop, stock_level),
        "suggested_substitutes": substitutes,
        "risk_flags":           risk_flags,
        "analyzed_at":          datetime.utcnow()
    }
    analysis_col.replace_one(
        {"request_id": request_id},
        analysis_doc,
        upsert=True
    )

    return {
        "priority_level":        priority_level,
        "priority_score":        _priority_to_score(priority_level),
        "reasoning":             analysis_doc["reasoning"],
        "suggested_substitutes": substitutes,
        "risk_flags":            risk_flags,
    }