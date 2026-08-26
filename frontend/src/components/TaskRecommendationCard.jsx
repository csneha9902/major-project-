import { Brain, ArrowRight } from 'lucide-react';

export default function TaskRecommendationCard({ recommendation }) {
  return (
    <div className="recommendation-card">
      <div className="card-header">
        <Brain className="icon-brain" />
        <h3 className="font-heading font-semibold text-base">Optimal Task Recommendation</h3>
      </div>
      <div className="recommendation-content">
        <p className="label">Next Action</p>
        <p className="task-name flex items-center gap-2">
          <ArrowRight size={18} className="text-[var(--accent-cyan)] flex-shrink-0" style={{ filter: 'drop-shadow(0 0 4px rgba(6,214,160,0.4))' }} />
          {recommendation?.task || 'Waiting for data...'}
        </p>
        <p className="reasoning">{recommendation?.reasoning || 'Recommendation will appear when simulation starts.'}</p>
      </div>
    </div>
  );
}
