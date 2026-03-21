export default function Header({ isRunning, onStart, onStop }) {
  return (
    <header className="header-container">
      <div className="title-section">
        <h1>SNN-AI Cognitive Health & Learning Optimizer</h1>
        <p className="tagline">Real-time insights for a personalized learning journey.</p>
      </div>
      <div className="header-controls">
        <button className="btn-start" onClick={onStart} disabled={isRunning}>
          ▶ Start Simulation
        </button>
        <button className="btn-stop" onClick={onStop} disabled={!isRunning}>
          ⏹ Stop Simulation
        </button>
      </div>
    </header>
  );
}


