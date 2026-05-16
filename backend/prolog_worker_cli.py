"""
prolog_worker_cli.py
Standalone AI worker for Project AURA.
Uses __file__-based absolute paths to guarantee correct resolution
regardless of which directory uvicorn/the subprocess runs from.
"""

import sys
import os
import subprocess
from datetime import datetime, timezone
from bson import ObjectId

# ── Path Setup (must use __file__, NOT os.getcwd()) ──────────────────────────
# This script lives at: backend/prolog_worker_cli.py
# So BACKEND_DIR is the parent directory of this file — always correct.
BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))

# Ensure we can import the 'app' package from backend/
sys.path.insert(0, BACKEND_DIR)

try:
    from app.database import requests_col, analysis_col
except Exception as e:
    print(f"[{datetime.now()}] CRITICAL: Could not load database: {e}")
    sys.exit(1)

# ── Prolog File Paths (backend/prolog/, NOT backend/app/prolog/) ─────────────
PRIORITY_PL = os.path.join(BACKEND_DIR, "prolog", "priority_rules.pl")
MEDICINE_PL = os.path.join(BACKEND_DIR, "prolog", "medicine_kb.pl")
RISK_PL     = os.path.join(BACKEND_DIR, "prolog", "risk_assessment.pl")

# On Windows, swipl needs forward slashes
PRIORITY_PL_SWIPL = PRIORITY_PL.replace("\\", "/")
MEDICINE_PL_SWIPL = MEDICINE_PL.replace("\\", "/")
RISK_PL_SWIPL     = RISK_PL.replace("\\", "/")

# ── Helpers ───────────────────────────────────────────────────────────────────

def _map_priority_label(color: str) -> str:
    return {"red": "Critical", "orange": "Urgent", "yellow": "Standard"}.get(
        color.lower().strip("."), "Standard"
    )

def _priority_to_score(priority: str) -> int:
    return {"red": 90, "orange": 60, "yellow": 30}.get(priority.lower().strip("."), 30)

def _stock_level(quantity: int) -> str:
    return "empty" if quantity == 0 else ("low" if quantity < 10 else "available")

def _dominant_category(items: list) -> str:
    """Prioritize medicine > food > shelter > other."""
    order = ["medicine", "food", "shelter", "other"]
    present = [item.get("category", "other").lower() for item in items]
    for cat in order:
        if cat in present:
            return cat
    return "other"

# ── Prolog Shell Execution ────────────────────────────────────────────────────

def run_swipl_query(query_goal: str) -> str:
    """
    Executes a Prolog query via swipl.exe command line.
    Paths are absolute and use forward slashes for swipl compatibility.
    """
    full_goal = (
        f"consult('{PRIORITY_PL_SWIPL}'), "
        f"consult('{MEDICINE_PL_SWIPL}'), "
        f"consult('{RISK_PL_SWIPL}'), "
        f"{query_goal}, halt."
    )

    try:
        result = subprocess.run(
            ["swipl", "-q", "-t", "halt", "-g", full_goal],
            capture_output=True,
            text=True,
            timeout=10,
            cwd=BACKEND_DIR  # Always run from backend dir for consistency
        )
        if result.stderr:
            print(f"DEBUG: swipl stderr: {result.stderr.strip()}")
        return result.stdout.strip()
    except FileNotFoundError:
        print("CRITICAL: 'swipl' not found. Ensure SWI-Prolog is in your PATH.")
        return ""
    except subprocess.TimeoutExpired:
        print("CRITICAL: Prolog query timed out.")
        return ""
    except Exception as e:
        print(f"DEBUG: Shell execution failed: {e}")
        return ""

# ── Main Analysis ─────────────────────────────────────────────────────────────

def run_analysis(request_id: str):
    print(f"=== AI ANALYSIS START: {request_id} | {datetime.now()} ===")
    print(f"DEBUG: BACKEND_DIR resolved to: {BACKEND_DIR}")
    print(f"DEBUG: PRIORITY_PL resolved to: {PRIORITY_PL}")
    print(f"DEBUG: File exists check: {os.path.exists(PRIORITY_PL)}")

    try:
        # 1. Load data from MongoDB
        request = requests_col.find_one({"_id": ObjectId(request_id)})
        if not request:
            print(f"ERROR: Request {request_id} not found.")
            return

        items    = request.get("items", [])
        road     = request.get("road_status", "clear")
        pop      = request.get("population_size", "medium")
        category = _dominant_category(items)

        cat_stocks = [
            item.get("current_stock", 0)
            for item in items
            if item.get("category", "other").lower() == category
        ]
        stock_level = _stock_level(min(cat_stocks) if cat_stocks else 0)

        print(f"DEBUG: category={category}, road={road}, pop={pop}, stock={stock_level}")

        # 2. Query Prolog via stable shell invocation
        priority_color = "yellow"

        p_goal = f"assign_priority({category}, {road}, {pop}, {stock_level}, P), writeln(P)"
        output = run_swipl_query(p_goal)
        if output:
            priority_color = output.lower().strip(".")
            print(f"RESULT: Prolog returned priority color: '{priority_color}'")
        else:
            print("WARNING: No output from Prolog priority query. Defaulting to 'yellow'.")

        f_goal = f"get_all_flags({road}, {pop}, {category}, {stock_level}, Flags), writeln(Flags)"
        flags_raw = run_swipl_query(f_goal)
        risk_flags = [f.strip() for f in flags_raw.strip("[]").split(",") if f.strip()] if flags_raw else []

        # 3. Map to human-readable label
        priority_label = _map_priority_label(priority_color)

        # 4. Persist to both collections
        now = datetime.now(timezone.utc)
        analysis_doc = {
            "request_id":    request_id,
            "priority_level": priority_label,
            "priority_color": priority_color,
            "priority_score": _priority_to_score(priority_color),
            "risk_flags":    risk_flags,
            "analyzed_at":   now,
        }
        analysis_col.replace_one({"request_id": request_id}, analysis_doc, upsert=True)
        requests_col.update_one(
            {"_id": ObjectId(request_id)},
            {"$set": {"priority_level": priority_label}}
        )
        print(f"SUCCESS: '{priority_label}' saved to MongoDB for request {request_id}")
        print(f"=== AI ANALYSIS COMPLETE ===")

    except Exception as e:
        import traceback
        print(f"CRITICAL ERROR: {e}")
        traceback.print_exc()


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("USAGE: python prolog_worker_cli.py <request_id>")
        sys.exit(1)
    run_analysis(sys.argv[1])
