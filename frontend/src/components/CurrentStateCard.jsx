import { Activity, Brain, Zap } from 'lucide-react';

const stateConfig = {
  Neutral: { icon: Activity, bgClass: 'bg-slate-800', textClass: 'text-slate-300' },
  Focused: { icon: Brain, bgClass: 'bg-blue-900', textClass: 'text-blue-300' },
  Stressed: { icon: Zap, bgClass: 'bg-red-900', textClass: 'text-red-300' }
};

export default function CurrentStateCard({ state }) {
  const { icon: Icon, bgClass, textClass } = stateConfig[state] || stateConfig.Neutral;
  return (
    <div className={`state-card ${bgClass} ${textClass}`}>
      <Icon className="state-icon" />
      <span>Current State: {state}</span>
    </div>
  );
}


