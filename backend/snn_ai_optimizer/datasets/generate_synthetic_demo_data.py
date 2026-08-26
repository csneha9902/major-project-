import os
import json
import math
import random
import csv
from pathlib import Path

DEMO_DIR = Path("results/demo_samples")
ANALYSIS_DIR = Path("results/analysis")

DEMO_DIR.mkdir(parents=True, exist_ok=True)
ANALYSIS_DIR.mkdir(parents=True, exist_ok=True)

def generate_patient_csv(filepath, duration_sec=120, scenario="stress"):
    """Generate realistic EEG/Biometric CSV time-series."""
    rng = random.Random(42 if scenario == "stress" else 101 if scenario == "focus" else 202)
    
    fieldnames = ["time_sec", "alpha", "beta", "theta", "heart_rate_bpm", "lf_hf_ratio", "cognitive_state"]
    
    rows = []
    for t in range(duration_sec):
        # Base sinusoidal rhythms
        alpha_base = 0.5 + 0.15 * math.sin(t * 0.1) + rng.gauss(0, 0.03)
        beta_base = 0.5 + 0.15 * math.cos(t * 0.12) + rng.gauss(0, 0.03)
        theta_base = 0.3 + 0.08 * math.sin(t * 0.05) + rng.gauss(0, 0.02)
        hr_base = 72 + 6 * math.sin(t * 0.08) + rng.gauss(0, 1.0)
        lf_hf_base = 1.0 + 0.2 * math.cos(t * 0.09) + rng.gauss(0, 0.05)
        
        if scenario == "stress":
            if 30 <= t <= 70:
                # Stress episode
                beta_base += 0.35 + rng.gauss(0, 0.04)
                alpha_base -= 0.15
                hr_base += 18.0 + rng.gauss(0, 1.5)
                lf_hf_base += 1.2
                state = "Stressed"
            elif t > 70:
                # Recovery phase
                alpha_base += 0.25
                beta_base -= 0.10
                hr_base -= 6.0
                lf_hf_base -= 0.3
                state = "Neutral"
            else:
                state = "Neutral"
        elif scenario == "focus":
            if 20 <= t <= 140:
                # Sustained focus state
                alpha_base += 0.30 + rng.gauss(0, 0.03)
                beta_base -= 0.08
                hr_base -= 4.0
                lf_hf_base -= 0.35
                state = "Focused"
            else:
                state = "Neutral"
        else: # fatigue
            if t > 80:
                # Fatigue state (high theta, low alpha/beta)
                theta_base += 0.35
                alpha_base -= 0.18
                beta_base -= 0.15
                hr_base -= 8.0
                state = "Stressed"
            else:
                state = "Focused" if t < 40 else "Neutral"

        alpha = round(max(0.1, min(1.8, alpha_base)), 3)
        beta = round(max(0.1, min(1.8, beta_base)), 3)
        theta = round(max(0.05, min(1.5, theta_base)), 3)
        hr = round(max(50, min(130, hr_base)), 1)
        lf_hf = round(max(0.2, min(4.0, lf_hf_base)), 3)
        
        rows.append({
            "time_sec": t,
            "alpha": alpha,
            "beta": beta,
            "theta": theta,
            "heart_rate_bpm": hr,
            "lf_hf_ratio": lf_hf,
            "cognitive_state": state
        })
        
    with open(filepath, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)
        
    return rows

