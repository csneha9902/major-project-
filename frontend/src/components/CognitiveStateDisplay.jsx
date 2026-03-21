import React from "react";

const CognitiveStateDisplay = React.memo(function CognitiveStateDisplay({ state }) {
  return (
    <div className="p-4 border rounded bg-white">
      <div className="text-sm text-gray-600">Current State</div>
      <div className="text-2xl font-semibold">{state || "—"}</div>
    </div>
  );
});

export default CognitiveStateDisplay;
