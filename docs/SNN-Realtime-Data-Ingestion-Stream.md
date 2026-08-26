# 📡 Realtime Data Ingestion Stream

The ingestion pipeline handles live telemetry broadcasting from raw biosensors or synthetic exam crunch simulation streams to the frontend dashboard.

---

## 🛠️ Stream Mechanics

- **Protocol:** WebSocket connection (`WS /api/data`) with HTTP polling fallback (`GET /api/snapshot`).
- **Data Generator:** Synthetic 25-point "Stressed Student Exam Crunch" timeline.
- **FastAPI Core:** Implemented in `backend/snn_ai_optimizer/streaming.py`.
- **Ingestion Mode:** Supports live web HTTP feeds (`EEG_SOURCE_URL`).

---

## 🔗 Related Vault Connections

- Frontend state hook: [[SNN-State-Management-Data-Flow]]
- SNN classifier integration: [[SNN-Spiking-Neural-Network-Engine]]
- Trend visualization: [[SNN-Biometric-Trends-Engine]]
- Backend service stack: [[SNN-Tech-Stack-and-Architecture]]

---
*Linked to: [[SNN-State-Management-Data-Flow]], [[SNN-Spiking-Neural-Network-Engine]], [[SNN-Biometric-Trends-Engine]], [[SNN-Tech-Stack-and-Architecture]]*
