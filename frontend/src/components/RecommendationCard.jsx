import React from "react";

const RecommendationCard = React.memo(function RecommendationCard({ recommendation }) {
  const task = recommendation?.task || "—";
  const difficulty = recommendation?.difficulty ?? "—";
  return (
    <div className="p-4 border rounded bg-white">
      <div className="text-sm text-gray-600">Recommendation</div>
      <div className="text-lg font-semibold">{task}</div>
      <div className="text-xs text-gray-700">Difficulty: {difficulty}</div>
    </div>
  );
});

export default RecommendationCard;
