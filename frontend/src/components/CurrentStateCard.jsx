import { Activity, Brain, Zap } from 'lucide-react';

const stateConfig = {
  Neutral: {
    icon: Activity,
    gradient: 'from-slate-500/20 to-slate-600/10',
    textColor: 'text-slate-300',
    glowColor: 'rgba(148, 163, 184, 0.15)',
    iconGlow: 'drop-shadow(0 0 6px rgba(148,163,184,0.5))',
  },
  Focused: {
    icon: Brain,
    gradient: 'from-blue-500/20 to-cyan-500/10',
    textColor: 'text-blue-300',
    glowColor: 'rgba(59, 130, 246, 0.2)',
    iconGlow: 'drop-shadow(0 0 8px rgba(59,130,246,0.6))',
  },
  Stressed: {
    icon: Zap,
    gradient: 'from-red-500/20 to-orange-500/10',
    textColor: 'text-red-300',
    glowColor: 'rgba(239, 68, 68, 0.2)',
    iconGlow: 'drop-shadow(0 0 8px rgba(239,68,68,0.6))',
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
        background: state === 'Stressed' ? 'var(--danger)' : state === 'Focused' ? 'var(--accent-blue)' : 'var(--text-muted)',
      }} />
    </div>
  );
}
