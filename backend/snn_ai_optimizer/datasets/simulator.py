import time, random, math
class Simulator:
    def __init__(self):
        self.t = 0
    def eeg_sample(self, channels=8, length=64):
        out = []
        for ch in range(channels):
            freq = 6 + ch*0.5
            vals = [math.sin(2*math.pi*freq*(self.t + i)/200.0) + 0.1*random.random() for i in range(length)]
            out.append(vals)
        return out
    def learning_event(self):
        return {'student_id': random.randint(1,20), 'problem_id': random.randint(100,999), 'correct': random.choice([0,1]), 'timestamp': time.time()}
    def vitals(self):
        return {'hr': 60 + random.random()*40, 'eda': random.random()*2.0}
    def stream_generator(self, max_iters=1000):
        for i in range(max_iters):
            self.t += 1
            yield {'type':'sample', 'step': i, 'eeg': self.eeg_sample(), 'event': self.learning_event(), 'vitals': self.vitals()}
