# ⏱️ System Clock Engine

Manages precise time synchronization, midnight calculations, and window visibility event listeners.

---

## ⚙️ Execution Mechanics

- **Midnight Delay Calculation:** $\Delta t = t_{\text{midnight}} - t_{\text{now}}$.
- **Timer Execution:** Uses precision `setTimeout` loops targeting exact midnight transitions.
- **Visibility Sync:** `visibilitychange` listener syncs date state instantly when computer wakes up or browser tab regains focus.

---

## 🔗 Related Vault Connections

- Calendar integration: [[SNN-Progress-Calendar-and-Rollover]]
- Workflow algorithms: [[SNN-Technical-Algorithms-and-Workflow]]
- Data flow: [[SNN-State-Management-Data-Flow]]

---
*Linked to: [[SNN-Progress-Calendar-and-Rollover]], [[SNN-Technical-Algorithms-and-Workflow]], [[SNN-State-Management-Data-Flow]]*
