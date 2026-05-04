import { Sun, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';
import GlowButton from './ui/GlowButton';

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
        <Sun className="icon-sun" size={22} />
        <h3>Wellness & Learning Tips</h3>
      </div>
      <div className="tip-content">
        <p className={loading ? 'text-[var(--text-muted)] italic' : ''}>
          {loading ? 'Loading...' : tip}
        </p>
      </div>
      <GlowButton variant="blue" onClick={fetchTip} disabled={loading}>
        <Sparkles size={16} />
        Get Dynamic Tip
      </GlowButton>
    </div>
  );
}
