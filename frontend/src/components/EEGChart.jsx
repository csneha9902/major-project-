import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

/**
 * EEGChart Component
 * @param {Array<number>} data - Array of EEG values
 */
export default function EEGChart({ data }) {
  // Convert raw numeric EEG array to chart-friendly format
  const chartData = data.map((val, idx) => ({
    point: idx,
    value: val
  }));

  return (
    <div className="bg-white rounded-xl shadow p-4">
      <h2 className="text-xl font-bold mb-4">EEG Signal</h2>
      <LineChart width={600} height={300} data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="point" label={{ value: "Sample", position: "insideBottom", offset: -5 }} />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="value" stroke="#ff7300" dot={false} />
      </LineChart>
    </div>
  );
}