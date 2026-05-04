import os
import sys

sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from snn_ai_optimizer.streaming import DataStreamer

def run_test():
    streamer = DataStreamer()
    streamer.set_mode("Neutral")
    streamer.start_simulation()
    
    print("\n[Test] Fetching 5 frames to observe SNN inference...")
    gen = streamer.stream(interval_sec=0)
    for i in range(5):
        frame = next(gen)
        print(f"  Frame {i}: State={frame['cognitive_state']}, Task={frame['recommendation']['task']}")
        
    print("[Test] Done fetching frames.")

if __name__ == "__main__":
    run_test()
