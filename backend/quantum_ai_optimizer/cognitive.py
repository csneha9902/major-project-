from __future__ import annotations

from dataclasses import dataclass


def compute_cognitive_state(alpha: float, beta: float, lf_hf_ratio: float) -> str:
    """
    Simple rule-based cognitive state engine.
    - If LF/HF is high, mark as Stressed
    - Else if alpha > beta by a margin, mark as Focused
    - Else Neutral
    """
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

