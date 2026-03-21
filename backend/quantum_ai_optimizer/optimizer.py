from __future__ import annotations

from typing import Dict, List

# We try to use Ocean SDK if available; otherwise fall back to a simple heuristic
try:
    import dimod  # type: ignore
    from neal import SimulatedAnnealingSampler  # type: ignore
    OCEAN_AVAILABLE = True
except Exception:
    OCEAN_AVAILABLE = False


# Demo task inventory
TASKS: List[Dict] = [
    {"task": "Review Chapter 1", "difficulty": 1},
    {"task": "Practice Easy Problems", "difficulty": 2},
    {"task": "Review Chapter 3", "difficulty": 3},
    {"task": "Practice Medium Problems", "difficulty": 4},
    {"task": "Attempt Hard Problems", "difficulty": 5},
]


def _preferred_difficulty_for_state(state: str) -> int:
    if state == "Focused":
        return 4  # favor medium-high
    if state == "Stressed":
        return 2  # favor easy
    return 3  # neutral mid


def _heuristic_choice(state: str) -> Dict:
    target = _preferred_difficulty_for_state(state)
    # Choose closest difficulty
    best = min(TASKS, key=lambda t: abs(t["difficulty"] - target))
    return {"task": best["task"], "difficulty": int(best["difficulty"])}


def recommend_task(state: str) -> Dict:
    """
    Recommend a task based on cognitive state using a simple QUBO when Ocean is available
    (SimulatedAnnealingSampler), otherwise fall back to a heuristic.
    """
    if not OCEAN_AVAILABLE:
        return _heuristic_choice(state)

    # QUBO: select exactly one task, and prefer difficulty near target
    try:
        target = _preferred_difficulty_for_state(state)
        lam = 2.0  # penalty for not selecting exactly one

        # Variables: x_i in {0,1}
        linear = {}
        quadratic = {}

        n = len(TASKS)
        for i, t in enumerate(TASKS):
            # Preference: lower cost when difficulty close to target
            pref = abs(t["difficulty"] - target)
            linear[i] = float(pref)

        # Add penalty (sum x_i - 1)^2 = sum x_i + 2*sum_{i<j} x_i x_j - 2*sum x_i + 1
        # We can omit constants; linear gets (lam * (1 - 2)) = -lam for each x_i, plus +lam for each x_i from first term → net (-lam + lam) cancels; keep a simple attractive pairwise term
        # Simpler: encourage exactly one by adding +lam for each pair (i<j)
        for i in range(n):
            for j in range(i + 1, n):
                quadratic[(i, j)] = quadratic.get((i, j), 0.0) + lam

        bqm = dimod.BinaryQuadraticModel(linear, quadratic, 0.0, vartype=dimod.BINARY)
        samples = SimulatedAnnealingSampler().sample(bqm, num_reads=50)
        sample = samples.first.sample
        # Map to chosen index; if none set, fallback
        chosen = [i for i, v in sample.items() if v == 1]
        idx = chosen[0] if chosen else 0
        t = TASKS[idx]
        return {"task": t["task"], "difficulty": int(t["difficulty"])}
    except Exception:
        return _heuristic_choice(state)
