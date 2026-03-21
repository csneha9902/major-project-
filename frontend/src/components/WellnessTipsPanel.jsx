import { Sun, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function WellnessTipsPanel({ currentState }) {
  const [tip, setTip] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchTip = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/wellness-tip?state=${encodeURIComponent(currentState || 'Neutral')}`);
      const data = await res.json();
      setTip(data?.tip || '');
    } catch (err) {
      console.error('Failed to fetch tip:', err);
    }
    setLoading(false);
  };

  useEffect(() => { fetchTip(); }, [currentState]);

  return (
    <div className="wellness-panel">
      <div className="panel-header">
        <Sun className="icon-sun" />
        <h3>Wellness & Learning Tips</h3>
      </div>
      <div className="tip-content">
        <p>{loading ? 'Loading...' : tip}</p>
      </div>
      <button className="btn-get-tip" onClick={fetchTip} disabled={loading}>
        <Sparkles className="icon-sparkle" />
        Get Dynamic Tip
      </button>
    </div>
  );
}


