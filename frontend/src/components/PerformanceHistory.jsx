import React from "react";
import {
  ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import ChartTooltip from "./ui/ChartTooltip";

export default function PerformanceHistory({ history }) {
  const rows = (history ?? []).map(h => ({
    ts: h.ts,
    base_acc: h.baseline?.accuracy ?? null,
    base_auc: h.baseline?.auc ?? null,
    snn_acc: h.snn?.accuracy ?? null,
    snn_auc: h.snn?.auc ?? null,
  }));

  const data = rows.length ? rows : [
    { ts: "T-2", base_acc: 0.70, base_auc: 0.72, snn_acc: 0.60, snn_auc: 0.62 },
    { ts: "T-1", base_acc: 0.78, base_auc: 0.80, snn_acc: 0.65, snn_auc: 0.67 },
    { ts: "T-0", base_acc: 0.85, base_auc: 0.90, snn_acc: 0.48, snn_auc: 0.49 },
  ];

  return (
    <div className="chart-card">
      <h3>Accuracy / AUC Over Time</h3>
      <ResponsiveContainer width="100%" height={280}>
        <ComposedChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
          <defs>
            <linearGradient id="perfBase" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.15} />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="perfSnn" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.15} />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
            </linearGradient>
            <filter id="perfGlow">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <CartesianGrid strokeDasharray="3 6" stroke="rgba(148,163,184,0.06)" vertical={false} />
          <XAxis
            dataKey="ts"
            stroke="transparent"
            tick={{ fill: '#64748b', fontSize: 10, fontFamily: "'JetBrains Mono', monospace" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[0, 1]}
            stroke="transparent"
            tick={{ fill: '#64748b', fontSize: 10, fontFamily: "'JetBrains Mono', monospace" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<ChartTooltip />} />
          <Legend
            wrapperStyle={{ paddingTop: '8px', fontSize: '0.75rem', fontFamily: "'Exo 2', sans-serif" }}
            iconType="circle"
            iconSize={8}
          />
          <Area type="monotone" dataKey="base_acc" fill="url(#perfBase)" stroke="none" />
          <Area type="monotone" dataKey="snn_acc" fill="url(#perfSnn)" stroke="none" />
          <Line type="monotone" dataKey="base_acc" name="Baseline Acc" stroke="#3b82f6" dot={false} strokeWidth={2.5} filter="url(#perfGlow)" />
          <Line type="monotone" dataKey="base_auc" name="Baseline AUC" stroke="#06d6a0" dot={false} strokeWidth={2} filter="url(#perfGlow)" strokeDasharray="6 3" />
          <Line type="monotone" dataKey="snn_acc" name="SNN Acc" stroke="#8b5cf6" dot={false} strokeWidth={2.5} filter="url(#perfGlow)" />
          <Line type="monotone" dataKey="snn_auc" name="SNN AUC" stroke="#f59e0b" dot={false} strokeWidth={2} filter="url(#perfGlow)" strokeDasharray="6 3" />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
