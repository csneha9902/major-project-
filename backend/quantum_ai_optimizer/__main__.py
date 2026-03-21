# backend/quantum_ai_optimizer/__main__.py
from .app import app

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)