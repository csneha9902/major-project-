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
    <div className="p-4 border rounded text-sm">
      <div className="font-semibold mb-2">Personalized Tips</div>
      <div className="text-gray-500">No feedback yet.</div>
    </div>
  );

  return (
    <div className="p-4 border rounded text-sm">
      <div className="font-semibold mb-2">Personalized Tips</div>
      <div className="text-xs text-gray-600 mb-2">
        Summary — Accuracy: {Number.isFinite(data.summary?.accuracy) ? data.summary.accuracy.toFixed(3) : "NaN"},
        AUC: {Number.isFinite(data.summary?.auc) ? data.summary.auc.toFixed(3) : "NaN"}
      </div>
      <ul className="list-disc pl-5 space-y-1">
        {data.tips?.map((t, i) => <li key={i}>{t}</li>)}
      </ul>
      {!!(data.actions?.length) && (
        <>
          <div className="font-semibold mt-3 mb-1">Next Actions</div>
          <ul className="list-disc pl-5 space-y-1">
            {data.actions.map((a, i) => <li key={i}>{a}</li>)}
          </ul>
        </>
      )}
    </div>
  );
}
