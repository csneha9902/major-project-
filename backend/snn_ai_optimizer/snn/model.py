import torch
import torch.nn as nn

try:
    from spikingjelly.activation_based import neuron, functional, surrogate, layer
    HAS_SPIKINGJELLY = True
except ImportError:
    HAS_SPIKINGJELLY = False

class FallbackLIFNode(nn.Module):
    def __init__(self):
        super().__init__()

    def forward(self, x):
        return torch.sigmoid(x)

class SNNHealthModel(nn.Module):
    def __init__(self, input_size, hidden_size, output_size, time_steps=100):
        super().__init__()
        self.time_steps = time_steps
        
        if HAS_SPIKINGJELLY:
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
        else:
            self.layer1 = nn.Sequential(
                nn.Linear(input_size, hidden_size),
                FallbackLIFNode()
            )
            self.layer2 = nn.Sequential(
                nn.Linear(hidden_size, hidden_size),
                FallbackLIFNode()
            )
            self.output_layer = nn.Sequential(
                nn.Linear(hidden_size, output_size),
                FallbackLIFNode()
            )

    def forward(self, x):
        if HAS_SPIKINGJELLY:
            functional.reset_net(self)
        
        output_spikes = []
        T = x.shape[0]
        
        for t in range(T):
            current_input = x[t] 
            x1 = self.layer1(current_input)
            x2 = self.layer2(x1)
            out = self.output_layer(x2)
            output_spikes.append(out)
            
        return torch.stack(output_spikes, dim=0)

def create_model(input_channels=32, hidden_dim=128, num_classes=2):
    return SNNHealthModel(input_channels, hidden_dim, num_classes)

