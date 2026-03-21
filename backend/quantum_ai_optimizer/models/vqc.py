from __future__ import annotations
import math
import torch
import torch.nn as nn
import pennylane as qml

# Keep everything in float32 to avoid PyTorch/PennyLane dtype clashes
torch.set_default_dtype(torch.float32)


class VQCClassifier(nn.Module):
    """
    PennyLane Variational Quantum Classifier wrapped as a Torch nn.Module.

    Pipeline:
      x (B, D) --proj--> (B, n_qubits) --norm--> per-sample z
        -> QNode(expval Z on each wire) -> mean -> Linear(1->1) -> logit
    """

    def __init__(
        self,
        input_dim: int,
        n_qubits: int | None = None,
        n_layers: int = 2,
        dev_name: str = "default.qubit",
        device: torch.device | None = None,
    ):
        super().__init__()
        self.input_dim = int(input_dim)
        self.n_qubits = int(n_qubits or min(6, max(2, int(math.ceil(self.input_dim / 2)))))
        self.n_layers = int(n_layers)
        self._torch_device = device or torch.device("cpu")

        # Pad/truncate linear projection R^{input_dim} -> R^{n_qubits}
        proj = torch.randn(self.input_dim, self.n_qubits, dtype=torch.float32) / math.sqrt(self.input_dim)
        self.register_buffer("proj", proj)

        # PennyLane device & QNode
        self.dev = qml.device(dev_name, wires=self.n_qubits)

        @qml.qnode(self.dev, interface="torch", diff_method="parameter-shift")
        def circuit(x, weights):
            # x: (n_qubits,) as torch.float32
            qml.AngleEmbedding(x, wires=range(self.n_qubits), rotation="Y")
            qml.StronglyEntanglingLayers(weights, wires=range(self.n_qubits))
            return [qml.expval(qml.PauliZ(i)) for i in range(self.n_qubits)]

        self.qnode = circuit

        # Trainable quantum weights (StronglyEntanglingLayers)
        self.weights = nn.Parameter(
            torch.zeros(self.n_layers, self.n_qubits, 3, dtype=torch.float32, device=self._torch_device)
        )
        nn.init.normal_(self.weights, mean=0.0, std=0.1)

        # Classical head maps mean(expvals) -> logit
        self.head = nn.Linear(1, 1).to(self._torch_device).float()

        # Move buffers to target device
        self.to(self._torch_device)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """
        x: (B, D) float32
        returns logits: (B, 1) float32
        """
        # Ensure float32 & on same device
        x = x.to(self._torch_device, dtype=torch.float32)

        # Project to n_qubits
        z = x @ self.proj  # (B, n_qubits) float32

        # Per-sample normalization
        z = (z - z.mean(dim=1, keepdim=True)) / (z.std(dim=1, keepdim=True) + 1e-6)

        outs = []
        # Evaluate QNode per sample (keeps code simple & stable)
        for i in range(z.shape[0]):
            # QNode expects float32 tensors; ensure dtype/device
            zi = z[i].to(dtype=torch.float32)
            ev = self.qnode(zi, self.weights)  # list/tuple of expvals (torch tensors/scalars)
            # Stack & enforce float32 on our device
            ev = torch.stack([torch.as_tensor(e, dtype=torch.float32, device=self._torch_device) for e in ev], dim=0)
            outs.append(ev.mean().unsqueeze(0))  # (1,)

        q_feat = torch.stack(outs, dim=0)  # (B, 1), float32
        logits = self.head(q_feat)         # (B, 1), float32
        return logits
