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
      <div className="font-heading font-bold text-[var(--text-primary)] mb-2">Personalized Tips</div>
      <div className="text-[var(--text-muted)] text-sm italic">No feedback available yet.</div>
    </div>
  );

  return (
    <div className="glass-card p-5">
      <div className="font-heading font-bold text-[var(--text-primary)] mb-3">Personalized Tips</div>
      <div className="text-xs font-mono text-[var(--text-secondary)] mb-3">
        Summary — Accuracy: {Number.isFinite(data.summary?.accuracy) ? data.summary.accuracy.toFixed(3) : "N/A"},
        AUC: {Number.isFinite(data.summary?.auc) ? data.summary.auc.toFixed(3) : "N/A"}
      </div>
      <ul className="space-y-2">
        {data.tips?.map((t, i) => (
          <li key={i} className="text-sm text-[var(--text-secondary)] pl-3 border-l-2 border-[rgba(34,197,94,0.3)]">
            {t}
          </li>
        ))}
      </ul>
      {!!(data.actions?.length) && (
        <>
          <div className="font-heading font-bold text-[var(--text-primary)] mt-4 mb-2 text-sm">Next Actions</div>
          <ul className="space-y-2">
            {data.actions.map((a, i) => (
              <li key={i} className="text-sm text-[var(--text-secondary)] pl-3 border-l-2 border-[rgba(21,128,61,0.3)]">
                {a}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
