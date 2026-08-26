import GlowButton from './ui/GlowButton';
import { Play, Square, LogOut } from 'lucide-react';

export default function Header({ isRunning, onStart, onStop, onLogout }) {
  return (
    <header className="header-container">
      <div className="title-section">
        <h1>SNN-AI Cognitive Health & Learning Optimizer</h1>
        <p className="tagline">
          {isRunning && <span className="live-dot mr-2" />}
          Real-time insights for a personalized learning journey.
        </p>
      </div>
      <div className="header-controls">
        <GlowButton variant="cyan" onClick={onStart} disabled={isRunning}>
          <Play size={16} />
          Start Simulation
        </GlowButton>
        <GlowButton variant="danger" onClick={onStop} disabled={!isRunning}>
          <Square size={14} />
          Stop
        </GlowButton>
        {onLogout && (
          <GlowButton variant="ghost" onClick={onLogout}>
            <LogOut size={16} />
            Logout
          </GlowButton>
        )}
      </div>
    </header>
  );
}

