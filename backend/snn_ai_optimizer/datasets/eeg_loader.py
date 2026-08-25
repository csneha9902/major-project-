# backend/snn_ai_optimizer/datasets/eeg_loader.py
import numpy as np
from pathlib import Path

try:
    import mne
    HAS_MNE = True
except ImportError:
    mne = None
    HAS_MNE = False

def load_sample_eeg():
    # Try MNE PhysioNet; on failure, return synthetic raw object or fallback dict
    if HAS_MNE:
        try:
            mne.set_config("MNE_DATA", "/root/mne_data", set_env=True)
            mne.datasets.sleep_physionet.age.fetch_data(subjects=[0], recording=[0])
            local_path = (
                Path(mne.datasets.sleep_physionet.age.data_path())
                / "sleep-cassette" / "SC4001E0-PSG.edf"
            )
            return mne.io.read_raw_edf(str(local_path), preload=True)
        except Exception:
            sfreq = 100.0
            n_channels, n_times = 2, 20_000
            data = np.random.randn(n_channels, n_times) * 1e-6
            info = mne.create_info(ch_names=["EEG1", "EEG2"], sfreq=sfreq, ch_types="eeg")
            return mne.io.RawArray(data, info)

    # Fallback when MNE is not installed
    n_channels, n_times = 2, 20_000
    data = np.random.randn(n_channels, n_times) * 1e-6
    return {"data": data, "has_mne": False}

def preprocess_eeg(raw):
    if HAS_MNE and hasattr(raw, "filter") and hasattr(raw, "get_data"):
        try:
            raw.filter(0.5, 40.0, verbose=False)
            raw.resample(100, verbose=False)
            data = raw.get_data()
            return data.mean(axis=1).tolist() + data.std(axis=1).tolist()
        except Exception:
            pass

    if isinstance(raw, dict):
        data = raw.get("data", np.random.randn(2, 20000) * 1e-6)
    elif hasattr(raw, "get_data"):
        data = raw.get_data()
    else:
        data = np.random.randn(2, 20000) * 1e-6

    return data.mean(axis=1).tolist() + data.std(axis=1).tolist()

