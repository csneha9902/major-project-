import React from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";

/**
 * Expects props.history like:
 * [
 *   { ts: "2025-08-20 16:06:00", baseline: {accuracy: 0.85, auc: 0.9}, hybrid: {accuracy: 0.48, auc: 0.49} },
 *   ...
 * ]
 */
export default function PerformanceHistory({ history }) {
  // Flatten into a simple array for recharts
  const rows = (history ?? []).map(h => ({
    ts: h.ts,
    base_acc: h.baseline?.accuracy ?? null,
    base_auc: h.baseline?.auc ?? null,
    hyb_acc:  h.hybrid?.accuracy ?? null,
    hyb_auc:  h.hybrid?.auc ?? null,
  }));

  // Default placeholder if empty
  const data = rows.length ? rows : [
    { ts: "T-2", base_acc: 0.70, base_auc: 0.72, hyb_acc: 0.60, hyb_auc: 0.62 },
    { ts: "T-1", base_acc: 0.78, base_auc: 0.80, hyb_acc: 0.65, hyb_auc: 0.67 },
    { ts: "T-0", base_acc: 0.85, base_auc: 0.90, hyb_acc: 0.48, hyb_auc: 0.49 },
  ];

  return (
    <div className="p-4 border rounded">
      <div className="font-semibold mb-3">Accuracy / AUC Over Time</div>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="ts" />
          <YAxis domain={[0, 1]} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="base_acc" name="Baseline Acc" dot={false} />
          <Line type="monotone" dataKey="base_auc" name="Baseline AUC" dot={false} />
          <Line type="monotone" dataKey="hyb_acc"  name="Hybrid Acc" dot={false} />
          <Line type="monotone" dataKey="hyb_auc"  name="Hybrid AUC" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
