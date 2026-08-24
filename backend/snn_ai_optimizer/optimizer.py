from typing import Dict, List
import json
import os
import random
from snn_ai_optimizer.models.snn_recommender import SNNRecommender

# Demo task inventory
TASKS: List[Dict] = [
    {"task": "Review Chapter 1", "difficulty": 1},
    {"task": "Practice Easy Problems", "difficulty": 2},
    {"task": "Review Chapter 3", "difficulty": 3},
    {"task": "Practice Medium Problems", "difficulty": 4},
    {"task": "Attempt Hard Problems", "difficulty": 5},
]

# Q-Learning parameters
Q_TABLE_PATH = "results/q_table.json"
ALPHA = 0.1
GAMMA = 0.9
EPSILON = 0.2

_snn_recommender = None

def _load_recommender():
    global _snn_recommender
    if _snn_recommender is None:
        _snn_recommender = SNNRecommender()
        if not _snn_recommender.load():
            # If no trained weights, it will use random initialization, which is fine for fallback.
            pass
    return _snn_recommender

def _load_q_table():
    if os.path.exists(Q_TABLE_PATH):
        try:
            with open(Q_TABLE_PATH, "r") as f:
                return json.load(f)
        except Exception:
            pass
    return {}

def _save_q_table(q_table):
    os.makedirs(os.path.dirname(Q_TABLE_PATH), exist_ok=True)
    with open(Q_TABLE_PATH, "w") as f:
        json.dump(q_table, f)

def get_q_value(q_table, state, action):
    action = str(action)
    if state not in q_table:
        return 0.0
    return q_table[state].get(action, 0.0)

def set_q_value(q_table, state, action, value):
    action = str(action)
    if state not in q_table:
        q_table[state] = {}
    q_table[state][action] = value

def recommend_task(state: str) -> Dict:
    """
    Two-layer architecture:
    1. SNN Recommender selects target difficulty band based on cognitive state.
    2. Q-Learning selects the specific task within that band.
    """
    # 1. SNN Difficulty Inference
    recommender = _load_recommender()
    target_difficulty = recommender.predict(state)
    
    # 2. Q-Learning Task Selection
    q_table = _load_q_table()
    
    # Filter tasks by the target difficulty band (allow +/- 1 for flexibility)
    candidate_indices = [i for i, t in enumerate(TASKS) if abs(t["difficulty"] - target_difficulty) <= 1]
    if not candidate_indices:
        candidate_indices = list(range(len(TASKS)))
        
    if random.random() < EPSILON:
        # Explore
        chosen_idx = random.choice(candidate_indices)
    else:
        # Exploit
        best_q = -float("inf")
        chosen_idx = candidate_indices[0]
        for idx in candidate_indices:
            q = get_q_value(q_table, state, idx)
            if q > best_q:
                best_q = q
                chosen_idx = idx
                
    chosen_task = TASKS[chosen_idx]
    
    return {"task": chosen_task["task"], "difficulty": int(chosen_task["difficulty"]), "task_index": chosen_idx}

def update_q_table(state: str, task_index: int, reward: float):
    q_table = _load_q_table()
    old_q = get_q_value(q_table, state, task_index)
    
    # Simple Q-learning update (assuming target Q is just the reward for this single-step task)
    new_q = old_q + ALPHA * (reward - old_q)
    set_q_value(q_table, state, task_index, new_q)
    _save_q_table(q_table)
