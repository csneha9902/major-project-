# 🛠️ SNN-AI Tech Stack & System Architecture

This note outlines the full-stack technology stack, component relationships, and deployment architecture of the project.

---

## 🏗️ Stack Overview

| Layer | Technology | Key Responsibility |
| :--- | :--- | :--- |
| **Frontend** | React 18 + Vite | Interactive UI dashboard, Recharts visualizers |
| **Backend** | FastAPI + Uvicorn | REST APIs, WebSocket streaming engine |
| **Neural Engine** | PyTorch + SpikingJelly | [[SNN-Spiking-Neural-Network-Engine]] inference |
| **Optimizer** | Q-Learning RL | [[SNN-Q-Learning-Task-Optimizer]] task adjustment |
| **Styling** | Custom CSS + Tailwind | [[SNN-Design-and-Aesthetics]] clinical off-white theme |
| **Containerization** | Docker & Compose | Multi-container production deployment |

---

## 🔄 Core Subsystems & Connections

- **Real-Time Data Pipeline:** Handled via [[SNN-Realtime-Data-Ingestion-Stream]] and [[SNN-State-Management-Data-Flow]].
- **Cognitive Inference:** Derived from [[SNN-Cognitive-State-Inference-Engine]] powered by [[SNN-Spiking-Neural-Network-Engine]].
- **Task Optimization:** Managed by [[SNN-Q-Learning-Task-Optimizer]] communicating with [[SNN-Task-Recommendation-Engine]].
- **UI Framework:** Rendered via [[SNN-UI-Component-Library]], [[SNN-Biometric-Trends-Engine]], and [[SNN-Progress-Calendar-and-Rollover]].
- **Data Loaders:** Implemented in [[SNN-Dataset-Preprocess-and-Loaders]].
- **Clock Synchronization:** Driven by [[SNN-System-Clock-Engine]].

---
*Linked to: [[SNN-OBI-MAPS]], [[SNN-Index]], [[SNN-Spiking-Neural-Network-Engine]], [[SNN-Q-Learning-Task-Optimizer]], [[SNN-Realtime-Data-Ingestion-Stream]], [[SNN-Research-Report-System-Architecture]]*
