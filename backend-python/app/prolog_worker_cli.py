"""
prolog_worker_cli.py
Isolated AI worker with robust path handling for Windows.
"""

import sys
import os
from datetime import datetime
from bson import ObjectId

# Ensure we can import from the parent 'app'
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(BASE_DIR)

try:
    from pyswip import Prolog
    from app.database import requests_col, analysis_col
except Exception as e:
    print(f"CRITICAL: Initialization error: {e}")
    sys.exit(1)

# ── Paths ────────────────────────────────────────────────────────────────────
# Use forward slashes for Prolog compatibility on Windows
PRIORITY_PL = os.path.join(BASE_DIR, "app", "prolog", "priority_rules.pl").replace("\\", "/")
MEDICINE_PL = os.path.join(BASE_DIR, "app", "prolog", "medicine_kb.pl").replace("\\", "/")
RISK_PL     = os.path.join(BASE_DIR, "app", "prolog", "risk_assessment.pl").replace("\\", "/")

def _map_priority_label(color: str) -> str:
    mapping = {"red": "Critical", "orange": "Urgent", "yellow": "Standard"}
    return mapping.get(color.lower(), "Standard")

def _priority_to_score(priority: str) -> int:
    return {"red": 90, "orange": 60, "yellow": 30}.get(priority.lower(), 30)

def _stock_level(quantity: int) -> str:
    return "empty" if quantity == 0 else ("low" if quantity < 10 else "available")

def _dominant_category(items: list) -> str:
    order = ["medicine", "food", "shelter", "other"]
    categories = [item.get("category", "other") for item in items]
    for cat in order:
        if cat in categories: return cat
    return "other"

def run_analysis(request_id: str):
    print(f"[{datetime.now()}] Starting Analysis for: {request_id}")
    
    try:
        # 1. Load Data
        request = requests_col.find_one({"_id": ObjectId(request_id)})
        if not request:
            print(f"ERROR: Request {request_id} not found.")
            return

        items = request.get("items", [])
        road  = request.get("road_status", "clear")
        prolog_road = "partial" if road == "flooded" else road
        pop   = request.get("population_size", "medium")
        category = _dominant_category(items)

        cat_stocks = [item.get("current_stock", 0) for item in items if item.get("category") == category]
        min_stock = min(cat_stocks) if cat_stocks else 0
        stock_level = _stock_level(min_stock)

        print(f"INFO: Data - Cat:{category}, Road:{road} (prolog_road={prolog_road}), Pop:{pop}, Stock:{stock_level}")

        # 2. Run Prolog
        priority_color = "yellow"
        risk_flags = []
        
        prolog = Prolog()
        print(f"INFO: Consulting {PRIORITY_PL}")
        prolog.consult(PRIORITY_PL)
        prolog.consult(MEDICINE_PL)
        prolog.consult(RISK_PL)

        p_query = f"assign_priority({category}, {prolog_road}, {pop}, {stock_level}, P)"
        print(f"QUERY: {p_query}")
        results = list(prolog.query(p_query))
        if results:
            priority_color = str(results[0]["P"])
            print(f"RESULT: Found priority color: {priority_color}")
        else:
            print("WARNING: No priority results from Prolog.")

        f_query = f"get_all_flags({prolog_road}, {pop}, {category}, {stock_level}, Flags)"
        f_results = list(prolog.query(f_query))
        if f_results and "Flags" in f_results[0]:
            risk_flags = [str(f) for f in f_results[0]["Flags"]]
            print(f"RESULT: Found {len(risk_flags)} risk flags.")

        # 3. Process Result
        priority_label = _map_priority_label(priority_color)

        # 4. Save/Sync
        analysis_doc = {
            "request_id": request_id,
            "priority_level": priority_label,
            "priority_color": priority_color,
            "priority_score": _priority_to_score(priority_color),
            "risk_flags": risk_flags,
            "analyzed_at": datetime.utcnow()
        }
        
        analysis_col.replace_one({"request_id": request_id}, analysis_doc, upsert=True)
        requests_col.update_one(
            {"_id": ObjectId(request_id)},
            {"$set": {"priority_level": priority_label}}
        )
        print(f"SUCCESS: Analysis saved. Priority: {priority_label}")

    except Exception as e:
        print(f"CRITICAL ERROR: {e}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        sys.exit(1)
    run_analysis(sys.argv[1])
