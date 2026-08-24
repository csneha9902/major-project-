from __future__ import annotations

from dataclasses import dataclass


import os
import torch
from snn_ai_optimizer.snn.model import SNNHealthModel

# Global model instance
_SNN_MODEL = None
_MODEL_PATH = "results/snn/cognitive_model.pth"

def _load_snn():
    global _SNN_MODEL
    if _SNN_MODEL is not None:
        return _SNN_MODEL
    
    log_dir = "logs"
    os.makedirs(log_dir, exist_ok=True)
    log_file = os.path.join(log_dir, "snn_inference.log")
    
    def _write_log(msg):
        with open(log_file, "a") as f:
            f.write(msg + "\n")
            
    # Check alternate paths
    paths_to_check = [_MODEL_PATH, "snn_cognitive_health.pth", "backend/snn_cognitive_health.pth"]
    
    for path in paths_to_check:
        if os.path.exists(path):
            try:
                model = SNNHealthModel(input_size=32, hidden_size=64, output_size=2)
                model.load_state_dict(torch.load(path, map_location=torch.device('cpu')))
                model.eval()
                _SNN_MODEL = model
                _write_log(f"SNN model loaded from {path}")
                return _SNN_MODEL
            except Exception as e:
                _write_log(f"Failed to load SNN from {path}: {e}")
                print(f"Failed to load SNN from {path}: {e}")
                
    _write_log("SNN load failed: No valid model path found")
    return None

def compute_cognitive_state(alpha: float, beta: float, lf_hf_ratio: float) -> str:
    """
    Primary: SNN-based cognitive state engine.
    Fallback: Simple rule-based engine.
    """
    try:
        model = _load_snn()
        if model is not None:
            # We construct a simple 32-channel mock input from alpha/beta/lf_hf to feed the SNN
            # This demonstrates SNN inference over time
            input_features = [alpha, beta, lf_hf_ratio] + [0.0] * 29
            # Shape: [Time=1, Batch=1, Channels=32]
            input_tensor = torch.tensor(input_features, dtype=torch.float32).unsqueeze(0).unsqueeze(0)
            
            with torch.no_grad():
                output = model(input_tensor) # [Time, Batch, Output]
                mean_out = output.mean(dim=0) # [Batch, Output]
                prediction = torch.argmax(mean_out, dim=1).item()
                
            # Assume Output 0 is Relaxed/Neutral, Output 1 is Stressed
            if prediction == 1:
                return "Stressed"
            else:
                # To differentiate Focused from Neutral, we can use a quick heuristic 
                # if the SNN only has 2 classes, or assume the SNN classes are sufficient.
                if alpha > beta:
                    return "Focused"
                return "Neutral"
    except Exception as e:
        log_dir = "logs"
        os.makedirs(log_dir, exist_ok=True)
        with open(os.path.join(log_dir, "snn_inference.log"), "a") as f:
            f.write(f"rule-based fallback: SNN inference failed: {e}\n")
        print(f"SNN inference failed, falling back to rules: {e}")
        
    # --- FALLBACK: Rule-based ---
    try:
        if lf_hf_ratio is not None and lf_hf_ratio > 1.5:
            return "Stressed"
    except Exception:
        pass

    try:
        if alpha is not None and beta is not None and (alpha - beta) > 0.1:
            return "Focused"
    except Exception:
        pass

    return "Neutral"


@dataclass
class Recommendation:
    task: str
    difficulty: int

