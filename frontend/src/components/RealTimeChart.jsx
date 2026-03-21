import React, { useMemo, useRef, useCallback } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";

const RealTimeChart = React.memo(function RealTimeChart({ frame, bufferRef, running }) {
  // Maintain a fixed-size buffer of recent points
  const buf = bufferRef.current || (bufferRef.current = []);
  
  // Only update buffer if we have new data with different timestamp
  const lastTimestamp = useRef(0);
  if (running && frame && frame.timestamp !== lastTimestamp.current) {
    lastTimestamp.current = frame.timestamp;
    buf.push({
      t: frame.timestamp,
      alpha: frame.eeg?.alpha ?? null,
      beta: frame.eeg?.beta ?? null,
      lf_hf: frame.hrv?.lf_hf_ratio ?? null,
    });
    if (buf.length > 60) buf.shift(); // keep ~60s at 1s cadence
  }

  const data = useMemo(() => {
    // Only recalculate if we actually have new data
    return buf.length > 0 ? buf.slice(-60) : [];
  }, [buf.length, lastTimestamp.current]);

  return (
    <div className="p-4 border rounded bg-white">
      <div className="font-semibold mb-2">EEG/HRV (Live)</div>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="t" tickFormatter={(v) => new Date(v * 1000).toLocaleTimeString()} />
          <YAxis domain={[0, 2]} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="alpha" name="Alpha" stroke="#3b82f6" dot={false} />
          <Line type="monotone" dataKey="beta" name="Beta" stroke="#ef4444" dot={false} />
          <Line type="monotone" dataKey="lf_hf" name="LF/HF" stroke="#10b981" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
});

export default RealTimeChart;
