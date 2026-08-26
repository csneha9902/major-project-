# 📁 Dataset Preprocessing & Data Loaders

Ingests and normalizes raw EEG datasets (DEAP) and MRI features for model training and baseline evaluation.

---

## 🛠️ Pipeline Functions

- **Loaders:** `backend/snn_ai_optimizer/datasets/mri_loader.py` & DEAP loaders.
- **Preprocessing:** Fast Fourier Transform (FFT) band filtering & Z-score normalization.
- **Outputs:** Serialized feature matrices saved to `results/preprocess/`.

---

## 🔗 Related Vault Connections

- Neural model training: [[SNN-Spiking-Neural-Network-Engine]]
- System architecture: [[SNN-Tech-Stack-and-Architecture]]
- Pipeline execution: [[SNN-Technical-Algorithms-and-Workflow]]

---
*Linked to: [[SNN-Spiking-Neural-Network-Engine]], [[SNN-Tech-Stack-and-Architecture]], [[SNN-Technical-Algorithms-and-Workflow]]*
