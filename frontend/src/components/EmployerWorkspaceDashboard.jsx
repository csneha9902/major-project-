import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CollaborationDashboard from './collaboration/CollaborationDashboard';
import AddPatientModal from './AddPatientModal';
import EmailReportModal from './EmailReportModal';
import {
  Users,
  Calendar as CalendarIcon,
  Activity,
  FileText,
  Search,
  Filter,
  Plus,
  ArrowUpRight,
  Clock,
  Heart,
  Brain,
  ChevronRight,
  LogOut,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  Lock,
  Download,
  Building2,
  CheckCircle2,
  AlertTriangle,
  Stethoscope,
  X,
  Eye,
  ArrowLeft,
  User,
  ShieldCheck,
  AlertCircle,
  FileCheck,
  TrendingUp,
  Layers,
  Sparkles,
  Mail,
  UserPlus
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Legend
} from 'recharts';

// Helper to format date YYYY-MM-DD
const formatDateKey = (d) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const FALLBACK_PATIENTS = [
  {
    id: "PAT-10492",
    name: "Eleanor Vance",
    age: 34,
    gender: "Female",
    bloodType: "A+",
    attendingDoctor: "Dr. Sarah Jenkins, MD (Neuropsychiatry)",
    cognitiveState: "Stressed",
    snnRiskScore: 84,
    betaAlphaRatio: "2.84 (Spike)",
    heartRate: 98,
    sessionDate: "Aug 26, 2026",
    sessionTime: "10:15 AM",
    edfStatus: "Processed",
    chiefComplaint: "Hyper-arousal insomnia and acute cognitive fatigue",
    checkupProblems: ["High Beta wave elevation (>28Hz)", "Working memory degradation", "Sympathetic dominance"],
    diagnosis: "ICD-11: 6C40 Cognitive Overload Syndrome",
    doctorNotes: "Prescribed 15-min sensory rest intervals and biofeedback protocol.",
    icdCode: "ICD-11: 6C40",
    treatmentPlan: "Daily 4-7-8 breathing and SNN-guided Tier 1 reduced task difficulty.",
    recordedSessions: [
      { id: "SES-8821", date: "Aug 26, 2026", time: "10:15 AM", duration: "45 min", snnScore: 84, state: "Stressed", notes: "Acute Beta power elevation" },
      { id: "SES-8790", date: "Aug 24, 2026", time: "09:00 AM", duration: "30 min", snnScore: 42, state: "Neutral", notes: "Normal baseline recording" }
    ],
    graphData: [
      { time: "10:00", snnSpikes: 45, heartRate: 78 },
      { time: "10:15", snnSpikes: 84, heartRate: 98 },
      { time: "10:30", snnSpikes: 62, heartRate: 88 }
    ],
    waveSpectrum: [
      { wave: "Delta", power: 12 },
      { wave: "Theta", power: 18 },
      { wave: "Alpha", power: 35 },
      { wave: "Beta", power: 92 },
      { wave: "Gamma", power: 28 }
    ]
  },
  {
    id: "PAT-10493",
    name: "James Wilson",
    age: 42,
    gender: "Male",
    bloodType: "O+",
    attendingDoctor: "Dr. Marcus Vance, MD (Clinical Neurology)",
    cognitiveState: "Focused",
    snnRiskScore: 22,
    betaAlphaRatio: "0.65 (Optimal)",
    heartRate: 68,
    sessionDate: "Aug 26, 2026",
    sessionTime: "11:30 AM",
    edfStatus: "Processed",
    chiefComplaint: "Post-concussion cognitive endurance monitoring",
    checkupProblems: ["Sustained attention recovery", "Alpha rhythm synchronization"],
    diagnosis: "ICD-11: NA07.0 Post-Concussive State",
    doctorNotes: "Steady recovery. High alpha dominance indicates excellent task focus.",
    icdCode: "ICD-11: NA07.0",
    treatmentPlan: "Gradual progression to Tier 4 high-complexity study tasks.",
    recordedSessions: [
      { id: "SES-8822", date: "Aug 26, 2026", time: "11:30 AM", duration: "60 min", snnScore: 22, state: "Focused", notes: "Sustained alpha focus" }
    ],
    graphData: [
      { time: "11:00", snnSpikes: 20, heartRate: 66 },
      { time: "11:30", snnSpikes: 22, heartRate: 68 }
    ],
    waveSpectrum: [
      { wave: "Delta", power: 8 },
      { wave: "Theta", power: 14 },
      { wave: "Alpha", power: 88 },
      { wave: "Beta", power: 32 },
      { wave: "Gamma", power: 15 }
    ]
  },
  {
    id: "PAT-10494",
    name: "Sophia Martinez",
    age: 29,
    gender: "Female",
    bloodType: "B+",
    attendingDoctor: "Dr. Sarah Jenkins, MD (Neuropsychiatry)",
    cognitiveState: "Neutral",
    snnRiskScore: 35,
    betaAlphaRatio: "1.10 (Normal)",
    heartRate: 72,
    sessionDate: "Aug 26, 2026",
    sessionTime: "02:00 PM",
    edfStatus: "Processed",
    chiefComplaint: "Shift work sleep disorder and circadian fatigue",
    checkupProblems: ["Theta wave drowsiness dips", "Mild baseline fatigue"],
    diagnosis: "ICD-11: 7A20 Shift Work Disorder",
    doctorNotes: "Stable cognitive metrics with periodic theta power rises.",
    icdCode: "ICD-11: 7A20",
    treatmentPlan: "Tier 3 steady-pace problem solving with scheduled breaks.",
    recordedSessions: [
      { id: "SES-8823", date: "Aug 26, 2026", time: "02:00 PM", duration: "40 min", snnScore: 35, state: "Neutral", notes: "Normal baseline session" }
    ],
    graphData: [
      { time: "14:00", snnSpikes: 30, heartRate: 70 },
      { time: "14:20", snnSpikes: 35, heartRate: 72 }
    ],
    waveSpectrum: [
      { wave: "Delta", power: 15 },
      { wave: "Theta", power: 25 },
      { wave: "Alpha", power: 65 },
      { wave: "Beta", power: 45 },
      { wave: "Gamma", power: 18 }
    ]
  }
];

