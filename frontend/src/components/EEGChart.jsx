import React from "react";
import {
  ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import ChartTooltip from "./ui/ChartTooltip";

export default function EEGChart({ data }) {
  const chartData = data.map((val, idx) => ({
    point: idx,
    value: val,
  }));

  return (
    <div className="chart-card">
      <h3>EEG Signal</h3>
      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={chartData} margin={{ top: 10, right: 16, left: 0, bottom: 5 }}>
          <defs>
            <linearGradient id="eegGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06d6a0" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#06d6a0" stopOpacity={0} />
            </linearGradient>
            <filter id="eegGlow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <CartesianGrid strokeDasharray="3 6" stroke="rgba(148,163,184,0.06)" vertical={false} />
          <XAxis
            dataKey="point"
            stroke="transparent"
            tick={{ fill: '#64748b', fontSize: 10, fontFamily: "'JetBrains Mono', monospace" }}
            axisLine={false}
            tickLine={false}
            label={{ value: 'Sample', position: 'insideBottom', offset: -5, fill: '#64748b', fontSize: 11 }}
          />
          <YAxis
            stroke="transparent"
            tick={{ fill: '#64748b', fontSize: 10, fontFamily: "'JetBrains Mono', monospace" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<ChartTooltip />} />
          <Area type="monotone" dataKey="value" fill="url(#eegGrad)" stroke="none" />
          <Line
            type="monotone"
            dataKey="value"
            name="EEG Signal"
            stroke="#06d6a0"
            dot={false}
            strokeWidth={2}
            filter="url(#eegGlow)"
            animationDuration={1500}
            animationEasing="ease-in-out"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
