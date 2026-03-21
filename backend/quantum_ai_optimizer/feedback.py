from __future__ import annotations
from pathlib import Path
import json

def _read_json(p: Path):
    try:
        return json.loads(p.read_text(encoding="utf-8"))
    except Exception:
        return None

def generate_feedback() -> dict:
    latest = _read_json(Path("results/latest_metrics.json")) or {}
    base = latest.get("baseline") or {}
    hybr = latest.get("hybrid") or {}
    eeg  = latest.get("preprocess_eeg") or {}
    mri  = latest.get("preprocess_mri") or {}

    tips = []
    actions = []

    # Model quality heuristics
    acc = max(base.get("accuracy", 0), hybr.get("accuracy", 0))
    auc = max(base.get("auc", 0), hybr.get("auc", 0))

    if acc < 0.6:
        tips.append("Accuracy is low; consider collecting more samples or stronger features (e.g., EEG band-power, MRI ROIs).")
        actions.append("Enable feature engineering: delta/theta/alpha/beta powers; z-score per subject.")
    else:
        tips.append("Accuracy is reasonable—try tuning hyperparameters and adding cross-validation.")

    if not isinstance(auc, float) or auc != auc:  # NaN check
        tips.append("AUC is undefined (single-class split). Use stratified train/test and larger sample size.")
        actions.append("Ensure stratified split; increase N to avoid degenerate folds.")
    elif auc < 0.65:
        tips.append("AUC is modest—try the quantum VQC head with 3–4 layers or a quantum kernel SVM.")
        actions.append("Try 'use_quantum=True' and increase n_layers to 3.")

    # Data readiness
    if eeg.get("ok") is False:
        tips.append("EEG preprocessing failed—using synthetic data. Check PhysioNet download/cache path.")
        actions.append("Mount ./mne_data volume; verify network egress for container.")
    if mri.get("ok") is False:
        tips.append("MRI sample download failed—using synthetic NIfTI. Provide a local small NIfTI for realism.")
        actions.append("Drop 'sample_T1.nii.gz' in backend/data and restart.")

    # Wellness / study pacing (simple placeholders)
    tips.append("Use 25–40 min focus blocks with 5–7 min breaks; hydrate and stretch between sessions.")
    tips.append("Schedule hardest topics at the time of day you typically have higher alertness.")

    return {"summary": {"accuracy": acc, "auc": auc},
            "tips": tips,
            "actions": actions}
