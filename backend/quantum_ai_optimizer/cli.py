# backend/quantum_ai_optimizer/cli.py
import click
from quantum_ai_optimizer.pipeline.preprocess import preprocess_run
from quantum_ai_optimizer.pipeline.baseline import baseline_run
from quantum_ai_optimizer.pipeline.hybrid import hybrid_run

@click.group()
def cli():
    """Quantum-AI Optimizer CLI"""
    pass

@cli.command("serve")
def serve_cmd():
    """Start FastAPI backend"""
    import uvicorn
    uvicorn.run("quantum_ai_optimizer.app:app", host="127.0.0.1", port=8000, reload=False)

@cli.command("run-pipeline")
def run_pipeline_cmd():
    """Run full pipeline: preprocess → baseline → hybrid (no WebSocket dependency)"""
    print("[CLI] Starting pipeline...")
    preprocess_run()
    print("[CLI] Preprocessing done")
    baseline_run()
    print("[CLI] Baseline training done")
    hybrid_run()
    print("[CLI] Hybrid training done")
    print("[CLI] ✅ Pipeline complete")
