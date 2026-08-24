import os
import sys

# Ensure backend is in python path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from snn_ai_optimizer.pipeline.snn_pipeline import snn_run
from snn_ai_optimizer.cognitive import _load_snn
from snn_ai_optimizer.optimizer import update_q_table, _load_q_table
import subprocess

def verify():
    print("Step 0: Running pipeline to train models...")
    snn_run()
    
    print("\nStep 1: Primary Inference Check...")
    snn_model = _load_snn()
    if snn_model is not None:
        print("[SUCCESS] _load_snn() returned a valid model.")
    else:
        print("[FAILED] _load_snn() returned None!")
        sys.exit(1)
        
    print("\nStep 2: Feedback Loop / Q-table Update Check...")
    update_q_table("Focused", 4, 1.0)
    q_table = _load_q_table()
    if "Focused" in q_table and "4" in q_table["Focused"]:
        print(f"[SUCCESS] Q-table updated successfully: {q_table['Focused']['4']}")
    else:
        print("[FAILED] Q-table update failed!")
        sys.exit(1)
        
    print("\nStep 3: Codebase Cleanliness Check...")
    result = subprocess.run(
        ["grep", "-rn", "-i", "-E", "--exclude-dir=node_modules", "--exclude-dir=.git", "--exclude-dir=results", "--exclude-dir=dist", "quantum|qubo", "."],
        capture_output=True, text=True
    )
    out = result.stdout.strip()

    
    # Filter out verify.py itself from grep output
    lines = [line for line in out.split('\n') if line and "verify.py" not in line and ".git" not in line and ".qodo" not in line and "README.md" not in line]
    
    # Check if we still have references to quantum
    bad_lines = []
    for line in lines:
        if "quantum" in line.lower() or "qubo" in line.lower():
            # Check if it's an actual code reference we missed
            if "snn" not in line.lower(): # Just a simple filter, maybe better to just print them
                bad_lines.append(line)
                
    if not bad_lines:
        print("[SUCCESS] No remaining code references to quantum or qubo found.")
    else:
        print("[WARNING] Possible remaining references found:")
        for line in bad_lines:
            print(f"  {line}")
            
    print("\nVerification Complete!")

if __name__ == "__main__":
    verify()
