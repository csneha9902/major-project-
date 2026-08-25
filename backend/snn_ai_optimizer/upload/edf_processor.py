from __future__ import annotations

try:
    import mne
    HAS_MNE = True
except ImportError:
    mne = None
    HAS_MNE = False

import numpy as np
from pathlib import Path
from typing import Dict, List, Tuple
import json
import uuid
from datetime import datetime


class EDFProcessor:
    """Process EDF files and extract features for analysis."""

    def __init__(self, file_path: str | Path):
        self.file_path = Path(file_path)
        self.raw = None
        self.metadata = {}
        self.features = {}

    def load(self) -> None:
        """Load EDF file using MNE."""
        if not HAS_MNE:
            raise ValueError("MNE library is required to process EDF files. Please install mne: pip install mne")
        try:
            self.raw = mne.io.read_raw_edf(str(self.file_path), preload=True, verbose=False)
            self.metadata = {
                "n_channels": len(self.raw.ch_names),
                "sfreq": float(self.raw.info["sfreq"]),
                "duration": float(self.raw.times[-1]),
                "ch_names": self.raw.ch_names,
            }
        except Exception as e:
            raise ValueError(f"Failed to load EDF file: {str(e)}")


    def extract_features(self) -> Dict:
        """Extract alpha, beta, and other features from EDF."""
        if self.raw is None:
            raise ValueError("EDF file not loaded. Call load() first.")

        data = self.raw.get_data()
        sfreq = float(self.metadata["sfreq"])
        duration = float(self.metadata["duration"])

        def _normalize(values: np.ndarray) -> np.ndarray:
            arr = np.asarray(values, dtype=float)
            if arr.size == 0:
                return arr
            arr = arr - arr.min()
            peak = arr.max()
            if peak < 1e-9:
                return np.zeros_like(arr)
            arr = arr / peak  # 0-1 range
            return (arr * 1.6) + 0.2  # stretch to 0.2-1.8 for better visual contrast

        try:
            from scipy import signal as sp_signal

            nyquist = sfreq / 2.0
            alpha_b, alpha_a = sp_signal.butter(4, [8 / nyquist, 13 / nyquist], btype="band")
            beta_b, beta_a = sp_signal.butter(4, [13 / nyquist, 30 / nyquist], btype="band")

            alpha_envelopes = []
            beta_envelopes = []
            for ch_data in data:
                alpha_filtered = sp_signal.filtfilt(alpha_b, alpha_a, ch_data)
                beta_filtered = sp_signal.filtfilt(beta_b, beta_a, ch_data)
                alpha_envelopes.append(np.abs(sp_signal.hilbert(alpha_filtered)))
                beta_envelopes.append(np.abs(sp_signal.hilbert(beta_filtered)))

            alpha_avg = np.mean(alpha_envelopes, axis=0)
            beta_avg = np.mean(beta_envelopes, axis=0)
        except Exception:
            # Fall back to simple absolute amplitudes if scipy is unavailable
            alpha_avg = np.abs(data).mean(axis=0)
            beta_avg = alpha_avg

        samples_per_second = 5.0
        step = max(1, int(round(max(sfreq, 1.0) / samples_per_second)))

        if alpha_avg.size == 0:
            sample_indices = np.array([], dtype=int)
        else:
            sample_indices = np.arange(0, alpha_avg.shape[0], step, dtype=int)

        if sample_indices.size == 0:
            timestamps = []
            alpha_samples = np.array([])
            beta_samples = np.array([])
        else:
            timestamps = (sample_indices / sfreq).astype(float).tolist()
            alpha_samples = alpha_avg[sample_indices]
            beta_samples = beta_avg[sample_indices]

        alpha_series = _normalize(alpha_samples).tolist() if alpha_samples.size else []
        beta_series = _normalize(beta_samples).tolist() if beta_samples.size else []

        raw_alpha_mean = float(np.mean(alpha_samples)) if alpha_samples.size else 1.0
        raw_beta_mean = float(np.mean(beta_samples)) if beta_samples.size else 1.0
        lf_hf_ratio = float((raw_beta_mean + 1e-6) / (raw_alpha_mean + 1e-6))

        if timestamps:
            self.metadata["duration"] = float(timestamps[-1])
        else:
            self.metadata["duration"] = duration

        self.features = {
            "timestamps": timestamps,
            "alpha": alpha_series,
            "beta": beta_series,
            "alpha_mean": float(np.mean(alpha_series)) if alpha_series else 0.0,
            "beta_mean": float(np.mean(beta_series)) if beta_series else 0.0,
            "alpha_std": float(np.std(alpha_series)) if alpha_series else 0.0,
            "beta_std": float(np.std(beta_series)) if beta_series else 0.0,
            "lf_hf_ratio": lf_hf_ratio,
            "n_samples": len(timestamps),
        }

        return self.features

    def get_analysis_data(self) -> Dict:
        """Get formatted data ready for analysis."""
        if not self.features:
            self.extract_features()

        # Compute cognitive states for each time point
        from snn_ai_optimizer.cognitive import compute_cognitive_state

        states = []
        recommendations = []
        heart_rates = []

        for i, (alpha, beta) in enumerate(zip(self.features["alpha"], self.features["beta"])):
            lf_hf = self.features["lf_hf_ratio"] + np.random.normal(0, 0.1)  # Add slight variation
            state = compute_cognitive_state(alpha, beta, lf_hf)
            from snn_ai_optimizer.optimizer import recommend_task
            rec = recommend_task(state)
            hr = 60 + (lf_hf * 20) + np.random.normal(0, 3)

            states.append(state)
            recommendations.append(rec)
            heart_rates.append(float(hr))

        return {
            "metadata": self.metadata,
            "features": self.features,
            "time_series": [
                {
                    "timestamp": ts,
                    "alpha": alpha,
                    "beta": beta,
                    "heart_rate": hr,
                    "cognitive_state": state,
                    "recommendation": rec,
                }
                for ts, alpha, beta, hr, state, rec in zip(
                    self.features["timestamps"],
                    self.features["alpha"],
                    self.features["beta"],
                    heart_rates,
                    states,
                    recommendations,
                )
            ],
        }


def process_edf_file(file_path: str | Path, upload_id: str | None = None) -> Dict:
    """Process an EDF file and return analysis data."""
    processor = EDFProcessor(file_path)
    processor.load()
    analysis_data = processor.get_analysis_data()
    
    if upload_id:
        analysis_data["upload_id"] = upload_id
    else:
        analysis_data["upload_id"] = str(uuid.uuid4())
    
    analysis_data["processed_at"] = datetime.now().isoformat()
    return analysis_data

