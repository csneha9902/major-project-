# SNN-AI Cognitive Health & Learning Optimizer

A full-stack prototype that ingests EEG/HRV data in real-time, infers cognitive state (Focused/Neutral/Stressed), and recommends the next learning task using a quantum-inspired optimizer and **event-driven SNNs**.

---

## What it does
- Streams frames every ~1–2s with: timestamp, EEG alpha/beta, HRV LF/HF, inferred cognitive state, and a recommendation (task + difficulty).
- Recommends tasks via a QUBO-based optimizer (D-Wave Ocean SDK if available; heuristic fallback otherwise).
- Uses **Event-Driven Spiking Neural Networks (SNN)** for biologically plausible stress detection.
- Web dashboard shows live charts, state, recommendation, and metrics.

### 🧠 Event-Driven Spiking Neural Network (SNN) Module
This project now includes an **Event-Driven Spiking Neural Network** for continuous cognitive health assessment.

**Features:**
- **Spike-Based Processing:** Utilizes `SpikingJelly` for biologically plausible neural processing.
- **DEAP Dataset Compatible:** Preprocessing pipeline designed for EEG signals.
- **Real-Time Stress Detection:** Integrated into the streaming engine for live assessment.

**Setup & Usage:**
1.  **Install Requirements:** `pip install -r backend/requirements.txt`
2.  **Train Model:**
    Run the training script to generate the initial SNN model:
    ```bash
    python backend/quantum_ai_optimizer/snn/train.py
    ```
    This will save `snn_cognitive_health.pth`.
3.  **Run Backend:**
    The backend will automatically load the SNN model if present.
    ```bash
    cd backend
    uvicorn quantum_ai_optimizer.app:app --reload
    ```
4.  **API Endpoints:**
    - `POST /api/snn/train`: Trigger background training.
    - `POST /api/snn/predict`: Make predictions on EEG data.
    - `GET /api/snn/status`: Check model status.

---

## Project structure
```
backend/
  quantum_ai_optimizer/
    app.py               # FastAPI app & APIs
    streaming.py         # DataStreamer (simulator or web feed)
    cognitive.py         # Rule-based cognitive state engine
    optimizer.py         # QUBO task optimizer (Ocean SDK if present)
    models/vqc.py        # Variational Quantum Classifier (PennyLane)
    pipeline/            # preprocess, baseline, hybrid
    datasets/            # EEG/MRI loaders
    utils/logger.py      # metrics/log history helpers
frontend/
  src/ (React + Vite + Tailwind + Recharts)
docker-compose.yml
```

---

## Run with Docker (recommended)

1) From project root:
```powershell
cd "C:\Users\thanm\OneDrive\Desktop\Stuff\Quantum AI Project\quantum-ai-optimizer\quantum-ai-optimizer"
```

2) (Optional) Enable web ingestion (backend polls an HTTP feed). To use the built-in mock feed, create `docker-compose.override.yml`:

PowerShell:
```powershell
@'
services:
  backend:
    environment:
      - EEG_SOURCE_URL=http://localhost:8000/mock/eeg
      - EEG_SOURCE_TIMEOUT=3.0
'@ | Out-File -Encoding UTF8 docker-compose.override.yml
```

3) Build and run:
```powershell
docker compose build --no-cache
docker compose up
```

Open:
- Frontend: http://localhost:5173
- Backend:  http://localhost:8000

Sanity checks:
```powershell
curl http://localhost:8000/
curl "http://localhost:8000/mock/eeg?mode=Focused"  # if web ingestion enabled
```

Stop:
```powershell
docker compose down
```

---

## Run locally (no Docker)

Backend (FastAPI):
```powershell
cd backend
python -m venv venv
./venv/Scripts/Activate.ps1
pip install -r requirements.txt
pip install -e .
uvicorn quantum_ai_optimizer.app:app --host 0.0.0.0 --port 8000
```

Frontend (React + Vite):
```powershell
cd frontend
npm install
npm run dev
# If backend differs:
# $env:VITE_API_URL="http://localhost:8000"; npm run dev
```

---

## Dashboard usage
- Open http://localhost:5173
- Top-right controls:
  - Start/Stop: begins/pauses the live stream (chart pauses on Stop)
  - Simulation Mode: Focused / Neutral / Stressed (affects alpha/beta and LF/HF)
- Cards show current cognitive state and recommended task.
- Live chart plots alpha, beta, LF/HF in real time.
- Bottom chart shows baseline vs hybrid metrics if pipeline has been run.

---

## Backend APIs
- Health: `GET /`
- Live data:
  - WebSocket: `WS /api/data`
  - Snapshot:  `GET /api/snapshot`
- Simulation control:
  - `GET/POST /api/sim/mode` with `{ "mode": "Focused|Neutral|Stressed" }`
  - `POST /api/sim/start`, `POST /api/sim/stop`
  - Status: `GET /api/sim/status` (includes ingestion info)
- Mock web feed (for testing web ingestion): `GET /mock/eeg?mode=...`
- Pipelines:
  - Run: `POST /run/pipeline` (preprocess → baseline → hybrid)
  - Latest metrics: `GET /results/metrics`
  - History: `GET /results/history`
  - Artifacts (static): `/files/*` (e.g., `/files/latest_metrics.json`)
- Feedback from metrics: `GET /feedback`

Frame schema (streamed):
```json
{
  "timestamp": 1678886400,
  "eeg": { "alpha": 0.6, "beta": 0.3 },
  "hrv": { "lf_hf_ratio": 0.8 },
  "cognitive_state": "Focused",
  "recommendation": { "task": "Review Chapter 3", "difficulty": 3 },
  "ingestion": { "active_source": "external|internal", ... }
}
```

---

## Training pipeline
Run end-to-end (via API):
```powershell
curl -X POST http://localhost:8000/run/pipeline
```

What happens:
1. Preprocess: loads EEG/MRI (falls back to synthetic), writes features under `results/preprocess/`.
2. Baseline: trains a classical model, writes `results/baseline/metrics.json`.
3. Hybrid: attempts VQC (PennyLane + Torch) or falls back to classical; writes `results/hybrid/metrics.json`.
4. All steps update `results/latest_metrics.json` and append to `results/history/metrics_log.json`.

View artifacts:
```
http://localhost:8000/files/latest_metrics.json
http://localhost:8000/files/baseline/metrics.json
http://localhost:8000/files/hybrid/metrics.json
http://localhost:8000/files/history/metrics_log.json
```

---

## Web ingestion (real-time from HTTP)
- Set `EEG_SOURCE_URL` for the backend (Docker override or environment):
  - Examples: `http://localhost:8000/mock/eeg`, `http://feed.example/eeg?mode=Focused`
  - `{mode}` templating supported (will be replaced with current mode)
- Backend adds `ingestion` status in frames and via `GET /api/sim/status`.

---

## Troubleshooting
- WebSocket not connecting:
  - Check backend at http://localhost:8000
  - Ensure ports 8000 (backend) and 5173 (frontend) are free
- Nothing updates on Stop/Start:
  - The chart buffer freezes when stopped; click Start to resume appending
- Ocean SDK not installed:
  - Task recommendation falls back to heuristic; install `dwave-ocean-sdk` to enable QUBO solver
- PennyLane/Torch missing:
  - Hybrid training falls back to classical; install requirements to use VQC

---

## License
MIT (or your chosen license)
