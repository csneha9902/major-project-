/**
 * Animated metric badge for stat readouts in off-white & light-green theme.
 * Shows a label, value, and optional unit with glow effect.
 */
export default function MetricBadge({ label, value, unit = '', color = 'cyan', icon = null }) {
  const colorMap = {
    cyan: { text: 'text-[#16A34A]', glow: 'shadow-[0_0_8px_rgba(22,163,74,0.18)]', bg: 'bg-[rgba(34,197,94,0.08)]' },
    violet: { text: 'text-[#15803D]', glow: 'shadow-[0_0_8px_rgba(21,128,61,0.18)]', bg: 'bg-[rgba(21,128,61,0.08)]' },
    blue: { text: 'text-[#059669]', glow: 'shadow-[0_0_8px_rgba(5,150,105,0.18)]', bg: 'bg-[rgba(5,150,105,0.08)]' },
    red: { text: 'text-[#DC2626]', glow: 'shadow-[0_0_8px_rgba(220,38,38,0.18)]', bg: 'bg-[rgba(220,38,38,0.08)]' },
    amber: { text: 'text-[#D97706]', glow: 'shadow-[0_0_8px_rgba(217,119,6,0.18)]', bg: 'bg-[rgba(217,119,6,0.08)]' },
    green: { text: 'text-[#22C55E]', glow: 'shadow-[0_0_8px_rgba(34,197,94,0.18)]', bg: 'bg-[rgba(34,197,94,0.08)]' },
  };

  const c = colorMap[color] || colorMap.cyan;

  return (
    <div className={`flex items-center gap-3 rounded-xl px-4 py-3 ${c.bg} ${c.glow} border border-[rgba(34,197,94,0.18)]`}>
      {icon && <span className={`${c.text} flex-shrink-0`}>{icon}</span>}
      <div className="flex flex-col min-w-0">
        <span className="text-[0.7rem] uppercase tracking-wider text-[var(--text-muted)] font-heading font-semibold">
          {label}
        </span>
        <span className={`text-lg font-mono font-bold ${c.text} leading-tight`}>
          {value}{unit && <span className="text-xs ml-0.5 opacity-70">{unit}</span>}
        </span>
      </div>
    </div>
  );
}
