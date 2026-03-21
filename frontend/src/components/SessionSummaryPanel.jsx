import { Brain, BarChart } from 'lucide-react';
import { useState } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function SessionSummaryPanel({ isRunning }) {
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [error, setError] = useState('');

  const fetchSummary = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/api/session-summary`);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      const data = await res.json();
      if (data?.summary) {
        setSummary(data.summary);
        setExpanded(true);
      } else {
        setError('No summary data available. Start the simulation and let it run for a few seconds.');
      }
    } catch (err) {
      console.error('Failed to fetch summary:', err);
      setError(err.message || 'Failed to fetch session summary. Make sure the simulation has been running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="summary-panel">
      <div className="panel-header">
        <Brain className="icon-brain" />
        <h3>Cognitive Session Summary</h3>
      </div>
      {expanded && summary ? (
        <div className="summary-content">
          <p>{summary}</p>
          <button 
            className="btn-refresh-summary" 
            onClick={() => { setExpanded(false); setSummary(''); fetchSummary(); }}
            disabled={loading}
          >
            Refresh Summary
          </button>
        </div>
      ) : (
        <div className="summary-actions">
          {error && (
            <div className="summary-error">
              <p>{error}</p>
            </div>
          )}
          {!isRunning && !error && (
            <p className="summary-hint">Start the simulation to generate a session summary.</p>
          )}
          <button 
            className="btn-get-summary" 
            onClick={fetchSummary} 
            disabled={loading || !isRunning}
          >
            <BarChart className="icon-chart" />
            {loading ? 'Loading...' : 'Get Session Summary'}
          </button>
        </div>
      )}
    </div>
  );
}


