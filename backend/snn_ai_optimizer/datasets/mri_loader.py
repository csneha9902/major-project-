# backend/snn_ai_optimizer/datasets/mri_loader.py
import numpy as np
from pathlib import Path

try:
    import nibabel as nib
    HAS_NIBABEL = True
except ImportError:
    nib = None
    HAS_NIBABEL = False

def load_sample_mri():
    data_dir = Path("data"); data_dir.mkdir(parents=True, exist_ok=True)
    nii_path = data_dir / "sample_T1.nii.gz"

    if HAS_NIBABEL:
        if nii_path.exists():
            try:
                return nib.load(str(nii_path))
            except Exception:
                pass
        try:
            arr = np.random.randn(32, 32, 32).astype(np.float32)
            img = nib.Nifti1Image(arr, affine=np.eye(4, dtype=np.float32))
            nib.save(img, str(nii_path))
            return img
        except Exception:
            pass

    # Fallback when nibabel is not installed or fails
    arr = np.random.randn(32, 32, 32).astype(np.float32)
    return {"array": arr, "has_nibabel": False}

def preprocess_mri(img):
    if HAS_NIBABEL and hasattr(img, "get_fdata"):
        try:
            arr = img.get_fdata()
            arr = (arr - arr.mean()) / (arr.std() + 1e-8)
            patch = arr[::4, ::4, ::4].ravel()[:128]
            return patch.tolist()
        except Exception:
            pass

    if isinstance(img, dict):
        arr = img.get("array", np.random.randn(32, 32, 32).astype(np.float32))
    elif hasattr(img, "get_fdata"):
        arr = img.get_fdata()
    else:
        arr = np.random.randn(32, 32, 32).astype(np.float32)

    arr = (arr - arr.mean()) / (arr.std() + 1e-8)
    patch = arr[::4, ::4, ::4].ravel()[:128]
    return patch.tolist()

