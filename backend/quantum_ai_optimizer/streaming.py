from __future__ import annotations

import os
import time
import random
import math
from typing import Dict, Generator, Optional

import requests
import torch
import numpy as np
try:
    from quantum_ai_optimizer.snn.model import SNNHealthModel
    from quantum_ai_optimizer.snn.api import MODEL_PATH
    SNN_AVAILABLE = True
except ImportError:
    SNN_AVAILABLE = False


from .cognitive import compute_cognitive_state
from .optimizer import recommend_task


class DataStreamer:
    """Produces frames following the agreed API contract.

    Frame example:
    {
      "timestamp": 1678886400,
      "eeg": { "alpha": 0.6, "beta": 0.3 },
      "hrv": { "lf_hf_ratio": 0.8 },
      "cognitive_state": "Focused",
      "recommendation": { "task": "Review Chapter 3", "difficulty": 3 }
    }
    """

    def __init__(self):
        self.mode: str = "Neutral"  # "Focused" | "Stressed" | "Neutral"
        self.running: bool = True  # Controls if simulation is active
        self._latest: Optional[Dict] = None
        self._rng = random.Random(42)
        self.external_url = os.environ.get("EEG_SOURCE_URL")
        self.external_timeout = float(os.environ.get("EEG_SOURCE_TIMEOUT", "2.5"))
        self._http_session = requests.Session() if self.external_url else None
        self._source_status = {
            "external_configured": bool(self.external_url),
            "external_healthy": False,
            "using_external": False,
            "last_error": None,
            "external_url": self.external_url,
        }
        self._tracker = None
        self.snn_model = None
        if SNN_AVAILABLE:
            try:
                self.snn_model = SNNHealthModel(input_size=32, hidden_size=64, output_size=2)
                # Ensure we look in the right place relative to the package
                model_full_path = os.path.join(os.path.dirname(__file__), MODEL_PATH)
                if os.path.exists(model_full_path):
                    self.snn_model.load_state_dict(torch.load(model_full_path, map_location='cpu'))
                    self.snn_model.eval()
                    print(f"SNN Model loaded successfully from {model_full_path}")
                elif os.path.exists(MODEL_PATH): # Fallback to current dir
                     self.snn_model.load_state_dict(torch.load(MODEL_PATH, map_location='cpu'))
                     self.snn_model.eval()
                     print(f"SNN Model loaded successfully from {MODEL_PATH}")
                else:
                    print(f"SNN Model file not found at {model_full_path} or {MODEL_PATH}. Using simulation.")
                    self.snn_model = None
            except Exception as e:
                print(f"Failed to load SNN Model: {e}")
                self.snn_model = None

    def set_tracker(self, tracker) -> None:
        self._tracker = tracker

    def set_mode(self, mode: str) -> None:
        if mode not in ("Focused", "Stressed", "Neutral"):
            mode = "Neutral"
        self.mode = mode
    
    def start_simulation(self) -> None:
        self.running = True
    
    def stop_simulation(self) -> None:
        self.running = False

    def get_latest(self) -> Optional[Dict]:
        return self._latest

    def get_ingestion_status(self) -> Dict:
        status = dict(self._source_status)
        status.setdefault("active_source", "external" if status.get("using_external") else "internal")
        return status

    def _sample_alpha_beta(self) -> (float, float):
        # Create smoother, more stable patterns with controlled variation
        t = time.time()
        # Use slower, smoother frequencies for more stable patterns
        freq1 = 0.2  # Slower base frequency
        freq2 = 0.5  # Medium frequency
        freq3 = 1.0  # Faster but still smooth
        
        # Smaller, more controlled amplitudes
        amp1 = 0.15
        amp2 = 0.10
        amp3 = 0.08
        
        # Smooth sinusoidal drifts
        drift1 = math.sin(t * freq1) * amp1
        drift2 = math.sin(t * freq2 + math.pi / 3) * amp2
        drift3 = math.sin(t * freq3 + math.pi / 6) * amp3
        combined_drift = drift1 + drift2 + drift3
        
        # Reduced random noise for smoother lines
        random_noise = self._rng.gauss(0, 0.08)  # Reduced from 0.2 to 0.08
        
        alpha_base = 0.5 + random_noise + combined_drift
        # Beta has inverse relationship with smoother variation
        beta_drift = -combined_drift * 0.6
        beta_base = 0.5 + self._rng.gauss(0, 0.08) + beta_drift  # Reduced noise
        
        if self.mode == "Focused":
            alpha_base += 0.3 + self._rng.uniform(-0.05, 0.05)
            beta_base -= 0.1 + self._rng.uniform(-0.02, 0.02)
        elif self.mode == "Stressed":
            alpha_base -= 0.1 + self._rng.uniform(-0.02, 0.02)
            beta_base += 0.3 + self._rng.uniform(-0.05, 0.05)
        
        # clamp with wider range
        alpha = max(0.1, min(1.8, alpha_base))
        beta = max(0.1, min(1.8, beta_base))
        return alpha, beta

    def _sample_lf_hf(self) -> float:
        # Smoother HRV patterns with controlled variation
        t = time.time()
        # Use slower, more stable frequencies
        freq1 = 0.25  # Slower base frequency
        freq2 = 0.6   # Medium frequency
        freq3 = 1.2   # Faster but still smooth
        
        # Smaller, more controlled amplitudes
        amp1 = 0.3
        amp2 = 0.2
        amp3 = 0.15
        
        # Smooth sinusoidal drifts
        drift1 = math.sin(t * freq1) * amp1
        drift2 = math.sin(t * freq2 + math.pi / 4) * amp2
        drift3 = math.sin(t * freq3 + math.pi / 2) * amp3
        combined_drift = drift1 + drift2 + drift3
        
        # Reduced random noise for smoother lines
        random_noise = self._rng.gauss(0, 0.12)  # Reduced from 0.3 to 0.12
        
        base = 1.0 + random_noise + combined_drift
        if self.mode == "Stressed":
            base += 0.8 + self._rng.uniform(-0.05, 0.05)  # Reduced variation
        elif self.mode == "Focused":
            base -= 0.25 + self._rng.uniform(-0.03, 0.03)  # Reduced variation
        return max(0.1, min(3.5, base))

    def _fetch_external_eeg(self):
        if not self._http_session or not self.external_url:
            return None

        url = self.external_url
        params = None
        if "{mode}" in url:
            url = url.format(mode=self.mode)
        else:
            params = {"mode": self.mode}

        try:
            response = self._http_session.get(url, params=params, timeout=self.external_timeout)
            response.raise_for_status()
            payload = response.json()

            container = payload.get("eeg") if isinstance(payload, dict) else None
            alpha = container.get("alpha") if container else payload.get("alpha")
            beta = container.get("beta") if container else payload.get("beta")
            hrv = payload.get("hrv") or {}
            lf_hf = hrv.get("lf_hf_ratio")

            if alpha is None or beta is None:
                raise ValueError("missing alpha/beta in payload")

            alpha = float(alpha)
            beta = float(beta)
            lf_hf = float(lf_hf) if lf_hf is not None else None

            self._source_status.update({
                "external_healthy": True,
                "using_external": True,
                "last_error": None,
                "last_success_ts": int(time.time()),
            })
            return alpha, beta, lf_hf
        except Exception as exc:
            self._source_status.update({
                "external_healthy": False,
                "using_external": False,
                "last_error": str(exc),
            })
            return None

    def stream(self, interval_sec: float = 0.5) -> Generator[Dict, None, None]:
        # Simple infinite generator
        while True:
            if self.running:
                ts = int(time.time())

                # Default to internally generated samples
                alpha, beta = self._sample_alpha_beta()
                lf_hf = self._sample_lf_hf()

                external_values = self._fetch_external_eeg()
                if external_values is not None:
                    alpha, beta, lf_hf_external = external_values
                    if lf_hf_external is not None:
                        lf_hf = lf_hf_external

                if external_values is None and not self._source_status.get("external_configured"):
                    self._source_status.update({
                        "using_external": False,
                        "external_healthy": False,
                    })

                # SNN Integration for Stress Detection
                use_snn = self.snn_model is not None
                if use_snn:
                    # Generate synthetic 32-channel input
                    # [Time=1, Batch=1, Channels=32]
                    snn_input = torch.randn(1, 1, 32) 
                    
                    # Simple correlation: if beta high, boost input to trigger 'Stress' class (assuming trained that way)
                    if beta > alpha: 
                        snn_input += 0.5 

                    try:
                        with torch.no_grad():
                            snn_out = self.snn_model(snn_input)
                            # mean firing rate -> argmax
                            pred = snn_out.mean(dim=0).argmax(dim=1).item() 
                            
                            # 0: Relaxed, 1: Stressed
                            if pred == 1:
                                state = "Stressed"
                            else:
                                # Fallback to heuristic 
                                state = compute_cognitive_state(alpha, beta, lf_hf)
                                # If heuristic says Stressed but SNN says Relaxed, trust SNN? 
                                # Let's trust SNN for "Not Stressed" -> change to Neutral if heuristic was Stressed
                                if state == "Stressed":
                                    state = "Neutral"
                    except Exception as e:
                        print(f"SNN Error: {e}")
                        state = compute_cognitive_state(alpha, beta, lf_hf)
                else:
                    state = compute_cognitive_state(alpha, beta, lf_hf)
                    
                rec = recommend_task(state)
                # Extend recommendation with simple reasoning per plan
                reasoning = {
                    "Stressed": "High stress indicators; choose an easier task to reduce cognitive load.",
                    "Focused": "Strong focus signals; tackle higher-difficulty material.",
                    "Neutral": "Maintain steady progress with moderate difficulty."
                }.get(state, "Maintain steady progress with moderate difficulty.")
                rec = {**rec, "reasoning": reasoning}

                # Derive heart rate BPM with smoother, more stable variation
                t = time.time()
                # Use slower, smoother frequencies for more stable heart rate
                hr_freq1 = 0.1   # Very slow base variation
                hr_freq2 = 0.4   # Medium frequency
                hr_freq3 = 0.9   # Faster but still smooth
                
                # Smaller, more controlled amplitudes
                hr_amp1 = 4
                hr_amp2 = 2.5
                hr_amp3 = 1.5
                
                # Smooth sinusoidal drifts
                hr_drift1 = math.sin(t * hr_freq1) * hr_amp1
                hr_drift2 = math.sin(t * hr_freq2 + math.pi / 3) * hr_amp2
                hr_drift3 = math.sin(t * hr_freq3 + math.pi / 6) * hr_amp3
                hr_combined = hr_drift1 + hr_drift2 + hr_drift3
                
                # Base heart rate varies with LF/HF ratio and mode
                base_hr = 70 + (lf_hf * 6)  # Reduced multiplier for less variation
                hr_variation = hr_combined + self._rng.gauss(0, 1.2)  # Reduced noise from 5 to 1.2
                
                heart_rate_bpm = max(55, min(115, base_hr + hr_variation))
                frame = {
                    "timestamp": ts,
                    "eeg": {"alpha": round(alpha, 3), "beta": round(beta, 3)},
                    "hrv": {"lf_hf_ratio": round(lf_hf, 3), "heart_rate_bpm": round(heart_rate_bpm, 2)},
                    "cognitive_state": state,
                    "recommendation": rec,
                    "ingestion": self.get_ingestion_status(),
                }
                self._latest = frame
                if self._tracker:
                    try:
                        self._tracker.record_state(state, ts)
                    except Exception:
                        pass
                yield frame
            else:
                # When stopped, yield the last frame or null data
                if self._latest:
                    yield self._latest
                else:
                    yield {
                        "timestamp": int(time.time()),
                        "eeg": {"alpha": 0, "beta": 0},
                        "hrv": {"lf_hf_ratio": 0},
                        "cognitive_state": "Paused",
                        "recommendation": {"task": "Simulation Paused", "difficulty": 0},
                        "ingestion": self.get_ingestion_status(),
                    }
            time.sleep(interval_sec)
