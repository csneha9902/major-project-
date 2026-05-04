import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid, Area, AreaChart, ComposedChart } from 'recharts';
import { useCallback } from 'react';
import ChartTooltip from './ui/ChartTooltip';

const BiometricTooltip = ({ active, payload, label, onHover, onHoverEnd }) => {
  if (!active || !payload || !payload[0]?.payload) {
    if (onHoverEnd) onHoverEnd();
    return null;
  }

  const dataPoint = payload[0].payload;
  if (onHover && dataPoint.cognitive_state) {
    onHover(dataPoint.cognitive_state, dataPoint.recommendation);
  }

  const items = [
    { name: 'Focus (Beta)', value: payload[0]?.value, color: '#ef4444' },
    { name: 'Relaxation (Alpha)', value: payload[1]?.value, color: '#3b82f6' },
    { name: 'Heart Rate', value: payload[2]?.value, color: '#f59e0b' },
  ];

  return (
    <ChartTooltip active={active} payload={payload} label={label} items={items}>
      {dataPoint.cognitive_state && (
        <div className="mt-2 pt-2 border-t border-[rgba(148,163,184,0.1)]">
          <span className="text-xs font-heading font-semibold text-[var(--accent-cyan)]">
            State: {dataPoint.cognitive_state}
          </span>
        </div>
      )}
    </ChartTooltip>
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
      <h3 className="flex items-center gap-2">
        <span className="text-lg">📊</span>
        Biometric Trends
        {data.length > 0 && <span className="live-dot ml-2" />}
      </h3>
      <ResponsiveContainer width="100%" height={320}>
        <ComposedChart
          data={data}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
        >
          <defs>
            <linearGradient id="gradBeta" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ef4444" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradAlpha" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradHR" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.2} />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
            </linearGradient>
            <filter id="glowRed">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="glowBlue">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="glowAmber">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <CartesianGrid
            strokeDasharray="3 6"
            stroke="rgba(148,163,184,0.06)"
            vertical={false}
          />
          <XAxis
            dataKey="timestamp"
            stroke="transparent"
            tick={{ fill: '#64748b', fontSize: 10, fontFamily: "'JetBrains Mono', monospace" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            yAxisId="left"
            stroke="transparent"
            tick={{ fill: '#64748b', fontSize: 10, fontFamily: "'JetBrains Mono', monospace" }}
            domain={[0, 2]}
            axisLine={false}
            tickLine={false}
            label={{ value: 'α/β', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 11 }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            stroke="transparent"
            tick={{ fill: '#f59e0b', fontSize: 10, fontFamily: "'JetBrains Mono', monospace" }}
            domain={[50, 120]}
            axisLine={false}
            tickLine={false}
            label={{ value: 'BPM', angle: 90, position: 'insideRight', fill: '#f59e0b', fontSize: 11 }}
          />
          <Tooltip
            content={<BiometricTooltip onHover={onHover} onHoverEnd={onHoverEnd} />}
          />
          <Legend
            wrapperStyle={{ paddingTop: '12px', fontSize: '0.75rem', fontFamily: "'Exo 2', sans-serif" }}
            iconType="circle"
            iconSize={8}
          />
          <Area
            yAxisId="left"
            type="monotone"
            dataKey="beta"
            fill="url(#gradBeta)"
            stroke="none"
          />
          <Area
            yAxisId="left"
            type="monotone"
            dataKey="alpha"
            fill="url(#gradAlpha)"
            stroke="none"
          />
          <Area
            yAxisId="right"
            type="monotone"
            dataKey="heartRate"
            fill="url(#gradHR)"
            stroke="none"
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="beta"
            name="Focus (Beta)"
            stroke="#ef4444"
            strokeWidth={2.5}
            dot={false}
            filter="url(#glowRed)"
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
            filter="url(#glowBlue)"
            animationDuration={300}
            isAnimationActive={true}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="heartRate"
            name="Heart Rate (BPM)"
            stroke="#f59e0b"
            strokeWidth={2}
            dot={false}
            filter="url(#glowAmber)"
            strokeDasharray="6 3"
            animationDuration={300}
            isAnimationActive={true}
          />
        </ComposedChart>
      </ResponsiveContainer>
      {currentMetrics && (
        <div className="current-values">
          <span>
            <span className="text-[var(--text-muted)] text-[0.7rem] uppercase tracking-wider block mb-0.5">Focus (β)</span>
            <span className="text-[#ef4444] font-mono font-medium">{currentMetrics.beta?.toFixed?.(2)}</span>
          </span>
          <span>
            <span className="text-[var(--text-muted)] text-[0.7rem] uppercase tracking-wider block mb-0.5">Relax (α)</span>
            <span className="text-[#3b82f6] font-mono font-medium">{currentMetrics.alpha?.toFixed?.(2)}</span>
          </span>
          <span>
            <span className="text-[var(--text-muted)] text-[0.7rem] uppercase tracking-wider block mb-0.5">Heart Rate</span>
            <span className="text-[#f59e0b] font-mono font-medium">{currentMetrics.heartRate?.toFixed?.(0)} <span className="text-[0.65rem] opacity-60">BPM</span></span>
          </span>
        </div>
      )}
    </div>
  );
}
