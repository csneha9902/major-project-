/**
 * Animated metric badge for stat readouts.
 * Shows a label, value, and optional unit with glow effect.
 */
export default function MetricBadge({ label, value, unit = '', color = 'cyan', icon = null }) {
  const colorMap = {
    cyan: { text: 'text-[#06d6a0]', glow: 'shadow-[0_0_8px_rgba(6,214,160,0.2)]', bg: 'bg-[rgba(6,214,160,0.08)]' },
    violet: { text: 'text-[#8b5cf6]', glow: 'shadow-[0_0_8px_rgba(139,92,246,0.2)]', bg: 'bg-[rgba(139,92,246,0.08)]' },
    blue: { text: 'text-[#3b82f6]', glow: 'shadow-[0_0_8px_rgba(59,130,246,0.2)]', bg: 'bg-[rgba(59,130,246,0.08)]' },
    red: { text: 'text-[#ef4444]', glow: 'shadow-[0_0_8px_rgba(239,68,68,0.2)]', bg: 'bg-[rgba(239,68,68,0.08)]' },
    amber: { text: 'text-[#f59e0b]', glow: 'shadow-[0_0_8px_rgba(245,158,11,0.2)]', bg: 'bg-[rgba(245,158,11,0.08)]' },
    green: { text: 'text-[#10b981]', glow: 'shadow-[0_0_8px_rgba(16,185,129,0.2)]', bg: 'bg-[rgba(16,185,129,0.08)]' },
  };

  const c = colorMap[color] || colorMap.cyan;

  return (
    <div className={`flex items-center gap-3 rounded-xl px-4 py-3 ${c.bg} ${c.glow} border border-[rgba(148,163,184,0.06)]`}>
      {icon && <span className={`${c.text} flex-shrink-0`}>{icon}</span>}
      <div className="flex flex-col min-w-0">
        <span className="text-[0.7rem] uppercase tracking-wider text-[var(--text-muted)] font-heading font-medium">
          {label}
        </span>
        <span className={`text-lg font-mono font-medium ${c.text} leading-tight`}>
          {value}{unit && <span className="text-xs ml-0.5 opacity-70">{unit}</span>}
        </span>
      </div>
    </div>
  );
}
