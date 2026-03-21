from setuptools import setup, find_packages

setup(
    name="quantum_ai_optimizer",
    version="0.3.0",
    packages=find_packages(),
    include_package_data=True,
    install_requires=[
        "click",
        "fastapi",
        "uvicorn",
        "numpy",
        "pandas",
        "scikit-learn",
        "torch",
        "pennylane",
        "dwave-ocean-sdk",
    ],
    entry_points={
        "console_scripts": [
            "quantum-ai=quantum_ai_optimizer.cli:cli",
        ],
    },
)
