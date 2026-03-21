from __future__ import annotations

import time
from typing import List, Tuple, Optional, Dict


class SessionTracker:
    """
    Track session metrics in memory (reset on sim stop).
    Stores: start_time, state_history[(ts, state)], stress_events, focus_periods
    """

    def __init__(self) -> None:
        self.reset()

    def reset(self) -> None:
        self.start_time: Optional[int] = None
        self.state_history: List[Tuple[int, str]] = []
        self.stress_events: int = 0
        self._last_state: Optional[str] = None

    def start(self) -> None:
        # Always update start_time when starting (even if already set, reset it)
        self.start_time = int(time.time())

    def stop(self) -> None:
        # Keep history for summary generation
        pass

    def record_state(self, state: str, ts: Optional[int] = None) -> None:
        ts = ts or int(time.time())
        self.state_history.append((ts, state))
        if state == "Stressed":
            self.stress_events += 1
        self._last_state = state

    def _dominant_state(self) -> str:
        from collections import Counter
        counts = Counter([s for _, s in self.state_history])
        if not counts:
            return "Neutral"
        return counts.most_common(1)[0][0]

    def _focus_percentage(self) -> float:
        if not self.state_history:
            return 0.0
        focused = sum(1 for _, s in self.state_history if s == "Focused")
        return 100.0 * focused / max(1, len(self.state_history))

    def _state_transitions(self) -> int:
        if len(self.state_history) < 2:
            return 0
        transitions = 0
        prev = self.state_history[0][1]
        for _, s in self.state_history[1:]:
            if s != prev:
                transitions += 1
                prev = s
        return transitions

    def generate_summary(self) -> Dict:
        now = int(time.time())
        # Calculate duration properly - use start_time if available, otherwise use first sample timestamp
        if self.start_time is not None:
            duration_seconds = now - self.start_time
        elif len(self.state_history) > 0:
            # Fallback: calculate from first sample timestamp
            first_sample_ts = self.state_history[0][0]
            duration_seconds = now - first_sample_ts
        else:
            duration_seconds = 0
        
        duration_minutes = duration_seconds // 60
        if duration_seconds < 60:
            duration_display = f"{duration_seconds} seconds"
        elif duration_minutes == 1:
            duration_display = "1 minute"
        else:
            duration_display = f"{duration_minutes} minutes"
        
        dominant_state = self._dominant_state()
        focus_pct = self._focus_percentage()
        transitions = self._state_transitions()
        total_samples = len(self.state_history)

        # Generate contextual summary based on data availability
        if total_samples == 0:
            summary_text = (
                "No session data collected yet. Start the simulation and let it run for at least "
                "10-15 seconds to generate a meaningful cognitive performance summary. "
                "The system will track your cognitive states (Focused, Neutral, Stressed) and provide insights."
            )
        elif total_samples < 5:
            summary_text = (
                f"Session just started ({duration_display}, {total_samples} samples collected). "
                f"Current dominant state: {dominant_state}. "
                "Let the simulation run longer for a more comprehensive analysis of your cognitive patterns."
            )
        else:
            stress_advice = ""
            if self.stress_events > 0:
                stress_advice = (
                    f" {self.stress_events} stress event(s) were detected. "
                    "Consider brief movement or breathing resets between learning blocks."
                )
            
            focus_advice = ""
            if focus_pct > 50:
                focus_advice = (
                    " You've maintained strong focus—leverage this for higher-difficulty material and capture notes to consolidate learning."
                )
            elif focus_pct < 20:
                focus_advice = (
                    " Focus levels are lower—try breaking tasks into smaller chunks or taking a short break to reset."
                )

            summary_text = (
                f"Your cognitive performance during this {duration_display} session shows "
                f"a dominant state of {dominant_state}. Focus was sustained for approximately "
                f"{focus_pct:.1f}% of sampled moments ({total_samples} total samples), with {transitions} notable state transitions."
                f"{stress_advice}{focus_advice}"
            )

        return {
            "summary": summary_text,
            "duration_minutes": max(0, duration_minutes),
            "duration_seconds": max(0, duration_seconds),
            "duration_display": duration_display,
            "dominant_state": dominant_state,
            "focus_percentage": round(focus_pct, 2),
            "stress_events": int(self.stress_events),
            "state_transitions": int(transitions),
            "total_samples": total_samples,
        }


