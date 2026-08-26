import { Activity, Brain, Zap } from 'lucide-react';

const stateConfig = {
  Neutral: {
    icon: Activity,
    gradient: 'from-emerald-600/15 to-green-500/10',
    textColor: 'text-[#166534]',
    glowColor: 'rgba(34, 197, 94, 0.15)',
    iconGlow: 'drop-shadow(0 0 6px rgba(34,197,94,0.5))',
  },
  Focused: {
    icon: Brain,
    gradient: 'from-green-600/20 to-emerald-600/15',
    textColor: 'text-[#14532D]',
    glowColor: 'rgba(22, 163, 74, 0.25)',
    iconGlow: 'drop-shadow(0 0 8px rgba(22,163,74,0.6))',
  },
  Stressed: {
    icon: Zap,
    gradient: 'from-amber-600/15 to-red-500/10',
    textColor: 'text-amber-800',
    glowColor: 'rgba(217, 119, 6, 0.2)',
    iconGlow: 'drop-shadow(0 0 8px rgba(217,119,6,0.6))',
  },
};

export default function CurrentStateCard({ state }) {
  const config = stateConfig[state] || stateConfig.Neutral;
  const Icon = config.icon;

  return (
    <div
      className={`state-card bg-gradient-to-r ${config.gradient} ${config.textColor}`}
      style={{ boxShadow: `var(--shadow-card), 0 0 30px ${config.glowColor}` }}
    >
      <Icon className="state-icon" style={{ filter: config.iconGlow }} />
      <span className="font-heading font-semibold">Current State: {state}</span>
      <span className="live-dot ml-auto" style={{
        background: state === 'Stressed' ? 'var(--danger)' : 'var(--accent-cyan)',
      }} />
    </div>
  );
}
