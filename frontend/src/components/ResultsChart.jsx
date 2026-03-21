import React from "react";
import {
  BarChart, Bar,
  XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer,
} from "recharts";

/**
 * Expects props.data like:
 * {
 *   baseline: { accuracy: 0.850, auc: 0.900 },
 *   hybrid:   { accuracy: 0.500, auc: 0.475 }
 * }
 */
export default function ResultsChart({ data }) {
  // Normalize into rows for Recharts
  const rows = [
    { model: "Baseline", accuracy: data?.baseline?.accuracy ?? null, auc: data?.baseline?.auc ?? null },
    { model: "Hybrid",  accuracy: data?.hybrid?.accuracy   ?? null, auc: data?.hybrid?.auc   ?? null },
  ];

  return (
    <div className="p-4 border rounded bg-white">
      <div className="font-semibold mb-3">Model Performance</div>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={rows} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="model" />
          <YAxis domain={[0, 1]} />
          <Tooltip />
          <Legend />
          <Bar dataKey="accuracy" name="Accuracy" />
          <Bar dataKey="auc" name="AUC" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
