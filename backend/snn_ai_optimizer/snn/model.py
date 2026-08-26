import torch
import torch.nn as nn
from spikingjelly.activation_based import neuron, functional, surrogate, layer

class SNNHealthModel(nn.Module):
    def __init__(self, input_size, hidden_size, output_size, time_steps=100):
        super().__init__()
        self.time_steps = time_steps
        
        # Define the spiking neural network layers
        self.layer1 = nn.Sequential(
            nn.Linear(input_size, hidden_size),
            neuron.LIFNode(surrogate_function=surrogate.ATan())
        )
        
        self.layer2 = nn.Sequential(
            nn.Linear(hidden_size, hidden_size),
            neuron.LIFNode(surrogate_function=surrogate.ATan())
        )
        
        self.output_layer = nn.Sequential(
            nn.Linear(hidden_size, output_size),
            neuron.LIFNode(surrogate_function=surrogate.ATan())
        )

    def forward(self, x):
        # x shape: [time_steps, batch_size, input_size]
        
        functional.reset_net(self)
        
        output_spikes = []
        
        # Simulation over time steps
        T = x.shape[0]
        
        for t in range(T):
            current_input = x[t] 
            
            x1 = self.layer1(current_input)
            x2 = self.layer2(x1)
            out = self.output_layer(x2)
            
            output_spikes.append(out)
            
        # Stack outputs along time dimension
        return torch.stack(output_spikes, dim=0)

def create_model(input_channels=32, hidden_dim=128, num_classes=2):
    return SNNHealthModel(input_channels, hidden_dim, num_classes)
