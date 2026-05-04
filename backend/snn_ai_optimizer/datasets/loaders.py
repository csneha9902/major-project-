import os
def load_physionet_eeg(path):
    # placeholder: integrate mne or read-edf
    if not os.path.exists(path):
        raise FileNotFoundError(path)
    return {'path': path}

def load_adni_mri(path):
    if not os.path.exists(path):
        raise FileNotFoundError(path)
    return {'path': path}

def load_oasis_mri(path):
    if not os.path.exists(path):
        raise FileNotFoundError(path)
    return {'path': path}

def load_ednet(path):
    if not os.path.exists(path):
        raise FileNotFoundError(path)
    return {'path': path}
