import React, { useState } from 'react';
import { Upload, Activity, Sparkles, Play, CheckCircle2, Brain } from 'lucide-react';
import FileUpload from './FileUpload';
import GlowButton from './ui/GlowButton';
import ProgressCalendar from './ProgressCalendar';

export default function UserOnboardingHub({ onUploadSuccess, onStartLiveStream, loading }) {
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' | 'live' | 'demo'

  return (
    <div className="user-onboarding-hub animate-fade-in">
      {/* Hero Welcome Banner */}
      <div className="onboarding-hero-banner p-8 rounded-2xl mb-8 bg-white border border-[var(--border-glass)] shadow-sm relative overflow-hidden">
        <div className="max-w-3xl z-10 relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-3">
            <Brain size={14} className="text-blue-600" />
            <span>Event-Driven SNN Cognitive Optimization</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold font-heading text-[var(--text-primary)] mb-2">
            Welcome to Your Cognitive Health Dashboard
          </h2>
          <p className="text-sm md:text-base text-[var(--text-secondary)] leading-relaxed">
            To provide accurate neural workload assessment and adaptive learning recommendations, the SNN engine requires an active EEG telemetry stream or an uploaded biometric recording.
          </p>
        </div>
      </div>

      {/* 3 Main Action Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Card 1: Upload EEG Recording */}
        <div 
          className={`source-selection-card p-6 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
            activeTab === 'upload' 
              ? 'bg-blue-50/40 border-blue-500 ring-2 ring-blue-500/20 shadow-md' 
              : 'bg-white border-[var(--border-glass)] hover:border-blue-300 shadow-sm'
          }`}
          onClick={() => setActiveTab('upload')}
        >
          <div>
            <div className="w-12 h-12 rounded-xl bg-blue-100/80 flex items-center justify-center text-blue-600 mb-4">
              <Upload size={24} />
            </div>
            <h3 className="font-heading font-bold text-lg text-[var(--text-primary)] mb-2">
              Upload EEG File
            </h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-4">
              Upload a recorded <code className="bg-slate-100 px-1 py-0.5 rounded text-blue-700 font-mono">.edf</code> or <code className="bg-slate-100 px-1 py-0.5 rounded text-blue-700 font-mono">.csv</code> file from clinical equipment or commercial EEG headbands.
            </p>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs font-medium text-blue-600">
            <span>Standard EDF / CSV format</span>
            <span className={`w-2 h-2 rounded-full ${activeTab === 'upload' ? 'bg-blue-600' : 'bg-slate-300'}`} />
          </div>
        </div>

        {/* Card 2: Live Real-Time Telemetry */}
        <div 
          className={`source-selection-card p-6 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
            activeTab === 'live' 
              ? 'bg-emerald-50/40 border-emerald-500 ring-2 ring-emerald-500/20 shadow-md' 
              : 'bg-white border-[var(--border-glass)] hover:border-emerald-300 shadow-sm'
          }`}
          onClick={() => setActiveTab('live')}
        >
          <div>
            <div className="w-12 h-12 rounded-xl bg-emerald-100/80 flex items-center justify-center text-emerald-600 mb-4">
              <Activity size={24} />
            </div>
            <h3 className="font-heading font-bold text-lg text-[var(--text-primary)] mb-2">
              Start Live Telemetry
            </h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-4">
              Connect to real-time wireless telemetry feeds or continuous bio-signal simulators to track live focus and stress shifts.
            </p>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs font-medium text-emerald-600">
            <span>WebSocket Live Stream (1.5s)</span>
            <span className={`w-2 h-2 rounded-full ${activeTab === 'live' ? 'bg-emerald-600' : 'bg-slate-300'}`} />
          </div>
        </div>

        {/* Card 3: Explore Sample Case Studies */}
        <div 
          className={`source-selection-card p-6 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
            activeTab === 'demo' 
              ? 'bg-purple-50/40 border-purple-500 ring-2 ring-purple-500/20 shadow-md' 
              : 'bg-white border-[var(--border-glass)] hover:border-purple-300 shadow-sm'
          }`}
          onClick={() => setActiveTab('demo')}
        >
          <div>
            <div className="w-12 h-12 rounded-xl bg-purple-100/80 flex items-center justify-center text-purple-600 mb-4">
              <Sparkles size={24} />
            </div>
            <h3 className="font-heading font-bold text-lg text-[var(--text-primary)] mb-2">
              Explore Demo Datasets
            </h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-4">
              Quickly preview the SNN recommender with pre-loaded clinical scenarios (Exam Stress Crunch, Deep Focus Baseline, Recovery).
            </p>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs font-medium text-purple-600">
            <span>Instant Pre-computed Cases</span>
            <span className={`w-2 h-2 rounded-full ${activeTab === 'demo' ? 'bg-purple-600' : 'bg-slate-300'}`} />
          </div>
        </div>
      </div>

      {/* Selected Action Panel Content */}
      <div className="action-panel-container bg-white p-8 rounded-2xl border border-[var(--border-glass)] shadow-sm mb-10">
        {activeTab === 'upload' && (
          <div className="upload-view-panel animate-fade-in">
            <FileUpload onUploadSuccess={onUploadSuccess} />
          </div>
        )}

        {activeTab === 'live' && (
          <div className="live-stream-panel text-center py-8 animate-fade-in max-w-xl mx-auto">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mx-auto mb-4">
              <Activity size={32} />
            </div>
            <h3 className="text-xl font-bold font-heading mb-2 text-[var(--text-primary)]">
              Real-Time SNN Telemetry Stream
            </h3>
            <p className="text-sm text-[var(--text-secondary)] mb-6 leading-relaxed">
              Launch continuous bio-sensor ingestion. The SNN neural engine will classify your live cognitive state (Alpha/Beta power, LF/HF ratio, Heart Rate) and recommend tasks in real time.
            </p>
            <GlowButton 
              variant="cyan" 
              onClick={onStartLiveStream} 
              disabled={loading}
              className="px-8 py-3 text-base mx-auto inline-flex items-center gap-2 shadow-lg"
            >
              <Play size={18} />
              <span>Launch Live Telemetry Session</span>
            </GlowButton>
          </div>
        )}

        {activeTab === 'demo' && (
          <div className="demo-view-panel animate-fade-in">
            <FileUpload onUploadSuccess={onUploadSuccess} />
          </div>
        )}
      </div>

      {/* User Progress Calendar (Historical Record) */}
      <div className="progress-history-section">
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle2 size={18} className="text-blue-600" />
          <h3 className="text-base font-bold font-heading text-[var(--text-primary)]">
            Personal Progress & Activity History
          </h3>
        </div>
        <ProgressCalendar />
      </div>
    </div>
  );
}
