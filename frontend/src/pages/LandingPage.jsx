import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, Activity, FileText, UserCheck } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function LandingPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleGoogleLogin = async () => {
    try {
      window.location.href = `${API_BASE}/auth/login`;
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed. Please try again.');
    }
  };

  return (
    <>
      {/* Animated background */}
      <div className="app-background">
        <div className="orb-3" />
        <div className="grid-overlay" />
      </div>

      <div className="landing-container">
        <div className="landing-content">
          <div className="landing-header">
            <div className="flex justify-center mb-6">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, rgba(34,197,94,0.15), rgba(21,128,61,0.15))',
                  border: '1px solid rgba(34,197,94,0.25)',
                  boxShadow: '0 0 30px rgba(34,197,94,0.15)',
                }}
              >
                <Brain size={32} className="text-[var(--accent-cyan)]" style={{ filter: 'drop-shadow(0 0 8px rgba(34,197,94,0.5))' }} />
              </div>
            </div>
            <h1>SNN-AI Cognitive Health & Learning Optimizer</h1>
            <p className="landing-subtitle">Professional Portal for Healthcare Providers</p>
          </div>

          <div className="landing-card">
            <h2>Doctor Login</h2>
            <p className="landing-description">
              Access advanced cognitive health analysis tools, upload patient EDF files,
              and generate comprehensive reports with AI-powered insights.
            </p>

            <button className="btn-google-login" onClick={handleGoogleLogin}>
              <svg className="google-icon" viewBox="0 0 24 24" width="20" height="20">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </button>

            <button className="btn-demo-login flex items-center justify-center gap-2" onClick={handleGoogleLogin}>
              <UserCheck size={18} />
              Continue as Demo Doctor (No OAuth Required)
            </button>

            <p className="landing-note">
              Secure OAuth authentication. Your data is protected and encrypted.
              <br />
              <small className="opacity-75">Demo mode available for testing without OAuth setup.</small>
            </p>
          </div>

          <div className="landing-features stagger-children">
            <div className="feature-item animate-slide-up">
              <div className="flex justify-center mb-3">
                <Activity size={28} className="text-[var(--accent-cyan)]" style={{ filter: 'drop-shadow(0 0 6px rgba(34,197,94,0.4))' }} />
              </div>
              <h3>Real-time Monitoring</h3>
              <p>Live cognitive state tracking and biometric visualization</p>
            </div>
            <div className="feature-item animate-slide-up">
              <div className="flex justify-center mb-3">
                <FileText size={28} className="text-[var(--accent-violet)]" style={{ filter: 'drop-shadow(0 0 6px rgba(21,128,61,0.4))' }} />
              </div>
              <h3>EDF File Analysis</h3>
              <p>Upload and analyze patient EEG data with advanced algorithms</p>
            </div>
            <div className="feature-item animate-slide-up">
              <div className="flex justify-center mb-3">
                <FileText size={28} className="text-[var(--accent-blue)]" style={{ filter: 'drop-shadow(0 0 6px rgba(5,150,105,0.4))' }} />
              </div>
              <h3>PDF Reports</h3>
              <p>Generate comprehensive analysis reports for patient records</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
