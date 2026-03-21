import { useState, useEffect, useMemo } from 'react';
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend } from 'recharts';
import { useAuth } from '../context/AuthContext';
import FileUpload from '../components/FileUpload';
import { Download, ArrowLeft, RotateCcw } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'];

// Pure utility function - format timestamp
const formatTimestamp = (ts) => {
  // If timestamp is a Unix timestamp (large number), convert it
  // Otherwise, treat it as elapsed seconds and format as time
  if (ts > 1000000000) {
    return new Date(ts * 1000).toLocaleTimeString();
  }
  // Format as elapsed time: "0:00", "0:01", "1:23", etc.
  const minutes = Math.floor(ts / 60);
  const seconds = Math.floor(ts % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

export default function AnalysisView() {
  const { uploadId } = useParams();
  const navigate = useNavigate();
  const { getAuthHeaders } = useAuth();
  const [analysisData, setAnalysisData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [chartKey, setChartKey] = useState(0);

  useEffect(() => {
    if (uploadId) {
      loadAnalysis(uploadId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uploadId]);

  // Reset chart key when new data is loaded to trigger animation
  useEffect(() => {
    if (analysisData && analysisData.time_series && analysisData.time_series.length > 0) {
      setChartKey(prev => prev + 1);
    }
  }, [analysisData]);

  const loadAnalysis = async (id) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/api/analysis/${id}`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error('Failed to load analysis');
      const data = await res.json();
      setAnalysisData(data);
    } catch (err) {
      setError(err.message || 'Failed to load analysis');
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async () => {
    if (!uploadId) return;
    try {
      const res = await fetch(`${API_BASE}/api/analysis/${uploadId}/export-pdf`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || 'Failed to generate PDF');
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analysis_${uploadId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Failed to export PDF: ' + err.message);
    }
  };

  const timeSeries = analysisData?.time_series || [];
  const extended = analysisData?.extended_analysis || {};
  const patterns = extended.patterns || {};
  const freqDomain = extended.frequency_domain || {};
  const stats = extended.statistics || {};

  // Format all data for display - similar to real-time dashboard
  // MUST be called before any early returns (React hooks rule)
  const displayData = useMemo(() => {
    if (!analysisData || !timeSeries.length) {
      return [];
    }
    return timeSeries.map(t => ({
      timestamp: formatTimestamp(t.timestamp),
      alpha: t.alpha,
      beta: t.beta,
      heartRate: t.heart_rate || 0,
      state: t.cognitive_state,
    }));
  }, [timeSeries, analysisData]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">Loading analysis...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-container">
        <div className="error-message">{error}</div>
        <FileUpload onUploadSuccess={(id) => navigate(`/analysis/${id}`)} />
      </div>
    );
  }

  if (!analysisData) {
    return (
      <div className="app-container">
        <div className="analysis-header">
          <button className="btn-back" onClick={() => navigate('/dashboard')}>
            <ArrowLeft size={20} />
            Back to Dashboard
          </button>
          <h1>File Analysis</h1>
        </div>
        <FileUpload onUploadSuccess={(id) => navigate(`/analysis/${id}`)} />
      </div>
    );
  }

  const handleReplayAnimation = () => {
    setChartKey(prev => prev + 1);
  };

  // State distribution for pie chart
  const stateDistribution = Object.entries(patterns.state_distribution || {}).map(([name, value]) => ({
    name,
    value,
  }));

  // Frequency domain data
  const freqData = (freqDomain.frequencies || []).slice(0, 50).map((freq, i) => ({
    frequency: freq,
    alphaPower: (freqDomain.alpha_power || [])[i] || 0,
    betaPower: (freqDomain.beta_power || [])[i] || 0,
  }));

  return (
    <div className="app-container">
      <div className="analysis-header">
        <button className="btn-back" onClick={() => navigate('/dashboard')}>
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>
        <h1>File Analysis: {analysisData.filename || 'EDF File'}</h1>
        {uploadId && (
          <button className="btn-export-pdf" onClick={handleExportPDF}>
            <Download size={20} />
            Export PDF
          </button>
        )}
      </div>

      <div className="analysis-content">
        <div className="analysis-left">
          <div className="analysis-card">
            <div className="chart-header-controls">
              <h3>Time Series Analysis</h3>
              {timeSeries.length > 0 && (
                <div className="animation-controls">
                  <button 
                    className="btn-animation" 
                    onClick={handleReplayAnimation}
                    title="Replay Animation"
                  >
                    <RotateCcw size={16} />
                    Replay
                  </button>
                </div>
              )}
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart 
                key={`chart-${chartKey}`}
                data={displayData}
                margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
              >
                <XAxis dataKey="timestamp" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis 
                  yAxisId="left" 
                  stroke="#64748b" 
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  domain={[0, 2]}
                  label={{ value: 'Alpha/Beta', angle: -90, position: 'insideLeft', fill: '#94a3b8' }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="#f59e0b"
                  tick={{ fill: '#f59e0b', fontSize: 11 }}
                  domain={['dataMin', 'dataMax']}
                  label={{ value: 'Heart Rate (BPM)', angle: 90, position: 'insideRight', fill: '#f59e0b' }}
                />
                <Tooltip />
                <Legend />
                <Line 
                  yAxisId="left" 
                  type="monotone" 
                  dataKey="alpha" 
                  stroke="#3b82f6" 
                  name="Relaxation (Alpha)" 
                  dot={false}
                  isAnimationActive={true}
                  animationDuration={300}
                  strokeWidth={2.5}
                />
                <Line 
                  yAxisId="left" 
                  type="monotone" 
                  dataKey="beta" 
                  stroke="#ef4444" 
                  name="Focus (Beta)" 
                  dot={false}
                  isAnimationActive={true}
                  animationDuration={300}
                  strokeWidth={2.5}
                />
                <Line 
                  yAxisId="right" 
                  type="monotone" 
                  dataKey="heartRate" 
                  stroke="#f59e0b" 
                  name="Heart Rate (BPM)" 
                  dot={false}
                  isAnimationActive={true}
                  animationDuration={300}
                  strokeWidth={2.5}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {freqData.length > 0 && (
            <div className="analysis-card">
              <h3>Frequency Domain (FFT)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={freqData}>
                  <XAxis dataKey="frequency" stroke="#64748b" label={{ value: 'Frequency (Hz)', position: 'insideBottom' }} />
                  <YAxis stroke="#64748b" label={{ value: 'Power', angle: -90 }} />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="alphaPower" 
                    stroke="#3b82f6" 
                    name="Alpha Power" 
                    dot={false}
                    isAnimationActive={true}
                    animationDuration={1000}
                    animationEasing="ease-in-out"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="betaPower" 
                    stroke="#ef4444" 
                    name="Beta Power" 
                    dot={false}
                    isAnimationActive={true}
                    animationDuration={1000}
                    animationEasing="ease-in-out"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="analysis-right">
          {stateDistribution.length > 0 && (
            <div className="analysis-card">
              <h3>State Distribution</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={stateDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {stateDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="analysis-card">
            <h3>Extended Insights</h3>
            <div className="insights-content">
              {extended.insights_text && extended.insights_text.map((insight, i) => (
                <p key={i} className="insight-item">{insight}</p>
              ))}
            </div>
          </div>

          <div className="analysis-card">
            <h3>Pattern Detection</h3>
            <div className="pattern-stats">
              <div className="stat-item">
                <span className="stat-label">Stress Events:</span>
                <span className="stat-value">{patterns.stress_event_count || 0}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Focus Periods:</span>
                <span className="stat-value">{patterns.focus_period_count || 0}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">State Transitions:</span>
                <span className="stat-value">{patterns.transition_count || 0}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Dominant State:</span>
                <span className="stat-value">{patterns.dominant_state || 'N/A'}</span>
              </div>
            </div>
          </div>

          {stats.alpha && (
            <div className="analysis-card">
              <h3>Statistical Summary</h3>
              <div className="stats-grid">
                <div className="stat-box">
                  <div className="stat-title">Alpha</div>
                  <div className="stat-detail">Mean: {stats.alpha.mean?.toFixed(3)}</div>
                  <div className="stat-detail">Std: {stats.alpha.std?.toFixed(3)}</div>
                  <div className="stat-detail">Range: {stats.alpha.min?.toFixed(3)} - {stats.alpha.max?.toFixed(3)}</div>
                </div>
                <div className="stat-box">
                  <div className="stat-title">Beta</div>
                  <div className="stat-detail">Mean: {stats.beta.mean?.toFixed(3)}</div>
                  <div className="stat-detail">Std: {stats.beta.std?.toFixed(3)}</div>
                  <div className="stat-detail">Range: {stats.beta.min?.toFixed(3)} - {stats.beta.max?.toFixed(3)}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

