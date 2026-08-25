from __future__ import annotations

import random
from typing import Dict, List


TIPS_BY_STATE: Dict[str, List[str]] = {
    "Stressed": [
        "Take three slow, deep breaths to reset your attention.",
        "Try a 5-minute walking break to reduce cortisol levels.",
        "Practice progressive muscle relaxation starting with your shoulders.",
        "Sip water and do 30 seconds of gentle neck stretches.",
        "Close your eyes for 20 seconds to reduce visual load.",
        "Switch to a simpler task to regain a sense of control.",
        "Write down distracting thoughts to clear mental space.",
        "Set a short timer (5–10 min) to get momentum.",
        "Do box breathing: inhale 4, hold 4, exhale 4, hold 4.",
        "Listen to a calming instrumental track for 2–3 minutes.",
    ],
    "Neutral": [
        "Set a clear intention for your next learning block.",
        "Review your progress to maintain motivation.",
        "Organize notes or outline the next topic.",
        "Do a quick recall quiz to warm up your memory.",
        "Adjust posture and screen height for comfort.",
        "Plan a short break 25–40 minutes from now.",
        "Skim key terms to prime your attention.",
        "Refactor your task list into small, clear actions.",
        "Minimize notifications for a focused sprint.",
        "Pair a task with a brief reward to keep momentum.",
    ],
    "Focused": [
        "Capitalize on this focus by tackling your most challenging task.",
        "Document your insights while retention is high.",
        "Batch similar tasks to stay in the same mental mode.",
        "Push for a stretch goal before taking a break.",
        "Use a 30–40 min focus block to maximize deep work.",
        "Avoid context switching; park ideas in a quick note.",
        "Rehearse key concepts aloud to strengthen memory.",
        "Attempt a harder practice problem to consolidate.",
        "Summarize what you’ve learned in your own words.",
        "Schedule a brief reflection at the end of this block.",
    ],
}


def get_random_tip(state: str | None) -> dict:
    s = state if state in TIPS_BY_STATE else "Neutral"
    tip = random.choice(TIPS_BY_STATE[s])
    category = (
        "breathing" if "breath" in tip.lower() or "box" in tip.lower()
        else "movement" if "walk" in tip.lower() or "stretch" in tip.lower() or "muscle" in tip.lower()
        else "mindfulness" if "intention" in tip.lower() or "review" in tip.lower() or "reflect" in tip.lower()
        else "productivity"
    )
    # Add contextual prefix based on state
    prefix = {
        "Stressed": "To reduce stress: ",
        "Focused": "To maintain focus: ",
        "Neutral": "To optimize learning: "
    }.get(s, "Tip: ")
    return {"tip": f"{prefix}{tip}", "state": s, "category": category}


