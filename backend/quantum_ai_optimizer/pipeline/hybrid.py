from __future__ import annotations
import json
from pathlib import Path
import numpy as np

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, roc_auc_score
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline

from quantum_ai_optimizer.utils.logger import create_run_folder, save_text_log, save_metrics

# ===== helpers for preprocessed features =====
def _load_or_prepare_preprocessed():
    eeg_path = Path("results/preprocess/eeg_features.json")
    mri_path = Path("results/preprocess/mri_features.json")
    if eeg_path.exists() and mri_path.exists():
        return eeg_path, mri_path
    eeg_path.parent.mkdir(parents=True, exist_ok=True)
    eeg_path.write_text(json.dumps({"features": [0.1, 0.2, 0.3]}, indent=2), encoding="utf-8")
    mri_path.write_text(json.dumps({"features": [1.1, 1.2, 1.3]}, indent=2), encoding="utf-8")
    return eeg_path, mri_path

def _read_features_or_dummy(path: Path, key="features", n_dummy=32) -> np.ndarray:
    try:
        obj = json.loads(path.read_text(encoding="utf-8"))
        feats = obj.get(key)
        if isinstance(feats, list) and feats:
            return np.array(feats, dtype=float)
    except Exception:
        pass
    return np.zeros(n_dummy, dtype=float)

def _build_dataset():
    eeg_path, mri_path = _load_or_prepare_preprocessed()
    eeg = _read_features_or_dummy(eeg_path)
    mri = _read_features_or_dummy(mri_path)
    L = max(len(eeg), len(mri))
    if len(eeg) < L: eeg = np.pad(eeg, (0, L - len(eeg)))
    if len(mri) < L: mri = np.pad(mri, (0, L - len(mri)))
    x = np.concatenate([eeg, mri], axis=0).astype(float)  # (2L,)

    rng = np.random.default_rng(42)
    N = 200
    X = (x[None, :] + 0.01 * rng.standard_normal((N, x.shape[0]))).astype(float)

    left = X[:, : min(32, X.shape[1])].mean(axis=1)
    right = X[:, -min(32, X.shape[1]):].mean(axis=1)
    proj = left - right + 1e-6 * rng.standard_normal(X.shape[0])
    y = (proj > np.median(proj)).astype(int)
    if np.unique(y).size < 2:
        y[: N//2] = 0; y[N//2:] = 1; rng.shuffle(y)
    return X, y

# ===== classical vs quantum training =====

def _train_classical(X, y, run_path: Path):
    model = Pipeline([("scaler", StandardScaler()), ("clf", LogisticRegression(max_iter=1000))])
    Xtr, Xte, ytr, yte = train_test_split(X, y, test_size=0.25, random_state=42, stratify=y)
    model.fit(Xtr, ytr)
    ypred = model.predict(Xte)
    acc = float(accuracy_score(yte, ypred))
    try:
        yprob = model.predict_proba(Xte)[:, 1]
        auc = float(roc_auc_score(yte, yprob)) if np.unique(yte).size > 1 else float("nan")
    except Exception:
        auc = float("nan")
    return {"accuracy": acc, "auc": auc}

def _train_quantum(X, y, run_path: Path):
    try:
        import torch
        from torch.utils.data import TensorDataset, DataLoader
        from quantum_ai_optimizer.models.vqc import VQCClassifier
    except Exception as e:
        save_text_log(run_path, f"[Hybrid] VQC import failed, falling back to classical: {e}")
        return _train_classical(X, y, run_path)

    scaler = StandardScaler()
    X = scaler.fit_transform(X)
    Xtr, Xte, ytr, yte = train_test_split(X, y, test_size=0.25, random_state=42, stratify=y)

    Xtr_t = torch.tensor(Xtr, dtype=torch.float32)
    ytr_t = torch.tensor(ytr.reshape(-1, 1), dtype=torch.float32)
    Xte_t = torch.tensor(Xte, dtype=torch.float32)
    yte_t = torch.tensor(yte.reshape(-1, 1), dtype=torch.float32)

    model = VQCClassifier(input_dim=Xtr_t.shape[1], n_layers=2)
    opt = torch.optim.Adam(model.parameters(), lr=1e-2)
    loss_fn = torch.nn.BCEWithLogitsLoss()

    ds = TensorDataset(Xtr_t, ytr_t)
    dl = DataLoader(ds, batch_size=16, shuffle=True)

    model.train()
    for epoch in range(6):  # small demo
        total = 0.0
        for xb, yb in dl:
            opt.zero_grad(set_to_none=True)
            logits = model(xb)
            loss = loss_fn(logits, yb)
            loss.backward()
            opt.step()
            total += float(loss.item()) * xb.size(0)
        save_text_log(run_path, f"[Hybrid][VQC] epoch {epoch+1}, loss={total/len(ds):.4f}")

    model.eval()
    with torch.no_grad():
        logits = model(Xte_t)
        yprob = torch.sigmoid(logits).squeeze(1).cpu().numpy()
    ypred = (yprob >= 0.5).astype(int)

    acc = float(accuracy_score(yte, ypred))
    try:
        auc = float(roc_auc_score(yte, yprob)) if np.unique(yte).size > 1 else float("nan")
    except Exception:
        auc = float("nan")
    return {"accuracy": acc, "auc": auc}

# ===== public entry =====

def hybrid_run(use_quantum: bool = True):
    run_dir = create_run_folder("hybrid")
    save_text_log(run_dir, "[Hybrid] Starting...")
    X, y = _build_dataset()
    save_text_log(run_dir, f"[Hybrid] Dataset X={X.shape}, classes={np.unique(y)}")

    metrics = _train_quantum(X, y, run_dir) if use_quantum else _train_classical(X, y, run_dir)

    out_dir = Path("results/hybrid"); out_dir.mkdir(parents=True, exist_ok=True)
    (out_dir / "metrics.json").write_text(json.dumps(metrics, indent=2), encoding="utf-8")
    save_metrics(run_dir, "hybrid", metrics)
    save_text_log(run_dir, f"[Hybrid] Metrics: {metrics}")
    save_text_log(run_dir, "[Hybrid] Done.")
    return metrics

# backward compat alias
train_hybrid = hybrid_run
