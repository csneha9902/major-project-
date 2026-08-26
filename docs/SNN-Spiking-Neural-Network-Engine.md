# ⚡ Spiking Neural Network (SNN) Engine

The SNN module performs continuous, event-driven cognitive stress classification from EEG temporal signals.

---

## 🔬 Key Components

- **Neuron Architecture:** Leaky Integrate-and-Fire (LIF) neurons (`SpikingJelly` & `PyTorch`).
- **Input Channels:** EEG Band Powers ($\mathbf{P}_\alpha$, $\mathbf{P}_\beta$) & HRV LF/HF ratios.
- **Surrogate Gradients:** ArcTangent surrogate derivative enabling BPTT gradient propagation.
- **Output:** Spike firing counts mapped to cognitive states (`Focused`, `Neutral`, `Stressed`).

---

## 🔗 Related Vault Connections

- Algorithmic formulation: [[SNN-Technical-Algorithms-and-Workflow]]
- Real-time ingestion feed: [[SNN-Realtime-Data-Ingestion-Stream]]
- State classification: [[SNN-Cognitive-State-Inference-Engine]]
- Dataset training pipeline: [[SNN-Dataset-Preprocess-and-Loaders]]
- Task optimizer integration: [[SNN-Q-Learning-Task-Optimizer]]
- System architecture: [[SNN-Tech-Stack-and-Architecture]]

---
*Linked to: [[SNN-Technical-Algorithms-and-Workflow]], [[SNN-Cognitive-State-Inference-Engine]], [[SNN-Q-Learning-Task-Optimizer]], [[SNN-Dataset-Preprocess-and-Loaders]], [[SNN-Tech-Stack-and-Architecture]]*
