import React, { useMemo, useRef } from "react";
import {
  ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import ChartTooltip from "./ui/ChartTooltip";

const RealTimeChart = React.memo(function RealTimeChart({ frame, bufferRef, running }) {
  const buf = bufferRef.current || (bufferRef.current = []);
  
  const lastTimestamp = useRef(0);
  if (running && frame && frame.timestamp !== lastTimestamp.current) {
    lastTimestamp.current = frame.timestamp;
    buf.push({
      t: frame.timestamp,
      alpha: frame.eeg?.alpha ?? null,
      beta: frame.eeg?.beta ?? null,
      lf_hf: frame.hrv?.lf_hf_ratio ?? null,
    });
    if (buf.length > 60) buf.shift();
  }

  const data = useMemo(() => {
    return buf.length > 0 ? buf.slice(-60) : [];
  }, [buf.length, lastTimestamp.current]);

  return (
    <div className="chart-card">
      <h3 className="flex items-center gap-2">
        EEG / HRV (Live Stream)
        {running && <span className="live-dot ml-1" />}
      </h3>
      <ResponsiveContainer width="100%" height={280}>
        <ComposedChart data={data} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="rtAlpha" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#059669" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#059669" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="rtBeta" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#16A34A" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#16A34A" stopOpacity={0} />
            </linearGradient>
            <filter id="rtGlow">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <CartesianGrid strokeDasharray="3 6" stroke="rgba(34,197,94,0.12)" vertical={false} />
          <XAxis
            dataKey="t"
            tickFormatter={(v) => new Date(v * 1000).toLocaleTimeString()}
            stroke="transparent"
            tick={{ fill: '#3F6212', fontSize: 10, fontFamily: "'JetBrains Mono', monospace" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[0, 2]}
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
          <Area type="monotone" dataKey="alpha" fill="url(#rtAlpha)" stroke="none" />
          <Area type="monotone" dataKey="beta" fill="url(#rtBeta)" stroke="none" />
          <Line type="monotone" dataKey="alpha" name="Relaxation (Alpha)" stroke="#059669" dot={false} strokeWidth={2.5} filter="url(#rtGlow)" />
          <Line type="monotone" dataKey="beta" name="Focus (Beta)" stroke="#16A34A" dot={false} strokeWidth={2.5} filter="url(#rtGlow)" />
          <Line type="monotone" dataKey="lf_hf" name="LF/HF Ratio" stroke="#15803D" dot={false} strokeWidth={2} filter="url(#rtGlow)" />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
});

export default RealTimeChart;
