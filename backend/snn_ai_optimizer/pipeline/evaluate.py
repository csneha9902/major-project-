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
        with open('results/snn/metrics.json') as f:
            res['snn'] = json.load(f)
    except Exception:
        res['snn'] = None
    with open('results/metrics.json','w') as f:
        json.dump(res, f)
    print('Evaluate written')
