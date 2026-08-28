from setuptools import setup, find_packages

setup(
    name="snn_ai_optimizer",
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
        "sqlalchemy",
        "psycopg2-binary",
        "alembic",
        "python-jose[cryptography]",
        "passlib",
        "python-multipart",
    ],
    entry_points={
        "console_scripts": [
            "snn-ai=snn_ai_optimizer.cli:cli",
        ],
    },
)
