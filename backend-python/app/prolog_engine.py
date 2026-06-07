"""
prolog_engine.py
Stable subprocess-based bridge for Project AURA (Root Worker Version).
"""

import os
import subprocess
import sys

def start_prolog_worker():
    """No-op for the subprocess-based approach."""
    pass

def analyze_request(request_id: str):
    """
    Spawns an isolated process to run the Prolog analysis.
    Uses the root-level prolog_worker_cli.py for maximum stability.
    """
    # Use absolute paths to prevent "file not found" errors
    backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    worker_script = os.path.join(backend_dir, "prolog_worker_cli.py")
    log_file = os.path.join(backend_dir, "prolog_ai.log")
    
    python_exe = sys.executable
    
    print(f"[AURA] Spawning AI worker for {request_id}. Logs: {log_file}")
    
    try:
        # Use a context manager to ensure the log file is handled correctly
        with open(log_file, "a") as log_fh:
            subprocess.Popen(
                [python_exe, worker_script, request_id],
                stdout=log_fh,
                stderr=log_fh,
                text=True,
                cwd=backend_dir # Set CWD to backend so imports work correctly
            )
    except Exception as e:
        print(f"[AURA ERROR] Failed to spawn analysis process: {e}")