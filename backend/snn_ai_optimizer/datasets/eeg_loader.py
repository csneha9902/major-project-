# backend/snn_ai_optimizer/datasets/eeg_loader.py
import mne, numpy as np
from pathlib import Path

def load_sample_eeg():
    # Try MNE PhysioNet; on failure, return synthetic RawArray
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
        raw = mne.io.RawArray(data, info)
        return raw

def preprocess_eeg(raw):
    raw.filter(0.5, 40.0, verbose=False)
    raw.resample(100, verbose=False)
    # simple summary features
    data = raw.get_data()
    feats = data.mean(axis=1).tolist() + data.std(axis=1).tolist()
    return feats
