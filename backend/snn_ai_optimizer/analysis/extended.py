from __future__ import annotations

import numpy as np
from typing import Dict, List
from collections import Counter
from pathlib import Path
import json

# scipy is optional for advanced signal processing
try:
    from scipy import signal
    HAS_SCIPY = True
except ImportError:
    HAS_SCIPY = False


class ExtendedAnalyzer:
    """Extended analysis engine for uploaded EDF data."""

    def __init__(self, analysis_data: Dict):
        self.data = analysis_data
        self.time_series = analysis_data.get("time_series", [])
        self.features = analysis_data.get("features", {})
        self.metadata = analysis_data.get("metadata", {})

    def frequency_domain_analysis(self) -> Dict:
        """Perform FFT and power spectral density analysis."""
        if not self.time_series:
            return {}

        alpha_vals = [t["alpha"] for t in self.time_series]
        beta_vals = [t["beta"] for t in self.time_series]
        timestamps = [t["timestamp"] for t in self.time_series]

        # FFT analysis
        n = len(alpha_vals)
        if n < 2:
            return {}

        # Sample rate (approximate from timestamps)
        if len(timestamps) > 1:
            dt = timestamps[1] - timestamps[0] if timestamps[1] != timestamps[0] else 1.0
            fs = 1.0 / dt if dt > 0 else 1.0
        else:
            fs = 1.0

        # FFT for alpha
        alpha_fft = np.fft.fft(alpha_vals)
        alpha_freqs = np.fft.fftfreq(n, 1/fs)
        alpha_power = np.abs(alpha_fft) ** 2

        # FFT for beta
        beta_fft = np.fft.fft(beta_vals)
        beta_freqs = np.fft.fftfreq(n, 1/fs)
        beta_power = np.abs(beta_fft) ** 2

        # Keep only positive frequencies
        pos_freq_idx = alpha_freqs >= 0
        alpha_freqs = alpha_freqs[pos_freq_idx]
        alpha_power = alpha_power[pos_freq_idx]
        beta_freqs = beta_freqs[pos_freq_idx]
        beta_power = beta_power[pos_freq_idx]

        return {
            "frequencies": alpha_freqs[:100].tolist(),  # Limit to first 100 points
            "alpha_power": alpha_power[:100].tolist(),
            "beta_power": beta_power[:100].tolist(),
            "dominant_alpha_freq": float(alpha_freqs[np.argmax(alpha_power)]),
            "dominant_beta_freq": float(beta_freqs[np.argmax(beta_power)]),
        }

    def pattern_detection(self) -> Dict:
        """Detect stress spikes, focus periods, and state transitions."""
        states = [t["cognitive_state"] for t in self.time_series]
        timestamps = [t["timestamp"] for t in self.time_series]

        # Count states
        state_counts = Counter(states)
        dominant_state = state_counts.most_common(1)[0][0] if state_counts else "Neutral"

        # Detect stress events
        stress_events = []
        for i, state in enumerate(states):
            if state == "Stressed":
                stress_events.append({
                    "timestamp": timestamps[i],
                    "index": i,
                })

        # Detect focus periods (consecutive Focused states)
        focus_periods = []
        current_period = None
        for i, state in enumerate(states):
            if state == "Focused":
                if current_period is None:
                    current_period = {"start": timestamps[i], "start_idx": i, "end": timestamps[i], "end_idx": i}
                else:
                    current_period["end"] = timestamps[i]
                    current_period["end_idx"] = i
            else:
                if current_period and (current_period["end_idx"] - current_period["start_idx"]) >= 2:
                    focus_periods.append(current_period)
                current_period = None
        if current_period and (current_period["end_idx"] - current_period["start_idx"]) >= 2:
            focus_periods.append(current_period)

        # State transitions
        transitions = []
        prev_state = None
        for i, state in enumerate(states):
            if prev_state and state != prev_state:
                transitions.append({
                    "timestamp": timestamps[i],
                    "from": prev_state,
                    "to": state,
                })
            prev_state = state

        return {
            "dominant_state": dominant_state,
            "state_distribution": dict(state_counts),
            "stress_events": stress_events,
            "stress_event_count": len(stress_events),
            "focus_periods": focus_periods,
            "focus_period_count": len(focus_periods),
            "state_transitions": transitions,
            "transition_count": len(transitions),
        }

    def statistical_summary(self) -> Dict:
        """Compute statistical summaries."""
        if not self.time_series:
            return {}

        alpha_vals = [t["alpha"] for t in self.time_series]
        beta_vals = [t["beta"] for t in self.time_series]
        hr_vals = [t.get("heart_rate", 0) for t in self.time_series]

        def stats(arr):
            arr = np.array(arr)
            return {
                "mean": float(np.mean(arr)),
                "std": float(np.std(arr)),
                "min": float(np.min(arr)),
                "max": float(np.max(arr)),
                "median": float(np.median(arr)),
                "q25": float(np.percentile(arr, 25)),
                "q75": float(np.percentile(arr, 75)),
            }

        return {
            "alpha": stats(alpha_vals),
            "beta": stats(beta_vals),
            "heart_rate": stats(hr_vals),
        }

    def anomaly_detection(self) -> Dict:
        """Detect anomalies in the data."""
        if not self.time_series:
            return {}

        alpha_vals = np.array([t["alpha"] for t in self.time_series])
        beta_vals = np.array([t["beta"] for t in self.time_series])

        # Use z-score for anomaly detection
        alpha_mean = np.mean(alpha_vals)
        alpha_std = np.std(alpha_vals)
        beta_mean = np.mean(beta_vals)
        beta_std = np.std(beta_vals)

        threshold = 2.5  # 2.5 standard deviations

        alpha_anomalies = []
        beta_anomalies = []

        for i, (alpha, beta) in enumerate(zip(alpha_vals, beta_vals)):
            alpha_z = abs((alpha - alpha_mean) / (alpha_std + 1e-6))
            beta_z = abs((beta - beta_mean) / (beta_std + 1e-6))

            if alpha_z > threshold:
                alpha_anomalies.append({
                    "index": i,
                    "timestamp": self.time_series[i]["timestamp"],
                    "value": float(alpha),
                    "z_score": float(alpha_z),
                })
            if beta_z > threshold:
                beta_anomalies.append({
                    "index": i,
                    "timestamp": self.time_series[i]["timestamp"],
                    "value": float(beta),
                    "z_score": float(beta_z),
                })

        return {
            "alpha_anomalies": alpha_anomalies[:20],  # Limit to first 20
            "beta_anomalies": beta_anomalies[:20],
            "total_alpha_anomalies": len(alpha_anomalies),
            "total_beta_anomalies": len(beta_anomalies),
        }

    def trend_analysis(self) -> Dict:
        """Analyze trends over time."""
        if len(self.time_series) < 3:
            return {}

        alpha_vals = [t["alpha"] for t in self.time_series]
        beta_vals = [t["beta"] for t in self.time_series]

        # Simple linear trend (slope)
        x = np.arange(len(alpha_vals))
        alpha_slope = float(np.polyfit(x, alpha_vals, 1)[0])
        beta_slope = float(np.polyfit(x, beta_vals, 1)[0])

        # Determine trend direction
        alpha_trend = "increasing" if alpha_slope > 0.001 else "decreasing" if alpha_slope < -0.001 else "stable"
        beta_trend = "increasing" if beta_slope > 0.001 else "decreasing" if beta_slope < -0.001 else "stable"

        return {
            "alpha_trend": alpha_trend,
            "alpha_slope": alpha_slope,
            "beta_trend": beta_trend,
            "beta_slope": beta_slope,
        }

    def generate_insights(self) -> Dict:
        """Generate comprehensive insights from all analyses."""
        freq_analysis = self.frequency_domain_analysis()
        patterns = self.pattern_detection()
        stats = self.statistical_summary()
        anomalies = self.anomaly_detection()
        trends = self.trend_analysis()

        # Build narrative insights
        insights = []

        # State analysis
        insights.append(
            f"Dominant cognitive state: {patterns['dominant_state']} "
            f"({patterns['state_distribution'].get(patterns['dominant_state'], 0)} occurrences)."
        )

        # Stress analysis
        if patterns["stress_event_count"] > 0:
            insights.append(
                f"Detected {patterns['stress_event_count']} stress event(s). "
                "Consider reviewing these periods for potential interventions."
            )
        else:
            insights.append("No significant stress events detected during this session.")

        # Focus analysis
        if patterns["focus_period_count"] > 0:
            insights.append(
                f"Identified {patterns['focus_period_count']} sustained focus period(s), "
                "indicating good cognitive engagement."
            )

        # Trend analysis
        if trends:
            insights.append(
                f"Alpha waves show {trends['alpha_trend']} trend, "
                f"while beta waves show {trends['beta_trend']} trend over the session."
            )

        # Anomaly analysis
        if anomalies["total_alpha_anomalies"] > 0 or anomalies["total_beta_anomalies"] > 0:
            insights.append(
                f"Detected {anomalies['total_alpha_anomalies']} alpha and "
                f"{anomalies['total_beta_anomalies']} beta anomalies. "
                "These may indicate significant cognitive state changes or artifacts."
            )

        # Statistical insights
        if stats.get("alpha"):
            alpha_mean = stats["alpha"]["mean"]
            if alpha_mean > 0.7:
                insights.append("High average alpha power suggests relaxed, meditative states.")
            elif alpha_mean < 0.3:
                insights.append("Low alpha power may indicate high alertness or stress.")

        return {
            "frequency_domain": freq_analysis,
            "patterns": patterns,
            "statistics": stats,
            "anomalies": anomalies,
            "trends": trends,
            "insights_text": insights,
            "summary": " ".join(insights),
        }


def analyze_uploaded_data(upload_id: str) -> Dict:
    """Load and analyze uploaded data by upload_id."""
    analysis_file = Path("results/analysis") / f"{upload_id}.json"
    if not analysis_file.exists():
        raise FileNotFoundError(f"Analysis data not found for upload_id: {upload_id}")

    with open(analysis_file, "r", encoding="utf-8") as f:
        analysis_data = json.load(f)

    analyzer = ExtendedAnalyzer(analysis_data)
    extended_analysis = analyzer.generate_insights()

    # Merge with original data
    result = {
        **analysis_data,
        "extended_analysis": extended_analysis,
    }

    return result

