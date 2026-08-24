import React, { useEffect, useState } from "react";
import Header from "./components/Header";
import CurrentStateCard from "./components/CurrentStateCard";
import BiometricTrendsChart from "./components/BiometricTrendsChart";
import TaskRecommendationCard from "./components/TaskRecommendationCard";
import WellnessTipsPanel from "./components/WellnessTipsPanel";
import SessionSummaryPanel from "./components/SessionSummaryPanel";
import ProgressCalendar from "./components/ProgressCalendar";
import { useDataStream } from "./hooks/useDataStream";
import "./App.css";

const generateExamCrunchHistory = () => {
  const points = [];
  const now = Date.now();
  for (let i = 25; i >= 0; i--) {
    const timeSec = new Date(now - i * 3000);
    const timestampStr = timeSec.toLocaleTimeString();
    
    // Stressed student crunching for exam: High Beta, Low Alpha, High Heart Rate
    const beta = Number((1.08 + 0.12 * Math.sin(i * 0.4) + (Math.random() * 0.08 - 0.04)).toFixed(2));
    const alpha = Number((0.38 + 0.05 * Math.cos(i * 0.3) + (Math.random() * 0.04 - 0.02)).toFixed(2));
    const heartRate = Math.round(98 + 6 * Math.sin(i * 0.5) + (Math.random() * 4 - 2));

    points.push({
      timestamp: timestampStr,
      alpha,
      beta,
      heartRate,
      cognitive_state: "Stressed",
      recommendation: {
        task: "Take 5-min Breathing Break",
        difficulty: 1,
        reasoning: "High cognitive stress detected during exam crunch. Neural load requires short recovery break."
      }
    });
  }
  return points;
};

export default function App() {
  const { frame, running, startSimulation, stopSimulation } = useDataStream();

  const [chartData, setChartData] = useState(() => generateExamCrunchHistory());
  const [hoveredState, setHoveredState] = useState(null);
  const [hoveredRecommendation, setHoveredRecommendation] = useState(null);

  useEffect(() => {
    if (frame && running) {
      setChartData(prev => {
        const newRow = {
          timestamp: new Date(frame.timestamp * 1000).toLocaleTimeString(),
          alpha: frame?.eeg?.alpha ?? 0.38,
          beta: frame?.eeg?.beta ?? 1.08,
          heartRate: frame?.hrv?.heart_rate_bpm ?? 98,
          cognitive_state: frame?.cognitive_state || "Stressed",
          recommendation: frame?.recommendation,
        };
        const next = [...prev, newRow];
        return next.slice(-60);
      });
    }
  }, [frame, running]);

  useEffect(() => {
    if (!running) {
      setChartData(generateExamCrunchHistory());
    }
  }, [running]);

  const currentMetrics = frame ? {
    alpha: frame?.eeg?.alpha ?? 0.38,
    beta: frame?.eeg?.beta ?? 1.08,
    heartRate: frame?.hrv?.heart_rate_bpm ?? 98,
  } : {
    alpha: chartData[chartData.length - 1]?.alpha || 0.38,
    beta: chartData[chartData.length - 1]?.beta || 1.08,
    heartRate: chartData[chartData.length - 1]?.heartRate || 98,
  };

  const displayState = hoveredState || frame?.cognitive_state || 'Stressed';
  const displayRecommendation = hoveredRecommendation || frame?.recommendation || {
    task: "Take 5-min Breathing Break & Lower Task Difficulty",
    difficulty: 1,
    reasoning: "Exam prep crunch detected: high beta wave elevation with elevated heart rate (98 BPM). Lowering difficulty prevents cognitive burnout."
  };

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

      {/* Dynamic Progress & Health Calendar Keeper */}
      <ProgressCalendar />
    </div>
  );
}
