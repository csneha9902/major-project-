# 🧠 Cognitive State Inference Engine

This engine categorizes biometric signals into discrete states: `Focused`, `Neutral`, and `Stressed`.

---

## 📊 Classification Rules

- **Stressed:** $\mathbf{P}_\beta / \mathbf{P}_\alpha > 2.2$ or Heart Rate $> 90\text{ BPM}$.
- **Focused:** $1.0 \le \mathbf{P}_\beta / \mathbf{P}_\alpha \le 2.2$ and $\mathbf{P}_\alpha \ge 0.6$.
- **Neutral:** Baseline default state.

---

## 🔗 Related Vault Connections

- Neural model classifier: [[SNN-Spiking-Neural-Network-Engine]]
- Signal formulations: [[SNN-Technical-Algorithms-and-Workflow]]
- Recommendation trigger: [[SNN-Task-Recommendation-Engine]]
- Trend charts: [[SNN-Biometric-Trends-Engine]]

---
*Linked to: [[SNN-Spiking-Neural-Network-Engine]], [[SNN-Technical-Algorithms-and-Workflow]], [[SNN-Task-Recommendation-Engine]], [[SNN-Biometric-Trends-Engine]]*
