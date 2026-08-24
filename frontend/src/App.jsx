import React, { useEffect, useMemo, useState } from "react";
import Header from "./components/Header";
import CurrentStateCard from "./components/CurrentStateCard";
import BiometricTrendsChart from "./components/BiometricTrendsChart";
import TaskRecommendationCard from "./components/TaskRecommendationCard";
import WellnessTipsPanel from "./components/WellnessTipsPanel";
import SessionSummaryPanel from "./components/SessionSummaryPanel";
import { useDataStream } from "./hooks/useDataStream";
import "./App.css";

export default function App() {
  const { frame, running, startSimulation, stopSimulation } = useDataStream();

  const [chartData, setChartData] = useState([]);
  const [hoveredState, setHoveredState] = useState(null);
  const [hoveredRecommendation, setHoveredRecommendation] = useState(null);

  useEffect(() => {
    if (frame && running) {
      setChartData(prev => {
        const newRow = {
          timestamp: new Date(frame.timestamp * 1000).toLocaleTimeString(),
          alpha: frame?.eeg?.alpha ?? 0,
          beta: frame?.eeg?.beta ?? 0,
          heartRate: frame?.hrv?.heart_rate_bpm ?? 0,
          cognitive_state: frame?.cognitive_state,
          recommendation: frame?.recommendation,
        };
        const next = [...prev, newRow];
        return next.slice(-60);
      });
    }
  }, [frame, running]);

  useEffect(() => { if (!running) setChartData([]); }, [running]);

  const currentMetrics = frame ? {
    alpha: frame?.eeg?.alpha ?? 0,
    beta: frame?.eeg?.beta ?? 0,
    heartRate: frame?.hrv?.heart_rate_bpm ?? 0,
  } : null;

  // Use hovered state if available, otherwise use current frame
  const displayState = hoveredState || frame?.cognitive_state || 'Neutral';
  const displayRecommendation = hoveredRecommendation || frame?.recommendation;

  return (
    <div className="app-container">
      <Header isRunning={running} onStart={startSimulation} onStop={stopSimulation} />

      <div className="main-content">
        <div className="left-section">
          <CurrentStateCard state={displayState} />
          <BiometricTrendsChart 
            data={chartData} 
            currentMetrics={currentMetrics}
            onHover={(state, recommendation) => {
              setHoveredState(state);
              setHoveredRecommendation(recommendation);
            }}
            onHoverEnd={() => {
              setHoveredState(null);
              setHoveredRecommendation(null);
            }}
          />
          <WellnessTipsPanel currentState={displayState} />
        </div>
        <div className="right-section">
          <TaskRecommendationCard recommendation={displayRecommendation} />
          <SessionSummaryPanel isRunning={running} />
        </div>
      </div>
    </div>
  );
}
