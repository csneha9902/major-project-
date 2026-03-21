import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useCallback } from 'react';

const CustomTooltip = ({ active, payload, onHover, onHoverEnd }) => {
  if (!active || !payload || !payload[0]?.payload) {
    if (onHoverEnd) onHoverEnd();
    return null;
  }

  const dataPoint = payload[0].payload;
  if (onHover && dataPoint.cognitive_state) {
    onHover(dataPoint.cognitive_state, dataPoint.recommendation);
  }

  return (
    <div className="chart-tooltip">
      <p>Focus (Beta): {payload[0]?.value?.toFixed?.(2)}</p>
      <p>Relaxation (Alpha): {payload[1]?.value?.toFixed?.(2)}</p>
      <p>Heart Rate (BPM): {payload[2]?.value?.toFixed?.(2)}</p>
      {dataPoint.cognitive_state && (
        <p className="tooltip-state">State: {dataPoint.cognitive_state}</p>
      )}
    </div>
  );
};

export default function BiometricTrendsChart({ data, currentMetrics, onHover, onHoverEnd }) {
  const handleMouseMove = useCallback((e) => {
    if (e && e.activePayload && e.activePayload[0]?.payload) {
      const point = e.activePayload[0].payload;
      if (onHover && point.cognitive_state) {
        onHover(point.cognitive_state, point.recommendation);
      }
    }
  }, [onHover]);

  const handleMouseLeave = useCallback(() => {
    if (onHoverEnd) onHoverEnd();
  }, [onHoverEnd]);

  return (
    <div className="chart-card">
      <h3>📊 Biometric Trends</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={data}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
        >
          <XAxis dataKey="timestamp" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
          <YAxis
            yAxisId="left"
            stroke="#64748b"
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            domain={[0, 2]}
            label={{ value: 'Alpha/Beta', angle: -90, position: 'insideLeft', fill: '#94a3b8' }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            stroke="#f59e0b"
            tick={{ fill: '#f59e0b', fontSize: 11 }}
            domain={[50, 120]}
            label={{ value: 'Heart Rate (BPM)', angle: 90, position: 'insideRight', fill: '#f59e0b' }}
          />
          <Tooltip
            content={<CustomTooltip onHover={onHover} onHoverEnd={onHoverEnd} />}
          />
          <Legend />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="beta"
            name="Focus (Beta)"
            stroke="#ef4444"
            strokeWidth={2.5}
            dot={false}
            animationDuration={300}
            isAnimationActive={true}
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="alpha"
            name="Relaxation (Alpha)"
            stroke="#3b82f6"
            strokeWidth={2.5}
            dot={false}
            animationDuration={300}
            isAnimationActive={true}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="heartRate"
            name="Heart Rate (BPM)"
            stroke="#f59e0b"
            strokeWidth={2.5}
            dot={false}
            animationDuration={300}
            isAnimationActive={true}
          />
        </LineChart>
      </ResponsiveContainer>
      {currentMetrics && (
        <div className="current-values">
          <span>Focus (Beta): {currentMetrics.beta?.toFixed?.(2)}</span>
          <span>Relaxation (Alpha): {currentMetrics.alpha?.toFixed?.(2)}</span>
          <span>Heart Rate (BPM): {currentMetrics.heartRate?.toFixed?.(2)}</span>
        </div>
      )}
    </div>
  );
}


