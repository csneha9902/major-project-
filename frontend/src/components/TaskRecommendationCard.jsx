import React from 'react';
import { Brain, ArrowRight, Activity, ShieldCheck, Zap, HeartPulse, CheckCircle2 } from 'lucide-react';

export default function TaskRecommendationCard({ recommendation }) {
  const taskTitle = recommendation?.task || 'Practice Easy Problems';
  const situation = recommendation?.situation || (
    'High Beta wave elevation with suppressed Alpha waves and an elevated heart rate (98 BPM). Your neural signals indicate acute cognitive stress detected during high-load SNN cognitive monitoring.'
  );
  const reasoning = recommendation?.reasoning || (
    'Excessive cognitive strain reduces working memory capacity and accelerates burnout. Lowering task difficulty and initiating brief relaxation intervals protects cognitive health.'
  );
  const nextSteps = recommendation?.next_steps || [
    'Execute 3 minutes of 4-7-8 deep breathing to re-engage parasympathetic neural recovery.',
    'Switch to Tier 1/2 practice problems to consolidate retention without cognitive overload.',
    'Hydrate and step back from high-intensity problem solving for a 5-minute break.'
  ];
  const difficultyTag = recommendation?.difficulty_tag || 'Tier 1 - Reduced Load';
  const state = recommendation?.state || 'Stressed';

  // Badge styling depending on state
  const stateBadgeStyle = {
    Stressed: 'bg-amber-100 text-amber-800 border-amber-300',
    Focused: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    Neutral: 'bg-blue-100 text-blue-800 border-blue-300',
  }[state] || 'bg-emerald-100 text-emerald-800 border-emerald-300';

  return (
    <div className="recommendation-card p-5 bg-[var(--bg-surface)] rounded-2xl border border-[var(--border-subtle)] shadow-sm hover:shadow-md transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)] mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-50 text-[var(--accent-cyan)]">
            <Brain size={22} />
          </div>
          <div>
            <h3 className="font-heading font-bold text-base text-[var(--text-primary)]">Optimal Task Recommendation</h3>
            <p className="text-xs text-[var(--text-muted)]">Real-time SNN Cognitive Load Optimization</p>
          </div>
        </div>
        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${stateBadgeStyle}`}>
          {state}
        </span>
      </div>

      {/* Main Next Action Box */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/20 via-emerald-900/10 to-transparent border border-emerald-500/20 mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[0.7rem] font-bold tracking-wider uppercase text-[var(--accent-cyan)] flex items-center gap-1">
            <Zap size={14} /> Recommended Next Action
          </span>
          <span className="text-[0.68rem] px-2 py-0.5 rounded-md bg-[var(--bg-card)] font-mono font-medium text-[var(--text-secondary)] border border-[var(--border-subtle)]">
            {difficultyTag}
          </span>
        </div>
        <div className="flex items-center gap-2 text-lg font-heading font-bold text-[var(--text-primary)]">
          <ArrowRight size={20} className="text-[var(--accent-cyan)] flex-shrink-0 animate-pulse" />
          <span>{taskTitle}</span>
        </div>
      </div>

      {/* Neural Situation Analysis */}
      <div className="mb-4">
        <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
          <Activity size={14} className="text-[var(--accent-cyan)]" />
          <span>Neural Situation Analysis</span>
        </div>
        <p className="text-xs text-[var(--text-secondary)] leading-relaxed bg-[var(--bg-subtle)] p-3 rounded-lg border border-[var(--border-subtle)]">
          {situation}
        </p>
      </div>

      {/* Cognitive Health Action Plan */}
      <div className="mb-4">
        <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
          <ShieldCheck size={14} className="text-[var(--accent-cyan)]" />
          <span>Cognitive Health Next Steps</span>
        </div>
        <div className="space-y-2">
          {nextSteps.map((step, idx) => (
            <div key={idx} className="flex items-start gap-2.5 text-xs text-[var(--text-primary)] bg-[var(--bg-subtle)]/50 p-2.5 rounded-lg border border-[var(--border-subtle)]/60">
              <CheckCircle2 size={15} className="text-[var(--accent-cyan)] flex-shrink-0 mt-0.5" />
              <span className="leading-snug">{step}</span>
            </div>
          ))}
        </div>
      </div>

      {/* SNN Adaptation Rationale */}
      <div className="pt-3 border-t border-[var(--border-subtle)]">
        <p className="text-[0.72rem] text-[var(--text-muted)] italic leading-relaxed">
          <strong className="not-italic text-[var(--text-secondary)]">Why this change: </strong>
          {reasoning}
        </p>
      </div>
    </div>
  );
}
