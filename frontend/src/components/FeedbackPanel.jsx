import React, { useEffect, useState } from "react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function FeedbackPanel() {
  const [data, setData] = useState(null);

  const load = async () => {
    try {
      const res = await fetch(`${API_BASE}/feedback`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setData(await res.json());
    } catch (e) {
      console.error("feedback fetch failed", e);
    }
  };

  useEffect(() => { load(); }, []);

  if (!data) return (
    <div className="glass-card p-5">
      <div className="font-heading font-semibold text-[var(--text-primary)] mb-2">Personalized Tips</div>
      <div className="text-[var(--text-muted)] text-sm">No feedback yet.</div>
    </div>
  );

  return (
    <div className="glass-card p-5">
      <div className="font-heading font-semibold text-[var(--text-primary)] mb-3">Personalized Tips</div>
      <div className="text-xs font-mono text-[var(--text-secondary)] mb-3">
        Summary — Accuracy: {Number.isFinite(data.summary?.accuracy) ? data.summary.accuracy.toFixed(3) : "NaN"},
        AUC: {Number.isFinite(data.summary?.auc) ? data.summary.auc.toFixed(3) : "NaN"}
      </div>
      <ul className="space-y-2">
        {data.tips?.map((t, i) => (
          <li key={i} className="text-sm text-[var(--text-secondary)] pl-3 border-l-2 border-[rgba(6,214,160,0.2)]">
            {t}
          </li>
        ))}
      </ul>
      {!!(data.actions?.length) && (
        <>
          <div className="font-heading font-semibold text-[var(--text-primary)] mt-4 mb-2 text-sm">Next Actions</div>
          <ul className="space-y-2">
            {data.actions.map((a, i) => (
              <li key={i} className="text-sm text-[var(--text-secondary)] pl-3 border-l-2 border-[rgba(139,92,246,0.2)]">
                {a}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
