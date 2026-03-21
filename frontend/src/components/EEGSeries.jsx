import React from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

/**
 * props.series: array of numeric samples
 */
export default function EEGSeries({ series }) {
  // Build points {i, v}
  const points = (series && series.length)
    ? series.slice(0, 1000).map((v, i) => ({ i, v }))
    : Array.from({ length: 200 }, (_, i) => ({ i, v: Math.sin(i / 10) * 20 + Math.random() * 5 }));

  return (
    <div className="p-4 border rounded">
      <div className="font-semibold mb-3">EEG Time Series (Sample)</div>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={points} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="i" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="v" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
