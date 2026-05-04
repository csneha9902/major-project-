import React from "react";
import {
  ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import ChartTooltip from "./ui/ChartTooltip";

export default function EEGSeries({ series }) {
  const points = (series && series.length)
    ? series.slice(0, 1000).map((v, i) => ({ i, v }))
    : Array.from({ length: 200 }, (_, i) => ({ i, v: Math.sin(i / 10) * 20 + Math.random() * 5 }));

  return (
    <div className="chart-card">
      <h3>EEG Time Series (Sample)</h3>
      <ResponsiveContainer width="100%" height={240}>
        <ComposedChart data={points} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
          <defs>
            <linearGradient id="eegSeriesGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
            </linearGradient>
            <filter id="eegSeriesGlow">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <CartesianGrid strokeDasharray="3 6" stroke="rgba(148,163,184,0.06)" vertical={false} />
          <XAxis
            dataKey="i"
            stroke="transparent"
            tick={{ fill: '#64748b', fontSize: 10, fontFamily: "'JetBrains Mono', monospace" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            stroke="transparent"
            tick={{ fill: '#64748b', fontSize: 10, fontFamily: "'JetBrains Mono', monospace" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<ChartTooltip />} />
          <Area type="monotone" dataKey="v" fill="url(#eegSeriesGrad)" stroke="none" />
          <Line
            type="monotone"
            dataKey="v"
            stroke="#8b5cf6"
            dot={false}
            strokeWidth={2}
            filter="url(#eegSeriesGlow)"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
