# backend/snn_ai_optimizer/pipeline/preprocess.py

from pathlib import Path
import json

from snn_ai_optimizer.utils.logger import (
    create_run_folder,
    save_metrics,
    save_text_log,
)

# EEG / MRI loaders
from snn_ai_optimizer.datasets.eeg_loader import (
    load_sample_eeg,  # alias for PhysioNet auto-fetch
    preprocess_eeg,
)
from snn_ai_optimizer.datasets.mri_loader import (
    load_sample_mri,  # tiny public NIfTI auto-fetch
    preprocess_mri,
)


def main():
    """Simple entry: run full preprocess and mark status."""
    print("[Preprocess] Starting preprocessing...")
    run_path = create_run_folder("preprocess", overwrite=True)

    steps = [
        "Loading EEG",
        "Filtering/Feature extraction (EEG)",
        "Loading MRI",
        "Normalization/Feature extraction (MRI)",
        "Write outputs",
    ]
    for s in steps:
        print(f"[Preprocess] {s}")
        save_text_log(run_path, f"[Preprocess] {s}")

    # Run the real pipeline
    preprocess_run(run_path=run_path)

    # Overall status metric
    save_metrics(run_path, "preprocess", {"status": "completed", "steps": steps})
    print("[Preprocess] Finished preprocessing.")


def preprocess_run(run_path=None):
    """
    Create demo EEG/MRI features and save them under results/preprocess/.
    Always writes both JSON files; falls back to dummy data on failure.
    """
    if run_path is None:
        run_path = create_run_folder("preprocess")
    out_dir = Path("results/preprocess")
    out_dir.mkdir(parents=True, exist_ok=True)

    # ---------------- EEG ----------------
    eeg_ok = False
    try:
        raw = load_sample_eeg()                 # may download via MNE on first run
        eeg_feats = preprocess_eeg(raw)         # list[float]
        (out_dir / "eeg_features.json").write_text(
            json.dumps({"features": eeg_feats}, indent=2),
            encoding="utf-8",
        )
        save_text_log(run_path, f"[Preprocess] EEG features saved ({len(eeg_feats)} dims)")
        save_metrics(run_path, "preprocess_eeg", {"dims": len(eeg_feats), "ok": True})
        eeg_ok = True
    except Exception as e:
        # Fallback: write dummy EEG so file always exists
        dummy = {"features": [0.0, 0.0, 0.0]}
        (out_dir / "eeg_features.json").write_text(json.dumps(dummy, indent=2), encoding="utf-8")
        save_text_log(run_path, f"[Preprocess] EEG failed: {e} (wrote dummy)")
        save_metrics(run_path, "preprocess_eeg", {"ok": False, "error": str(e)})

    # ---------------- MRI ----------------
    mri_ok = False
    try:
        img = load_sample_mri()                 # downloads tiny NIfTI if missing
        mri_feats = preprocess_mri(img)         # list[float]
        (out_dir / "mri_features.json").write_text(
            json.dumps({"features": mri_feats}, indent=2),
            encoding="utf-8",
        )
        save_text_log(run_path, f"[Preprocess] MRI features saved ({len(mri_feats)} dims)")
        save_metrics(run_path, "preprocess_mri", {"dims": len(mri_feats), "ok": True})
        mri_ok = True
    except Exception as e:
        # Fallback: write dummy MRI so file always exists
        dummy = {"features": [0.0, 0.0, 0.0]}
        (out_dir / "mri_features.json").write_text(json.dumps(dummy, indent=2), encoding="utf-8")
        save_text_log(run_path, f"[Preprocess] MRI failed: {e} (wrote dummy)")
        save_metrics(run_path, "preprocess_mri", {"ok": False, "error": str(e)})

    # Final status log
    save_text_log(
        run_path,
        f"[Preprocess] Done. EEG ok={eeg_ok}, MRI ok={mri_ok}. Artifacts at {out_dir}",
    )


if __name__ == "__main__":
    main()
