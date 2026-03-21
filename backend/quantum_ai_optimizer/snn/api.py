from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
import torch
import os
from typing import List

from quantum_ai_optimizer.snn.model import SNNHealthModel
from quantum_ai_optimizer.snn.train import train_snn

router = APIRouter(prefix="/api/snn", tags=["snn"])

MODEL_PATH = "snn_cognitive_health.pth"

class PredictRequest(BaseModel):
    # Expecting a list of time-series data for channels
    # Shape: [Time, Channels] or [Channels] (static)
    data: List[List[float]] 

class TrainResponse(BaseModel):
    message: str
    status: str

@router.post("/train", response_model=TrainResponse)
async def train_model(background_tasks: BackgroundTasks):
    """Triggers SNN model training in the background."""
    background_tasks.add_task(train_snn, save_path=MODEL_PATH)
    return {"message": "SNN training started in background.", "status": "started"}

@router.get("/status")
async def model_status():
    """Checks if the SNN model is trained and available."""
    if os.path.exists(MODEL_PATH):
        return {"status": "ready", "model_path": MODEL_PATH}
    return {"status": "not_trained"}

@router.post("/predict")
async def predict_cognitive_state(request: PredictRequest):
    """Predicts stress vs relaxed state using the SNN."""
    if not os.path.exists(MODEL_PATH):
        raise HTTPException(status_code=400, detail="Model is not trained yet. Call /api/snn/train first.")
    
    try:
        # Load Model
        # TODO: Load model once at startup or singleton
        model = SNNHealthModel(input_size=32, hidden_size=64, output_size=2)
        model.load_state_dict(torch.load(MODEL_PATH, map_location=torch.device('cpu')))
        model.eval()
        
        # Prepare Data
        # Expect input [Time, Channels] from JSON
        input_data = torch.tensor(request.data, dtype=torch.float32)
        
        # Check dims
        if input_data.dim() == 2:
            # [Time, Channels] -> Add batch dim -> [Time, 1, Channels]
            input_data = input_data.unsqueeze(1)
        elif input_data.dim() == 1:
             # [Channels] -> Treat as 1 timestep -> [1, 1, Channels]
             input_data = input_data.unsqueeze(0).unsqueeze(0)
             
        # Normalize/Preprocess if needed (assuming input is already somewhat processed or raw matched to training)
        
        with torch.no_grad():
            output = model(input_data) # [Time, Batch, Output]
            mean_out = output.mean(dim=0) # [Batch, Output]
            probabilities = torch.softmax(mean_out, dim=1)
            prediction = torch.argmax(mean_out, dim=1).item()
            
        classes = ["Relaxed", "Stressed"]
        result = classes[prediction]
        confidence = probabilities[0][prediction].item()
        
        return {
            "prediction": result,
            "confidence": confidence,
            "probabilities": {
                "Relaxed": probabilities[0][0].item(),
                "Stressed": probabilities[0][1].item()
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
