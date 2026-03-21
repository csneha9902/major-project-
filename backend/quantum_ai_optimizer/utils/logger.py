from __future__ import annotations

import json
import shutil
from pathlib import Path
from datetime import datetime
from typing import Union

# Base paths
RESULTS_DIR = Path("results")
LOGS_DIR = RESULTS_DIR / "logs"
LATEST_PATH = RESULTS_DIR / "latest_metrics.json"

def create_run_folder(name: str = "run") -> Path:
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    p = Path("results/logs") / f"{name}_{ts}"
    p.mkdir(parents=True, exist_ok=True)
    return p

def save_text_log(run_path: Path, text: str):
    logf = run_path / "run.log"
    with open(logf, "a", encoding="utf-8") as f:
        f.write(text + "\n")

def save_metrics(run_path: Path, name: str, metrics: dict):
    # 1) per-step metrics file
    step_dir = Path(f"results/{name}")
    step_dir.mkdir(parents=True, exist_ok=True)
    (step_dir / "metrics.json").write_text(json.dumps(metrics, indent=2), encoding="utf-8")

    # 2) merge into latest
    latest_p = Path("results/latest_metrics.json")
    latest = {}
    if latest_p.exists():
        try: latest = json.loads(latest_p.read_text(encoding="utf-8"))
        except Exception: latest = {}
    latest[name] = metrics
    latest_p.write_text(json.dumps(latest, indent=2), encoding="utf-8")

    # 3) append into history (with timestamp snapshot)
    hist_dir = Path("results/history"); hist_dir.mkdir(parents=True, exist_ok=True)
    hist_p = hist_dir / "metrics_log.json"
    snap = {"ts": datetime.now().strftime("%Y-%m-%d %H:%M:%S"), name: metrics}
    try:
        arr = json.loads(hist_p.read_text(encoding="utf-8"))
        if isinstance(arr, list): arr.append(snap)
        else: arr = [arr, snap]
    except Exception:
        arr = [snap]
    hist_p.write_text(json.dumps(arr, indent=2), encoding="utf-8")


# ---------- Backwards compatibility helpers ----------

def save_log(run_path: Union[Path, str], text: str) -> None:
    """
    Back-compat alias for older code that called save_log().
    If a string is passed instead of a Path, create a quick run folder with that name.
    """
    if isinstance(run_path, (str,)):
        run_path = create_run_folder(str(run_path))
    save_text_log(Path(run_path), text)
