import { Brain } from 'lucide-react';

export default function TaskRecommendationCard({ recommendation }) {
  return (
    <div className="recommendation-card">
      <div className="card-header">
        <Brain className="icon-brain" />
        <h3>Optimal Task Recommendation</h3>
      </div>
      <div className="recommendation-content">
        <p className="label">**Next Action:**</p>
        <p className="task-name">→ {recommendation?.task || 'Waiting for data...'}</p>
        <p className="reasoning">{recommendation?.reasoning || 'Recommendation will appear when simulation starts.'}</p>
      </div>
    </div>
  );
}