def generate_analysis_json(upload_id, name, filename, rows, scenario):
    """Generate pre-computed analysis JSON matching backend schema."""
    n_samples = len(rows)
    duration = float(n_samples)
    
    alpha_vals = [r["alpha"] for r in rows]
    beta_vals = [r["beta"] for r in rows]
    hr_vals = [r["heart_rate_bpm"] for r in rows]
    lf_hf_vals = [r["lf_hf_ratio"] for r in rows]
    states = [r["cognitive_state"] for r in rows]
    
    stress_count = states.count("Stressed")
    focus_count = states.count("Focused")
    neutral_count = states.count("Neutral")
    
    time_series = []
    for r in rows:
        time_series.append({
            "timestamp": r["time_sec"],
            "time_sec": r["time_sec"],
            "alpha": r["alpha"],
            "beta": r["beta"],
            "theta": r["theta"],
            "alpha_beta_ratio": round(r["alpha"] / max(0.01, r["beta"]), 3),
            "heart_rate_bpm": r["heart_rate_bpm"],
            "lf_hf_ratio": r["lf_hf_ratio"],
            "cognitive_state": r["cognitive_state"]
        })
        
    analysis_data = {
        "upload_id": upload_id,
        "filename": filename,
        "name": name,
        "uploaded_by": "demo@doctor.com",
        "uploaded_at": "2026-08-24T18:00:00Z",
        "metadata": {
            "duration": duration,
            "n_samples": n_samples,
            "sampling_rate": 1.0,
            "channels": ["Alpha", "Beta", "Theta", "ECG_HRV"]
        },
        "features": {
            "n_samples": n_samples,
            "alpha_mean": round(sum(alpha_vals) / n_samples, 3),
            "beta_mean": round(sum(beta_vals) / n_samples, 3),
            "hr_mean": round(sum(hr_vals) / n_samples, 1),
            "lf_hf_mean": round(sum(lf_hf_vals) / n_samples, 3),
        },
        "time_series": time_series,
        "patterns": {
            "stress_events": stress_count > 10,
            "stress_event_count": 1 if stress_count > 10 else 0,
            "focus_periods": focus_count > 10,
            "focus_period_count": 1 if focus_count > 10 else 0,
            "state_distribution": {
                "Stressed": round(stress_count / n_samples, 2),
                "Focused": round(focus_count / n_samples, 2),
                "Neutral": round(neutral_count / n_samples, 2)
            }
        },
        "summary": {
            "overall_state": "Focused" if focus_count >= max(stress_count, neutral_count) else "Stressed" if stress_count > neutral_count else "Neutral",
            "key_takeaway": (
                "Patient demonstrated acute stress response followed by effective alpha-wave recovery."
                if scenario == "stress" else
                "Sustained high-beta and alpha power indicating optimal deep focus and task engagement."
                if scenario == "focus" else
                "Noticed gradual cognitive fatigue with rising theta wave activity in the final third."
            )
        }
    }
    
    out_file = ANALYSIS_DIR / f"{upload_id}.json"
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(analysis_data, f, indent=2)
        
    return analysis_data

def build_all_demo_data():
    print("Generating Synthetic Demo Datasets...")
    
    samples = [
        ("demo-patient-001", "Patient 001 - Stress Recovery", "demo_patient_001_stress.csv", 120, "stress"),
        ("demo-patient-002", "Patient 002 - Deep Focus Session", "demo_patient_002_focus.csv", 180, "focus"),
        ("demo-patient-003", "Patient 003 - Cognitive Fatigue", "demo_patient_003_fatigue.csv", 150, "fatigue"),
    ]
    
    manifest = []
    for upload_id, name, filename, duration, scenario in samples:
        csv_path = DEMO_DIR / filename
        rows = generate_patient_csv(csv_path, duration_sec=duration, scenario=scenario)
        analysis_json = generate_analysis_json(upload_id, name, filename, rows, scenario)
        manifest.append({
            "upload_id": upload_id,
            "name": name,
            "filename": filename,
            "duration": duration,
            "scenario": scenario,
            "n_samples": len(rows),
            "summary": analysis_json["summary"]["key_takeaway"]
        })
        print(f"  [Created Demo Sample] {name} ({duration}s)")
        
    manifest_file = DEMO_DIR / "manifest.json"
    with open(manifest_file, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2)
        
    print("Synthetic Demo Datasets Generated Successfully!")

if __name__ == "__main__":
    build_all_demo_data()
