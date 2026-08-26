import React from "react";
import {
  BarChart, Bar,
  XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer, Cell,
} from "recharts";
import ChartTooltip from "./ui/ChartTooltip";

/**
 * 3D-styled bar chart for model performance comparison.
 * Custom bar shape creates an isometric 3D illusion.
 */
const Bar3DShape = ({ x, y, width, height, fill }) => {
  const depth = 8;
  const darkerFill = fill + '99';
  const topFill = fill + 'cc';

  return (
    <g>
      {/* Main face */}
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={fill}
        rx={4}
        ry={4}
        style={{ filter: `drop-shadow(0 0 8px ${fill}44)` }}
      />
      {/* Top face (3D illusion) */}
      <polygon
        points={`${x},${y} ${x + depth},${y - depth} ${x + width + depth},${y - depth} ${x + width},${y}`}
        fill={topFill}
      />
      {/* Right side face */}
      <polygon
        points={`${x + width},${y} ${x + width + depth},${y - depth} ${x + width + depth},${y + height - depth} ${x + width},${y + height}`}
        fill={darkerFill}
      />
    </g>
  );
};

export default function ResultsChart({ data }) {
  const rows = [
    { model: "Baseline", accuracy: data?.baseline?.accuracy ?? null, auc: data?.baseline?.auc ?? null },
    { model: "SNN", accuracy: data?.snn?.accuracy ?? null, auc: data?.snn?.auc ?? null },
  ];

  return (
    <div className="chart-card">
      <h3>Model Performance</h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={rows} margin={{ top: 20, right: 16, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="barAcc" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#16A34A" />
              <stop offset="100%" stopColor="#15803D" />
            </linearGradient>
            <linearGradient id="barAuc" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#059669" />
              <stop offset="100%" stopColor="#047857" />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 6" stroke="rgba(34,197,94,0.12)" vertical={false} />
          <XAxis
            dataKey="model"
            stroke="transparent"
            tick={{ fill: '#166534', fontSize: 12, fontFamily: "'Exo 2', sans-serif" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[0, 1]}
            stroke="transparent"
            tick={{ fill: '#3F6212', fontSize: 10, fontFamily: "'JetBrains Mono', monospace" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<ChartTooltip />} />
          <Legend
            wrapperStyle={{ paddingTop: '8px', fontSize: '0.75rem', fontFamily: "'Exo 2', sans-serif" }}
            iconType="circle"
            iconSize={8}
          />
          <Bar
            dataKey="accuracy"
            name="Accuracy"
            fill="url(#barAcc)"
            shape={<Bar3DShape />}
            animationDuration={1200}
            animationEasing="ease-out"
          />
          <Bar
            dataKey="auc"
            name="AUC"
            fill="url(#barAuc)"
            shape={<Bar3DShape />}
            animationDuration={1200}
            animationEasing="ease-out"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