export default function EmployerWorkspaceDashboard({ onLogout }) {
  const navigate = useNavigate();
  const { getAuthHeaders } = useAuth();
  const [patients, setPatients] = useState(FALLBACK_PATIENTS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('patients'); // 'patients' | 'calendar' | 'patient-detail' | 'collaboration'
  const [searchQuery, setSearchQuery] = useState('');
  const [filterState, setFilterState] = useState('ALL'); // 'ALL' | 'Stressed' | 'Focused' | 'Neutral'
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [addPatientModalOpen, setAddPatientModalOpen] = useState(false);
  const [emailReportModalOpen, setEmailReportModalOpen] = useState(false);
  const [reportModalData, setReportModalData] = useState({ uploadId: 'demo_session_focus', filename: 'EEG_Session.edf', recipientName: '', recipientEmail: '' });

  const fetchPatients = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/patients/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (result && result.patients && result.patients.length > 0) {
        const transformedPatients = result.patients.map(patient => {
          const isEleanor = (patient.name || '').toLowerCase().includes('eleanor');
          const isJames = (patient.name || '').toLowerCase().includes('james');
          return {
            id: patient.patient_id || 'PAT-1000',
            name: patient.name || 'Patient Record',
            age: patient.age || 30,
            gender: patient.gender || 'Female',
            bloodType: patient.blood_type || 'A+',
            attendingDoctor: patient.primary_care_physician || 'Dr. Sarah Jenkins, MD',
            cognitiveState: patient.cognitive_state || (isEleanor ? 'Stressed' : isJames ? 'Focused' : 'Neutral'),
            snnRiskScore: patient.snn_risk_score || (isEleanor ? 84 : isJames ? 22 : 35),
            betaAlphaRatio: patient.beta_alpha_ratio || (isEleanor ? '2.84 (Spike)' : isJames ? '0.65 (Optimal)' : '1.05 (Normal)'),
            heartRate: patient.heart_rate_bpm || (isEleanor ? 98 : isJames ? 68 : 72),
            sessionDate: patient.session_date || 'Aug 26, 2026',
            sessionTime: patient.session_time || '10:00 AM',
            edfStatus: patient.edf_status || 'Processed',
            chiefComplaint: patient.medical_history || patient.chief_complaint || 'Routine neurological examination',
            checkupProblems: patient.checkup_problems || ['Baseline cognitive assessment', 'Telemetry calibration'],
            diagnosis: patient.diagnosis || (isEleanor ? 'ICD-11: 6C40 Cognitive Overload' : isJames ? 'ICD-11: NA07.0 Post-Concussive State' : 'ICD-11: QA02.3 Routine Check'),
            doctorNotes: patient.doctor_notes || 'Patient active in clinical monitoring.',
            icdCode: patient.icd_code || (isEleanor ? 'ICD-11: 6C40' : isJames ? 'ICD-11: NA07.0' : 'ICD-11: QA02.3'),
            treatmentPlan: patient.treatment_plan || 'SNN-guided cognitive load monitoring and adaptive learning task pacing.',
            recordedSessions: patient.recorded_sessions || [
              { id: `SES-${patient.patient_id?.replace('PAT-', '') || '1001'}`, date: 'Aug 26, 2026', time: '10:00 AM', duration: '45 min', snnScore: isEleanor ? 84 : 35, state: isEleanor ? 'Stressed' : 'Neutral', notes: 'Clinical EEG session' }
            ],
            graphData: patient.graph_data || [
              { time: '10:00', snnSpikes: isEleanor ? 60 : 20, heartRate: 72 },
              { time: '10:15', snnSpikes: isEleanor ? 84 : 30, heartRate: 76 }
            ],
            waveSpectrum: patient.wave_spectrum || [
              { wave: 'Delta', power: 12 },
              { wave: 'Theta', power: 18 },
              { wave: 'Alpha', power: isJames ? 88 : 35 },
              { wave: 'Beta', power: isEleanor ? 92 : 30 },
              { wave: 'Gamma', power: 15 }
            ]
          };
        });
        setPatients(transformedPatients);
      } else {
        setPatients(FALLBACK_PATIENTS);
      }
    } catch (err) {
      console.warn('API fetch failed, loading clinical dataset fallback:', err);
      setPatients(FALLBACK_PATIENTS);
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  // Fetch patient data from API on mount
  useEffect(() => {
    fetchPatients();
  }, []);

  // Calendar State
  const [todayDate] = useState(() => new Date(2026, 7, 26)); // Fixed anchor date Aug 26, 2026
  const [currentMonthDate, setCurrentMonthDate] = useState(() => new Date(2026, 7, 1));
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(() => new Date(2026, 7, 26));

  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Filter patients list based on search and state pill
  const filteredPatients = patients.filter(p => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.diagnosis && p.diagnosis.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesFilter = filterState === 'ALL' || p.cognitiveState === filterState;

    return matchesSearch && matchesFilter;
  });

  // Get patients list scheduled for selected calendar date
  const selectedDateKey = formatDateKey(selectedCalendarDate);
  const patientsForSelectedDate = patients.filter(p => p.sessionDate === selectedDateKey);

  const isFutureDate = selectedCalendarDate > todayDate;

  // Open detailed psychiatric window for a patient
  const handleOpenPatientDetail = (patient) => {
    setSelectedPatient(patient);
    setActiveTab('patient-detail');
  };

  return (
    <div className="employer-workspace-container">
      {/* 1. Left Sidebar Navigation (ClickUp inspired clinical workspace) */}
      <aside className="workspace-sidebar">
        <div className="sidebar-brand">
          <div className="brand-logo shadow-sm">
            <Building2 size={22} className="text-blue-500" />
          </div>
          <div className="brand-text">
            <h4>St. Jude Health</h4>
            <span className="badge-clinical">Clinical Workspace</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-title">MAIN NAVIGATION</div>
          <button
            className={`nav-item ${activeTab === 'patients' || activeTab === 'patient-detail' ? 'active' : ''}`}
            onClick={() => { setActiveTab('patients'); setSelectedPatient(null); }}
          >
            <Users size={18} />
            <span>Patients Directory</span>
            <span className="badge-count">{patients.length}</span>
          </button>

          <button
            className={`nav-item ${activeTab === 'calendar' ? 'active' : ''}`}
            onClick={() => setActiveTab('calendar')}
          >
            <CalendarIcon size={18} />
            <span>Calendar Schedule</span>
            {patientsForSelectedDate.length > 0 && (
              <span className="badge-dot" title="Active Sessions" />
            )}
          </button>

          <button
            className="nav-item"
            onClick={() => navigate('/analysis')}
          >
            <Activity size={18} />
            <span>EDF Wave Analysis</span>
            <ArrowUpRight size={14} className="ml-auto opacity-60" />
          </button>

          <button
            className={`nav-item ${activeTab === 'collaboration' ? 'active' : ''}`}
            onClick={() => setActiveTab('collaboration')}
          >
            <Users size={18} className="text-blue-500" />
            <span>Care Team Collaboration</span>
          </button>

          {activeTab === 'patient-detail' && selectedPatient && (
            <div className="active-patient-subnav animate-fade-in">
              <div className="subnav-header">SELECTED PATIENT</div>
              <div className="subnav-patient-card">
                <Brain size={16} className="text-blue-600 flex-shrink-0" />
                <div className="truncate">
                  <div className="font-bold text-xs truncate">{selectedPatient.name}</div>
                  <div className="text-[0.68rem] text-blue-600">{selectedPatient.id}</div>
                </div>
              </div>
            </div>
          )}

          <div className="nav-section-title mt-6">QUICK ACTIONS</div>
          <button
            className="nav-item text-blue-500"
            onClick={() => navigate('/analysis')}
          >
            <Plus size={18} />
            <span>Upload New EDF File</span>
          </button>

          <button
            className="nav-item"
            onClick={() => alert("Report export feature initialized.")}
          >
            <FileText size={18} />
            <span>Clinical Reports</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="doctor-profile-card">
            <div className="doctor-avatar">
              <Stethoscope size={18} className="text-blue-500" />
            </div>
            <div className="doctor-info">
              <span className="doc-name">Dr. Hospital Admin</span>
              <span className="doc-role">Head of Neuropsychiatry</span>
            </div>
          </div>

          <button className="btn-sidebar-logout" onClick={onLogout} title="Log Out">
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* 2. Main Body Area */}
      <main className="workspace-main">
        {/* Workspace Top Header Bar */}
        <header className="workspace-topbar">
          <div className="topbar-left">
            <h2 className="topbar-title">
              {activeTab === 'patients' && 'Patients Directory & SNN Monitoring'}
              {activeTab === 'calendar' && 'Clinical Calendar & Patient Schedule'}
              {activeTab === 'patient-detail' && 'Psychiatric Clinical Assessment & Patient Record'}
              {activeTab === 'collaboration' && 'Care Team Collaboration & Communication'}
            </h2>
            <p className="topbar-subtitle">
              {activeTab === 'patients' && 'Manage patient neurological records, EDF EEG analyses, and SNN stress scores'}
              {activeTab === 'calendar' && 'Select dates to view scheduled patient EEG sessions and diagnostic logs'}
              {activeTab === 'patient-detail' && selectedPatient && `Comprehensive neurological profile, check-up issues, EEG graphs, and session logs for ${selectedPatient.name}`}
              {activeTab === 'collaboration' && 'Secure messaging, task management, and shared notes for care team coordination'}
            </p>
          </div>

          <div className="topbar-actions">
            {activeTab === 'patient-detail' ? (
              <button
                className="btn-back-directory"
                onClick={() => setActiveTab('patients')}
              >
                <ArrowLeft size={16} />
                <span>Back to Patients Directory</span>
              </button>
            ) : (
              <button
                className={`topbar-icon-btn ${activeTab === 'calendar' ? 'active' : ''}`}
                onClick={() => setActiveTab(activeTab === 'calendar' ? 'patients' : 'calendar')}
                title="Toggle Clinical Calendar Screen"
              >
                <CalendarIcon size={20} />
                <span className="icon-btn-label">Calendar View</span>
              </button>
            )}

            <button className="topbar-logout-btn" onClick={onLogout}>
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        </header>

        {/* TAB 1: PATIENTS DIRECTORY (LIST VIEW) */}
        {activeTab === 'patients' && (
          <div className="workspace-content animate-fade-in">
            {/* Loading State */}
            {loading && (
              <div className="loading-container">
                <div className="loading-spinner" />
                <p>Loading patient data...</p>
              </div>
            )}

            {/* Error State */}
            {error && !loading && (
              <div className="error-container">
                <AlertTriangle size={20} className="text-red-500 mb-2" />
                <p className="text-red-500">{error}</p>
                <button
                  className="btn-retry"
                  onClick={() => fetchPatients()}
                >
                  Retry
                </button>
              </div>
            )}

            {/* Show content when not loading and no error */}
            {!loading && !error && (
              <>
                {/* Search & Filter Control Bar */}
                <div className="controls-bar flex flex-wrap items-center justify-between gap-3">
                  <div className="search-box">
                    <Search size={18} className="search-icon" />
                    <input
                      type="text"
                      placeholder="Search by patient name, ID, or diagnosis..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                      <button className="clear-search" onClick={() => setSearchQuery('')}>
                        <X size={14} />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="filter-pills">
                      <button
                        className={`filter-pill ${filterState === 'ALL' ? 'active' : ''}`}
                        onClick={() => setFilterState('ALL')}
                      >
                        All Patients ({patients.length})
                      </button>
                      <button
                        className={`filter-pill stressed ${filterState === 'Stressed' ? 'active' : ''}`}
                        onClick={() => setFilterState('Stressed')}
                      >
                        Stressed (High Risk)
                      </button>
                      <button
                        className={`filter-pill focused ${filterState === 'Focused' ? 'active' : ''}`}
                        onClick={() => setFilterState('Focused')}
                      >
                        Focused
                      </button>
                      <button
                        className={`filter-pill neutral ${filterState === 'Neutral' ? 'active' : ''}`}
                        onClick={() => setFilterState('Neutral')}
                      >
                        Neutral / Rest
                      </button>
                    </div>

                    <button
                      className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all hover:scale-105 active:scale-95"
                      onClick={() => setAddPatientModalOpen(true)}
                    >
                      <UserPlus size={15} />
                      <span>Register Patient</span>
                    </button>
                  </div>
                </div>

            {/* Patients List Table Card */}
            <div className="table-card">
              <table className="patients-table">
                <thead>
                  <tr>
                    <th>Patient Info</th>
                    <th>Cognitive State</th>
                    <th>SNN Risk Score</th>
                    <th>EEG Metrics</th>
                    <th>Session Date & Time</th>
                    <th>EDF Status</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPatients.length > 0 ? (
                    filteredPatients.map(p => (
                      <tr key={p.id} className="patient-row">
                        <td>
                          <div className="patient-name-block">
                            <span className="patient-name">{p.name || 'Unknown'}</span>
                            <span className="patient-meta">{p.id} • {(p.age || 0)} yrs • {(p.gender || 'Unknown')}</span>
                          </div>
                        </td>
                        <td>
                          <span className={`status-badge ${(p.cognitiveState || 'Neutral').toLowerCase()}`}>
                            {(p.cognitiveState || 'Neutral') === 'Stressed' && <AlertTriangle size={12} />}
                            {(p.cognitiveState || 'Neutral') === 'Focused' && <CheckCircle2 size={12} />}
                            {(p.cognitiveState || 'Neutral')}
                          </span>
                        </td>
                        <td>
                          <div className="risk-score-wrapper">
                            <div className="risk-bar-container">
                              <div
                                className={`risk-bar ${(p.snnRiskScore || 0) > 70 ? 'high' : (p.snnRiskScore || 0) > 40 ? 'med' : 'low'}`}
                                style={{ width: `${(p.snnRiskScore || 0)}%` }}
                              />
                            </div>
                            <span className="risk-value">{(p.snnRiskScore || 0)}% SNN Spike</span>
                          </div>
                        </td>
                        <td>
                          <div className="metrics-cell">
                            <span className="metric-tag">Beta/Alpha: <strong>{(p.betaAlphaRatio || '1.0')}</strong></span>
                            <span className="metric-tag">HR: <strong>{(p.heartRate || 0)} BPM</strong></span>
                          </div>
                        </td>
                        <td>
                          <div className="time-cell">
                            <Clock size={13} className="text-blue-600" />
                            <span>{(p.sessionDate || '')} at {(p.sessionTime || '')}</span>
                          </div>
                        </td>
                        <td>
                          <span className="edf-badge">
                            {(p.edfStatus || 'Not Uploaded')}
                          </span>
                        </td>
                        <td>
                          <div className="actions-cell">
                            <button
                              className="btn-action-view"
                              onClick={() => handleOpenPatientDetail(p)}
                              title="Open Full Clinical Patient Details Window"
                            >
                              <Eye size={15} />
                              <span>Details</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="no-data-cell">
                        No patient records found matching your query.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    )}

        {/* TAB 2: CALENDAR SCHEDULE SCREEN */}
        {activeTab === 'calendar' && (
          <div className="workspace-content animate-fade-in">
            {/* Loading State for Calendar */}
            {loading && (
              <div className="loading-container">
                <div className="loading-spinner" />
                <p>Loading calendar data...</p>
              </div>
            )}

            {/* Error State for Calendar */}
            {error && !loading && (
              <div className="error-container">
                <AlertTriangle size={20} className="text-red-500 mb-2" />
                <p className="text-red-500">{error}</p>
                <button
                  className="btn-retry"
                  onClick={() => {
                    setLoading(true);
                    setError(null);
                    window.location.reload();
                  }}
                >
                  Retry
                </button>
              </div>
            )}

            {/* Show calendar content when not loading and no error */}
            {!loading && !error && (
              <div className="calendar-grid-container">
              {/* Left Calendar Controls */}
              <div className="calendar-card">
                <div className="calendar-month-header">
                  <h3>{monthNames[month]} {year}</h3>
                  <div className="calendar-nav-buttons">
                    <button
                      onClick={() => setCurrentMonthDate(new Date(year, month - 1, 1))}
                      className="cal-btn"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <button
                      onClick={() => setCurrentMonthDate(new Date(year, month + 1, 1))}
                      className="cal-btn"
                    >
                      <ChevronRightIcon size={18} />
                    </button>
                  </div>
                </div>

                {/* Days Header */}
                <div className="calendar-days-header">
                  <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
                </div>

                {/* Dates Matrix */}
                <div className="calendar-dates-grid">
                  {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
                    <div key={`blank-${idx}`} className="date-cell blank" />
                  ))}

                  {Array.from({ length: daysInMonth }).map((_, idx) => {
                    const dayNum = idx + 1;
                    const dateObj = new Date(year, month, dayNum);
                    const dateKey = formatDateKey(dateObj);
                    const isSelected = dateKey === selectedDateKey;
                    const isToday = dateKey === formatDateKey(todayDate);
                    const isFuture = dateObj > todayDate;
                    const hasPatients = patients.some(p => p.sessionDate === dateKey);

                    return (
                      <button
                        key={dateKey}
                        className={`date-cell ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''} ${isFuture ? 'future-locked' : ''} ${hasPatients ? 'has-patients' : ''}`}
                        onClick={() => setSelectedCalendarDate(dateObj)}
                        title={isFuture ? `Date ${dayNum} is in the future (Locked Session)` : `View sessions for ${dateKey}`}
                      >
                        <span className="day-number">{dayNum}</span>
                        {hasPatients && <span className="patient-dot" />}
                        {isFuture && <Lock size={10} className="lock-icon-subtle" />}
                      </button>
                    );
                  })}
                </div>

                <div className="calendar-legend">
                  <div className="legend-item"><span className="dot active-dot" /> Patients Scheduled</div>
                  <div className="legend-item"><span className="legend-today-outline" /> Today (Blue Outline)</div>
                  <div className="legend-item"><span className="legend-locked-box"><Lock size={10} /></span> Future Date (Locked)</div>
                </div>
              </div>

              {/* Right Side: List of Patients for Selected Date & Time */}
              <div className="date-patients-card">
                <div className="date-card-header">
                  <div>
                    <span className="sub-tag">SELECTED DATE SESSION LOG</span>
                    <h3>Patients on {selectedCalendarDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</h3>
                  </div>
                  <span className="count-badge">{patientsForSelectedDate.length} Patients Recorded</span>
                </div>

                <div className="date-patients-list">
                  {patientsForSelectedDate.length > 0 ? (
                    patientsForSelectedDate.map(p => (
                      <div key={p.id} className="date-patient-item">
                        <div className="patient-item-header">
                          <div className="patient-main-info">
                            <span className="patient-time">{p.sessionTime}</span>
                            <span className="patient-name-title">{p.name}</span>
                            <span className="patient-id-tag">({p.id})</span>
                          </div>
                          <span className={`status-badge ${p.cognitiveState.toLowerCase()}`}>
                            {p.cognitiveState}
                          </span>
                        </div>

                        <div className="patient-item-details">
                          <div className="detail-chip">
                            <Brain size={13} className="text-blue-600" />
                            <span>Beta/Alpha: <strong>{p.betaAlphaRatio}</strong></span>
                          </div>
                          <div className="detail-chip">
                            <Heart size={13} className="text-red-500" />
                            <span>Heart Rate: <strong>{p.heartRate} BPM</strong></span>
                          </div>
                          <div className="detail-chip">
                            <Activity size={13} className="text-blue-600" />
                            <span>SNN Risk: <strong>{p.snnRiskScore}%</strong></span>
                          </div>
                        </div>

                        <p className="patient-item-diagnosis">
                          <strong>Diagnosis:</strong> {p.diagnosis}
                        </p>
                        <p className="patient-item-notes">
                          <strong>Doctor Notes:</strong> {p.doctorNotes}
                        </p>

                        <div className="patient-item-actions">
                          <button
                            className="btn-link-action"
                            onClick={() => handleOpenPatientDetail(p)}
                          >
                            <Eye size={14} />
                            <span>View Full Clinical Record</span>
                          </button>
                          <button
                            className="btn-link-action secondary"
                            onClick={() => alert(`Downloading PDF diagnostic report for ${p.name}`)}
                          >
                            <Download size={14} />
                            <span>Download PDF Report</span>
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="no-patients-scheduled">
                      <CalendarIcon size={32} className="opacity-30 mb-2" />
                      <h4>No Patient Sessions Recorded</h4>
                      <p>There are no patient appointments or SNN data logs recorded for this specific date.</p>
                      {isFutureDate && (
                        <span className="future-lock-note">
                          <Lock size={12} /> Future date session tracking will activate when this date arrives.
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

        {/* TAB 3: CARE TEAM COLLABORATION */}
        {activeTab === 'collaboration' && (
          <CollaborationDashboard
            patients={patients}
            getAuthHeaders={getAuthHeaders}
          />
        )}

        {/* TAB 3: PSYCHIATRIC CLINICAL PATIENT DETAIL WINDOW */}
        {activeTab === 'patient-detail' && selectedPatient && (
          <div className="workspace-content patient-detail-window-view animate-fade-in">
            {/* Header Banner Hero Card */}
            <div className="patient-hero-card">
              <div className="hero-main-info">
                <div className="patient-avatar-badge">
                  <User size={28} className="text-blue-600" />
                </div>
                <div>
                  <div className="patient-title-row">
                    <h2>{selectedPatient.name || 'Unknown Patient'}</h2>
                    <span className="hero-id-tag">{selectedPatient.id}</span>
                    <span className={`status-badge ${(selectedPatient.cognitiveState || 'Neutral').toLowerCase()}`}>
                      {selectedPatient.cognitiveState || 'Neutral'}
                    </span>
                  </div>
                  <div className="patient-demographics-row">
                    <span><strong>Age:</strong> {(selectedPatient.age || 0)} yrs</span>
                    <span className="dot-sep">•</span>
                    <span><strong>Sex:</strong> {(selectedPatient.gender || 'Unknown')}</span>
                    <span className="dot-sep">•</span>
                    <span><strong>Blood Type:</strong> {(selectedPatient.bloodType || 'A+')}</span>
                    <span className="dot-sep">•</span>
                    <span><strong>Attending Doctor:</strong> {(selectedPatient.attendingDoctor || 'Unknown Doctor')}</span>
                  </div>
                </div>
              </div>

              <div className="hero-actions">
                <button
                  className="btn-hero-action primary"
                  onClick={() => {
                    setReportModalData({
                      uploadId: 'demo_session_stress',
                      filename: `${(selectedPatient.name || 'Patient').replace(/\s+/g, '_')}_Psychiatric_Report.edf`,
                      recipientName: selectedPatient.name,
                      recipientEmail: selectedPatient.email || ''
                    });
                    setEmailReportModalOpen(true);
                  }}
                >
                  <Mail size={16} />
                  <span>Email Report</span>
                </button>

                <button
                  className="btn-hero-action secondary"
                  onClick={() => alert(`Generating & Downloading Official Psychiatric Assessment PDF for ${selectedPatient.name}...`)}
                >
                  <Download size={16} />
                  <span>Download PDF</span>
                </button>

                <button
                  className="btn-hero-action secondary"
                  onClick={() => navigate('/analysis')}
                >
                  <Activity size={16} />
                  <span>Launch EDF Wave Analysis</span>
                </button>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="detail-metrics-bar">
              <div className="metric-strip-card">
                <span className="strip-label">SNN NEURAL RISK SCORE</span>
                <div className="strip-value-row">
                  <span className="strip-value text-blue-600">{selectedPatient.snnRiskScore || 0}%</span>
                  <span className="strip-sub">Spike Rate Load</span>
                </div>
                <div className="strip-progress-bg">
                  <div
                    className={`strip-progress-bar ${(selectedPatient.snnRiskScore || 0) > 70 ? 'high' : 'normal'}`}
                    style={{ width: `${(selectedPatient.snnRiskScore || 0)}%` }}
                  />
                </div>
              </div>

              <div className="metric-strip-card">
                <span className="strip-label">BETA / ALPHA WAVE RATIO</span>
                <div className="strip-value-row">
                  <span className="strip-value">{selectedPatient.betaAlphaRatio || '1.0'}</span>
                </div>
                <span className="strip-sub text-blue-700">Cortical Arousal Metric</span>
              </div>

              <div className="metric-strip-card">
                <span className="strip-label">AVERAGE HEART RATE (HRV)</span
                ><div className="strip-value-row">
                  <span className="strip-value">{selectedPatient.heartRate || 0} BPM</span>
                </div>
                <span className="strip-sub text-blue-700">Autonomic Cardiac Metric</span>
              </div>

              <div className="metric-strip-card">
                <span className="strip-label">LAST RECORDED SESSION</span>
                <div className="strip-value-row">
                  <span className="strip-value text-sm font-semibold">{selectedPatient.sessionDate || ''}</span>
                </div>
                <span className="strip-sub">{selectedPatient.sessionTime || ''}</span>
              </div>
            </div>

            {/* Two Column Grid: Left Checkup Problems & Psychiatrist Report, Right Graphs */}
            <div className="detail-grid-layout">
              {/* Left Column: Problems Facing & Psychiatric Assessment */}
              <div className="detail-left-col">
                {/* Check-Up Problems & Chief Complaints Card */}
                <div className="clinical-card">
                  <div className="card-header-title">
                    <AlertCircle size={18} className="text-blue-600" />
                    <h3>Check-Up Problems & Chief Complaints</h3>
                  </div>

                  <div className="card-body-content">
                    <div className="chief-complaint-box">
                      <span className="box-section-title">CHIEF COMPLAINT SUBMITTED FOR CHECKUP</span>
                      <p className="complaint-text">"{selectedPatient.chiefComplaint}"</p>
                    </div>

                    <div className="problems-list-section">
                      <span className="box-section-title">CLINICAL & PHYSIOLOGICAL PROBLEMS IDENTIFIED</span>
                      <ul className="problems-bullet-list">
                        {(selectedPatient.checkupProblems || []).map((prob, idx) => (
                          <li key={idx} className="problem-bullet-item">
                            <CheckCircle2 size={15} className="text-blue-600 flex-shrink-0 mt-0.5" />
                            <span>{prob}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Psychiatric Assessment Report Preview Box */}
                <div className="clinical-card mt-6">
                  <div className="card-header-title">
                    <FileCheck size={18} className="text-blue-600" />
                    <h3>Psychiatric Diagnostic Assessment & Clinical Summary</h3>
                  </div>

                  <div className="card-body-content">
                    <div className="icd-code-row">
                      <span className="label">Diagnostic Classification:</span>
                      <span className="icd-badge">{selectedPatient.icdCode || 'ICD-11: 6C40 / MB23.1'}</span>
                    </div>

                    <div className="impression-box">
                      <h4>Neurological Diagnostic Assessment</h4>
                      <p>{selectedPatient.diagnosis || ''}</p>
                    </div>

                    <div className="doctor-observations-box">
                      <h4>Attending Psychiatrist Clinical Observations</h4>
                      <p>{selectedPatient.doctorNotes || ''}</p>
                    </div>

                    <div className="treatment-plan-box">
                      <h4>Recommended Clinical Treatment & Intervention Plan</h4>
                      <p>{selectedPatient.treatmentPlan || 'Initiate structured biofeedback breaks and pacing intervals.'}</p>
                    </div>

                    <div className="report-signature-footer">
                      <div className="sig-block">
                        <span className="sig-title">Attending Neuropsychiatrist Signature</span>
                        <span className="sig-name">{selectedPatient.attendingDoctor}</span>
                      </div>
                      <button
                        className="btn-export-pdf"
                        onClick={() => alert(`Exporting Official Clinical PDF Report for ${selectedPatient.name}`)}
                      >
                        <Download size={14} />
                        <span>Export PDF</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Graphs Panel */}
              <div className="detail-right-col">
                {/* SNN Spike Rate & HRV Timeline Graph */}
                <div className="clinical-card">
                  <div className="card-header-title">
                    <TrendingUp size={18} className="text-blue-600" />
                    <h3>SNN Neural Spike Rate & HRV Timeline</h3>
                  </div>

                  <div className="card-body-content">
                    <p className="graph-subtext">Continuous 30-minute SNN spike rate monitoring alongside cardiac pulse changes.</p>
                    <div className="chart-container-wrapper">
                      <ResponsiveContainer width="100%" height={230}>
                        <AreaChart data={selectedPatient.graphData || [
                          { time: "00:00", alpha: 0.5, beta: 0.4, heartRate: 74, snnSpikes: 22 },
                          { time: "10:00", alpha: 0.4, beta: 0.8, heartRate: 85, snnSpikes: 58 },
                          { time: "20:00", alpha: 0.3, beta: 1.1, heartRate: 98, snnSpikes: 84 },
                          { time: "30:00", alpha: 0.5, beta: 0.6, heartRate: 80, snnSpikes: 42 }
                        ]}>
                          <defs>
                            <linearGradient id="snnColor" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#16A34A" stopOpacity={0.4}/>
                              <stop offset="95%" stopColor="#16A34A" stopOpacity={0.0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(34, 197, 94, 0.15)" />
                          <XAxis dataKey="time" stroke="#166534" fontSize={11} />
                          <YAxis stroke="#166534" fontSize={11} />
                          <Tooltip contentStyle={{ background: '#FFFFFF', borderColor: '#16A34A', borderRadius: '8px', fontSize: '12px' }} />
                          <Legend wrapperStyle={{ fontSize: '11px' }} />
                          <Area type="monotone" dataKey="snnSpikes" name="SNN Spike Rate (%)" stroke="#16A34A" fillOpacity={1} fill="url(#snnColor)" strokeWidth={2} />
                          <Area type="monotone" dataKey="heartRate" name="Heart Rate (BPM)" stroke="#DC2626" fillOpacity={0} strokeWidth={2} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* EEG Waveband Power Spectrum Graph */}
                <div className="clinical-card mt-6">
                  <div className="card-header-title">
                    <Layers size={18} className="text-blue-600" />
                    <h3>EEG Waveband Spectral Distribution</h3>
                  </div>

                  <div className="card-body-content">
                    <p className="graph-subtext">Relative power distribution across Delta, Theta, Alpha, Beta, and Gamma wavebands.</p>
                    <div className="chart-container-wrapper">
                      <ResponsiveContainer width="100%" height={210}>
                        <BarChart data={selectedPatient.waveSpectrum || [
                          { wave: "Delta", power: 10 },
                          { wave: "Theta", power: 15 },
                          { wave: "Alpha", power: 90 },
                          { wave: "Beta", power: 25 },
                          { wave: "Gamma", power: 12 }
                        ]}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(34, 197, 94, 0.15)" />
                          <XAxis dataKey="wave" stroke="#166534" fontSize={11} />
                          <YAxis stroke="#166534" fontSize={11} />
                          <Tooltip contentStyle={{ background: '#FFFFFF', borderColor: '#16A34A', borderRadius: '8px', fontSize: '12px' }} />
                          <Bar dataKey="power" name="Power Spectral Density (µV²)" fill="#16A34A" radius={[6, 6, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Section: Recorded Session Logs Audit Table */}
            <div className="recorded-sessions-card mt-6">
              <div className="card-header-title">
                <Clock size={18} className="text-blue-600" />
                <h3>Recorded Clinical EEG Sessions & EDF Audits</h3>
              </div>

              <div className="table-card">
                <table className="patients-table">
                  <thead>
                    <tr>
                      <th>Session ID</th>
                      <th>Date & Time</th>
                      <th>Duration</th>
                      <th>Raw EDF File</th>
                      <th>SNN Risk Score</th>
                      <th>Inferred Cognitive State</th>
                      <th>Doctor Observations</th>
                      <th className="text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(selectedPatient.recordedSessions || []).length > 0 ? (
                      (selectedPatient.recordedSessions || []).map(ses => (
                        <tr key={ses.id} className="patient-row">
                          <td className="font-mono font-bold text-xs">{ses.id}</td>
                          <td>
                            <div className="time-cell">
                              <Clock size={13} className="text-blue-600" />
                              <span>{(ses.date || '')} at {(ses.time || '')}</span>
                            </div>
                          </td>
                          <td className="text-xs font-semibold">{ses.duration || ''}</td>
                          <td>
                            <span className="edf-badge">
                              {(ses.edfFile || '')}
                            </span>
                          </td>
                          <td>
                            <span className="font-bold text-xs text-blue-700">{ses.snnScore || 0}% Spike Rate</span>
                          </td>
                          <td>
                            <span className={`status-badge ${(ses.state || 'Neutral').toLowerCase()}`}>
                              {(ses.state || 'Neutral')}
                            </span>
                          </td>
                          <td>
                            <span className="text-xs text-[var(--text-secondary)] max-w-xs truncate">{(ses.notes || '')}</span>
                          </td>
                          <td>
                            <div className="actions-cell">
                              <button
                                className="btn-action-view"
                                onClick={() => navigate('/analysis')}
                                title="Open EDF Waveform in Analyzer"
                              >
                                <Activity size={14} />
                                <span>Analyze EDF</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="8" className="no-data-cell">
                          No historical sessions recorded for this patient.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Add Patient Modal */}
      <AddPatientModal
        isOpen={addPatientModalOpen}
        onClose={() => setAddPatientModalOpen(false)}
        onPatientCreated={(newP) => {
          setPatients(prev => [newP, ...prev]);
        }}
      />

      {/* Email Report Modal */}
      <EmailReportModal
        isOpen={emailReportModalOpen}
        onClose={() => setEmailReportModalOpen(false)}
        uploadId={reportModalData.uploadId}
        filename={reportModalData.filename}
        defaultRecipientEmail={reportModalData.recipientEmail}
        defaultRecipientName={reportModalData.recipientName}
      />
    </div>
  );
}
