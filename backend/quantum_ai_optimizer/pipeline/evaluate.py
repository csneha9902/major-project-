import os, json
def evaluate_run():
    os.makedirs('results', exist_ok=True)
    res = {}
    try:
        with open('results/classical_scores.json') as f:
            res['classical'] = json.load(f)
    except Exception:
        res['classical'] = None
    try:
        with open('results/quantum_metrics.json') as f:
            res['quantum'] = json.load(f)
    except Exception:
        res['quantum'] = None
    with open('results/metrics.json','w') as f:
        json.dump(res, f)
    print('Evaluate written')
