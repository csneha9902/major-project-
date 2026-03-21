# backend/quantum_ai_optimizer/datasets/mri_loader.py
import numpy as np
import nibabel as nib
from pathlib import Path

def load_sample_mri():
    # Try to load local cached, else download, else create synthetic
    data_dir = Path("data"); data_dir.mkdir(parents=True, exist_ok=True)
    nii_path = data_dir / "sample_T1.nii.gz"
    if nii_path.exists():
        return nib.load(str(nii_path))
    try:
        # TODO: replace with a real tiny public NIfTI URL you trust
        # If this fails, fall back to synthetic:
        raise RuntimeError("Skip remote fetch in demo")  # force synthetic in demo
    except Exception:
        # synthetic 3D volume (32x32x32)
        arr = np.random.randn(32, 32, 32).astype(np.float32)
        img = nib.Nifti1Image(arr, affine=np.eye(4, dtype=np.float32))
        nib.save(img, str(nii_path))
        return img

def preprocess_mri(img):
    arr = img.get_fdata()
    arr = (arr - arr.mean()) / (arr.std() + 1e-8)
    # downsample/flatten small subset for demo
    patch = arr[::4, ::4, ::4].ravel()[:128]
    return patch.tolist()
