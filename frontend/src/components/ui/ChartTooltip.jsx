/**
 * Glassmorphic chart tooltip used across all Recharts charts.
 */
export default function ChartTooltip({ active, payload, label, items = [], children }) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div
      className="rounded-xl px-4 py-3 border border-[rgba(148,163,184,0.1)]"
      style={{
        background: 'rgba(10, 14, 26, 0.92)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.4), 0 0 15px rgba(6,214,160,0.08)',
      }}
    >
      {label && (
        <p className="text-[0.7rem] font-heading uppercase tracking-wider text-[var(--text-muted)] mb-2 pb-1.5 border-b border-[rgba(148,163,184,0.1)]">
          {label}
        </p>
      )}
      {items.length > 0
        ? items.map((item, i) => (
            <div key={i} className="flex items-center gap-2 py-0.5">
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{
                  background: item.color,
                  boxShadow: `0 0 6px ${item.color}`,
                }}
              />
              <span className="text-xs text-[var(--text-secondary)]">{item.name}:</span>
              <span className="text-xs font-mono font-medium text-[var(--text-primary)]">
                {typeof item.value === 'number' ? item.value.toFixed(2) : item.value}
              </span>
            </div>
          ))
        : payload.map((entry, i) => (
            <div key={i} className="flex items-center gap-2 py-0.5">
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{
                  background: entry.color || entry.stroke,
                  boxShadow: `0 0 6px ${entry.color || entry.stroke}`,
                }}
              />
              <span className="text-xs text-[var(--text-secondary)]">{entry.name}:</span>
              <span className="text-xs font-mono font-medium text-[var(--text-primary)]">
                {typeof entry.value === 'number' ? entry.value.toFixed(2) : entry.value}
              </span>
            </div>
          ))}
      {children}
    </div>
  );
}
