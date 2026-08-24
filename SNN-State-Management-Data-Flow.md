# 🔄 State Management & Data Flow

Details the end-to-end data lifecycle from server stream sockets to React component states.

---

## 🌊 Flow Pipeline

```
WebSocket Frame (/api/data) -> useDataStream Hook -> Dashboard State
-> CurrentStateCard (State Badge)
-> BiometricTrendsChart (Recharts Buffer)
-> TaskRecommendationCard (Situation Analysis)
-> ProgressCalendar (Daily Log Entry)
```

---

## 🔗 Related Vault Connections

- Backend stream source: [[SNN-Realtime-Data-Ingestion-Stream]]
- System architecture: [[SNN-Tech-Stack-and-Architecture]]
- Dynamic recommendations: [[SNN-Task-Recommendation-Engine]]
- Clock synchronization: [[SNN-System-Clock-Engine]]

---
*Linked to: [[SNN-Realtime-Data-Ingestion-Stream]], [[SNN-Tech-Stack-and-Architecture]], [[SNN-Task-Recommendation-Engine]], [[SNN-System-Clock-Engine]]*
