import React from "react";

const RecommendationCard = React.memo(function RecommendationCard({ recommendation }) {
  const task = recommendation?.task || "—";
  const difficulty = recommendation?.difficulty ?? "—";
  return (
    <div className="glass-card p-5">
      <div className="text-[0.7rem] uppercase tracking-wider text-[var(--text-muted)] font-heading font-semibold mb-1">
        Optimal Recommendation
      </div>
      <div className="text-lg font-heading font-bold text-[var(--text-primary)] mb-1">{task}</div>
      <div className="text-xs font-mono text-[var(--text-secondary)] font-medium">Difficulty Level: {difficulty}</div>
    </div>
  );
});

export default RecommendationCard;
