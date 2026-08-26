import React from "react";

const CognitiveStateDisplay = React.memo(function CognitiveStateDisplay({ state }) {
  return (
    <div className="glass-card p-5">
      <div className="text-[0.7rem] uppercase tracking-wider text-[var(--text-muted)] font-heading font-medium mb-1">
        Current State
      </div>
      <div className="text-2xl font-heading font-bold text-[var(--accent-cyan)]" style={{ filter: 'drop-shadow(0 0 6px rgba(6,214,160,0.3))' }}>
        {state || "—"}
      </div>
    </div>
  );
});

export default CognitiveStateDisplay;
