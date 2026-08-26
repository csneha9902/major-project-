# 🎯 Q-Learning Task Optimizer

The reinforcement learning module dynamically selects learning tasks and break recommendations based on student cognitive state feedback.

---

## ⚙️ Core Mechanics

- **State Space ($\mathcal{S}$):** Cognitive state + EEG Beta/Alpha ratio + HRV stress index.
- **Action Space ($\mathcal{A}$):**
  1. Breathing Break & Recovery (Difficulty 1)
  2. Light Task Review (Difficulty 2)
  3. Moderate Challenge (Difficulty 3)
  4. Intense Exam Practice (Difficulty 4)
- **Reward Function:** Positive rewards ($+10$) for focused task completion; penalties ($-5$) for high stress task assignments to prevent burnout.

---

## 🔗 Related Vault Connections

- Mathematical update rule: [[SNN-Technical-Algorithms-and-Workflow]]
- SNN model feed: [[SNN-Spiking-Neural-Network-Engine]]
- Recommendation UI display: [[SNN-Task-Recommendation-Engine]]
- Real-time data loop: [[SNN-State-Management-Data-Flow]]
- Viva questions: [[SNN-Viva-and-Exam-Questions]]

---
*Linked to: [[SNN-Technical-Algorithms-and-Workflow]], [[SNN-Spiking-Neural-Network-Engine]], [[SNN-Task-Recommendation-Engine]], [[SNN-State-Management-Data-Flow]]*
