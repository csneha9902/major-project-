# 🧮 Technical Algorithms & Workflow

This note documents the core mathematical models, signal processing algorithms, and operational workflows of the project.

---

## 1. Spiking Neuron Dynamics
Implemented in [[SNN-Spiking-Neural-Network-Engine]] using Leaky Integrate-and-Fire (LIF) equations:

$$\tau_m \frac{dV(t)}{dt} = -(V(t) - V_{\text{rest}}) + R \cdot I(t)$$

Discrete membrane updates and surrogate gradient backpropagation ($\sigma'(x)$) allow temporal spike learning.

---

## 2. Q-Learning Optimization
Implemented in [[SNN-Q-Learning-Task-Optimizer]] using the Bellman update:

$$Q(s, a) \leftarrow Q(s, a) + \alpha \left[ R(s, a, s') + \gamma \max_{a'} Q(s', a') - Q(s, a) \right]$$

Prevents cognitive overload and optimizes student task difficulty.

---

## 3. EEG Signal Power Spectral Density (PSD)
Calculated via Welch Periodogram in [[SNN-Cognitive-State-Inference-Engine]]:
- **Alpha Band ($8\text{--}13\text{ Hz}$)**: Relaxed focus.
- **Beta Band ($13\text{--}30\text{ Hz}$)**: High cognitive workload & stress.

---

## 4. Midnight Rollover Synchronization
Engineered in [[SNN-System-Clock-Engine]] and [[SNN-Progress-Calendar-and-Rollover]]:
- Calculates $\Delta t_{\text{rollover}} = t_{\text{midnight}} - t_{\text{now}}$.
- Auto-shifts active session outline borders and updates today's log cell.

---
*Linked to: [[SNN-OBI-MAPS]], [[SNN-Index]], [[SNN-Spiking-Neural-Network-Engine]], [[SNN-Q-Learning-Task-Optimizer]], [[SNN-Cognitive-State-Inference-Engine]], [[SNN-System-Clock-Engine]]*
