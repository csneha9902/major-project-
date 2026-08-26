import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, TensorDataset
import matplotlib.pyplot as plt
import numpy as np

from snn_ai_optimizer.snn.model import SNNHealthModel
from snn_ai_optimizer.snn.preprocessing import load_mock_data, EEGPreprocessor

def train_snn(save_path="snn_cognitive_health.pth"):
    print(f"Loading data... Saving to {save_path}")
    # Load raw data (mock)
    raw_data, labels = load_mock_data()
    # raw_data: (40, 32, 8064)
    
    # Preprocess
    preprocessor = EEGPreprocessor()
    # For SNN, we might want raw time-series per channel, potentially downsampled
    # Let's say we use 32 input channels over time.
    # We need to reshape: (Trials, Time, Channels) -> (Time, Trials, Channels)
    
    # Simple preprocessing: Normalize
    data = raw_data.transpose(2, 0, 1) # (Time, Trials, Channels)
    # Downsample for speed in this mock setting
    # Take every 8th sample -> 128Hz becomes 16Hz effective for SNN simulation if complex
    data = data[::8, :, :]
    
    # Convert to Tensor
    data_tensor = torch.FloatTensor(data) # [T, N, C]
    
    # Labels: Binary classification (Stress vs Relaxed)
    # Assume labels[:, 0] is valence. >5 is positive (Relaxed?), <=5 is negative (Stress?)
    # Let's simplify: Valence > 5 = 1 (Positive), else 0
    binary_labels = (labels[:, 0] > 5).astype(int)
    labels_tensor = torch.LongTensor(binary_labels)
    
    # Create Dataset
    # Ideally use DataLoader, but for SNN time-step iteration, it's easier to verify with full batch first
    # Or batch over Trials dimension
    # TensorDataset expects (N, ...)
    # data_tensor is (T, N, C). Let's permute back for DataLoader: (N, T, C)
    dataset = TensorDataset(data_tensor.permute(1, 0, 2), labels_tensor)
    dataloader = DataLoader(dataset, batch_size=8, shuffle=True)
    
    # Model
    # Input size = 32 channels
    model = SNNHealthModel(input_size=32, hidden_size=64, output_size=2)
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model.to(device)
    
    optimizer = optim.Adam(model.parameters(), lr=1e-3)
    criterion = nn.CrossEntropyLoss()
    
    epochs = 10
    
    print("Starting training...")
    for epoch in range(epochs):
        model.train()
        total_loss = 0
        correct = 0
        total = 0
        
        for batch_idx, (data, target) in enumerate(dataloader):
            data, target = data.to(device), target.to(device)
            # data: (B, T, C) -> transform to (T, B, C) for model
            data = data.permute(1, 0, 2)
            
            optimizer.zero_grad()
            
            # Forward pass
            outputs = model(data) # [T, B, Output]
            
            # Mean firing rate over time as prediction
            mean_output = outputs.mean(dim=0) # [B, Output]
            
            loss = criterion(mean_output, target)
            loss.backward()
            optimizer.step()
            
            total_loss += loss.item()
            pred = mean_output.argmax(dim=1)
            correct += (pred == target).sum().item()
            total += target.size(0)
            
        print(f"Epoch {epoch+1}/{epochs}, Loss: {total_loss/len(dataloader):.4f}, Accuracy: {100*correct/total:.2f}%")
        
    # Save Model
    torch.save(model.state_dict(), save_path)
    print(f"Model saved to {save_path}")

if __name__ == "__main__":
    train_snn()
