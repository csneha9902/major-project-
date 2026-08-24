import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import CurrentStateCard from "../components/CurrentStateCard";
import BiometricTrendsChart from "../components/BiometricTrendsChart";
import TaskRecommendationCard from "../components/TaskRecommendationCard";
import WellnessTipsPanel from "../components/WellnessTipsPanel";
import SessionSummaryPanel from "../components/SessionSummaryPanel";
import { useDataStream } from "../hooks/useDataStream";
import { useAuth } from "../context/AuthContext";
import GlowButton from "../components/ui/GlowButton";
import "../App.css";

export default function Dashboard() {
  const { frame, running, startSimulation, stopSimulation } = useDataStream();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

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

  const displayState = hoveredState || frame?.cognitive_state || 'Neutral';
  const displayRecommendation = hoveredRecommendation || frame?.recommendation;

  return (
    <>
      {/* Animated background */}
      <div className="app-background">
        <div className="orb-3" />
        <div className="grid-overlay" />
      </div>

      <div className="app-container">
        {/* Top bar */}
        <div className="dashboard-header">
          <Header isRunning={running} onStart={startSimulation} onStop={stopSimulation} />
          <div className="user-menu">
            <span className="user-name font-heading">
              Dr. {user?.name || user?.email || 'User'}
            </span>
            <button className="btn-logout" onClick={logout}>Logout</button>
          </div>
        </div>

        {/* Navigation */}
        <div className="dashboard-nav">
          <button className="nav-btn active" onClick={() => navigate('/dashboard')}>
            <span className="live-dot mr-2" style={{ width: 6, height: 6 }} />
            Live Dashboard
          </button>
          <button className="nav-btn" onClick={() => navigate('/analysis')}>
            File Analysis
          </button>
        </div>

        {/* Main Content */}
        <div className="main-content stagger-children">
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
    </>
  );
}
