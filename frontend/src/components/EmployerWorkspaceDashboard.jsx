import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import FileUpload from './FileUpload';
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
  Zap,
  HeartPulse,
  CalendarCheck,
  RefreshCw,
  Copy,
  Check,
  Database
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

// Initial Clinical Patients Directory Data with rich Psychiatric details
const INITIAL_PATIENTS = [
  {
    id: "PAT-10492",
    name: "Eleanor Vance",
    age: 34,
    gender: "Female",
    bloodType: "A+",
    attendingDoctor: "Dr. Sarah Jenkins, MD (Neuropsychiatry)",
    cognitiveState: "Stressed",
    snnRiskScore: 84,
    betaAlphaRatio: "3.11 (Elevated)",
    heartRate: 98,
    sessionDate: "2026-08-26",
    sessionTime: "09:30 AM",
    edfStatus: "Uploaded & Analyzed",
    chiefComplaint: "Acute cognitive fatigue, persistent tension headaches during sustained mental focus, and hyper-arousal insomnia.",
    checkupProblems: [
      "High Beta wave hyperactivity (>28Hz) indicating continuous neural stress overload",
      "Suppressed parasympathetic tone with HRV LF/HF ratio of 3.45",
      "Cognitive stamina drops sharply after 45 minutes of continuous task engagement",
      "Subjective difficulty with memory recall and emotional regulation under pressure"
    ],
    diagnosis: "Acute SNN Cognitive Stress & Beta Wave Spike",
    doctorNotes: "Elevated Beta power spike (3.11 ratio) and high SNN spike frequency detected during high-intensity cognitive workload.",
    icdCode: "ICD-11: 6C40 / MB23.1 (Cognitive Overload & Neural Hyper-reactivity)",
    treatmentPlan: "Recommend immediate 15-minute SNN biofeedback recovery breaks every 90 minutes. Initiate targeted neuro-relaxation protocol and temporary reduction in high-complexity task assignments.",
    recordedSessions: [
      { id: "SES-901", date: "2026-08-26", time: "09:30 AM", duration: "45 mins", edfFile: "eleanor_vance_eeg_20260826.edf", snnScore: 84, state: "Stressed", notes: "Acute Beta wave elevation observed during high-load diagnostic task." },
      { id: "SES-882", date: "2026-08-24", time: "02:15 PM", duration: "60 mins", edfFile: "eleanor_vance_eeg_20260824.edf", snnScore: 78, state: "Stressed", notes: "Sustained high beta activity with cardiac HRV suppression." },
      { id: "SES-840", date: "2026-08-20", time: "11:00 AM", duration: "50 mins", edfFile: "eleanor_vance_eeg_20260820.edf", snnScore: 62, state: "Neutral", notes: "Moderate baseline recovery after guided breathing exercise." }
    ],
    graphData: [
      { time: "00:00", alpha: 0.52, beta: 0.45, heartRate: 74, snnSpikes: 22 },
      { time: "05:00", alpha: 0.48, beta: 0.58, heartRate: 78, snnSpikes: 35 },
      { time: "10:00", alpha: 0.42, beta: 0.82, heartRate: 85, snnSpikes: 58 },
      { time: "15:00", alpha: 0.36, beta: 1.12, heartRate: 98, snnSpikes: 84 },
      { time: "20:00", alpha: 0.38, beta: 1.05, heartRate: 94, snnSpikes: 79 },
      { time: "25:00", alpha: 0.44, beta: 0.88, heartRate: 88, snnSpikes: 64 },
      { time: "30:00", alpha: 0.50, beta: 0.65, heartRate: 80, snnSpikes: 42 }
    ],
    waveSpectrum: [
      { wave: "Delta (0.5-4Hz)", power: 12 },
      { wave: "Theta (4-8Hz)", power: 18 },
      { wave: "Alpha (8-12Hz)", power: 24 },
      { wave: "Beta (13-30Hz)", power: 78 },
      { wave: "Gamma (>30Hz)", power: 45 }
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
    betaAlphaRatio: "1.08 (Optimal)",
    heartRate: 72,
    sessionDate: "2026-08-26",
    sessionTime: "11:00 AM",
    edfStatus: "Report Ready",
    chiefComplaint: "Routine neuro-performance evaluation post-recovery; reports high mental clarity and calm mood.",
    checkupProblems: [
      "Optimal 10Hz Alpha peak wave synchronization across parietal sensors",
      "Balanced autonomic nervous system regulation (HRV LF/HF: 1.12)",
      "Low SNN neural spike noise floor (22% risk level)",
      "Sustained working memory endurance beyond 2 hours"
    ],
    diagnosis: "Optimal Alpha Synchronization & Deep Focus",
    doctorNotes: "Dominant 10Hz Alpha peak with low SNN stress index (22%); steady cardiac metrics during EEG assessment.",
    icdCode: "ICD-11: Z01.89 (Routine Neurological & Cognitive Evaluation)",
    treatmentPlan: "Maintain current workload and neuro-hygiene routine. Schedule follow-up routine EEG checkup in 6 months.",
    recordedSessions: [
      { id: "SES-902", date: "2026-08-26", time: "11:00 AM", duration: "60 mins", edfFile: "james_wilson_eeg_20260826.edf", snnScore: 22, state: "Focused", notes: "Optimal deep focus state verified by SNN model." },
      { id: "SES-875", date: "2026-08-21", time: "10:30 AM", duration: "55 mins", edfFile: "james_wilson_eeg_20260821.edf", snnScore: 28, state: "Focused", notes: "High alpha power continuity during task evaluation." }
    ],
    graphData: [
      { time: "00:00", alpha: 0.75, beta: 0.40, heartRate: 68, snnSpikes: 18 },
      { time: "05:00", alpha: 0.82, beta: 0.42, heartRate: 70, snnSpikes: 20 },
      { time: "10:00", alpha: 0.88, beta: 0.44, heartRate: 72, snnSpikes: 22 },
      { time: "15:00", alpha: 0.85, beta: 0.41, heartRate: 71, snnSpikes: 21 },
      { time: "20:00", alpha: 0.80, beta: 0.39, heartRate: 69, snnSpikes: 19 }
    ],
    waveSpectrum: [
      { wave: "Delta (0.5-4Hz)", power: 15 },
      { wave: "Theta (4-8Hz)", power: 22 },
      { wave: "Alpha (8-12Hz)", power: 85 },
      { wave: "Beta (13-30Hz)", power: 32 },
      { wave: "Gamma (>30Hz)", power: 14 }
    ]
  },
  {
    id: "PAT-10494",
    name: "Sophia Martinez",
    age: 29,
    gender: "Female",
    bloodType: "B+",
    attendingDoctor: "Dr. Sarah Jenkins, MD (Neuropsychiatry)",
    cognitiveState: "Stressed",
    snnRiskScore: 78,
    betaAlphaRatio: "2.85 (High)",
    heartRate: 94,
    sessionDate: "2026-08-26",
    sessionTime: "02:15 PM",
    edfStatus: "Processing SNN",
    chiefComplaint: "High mental exhaustion during shift work, anxiety spikes under tight deadlines, and focus drops.",
    checkupProblems: [
      "Persistent Beta desynchronization (2.85 ratio) with elevated SNN spike rate (78%)",
      "Cardiac pulse elevation up to 94 BPM during complex decision tasks",
      "Cognitive overload warning triggered after 30 minutes of continuous monitoring"
    ],
    diagnosis: "Neural Fatigue & High Beta Load Spike",
    doctorNotes: "Persistent Beta desynchronization (2.85 ratio) with elevated SNN spike rate (78%); recommended 15-min mindfulness recovery break.",
    icdCode: "ICD-11: QD85 (Cognitive Exhaustion & Autonomic Dysregulation)",
    treatmentPlan: "Implement structured 15-minute relaxation breaks during shift work. Re-evaluate SNN stress score in 2 weeks.",
    recordedSessions: [
      { id: "SES-903", date: "2026-08-26", time: "02:15 PM", duration: "40 mins", edfFile: "sophia_m_eeg_20260826.edf", snnScore: 78, state: "Stressed", notes: "High beta load spike recorded during cognitive task battery." }
    ],
    graphData: [
      { time: "00:00", alpha: 0.45, beta: 0.60, heartRate: 82, snnSpikes: 45 },
      { time: "10:00", alpha: 0.38, beta: 0.95, heartRate: 90, snnSpikes: 70 },
      { time: "20:00", alpha: 0.35, beta: 1.05, heartRate: 94, snnSpikes: 78 }
    ],
    waveSpectrum: [
      { wave: "Delta (0.5-4Hz)", power: 10 },
      { wave: "Theta (4-8Hz)", power: 16 },
      { wave: "Alpha (8-12Hz)", power: 28 },
      { wave: "Beta (13-30Hz)", power: 72 },
      { wave: "Gamma (>30Hz)", power: 38 }
    ]
  },
  {
    id: "PAT-10495",
    name: "Marcus Brody",
    age: 51,
    gender: "Male",
    bloodType: "AB+",
    attendingDoctor: "Dr. Elena Rostova, MD (Clinical Neurophysiology)",
    cognitiveState: "Neutral",
    snnRiskScore: 40,
    betaAlphaRatio: "1.42 (Normal)",
    heartRate: 68,
    sessionDate: "2026-08-25",
    sessionTime: "04:30 PM",
    edfStatus: "Report Ready",
    chiefComplaint: "Post-concussion baseline neural recovery assessment and sleep quality monitoring.",
    checkupProblems: [
      "Subtle Theta band elevation (4-7 Hz) during resting state",
      "Normal baseline SNN stress score (40%) post-recovery protocol",
      "Occasional transient fatigue during prolonged reading"
    ],
    diagnosis: "Baseline Resting State & Recovery Protocol",
    doctorNotes: "Normal baseline EEG rhythm; SNN stress score at 40% post-recovery protocol.",
    icdCode: "ICD-11: S06.0 / Z09 (Post-Concussion Baseline Monitoring)",
    treatmentPlan: "Continue light cognitive pacing exercises. Gradually increase reading and task duration.",
    recordedSessions: [
      { id: "SES-890", date: "2026-08-25", time: "04:30 PM", duration: "50 mins", edfFile: "marcus_brody_eeg_20260825.edf", snnScore: 40, state: "Neutral", notes: "Stable baseline EEG recording during rest phase." }
    ],
    graphData: [
      { time: "00:00", alpha: 0.60, beta: 0.50, heartRate: 65, snnSpikes: 32 },
      { time: "15:00", alpha: 0.62, beta: 0.52, heartRate: 68, snnSpikes: 40 }
    ],
    waveSpectrum: [
      { wave: "Delta (0.5-4Hz)", power: 20 },
      { wave: "Theta (4-8Hz)", power: 35 },
      { wave: "Alpha (8-12Hz)", power: 55 },
      { wave: "Beta (13-30Hz)", power: 40 },
      { wave: "Gamma (>30Hz)", power: 15 }
    ]
  },
  {
    id: "PAT-10496",
    name: "Dr. Amanda Chen",
    age: 38,
    gender: "Female",
    bloodType: "O-",
    attendingDoctor: "Dr. Marcus Vance, MD (Clinical Neurology)",
    cognitiveState: "Focused",
    snnRiskScore: 18,
    betaAlphaRatio: "0.95 (Deep Focus)",
    heartRate: 70,
    sessionDate: "2026-08-25",
    sessionTime: "10:15 AM",
    edfStatus: "Uploaded & Analyzed",
    chiefComplaint: "Cognitive endurance evaluation during long surgical procedures and high-concentration tasks.",
    checkupProblems: [
      "High sustained attention endurance with optimal Alpha/Beta ratio (0.95)",
      "Minimal SNN artifact interference during extended 2-hour monitoring block",
      "Consistent 70 BPM cardiac rate under high task complexity"
    ],
    diagnosis: "High Sustained Attention & Low Neural Noise",
    doctorNotes: "Optimal Alpha/Beta ratio (0.95) with minimal SNN artifact interference during extended monitoring.",
    icdCode: "ICD-11: Z01.89 (High-Performance Cognitive Baseline)",
    treatmentPlan: "No clinical intervention needed. Optimal cognitive state maintained.",
    recordedSessions: [
      { id: "SES-885", date: "2026-08-25", time: "10:15 AM", duration: "120 mins", edfFile: "amanda_chen_eeg_20260825.edf", snnScore: 18, state: "Focused", notes: "Exceptional cognitive endurance and stable neural metrics." }
    ],
    graphData: [
      { time: "00:00", alpha: 0.88, beta: 0.35, heartRate: 68, snnSpikes: 15 },
      { time: "30:00", alpha: 0.90, beta: 0.36, heartRate: 70, snnSpikes: 18 }
    ],
    waveSpectrum: [
      { wave: "Delta (0.5-4Hz)", power: 10 },
      { wave: "Theta (4-8Hz)", power: 15 },
      { wave: "Alpha (8-12Hz)", power: 90 },
      { wave: "Beta (13-30Hz)", power: 25 },
      { wave: "Gamma (>30Hz)", power: 12 }
    ]
  },
  {
    id: "PAT-10497",
    name: "Robert Taylor",
    age: 46,
    gender: "Male",
    bloodType: "A-",
    attendingDoctor: "Dr. Sarah Jenkins, MD (Neuropsychiatry)",
    cognitiveState: "Stressed",
    snnRiskScore: 88,
    betaAlphaRatio: "3.45 (Critical)",
    heartRate: 104,
    sessionDate: "2026-08-24",
    sessionTime: "01:00 PM",
    edfStatus: "Uploaded & Analyzed",
    chiefComplaint: "Severe panic-induced neural exhaustion, rapid pulse spikes, and cognitive disorientation under high stress.",
    checkupProblems: [
      "Critical Beta/Alpha ratio elevation (3.45) with 88% SNN risk spike",
      "Heart rate variability suppression with pulse reaching 104 BPM",
      "Acute sympathetic overdrive requiring immediate clinical intervention"
    ],
    diagnosis: "Acute Neural Exhaustion & High SNN Risk Spike",
    doctorNotes: "Heart rate variability dropped sharply (104 BPM); critical Beta/Alpha elevation and high SNN stress spike (88%) detected.",
    icdCode: "ICD-11: 6B40 (Acute Stress & Autonomic Overdrive Response)",
    treatmentPlan: "Immediate cessation of high-stress duty. Prescribed targeted biofeedback session and 48-hour clinical rest protocol.",
    recordedSessions: [
      { id: "SES-870", date: "2026-08-24", time: "01:00 PM", duration: "35 mins", edfFile: "robert_taylor_eeg_20260824.edf", snnScore: 88, state: "Stressed", notes: "Critical SNN spike alert triggered. High sympathetic drive." }
    ],
    graphData: [
      { time: "00:00", alpha: 0.35, beta: 0.85, heartRate: 90, snnSpikes: 65 },
      { time: "15:00", alpha: 0.28, beta: 1.25, heartRate: 104, snnSpikes: 88 }
    ],
    waveSpectrum: [
      { wave: "Delta (0.5-4Hz)", power: 8 },
      { wave: "Theta (4-8Hz)", power: 12 },
      { wave: "Alpha (8-12Hz)", power: 18 },
      { wave: "Beta (13-30Hz)", power: 88 },
      { wave: "Gamma (>30Hz)", power: 52 }
    ]
  }
];

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

function computeDynamicRecommendations(data) {
  let snnScore = 75;
  let betaAlpha = 2.5;
  let heartRate = 80;
  let state = "STRESSED";
  let complaint = "Cognitive fatigue & focus overload";

  if (data) {
    if (data.snnRiskScore !== undefined) snnScore = parseInt(data.snnRiskScore, 10);
    else if (data.snnSpikeRate !== undefined) snnScore = parseInt(data.snnSpikeRate, 10);
    else if (data.extended_analysis?.patterns?.stress_event_count > 3) snnScore = 84;

    if (data.betaAlphaRatio !== undefined) betaAlpha = parseFloat(data.betaAlphaRatio);
    else if (data.extended_analysis?.patterns?.dominant_state === 'Stressed') betaAlpha = 3.11;

    if (data.heartRate !== undefined) heartRate = parseInt(data.heartRate, 10);
    if (data.status) state = String(data.status).toUpperCase();
    else if (data.extended_analysis?.patterns?.dominant_state) state = String(data.extended_analysis.patterns.dominant_state).toUpperCase();

    if (data.chiefComplaint) complaint = data.chiefComplaint;
    else if (data.filename) complaint = `Analysis file: ${data.filename}`;
  }

  let priority = "MODERATE ELEVATION";
  let priorityClass = "amber";

  if (snnScore >= 75 || betaAlpha >= 2.8 || state.includes("STRESS") || state.includes("HIGH")) {
    priority = "CRITICAL / HIGH RISK";
    priorityClass = "red";
  } else if (snnScore >= 45 || betaAlpha >= 1.8) {
    priority = "MODERATE ELEVATION";
    priorityClass = "amber";
  } else {
    priority = "OPTIMAL / LOW RISK";
    priorityClass = "green";
  }

  const executiveSummary = priorityClass === "red"
    ? `High SNN cortical spike load (${snnScore}%) and elevated Beta/Alpha arousal (${betaAlpha}) indicate acute hyper-arousal and impending cognitive exhaustion. Combined with reported chief complaints ("${complaint}"), immediate targeted clinical workload intervention and biofeedback recovery are strongly indicated.`
    : priorityClass === "amber"
    ? `Moderate neural load detected (SNN Spike Load: ${snnScore}%, Beta/Alpha: ${betaAlpha}). Autonomic cardiac metrics (${heartRate} BPM) reflect elevated mental strain during prolonged tasks. Pacing intervals and mindfulness recovery recommended.`
    : `Baseline neurological activity is optimal (SNN Spike Rate: ${snnScore}%, Beta/Alpha: ${betaAlpha}). High Alpha synchronization and stable HRV indicate low stress load and high cognitive resilience. Maintain preventative maintenance schedule.`;

  const categories = [
    {
      id: "immediate",
      title: "Immediate Clinical Interventions",
      items: snnScore >= 75 ? [
        "Mandate targeted 15-minute SNN biofeedback recovery micro-breaks every 60 minutes.",
        "Impose an immediate 35% temporary reduction in high-complexity analytical task duration.",
        "Initiate vagal nerve stimulation or 0.1Hz HRV resonance pacing to reduce sympathetic surge.",
        "Apply real-time SNN focus-fatigue monitoring during intensive work windows."
      ] : snnScore >= 45 ? [
        "Recommend 10-minute structured mindfulness or audio-guided relaxation pauses after 90 minutes of continuous work.",
        "Cap intense focus sessions to a maximum of 4 hours daily with mandatory non-screen intervals.",
        "Incorporate bio-monitored focus pacing with real-time SNN stress alerts."
      ] : [
        "Maintain current balanced task cadence with standard 5-minute hourly eye-rest breaks.",
        "Continue supportive cognitive wellness habits and baseline focus tracking."
      ]
    },
    {
      id: "neurological",
      title: "Neurological & EEG Neurofeedback Considerations",
      items: betaAlpha >= 2.8 ? [
        "Evaluate GABAergic tone modulation to counter sustained >28Hz Beta wave hyperactivity.",
        "Schedule 10 sessions of targeted EEG neurofeedback for sensorimotor rhythm (SMR 12-15Hz) enhancement.",
        "Monitor cortical hyperexcitability and check for nocturnal epileptiform micro-spikes."
      ] : [
        "Initiate Alpha-wave (8-12Hz) enhancement protocols to restore restful mental focus.",
        "Conduct dual-n-back working memory assessment to quantify cognitive fatigue threshold."
      ]
    },
    {
      id: "lifestyle",
      title: "Lifestyle & Circadian Optimization",
      items: [
        "Implement a strict blue-light exposure curfew 90 minutes before sleep to manage hyper-arousal insomnia.",
        "Introduce daily 20-minute slow-pace diaphragmatic breathing (6 breaths/min) to elevate HRV parasympathetic tone.",
        "Maintain consistent sleep-wake timing with outdoor morning sunlight exposure within 30 mins of waking."
      ]
    },
    {
      id: "followup",
      title: "Follow-up EEG & Clinical Audit Schedule",
      items: [
        "Schedule a 64-channel EDF EEG re-evaluation in 7 to 14 days to monitor spike rate drop.",
        "Weekly psychiatrist clinical check-in focused on chief complaint progress and biofeedback logs."
      ]
    }
  ];

  return { priority, priorityClass, executiveSummary, categories };
}

function ClinicalRecommendationEngine({ data, title = "AI Neuro-Clinical Recommendation Engine" }) {
  const [copiedId, setCopiedId] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [engineResult, setEngineResult] = useState(() => computeDynamicRecommendations(data));

  useEffect(() => {
    setEngineResult(computeDynamicRecommendations(data));
  }, [data]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setEngineResult(computeDynamicRecommendations(data));
      setIsRefreshing(false);
    }, 400);
  };

  const handleCopyCategory = (catId, items) => {
    const textToCopy = items.join('\n- ');
    navigator.clipboard.writeText(`- ${textToCopy}`);
    setCopiedId(catId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const { priority, priorityClass, executiveSummary, categories } = engineResult;

  return (
    <div className="clinical-recommendations-window clinical-card my-6 animate-fade-in border-2 border-emerald-500/30 shadow-lg">
      <div className="card-header-title flex items-center justify-between pb-3 border-b border-emerald-200/60 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-100/80 border border-emerald-300 text-emerald-700 shadow-sm flex items-center justify-center">
            <Sparkles size={20} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-extrabold text-emerald-950 m-0 tracking-tight">{title}</h3>
              <span className="badge-clinical text-[0.7rem] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 border border-emerald-300">
                DYNAMIC SNN ENGINE
              </span>
            </div>
            <p className="text-xs text-emerald-800/80 m-0 mt-0.5">
              Multi-factor clinical interventions generated from EEG wavebands, SNN spike load & biometric signals
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className={`priority-tag priority-${priorityClass} px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-2 border shadow-sm`}>
            <span className="w-2 h-2 rounded-full bg-current animate-ping" />
            <span>Risk Level: {priority}</span>
          </div>

          <button
            type="button"
            className="btn-action-view text-xs py-1.5 px-3 flex items-center gap-1.5"
            onClick={handleRefresh}
            title="Re-run AI recommendation calculations"
          >
            <RefreshCw size={13} className={isRefreshing ? "animate-spin" : ""} />
            <span>{isRefreshing ? "Recalculating..." : "Regenerate"}</span>
          </button>
        </div>
      </div>

      <div className="card-body-content pt-4">
        {/* Executive Clinical Assessment Summary */}
        <div className="exec-summary-banner p-4 rounded-xl mb-5 bg-emerald-50/90 border border-emerald-200/80 shadow-inner">
          <div className="flex items-start gap-3">
            <ShieldCheck size={20} className="text-emerald-700 flex-shrink-0 mt-0.5" />
            <div>
              <span className="text-[0.72rem] font-bold text-emerald-900 uppercase tracking-wider block mb-1">
                PHYSIOLOGICAL EVALUATION & INTERVENTION RATIONALE
              </span>
              <p className="text-sm font-semibold text-emerald-950 m-0 leading-relaxed">
                "{executiveSummary}"
              </p>
            </div>
          </div>
        </div>

        {/* 4 Categorized Clinical Interventions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categories.map((cat) => (
            <div key={cat.id} className="recommendation-category-card p-4 rounded-xl bg-white border border-emerald-200/70 shadow-sm hover:border-emerald-400 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-emerald-100">
                  <div className="flex items-center gap-2">
                    {cat.id === 'immediate' && <Zap size={16} className="text-amber-600" />}
                    {cat.id === 'neurological' && <Brain size={16} className="text-emerald-700" />}
                    {cat.id === 'lifestyle' && <HeartPulse size={16} className="text-emerald-600" />}
                    {cat.id === 'followup' && <CalendarCheck size={16} className="text-teal-700" />}
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-emerald-900 m-0">{cat.title}</h4>
                  </div>

                  <button
                    type="button"
                    className="text-[0.7rem] font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 transition-colors"
                    onClick={() => handleCopyCategory(cat.id, cat.items)}
                    title="Copy recommendations to treatment plan"
                  >
                    {copiedId === cat.id ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                    <span>{copiedId === cat.id ? "Copied" : "Copy"}</span>
                  </button>
                </div>

                <ul className="space-y-2 m-0 p-0 list-none">
                  {cat.items.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs font-semibold text-emerald-950 leading-snug">
                      <CheckCircle2 size={14} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-3 pt-2 border-t border-emerald-50 text-[0.68rem] text-emerald-700 font-bold flex items-center justify-between">
                <span>Clinical Priority: High</span>
                <span className="text-emerald-600">Dynamic Guidance</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function EmbeddedAnalysisView({ uploadId, onBack }) {
  const { getAuthHeaders } = useAuth();
  const [analysisData, setAnalysisData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (uploadId) {
      loadAnalysis(uploadId);
    }
  }, [uploadId]);

  const loadAnalysis = async (id) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/api/analysis/${id}`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error('Failed to load analysis results');
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

  if (loading) {
    return (
      <div className="clinical-card flex flex-col items-center justify-center p-12 text-center">
        <Activity className="animate-spin text-emerald-600 mb-3" size={32} />
        <h4 className="font-bold text-emerald-800 text-lg">Processing EDF Waveform & SNN Signal Decomposition...</h4>
        <p className="text-xs text-gray-500 mt-1">Executing FFT spectral filtering and biometric neural mapping.</p>
      </div>
    );
  }

  if (error || !analysisData) {
    return (
      <div className="clinical-card p-6 bg-red-50/80 border-red-200">
        <h4 className="font-bold text-red-800 mb-2">Analysis Failed</h4>
        <p className="text-sm text-red-600 mb-4">{error || 'Could not load analysis details.'}</p>
        <button className="btn-back-directory" onClick={onBack}>
          <ArrowLeft size={16} />
          <span>Upload Another File</span>
        </button>
      </div>
    );
  }

  const timeSeries = analysisData?.time_series || [];
  const extended = analysisData?.extended_analysis || {};
  const patterns = extended.patterns || {};

  const displayData = timeSeries.map(t => ({
    timestamp: t.timestamp > 1000000000 ? new Date(t.timestamp * 1000).toLocaleTimeString() : `${Math.floor(t.timestamp/60)}:${Math.floor(t.timestamp%60).toString().padStart(2, '0')}`,
    alpha: t.alpha,
    beta: t.beta,
    heartRate: t.heart_rate || 0,
  }));

  return (
    <div className="embedded-analysis-view space-y-6 animate-fade-in">
      <div className="patient-hero-card">
        <div className="hero-main-info">
          <div className="patient-avatar-badge">
            <Activity size={28} className="text-emerald-600" />
          </div>
          <div>
            <div className="patient-title-row">
              <h2>{analysisData.filename || 'EDF Wave Analysis'}</h2>
              <span className="hero-id-tag">EDF-ANALYSIS-{uploadId.slice(0, 6)}</span>
            </div>
            <div className="patient-demographics-row">
              <span>Status: Completed</span>
              <span className="dot-sep">•</span>
              <span>Data Points: {timeSeries.length}</span>
              <span className="dot-sep">•</span>
              <span>Dominant State: <strong>{patterns.dominant_state || 'Neutral'}</strong></span>
            </div>
          </div>
        </div>

        <div className="hero-actions">
          <button className="btn-hero-action secondary" onClick={onBack}>
            <ArrowLeft size={16} />
            <span>Upload Another File</span>
          </button>
          <button className="btn-hero-action primary" onClick={handleExportPDF}>
            <Download size={16} />
            <span>Export Diagnostic PDF</span>
          </button>
        </div>
      </div>

      <div className="detail-grid-layout">
        <div className="clinical-card">
          <div className="card-header-title">
            <Activity size={18} className="text-emerald-600" />
            <h3>EEG Time Series Wave Decomposition</h3>
          </div>
          <div className="chart-container-wrapper" style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={displayData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(34,197,94,0.15)" />
                <XAxis dataKey="timestamp" stroke="var(--text-muted)" fontSize={11} />
                <YAxis stroke="var(--text-muted)" fontSize={11} />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="alpha" stroke="#059669" fill="#059669" fillOpacity={0.2} name="Alpha (Relaxation)" />
                <Area type="monotone" dataKey="beta" stroke="#16A34A" fill="#16A34A" fillOpacity={0.3} name="Beta (Cognitive Stress)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="clinical-card">
          <div className="card-header-title">
            <Brain size={18} className="text-emerald-600" />
            <h3>Pattern Detection & Diagnostic Stats</h3>
          </div>
          <div className="problems-bullet-list">
            <div className="problem-bullet-item">
              <AlertTriangle size={16} className="text-amber-500 flex-shrink-0" />
              <div>
                <strong>Stress Spike Events:</strong> {patterns.stress_event_count || 0} detected during recording session.
              </div>
            </div>
            <div className="problem-bullet-item">
              <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0" />
              <div>
                <strong>Focus Recovery Periods:</strong> {patterns.focus_period_count || 0} sustained focus intervals observed.
              </div>
            </div>
            <div className="problem-bullet-item">
              <Activity size={16} className="text-blue-500 flex-shrink-0" />
              <div>
                <strong>State Transitions:</strong> {patterns.transition_count || 0} frequency phase changes recorded.
              </div>
            </div>
          </div>
          {extended.insights_text && extended.insights_text.length > 0 && (
            <div className="impression-box mt-2">
              <h4>Automated Neuropsychiatric Insights</h4>
              <p>{extended.insights_text.join(' ')}</p>
            </div>
          )}
        </div>
      </div>

      {/* Dynamic Recommendation Engine for Uploaded File Analysis */}
      <ClinicalRecommendationEngine data={analysisData} title="AI EDF File Recommendation Engine" />
    </div>
  );
}

function AddPatientModal({ isOpen, onClose, onSavePatient }) {
  const [formData, setFormData] = useState({
    name: '',
    age: '34',
    gender: 'Female',
    bloodType: 'A+',
    attendingDoctor: 'Dr. Sarah Jenkins, MD (Neuropsychiatry)',
    cognitiveState: 'Stressed',
    snnRiskScore: 78,
    betaAlphaRatio: '2.85 (High)',
    heartRate: 88,
    chiefComplaint: 'Acute cognitive fatigue and tension headaches during sustained mental focus.',
    checkupProblemsText: 'High Beta wave hyperactivity (>25Hz)\nSuppressed parasympathetic tone\nCognitive stamina drops after 45 minutes',
    diagnosis: 'Acute SNN Cognitive Stress & Beta Wave Spike',
    doctorNotes: 'Elevated Beta power spike and high SNN spike frequency detected during high-intensity cognitive workload.',
    icdCode: 'ICD-11: 6C40 / MB23.1',
    treatmentPlan: 'Recommend 15-minute SNN biofeedback recovery breaks every 60 minutes.',
    edfFile: 'patient_eeg_20260826.edf'
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert("Please enter patient name.");
      return;
    }

    const checkupProblems = formData.checkupProblemsText
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);

    const todayStr = "2026-08-26";
    const newPatient = {
      id: `PAT-${Math.floor(10000 + Math.random() * 90000)}`,
      name: formData.name,
      age: parseInt(formData.age, 10) || 30,
      gender: formData.gender,
      bloodType: formData.bloodType,
      attendingDoctor: formData.attendingDoctor,
      cognitiveState: formData.cognitiveState,
      snnRiskScore: parseInt(formData.snnRiskScore, 10) || 75,
      betaAlphaRatio: formData.betaAlphaRatio,
      heartRate: parseInt(formData.heartRate, 10) || 85,
      sessionDate: todayStr,
      sessionTime: "10:30 AM",
      edfStatus: "Uploaded & Analyzed",
      chiefComplaint: formData.chiefComplaint,
      checkupProblems: checkupProblems.length > 0 ? checkupProblems : [
        "High Beta wave hyperactivity during sustained attention tasks",
        "Suppressed parasympathetic tone under mental pressure"
      ],
      diagnosis: formData.diagnosis,
      doctorNotes: formData.doctorNotes,
      icdCode: formData.icdCode,
      treatmentPlan: formData.treatmentPlan,
      recordedSessions: [
        {
          id: `SES-${Math.floor(800 + Math.random() * 199)}`,
          date: todayStr,
          time: "10:30 AM",
          duration: "45 mins",
          edfFile: formData.edfFile || `${formData.name.toLowerCase().replace(/\s+/g, '_')}_eeg.edf`,
          snnScore: parseInt(formData.snnRiskScore, 10) || 75,
          state: formData.cognitiveState,
          notes: formData.doctorNotes
        }
      ],
      graphData: [
        { time: "00:00", alpha: 0.50, beta: 0.40, heartRate: 72, snnSpikes: 20 },
        { time: "10:00", alpha: 0.45, beta: 0.75, heartRate: 80, snnSpikes: 50 },
        { time: "20:00", alpha: 0.35, beta: 1.10, heartRate: parseInt(formData.heartRate, 10) || 88, snnSpikes: parseInt(formData.snnRiskScore, 10) || 78 },
        { time: "30:00", alpha: 0.48, beta: 0.60, heartRate: 78, snnSpikes: 40 }
      ],
      waveSpectrum: [
        { wave: "Delta (0.5-4Hz)", power: 14 },
        { wave: "Theta (4-8Hz)", power: 19 },
        { wave: "Alpha (8-12Hz)", power: 22 },
        { wave: "Beta (13-30Hz)", power: parseInt(formData.snnRiskScore, 10) || 75 },
        { wave: "Gamma (>30Hz)", power: 42 }
      ]
    };

    onSavePatient(newPatient);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl border-2 border-emerald-500/30 shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-fade-in my-8">
        <div className="p-5 bg-gradient-to-r from-emerald-800 to-emerald-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-700/60 rounded-xl border border-emerald-500/40">
              <Plus size={20} className="text-emerald-300" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold m-0 text-white tracking-tight">Register New Clinical Patient Record</h3>
              <p className="text-xs text-emerald-200 m-0">Input patient demographics, EEG wave readings & psychiatric observations</p>
            </div>
          </div>
          <button onClick={onClose} className="text-emerald-200 hover:text-white p-1 rounded-lg hover:bg-emerald-700/50 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 text-emerald-950 text-xs font-semibold">
          {/* Section 1: Demographics */}
          <div>
            <span className="text-[0.7rem] font-extrabold uppercase tracking-wider text-emerald-800 block mb-3 pb-1 border-b border-emerald-100">
              1. Patient Demographics & Doctor Info
            </span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block mb-1 font-bold text-emerald-900">Patient Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sarah Connor"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-emerald-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 outline-none text-xs font-bold"
                />
              </div>
              <div>
                <label className="block mb-1 font-bold text-emerald-900">Age</label>
                <input
                  type="number"
                  value={formData.age}
                  onChange={e => setFormData({ ...formData, age: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-emerald-300 focus:border-emerald-600 outline-none text-xs font-bold"
                />
              </div>
              <div>
                <label className="block mb-1 font-bold text-emerald-900">Gender</label>
                <select
                  value={formData.gender}
                  onChange={e => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-emerald-300 focus:border-emerald-600 outline-none text-xs font-bold bg-white"
                >
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block mb-1 font-bold text-emerald-900">Blood Type</label>
                <input
                  type="text"
                  value={formData.bloodType}
                  onChange={e => setFormData({ ...formData, bloodType: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-emerald-300 focus:border-emerald-600 outline-none text-xs font-bold"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block mb-1 font-bold text-emerald-900">Attending Psychiatrist / Doctor</label>
                <input
                  type="text"
                  value={formData.attendingDoctor}
                  onChange={e => setFormData({ ...formData, attendingDoctor: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-emerald-300 focus:border-emerald-600 outline-none text-xs font-bold"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Biometrics & SNN Metrics */}
          <div>
            <span className="text-[0.7rem] font-extrabold uppercase tracking-wider text-emerald-800 block mb-3 pb-1 border-b border-emerald-100">
              2. SNN Neural Risk & Biometric Signals
            </span>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block mb-1 font-bold text-emerald-900">Cognitive State</label>
                <select
                  value={formData.cognitiveState}
                  onChange={e => setFormData({ ...formData, cognitiveState: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-emerald-300 focus:border-emerald-600 outline-none text-xs font-bold bg-white"
                >
                  <option value="Stressed">Stressed (High Risk)</option>
                  <option value="Focused">Focused (Optimal)</option>
                  <option value="Neutral">Neutral (Baseline)</option>
                </select>
              </div>
              <div>
                <label className="block mb-1 font-bold text-emerald-900">SNN Risk Score (0-100%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.snnRiskScore}
                  onChange={e => setFormData({ ...formData, snnRiskScore: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-emerald-300 focus:border-emerald-600 outline-none text-xs font-bold"
                />
              </div>
              <div>
                <label className="block mb-1 font-bold text-emerald-900">Beta/Alpha Ratio</label>
                <input
                  type="text"
                  value={formData.betaAlphaRatio}
                  onChange={e => setFormData({ ...formData, betaAlphaRatio: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-emerald-300 focus:border-emerald-600 outline-none text-xs font-bold"
                />
              </div>
              <div>
                <label className="block mb-1 font-bold text-emerald-900">Heart Rate (BPM)</label>
                <input
                  type="number"
                  value={formData.heartRate}
                  onChange={e => setFormData({ ...formData, heartRate: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-emerald-300 focus:border-emerald-600 outline-none text-xs font-bold"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Clinical Symptoms & Diagnosis */}
          <div>
            <span className="text-[0.7rem] font-extrabold uppercase tracking-wider text-emerald-800 block mb-3 pb-1 border-b border-emerald-100">
              3. Chief Complaints & Psychiatric Diagnosis
            </span>
            <div className="space-y-4">
              <div>
                <label className="block mb-1 font-bold text-emerald-900">Chief Complaint Submitted for Checkup</label>
                <textarea
                  rows={2}
                  value={formData.chiefComplaint}
                  onChange={e => setFormData({ ...formData, chiefComplaint: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-emerald-300 focus:border-emerald-600 outline-none text-xs font-semibold resize-none"
                />
              </div>
              <div>
                <label className="block mb-1 font-bold text-emerald-900">Identified Clinical & Physiological Problems (One per line)</label>
                <textarea
                  rows={3}
                  value={formData.checkupProblemsText}
                  onChange={e => setFormData({ ...formData, checkupProblemsText: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-emerald-300 focus:border-emerald-600 outline-none text-xs font-semibold resize-none"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 font-bold text-emerald-900">Diagnostic Classification (ICD Code)</label>
                  <input
                    type="text"
                    value={formData.icdCode}
                    onChange={e => setFormData({ ...formData, icdCode: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-emerald-300 focus:border-emerald-600 outline-none text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-bold text-emerald-900">Neurological Diagnostic Assessment</label>
                  <input
                    type="text"
                    value={formData.diagnosis}
                    onChange={e => setFormData({ ...formData, diagnosis: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-emerald-300 focus:border-emerald-600 outline-none text-xs font-bold"
                  />
                </div>
              </div>
              <div>
                <label className="block mb-1 font-bold text-emerald-900">Recommended Treatment & Intervention Plan</label>
                <textarea
                  rows={2}
                  value={formData.treatmentPlan}
                  onChange={e => setFormData({ ...formData, treatmentPlan: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-emerald-300 focus:border-emerald-600 outline-none text-xs font-semibold resize-none"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-emerald-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-emerald-800 font-bold border border-emerald-300 hover:bg-emerald-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-white font-bold bg-gradient-to-r from-emerald-600 to-emerald-800 hover:from-emerald-700 hover:to-emerald-900 shadow-md transition-all flex items-center gap-2"
            >
              <CheckCircle2 size={16} />
              <span>Save & Register Patient</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function EmployerWorkspaceDashboard({ onLogout, isDemo = false }) {
  const navigate = useNavigate();
  
  // Live Workspace Patient State (persisted in localStorage)
  const [livePatients, setLivePatients] = useState(() => {
    const saved = localStorage.getItem('snn_live_patients');
    return saved ? JSON.parse(saved) : [];
  });
  const [isAddPatientModalOpen, setIsAddPatientModalOpen] = useState(false);

  useEffect(() => {
    if (!isDemo) {
      localStorage.setItem('snn_live_patients', JSON.stringify(livePatients));
    }
  }, [livePatients, isDemo]);

  // Isolate Demo Mode dataset from Live Workspace dataset
  const patients = isDemo ? INITIAL_PATIENTS : livePatients;

  const handleSaveNewPatient = (newPatient) => {
    if (isDemo) {
      setSelectedPatient(newPatient);
      setActiveTab('patient-detail');
      return;
    }
    const updated = [newPatient, ...livePatients];
    setLivePatients(updated);
    setSelectedPatient(newPatient);
    setActiveTab('patient-detail');
  };

  const [activeTab, setActiveTab] = useState('patients'); // 'patients' | 'calendar' | 'patient-detail' | 'analysis'
  const [searchQuery, setSearchQuery] = useState('');
  const [filterState, setFilterState] = useState('ALL'); // 'ALL' | 'Stressed' | 'Focused' | 'Neutral'
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedAnalysisUploadId, setSelectedAnalysisUploadId] = useState(null);

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
      p.diagnosis.toLowerCase().includes(searchQuery.toLowerCase());

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
            <Building2 size={22} className="text-emerald-400" />
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
            className={`nav-item ${activeTab === 'analysis' ? 'active' : ''}`}
            onClick={() => { setActiveTab('analysis'); setSelectedAnalysisUploadId(null); }}
          >
            <Activity size={18} />
            <span>EDF Wave Analysis</span>
          </button>

          {activeTab === 'patient-detail' && selectedPatient && (
            <div className="active-patient-subnav animate-fade-in">
              <div className="subnav-header">SELECTED PATIENT</div>
              <div className="subnav-patient-card">
                <Brain size={16} className="text-emerald-500 flex-shrink-0" />
                <div className="truncate">
                  <div className="font-bold text-xs truncate">{selectedPatient.name}</div>
                  <div className="text-[0.68rem] text-emerald-600">{selectedPatient.id}</div>
                </div>
              </div>
            </div>
          )}

          <div className="nav-section-title mt-6">QUICK ACTIONS</div>
          <button
            className={`nav-item ${activeTab === 'analysis' ? 'active' : ''}`}
            onClick={() => { setActiveTab('analysis'); setSelectedAnalysisUploadId(null); }}
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
              <Stethoscope size={18} className="text-emerald-400" />
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
              {activeTab === 'analysis' && 'File Analysis & EDF Wave Processing'}
            </h2>
            <p className="topbar-subtitle">
              {activeTab === 'patients' && 'Manage patient neurological records, EDF EEG analyses, and SNN stress scores'}
              {activeTab === 'calendar' && 'Select dates to view scheduled patient EEG sessions and diagnostic logs'}
              {activeTab === 'patient-detail' && selectedPatient && `Comprehensive neurological profile, check-up issues, EEG graphs, and session logs for ${selectedPatient.name}`}
              {activeTab === 'analysis' && 'Upload raw EDF or CSV files to execute SNN wave decomposition, FFT spectral analysis, and generate psychiatric diagnostic reports'}
            </p>
          </div>

          <div className="topbar-actions flex items-center gap-2.5">
            {isDemo && (
              <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1.5">
                <Sparkles size={14} className="text-amber-400" />
                <span>Demo Version Preview</span>
              </span>
            )}

            {/* Register Patient Button in Right Navigation Header */}
            <button
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-emerald-800 hover:from-emerald-700 hover:to-emerald-900 text-white shadow-md transition-all flex items-center gap-1.5 border border-emerald-500/40"
              onClick={() => setIsAddPatientModalOpen(true)}
              title="Register New Clinical Patient Record"
            >
              <Plus size={16} />
              <span>Register Patient</span>
            </button>

            {activeTab === 'patient-detail' || activeTab === 'analysis' ? (
              <button
                className="btn-back-directory"
                onClick={() => { setActiveTab('patients'); setSelectedPatient(null); setSelectedAnalysisUploadId(null); }}
              >
                <ArrowLeft size={16} />
                <span>Back to Directory</span>
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
              <span>{isDemo ? 'Exit Demo' : 'Logout'}</span>
            </button>
          </div>
        </header>

        {/* TAB 1: PATIENTS DIRECTORY (LIST VIEW) */}
        {activeTab === 'patients' && (
          <div className="workspace-content animate-fade-in">
            {patients.length === 0 ? (
              <div className="clinical-card p-10 text-center flex flex-col items-center justify-center my-6 border-2 border-dashed border-emerald-400/60 bg-emerald-50/60 rounded-2xl shadow-sm">
                <div className="p-4 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-700 mb-4 shadow-inner">
                  <Users size={36} />
                </div>
                <h3 className="text-xl font-extrabold text-emerald-950 mb-1 tracking-tight">Live Workspace is Empty</h3>
                <p className="text-xs text-emerald-800/80 max-w-md mb-6 leading-relaxed">
                  No patient records have been registered in your clinical workspace yet. Click below or use the top right navigation button to register your first patient.
                </p>
                <div className="flex items-center gap-3">
                  <button
                    className="px-5 py-2.5 rounded-xl text-white font-bold bg-gradient-to-r from-emerald-600 to-emerald-800 hover:from-emerald-700 hover:to-emerald-900 shadow-md transition-all flex items-center gap-2 text-xs"
                    onClick={() => setIsAddPatientModalOpen(true)}
                  >
                    <Plus size={16} />
                    <span>Register First Patient</span>
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Search & Filter Control Bar */}
                <div className="controls-bar">
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
                                <span className="patient-name">{p.name}</span>
                                <span className="patient-meta">{p.id} • {p.age} yrs • {p.gender}</span>
                              </div>
                            </td>
                            <td>
                              <span className={`status-badge ${p.cognitiveState.toLowerCase()}`}>
                                {p.cognitiveState === 'Stressed' && <AlertTriangle size={12} />}
                                {p.cognitiveState === 'Focused' && <CheckCircle2 size={12} />}
                                {p.cognitiveState}
                              </span>
                            </td>
                            <td>
                              <div className="risk-score-wrapper">
                                <div className="risk-bar-container">
                                  <div
                                    className={`risk-bar ${p.snnRiskScore > 70 ? 'high' : p.snnRiskScore > 40 ? 'med' : 'low'}`}
                                    style={{ width: `${p.snnRiskScore}%` }}
                                  />
                                </div>
                                <span className="risk-value">{p.snnRiskScore}% SNN Spike</span>
                              </div>
                            </td>
                            <td>
                              <div className="metrics-cell">
                                <span className="metric-tag">Beta/Alpha: <strong>{p.betaAlphaRatio}</strong></span>
                                <span className="metric-tag">HR: <strong>{p.heartRate} BPM</strong></span>
                              </div>
                            </td>
                            <td>
                              <div className="time-cell">
                                <Clock size={13} className="text-emerald-500" />
                                <span>{p.sessionDate} at {p.sessionTime}</span>
                              </div>
                            </td>
                            <td>
                              <span className="edf-badge">
                                {p.edfStatus}
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
                  <div className="legend-item"><span className="legend-today-outline" /> Today (Green Outline)</div>
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
                            <Brain size={13} className="text-emerald-500" />
                            <span>Beta/Alpha: <strong>{p.betaAlphaRatio}</strong></span>
                          </div>
                          <div className="detail-chip">
                            <Heart size={13} className="text-red-500" />
                            <span>Heart Rate: <strong>{p.heartRate} BPM</strong></span>
                          </div>
                          <div className="detail-chip">
                            <Activity size={13} className="text-emerald-600" />
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
          </div>
        )}

        {/* TAB 3: PSYCHIATRIC CLINICAL PATIENT DETAIL WINDOW */}
        {activeTab === 'patient-detail' && selectedPatient && (
          <div className="workspace-content patient-detail-window-view animate-fade-in">
            {/* Header Banner Hero Card */}
            <div className="patient-hero-card">
              <div className="hero-main-info">
                <div className="patient-avatar-badge">
                  <User size={28} className="text-emerald-600" />
                </div>
                <div>
                  <div className="patient-title-row">
                    <h2>{selectedPatient.name}</h2>
                    <span className="hero-id-tag">{selectedPatient.id}</span>
                    <span className={`status-badge ${selectedPatient.cognitiveState.toLowerCase()}`}>
                      {selectedPatient.cognitiveState}
                    </span>
                  </div>
                  <div className="patient-demographics-row">
                    <span><strong>Age:</strong> {selectedPatient.age} yrs</span>
                    <span className="dot-sep">•</span>
                    <span><strong>Sex:</strong> {selectedPatient.gender}</span>
                    <span className="dot-sep">•</span>
                    <span><strong>Blood Type:</strong> {selectedPatient.bloodType || 'A+'}</span>
                    <span className="dot-sep">•</span>
                    <span><strong>Attending Doctor:</strong> {selectedPatient.attendingDoctor}</span>
                  </div>
                </div>
              </div>

              <div className="hero-actions">
                <button
                  className="btn-hero-action primary"
                  onClick={() => alert(`Generating & Downloading Official Psychiatric Assessment PDF for ${selectedPatient.name}...`)}
                >
                  <Download size={16} />
                  <span>Download Psychiatric Report</span>
                </button>

                <button
                  className="btn-hero-action secondary"
                  onClick={() => { setActiveTab('analysis'); setSelectedAnalysisUploadId(null); }}
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
                  <span className="strip-value text-emerald-600">{selectedPatient.snnRiskScore}%</span>
                  <span className="strip-sub">Spike Rate Load</span>
                </div>
                <div className="strip-progress-bg">
                  <div
                    className={`strip-progress-bar ${selectedPatient.snnRiskScore > 70 ? 'high' : 'normal'}`}
                    style={{ width: `${selectedPatient.snnRiskScore}%` }}
                  />
                </div>
              </div>

              <div className="metric-strip-card">
                <span className="strip-label">BETA / ALPHA WAVE RATIO</span>
                <div className="strip-value-row">
                  <span className="strip-value">{selectedPatient.betaAlphaRatio}</span>
                </div>
                <span className="strip-sub text-emerald-700">Cortical Arousal Metric</span>
              </div>

              <div className="metric-strip-card">
                <span className="strip-label">AVERAGE HEART RATE (HRV)</span>
                <div className="strip-value-row">
                  <span className="strip-value">{selectedPatient.heartRate} BPM</span>
                </div>
                <span className="strip-sub text-emerald-700">Autonomic Cardiac Metric</span>
              </div>

              <div className="metric-strip-card">
                <span className="strip-label">LAST RECORDED SESSION</span>
                <div className="strip-value-row">
                  <span className="strip-value text-sm font-semibold">{selectedPatient.sessionDate}</span>
                </div>
                <span className="strip-sub">{selectedPatient.sessionTime}</span>
              </div>
            </div>

            {/* Two Column Grid: Left Checkup Problems & Psychiatrist Report, Right Graphs */}
            <div className="detail-grid-layout">
              {/* Left Column: Problems Facing & Psychiatric Assessment */}
              <div className="detail-left-col">
                {/* Check-Up Problems & Chief Complaints Card */}
                <div className="clinical-card">
                  <div className="card-header-title">
                    <AlertCircle size={18} className="text-emerald-600" />
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
                        {selectedPatient.checkupProblems ? (
                          selectedPatient.checkupProblems.map((prob, idx) => (
                            <li key={idx} className="problem-bullet-item">
                              <CheckCircle2 size={15} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                              <span>{prob}</span>
                            </li>
                          ))
                        ) : (
                          <li className="problem-bullet-item">
                            <CheckCircle2 size={15} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                            <span>High Beta wave hyperactivity during sustained attention tasks</span>
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Psychiatric Assessment Report Preview Box */}
                <div className="clinical-card mt-6">
                  <div className="card-header-title">
                    <FileCheck size={18} className="text-emerald-600" />
                    <h3>Psychiatric Diagnostic Assessment & Clinical Summary</h3>
                  </div>

                  <div className="card-body-content">
                    <div className="icd-code-row">
                      <span className="label">Diagnostic Classification:</span>
                      <span className="icd-badge">{selectedPatient.icdCode || 'ICD-11: 6C40 / MB23.1'}</span>
                    </div>

                    <div className="impression-box">
                      <h4>Neurological Diagnostic Assessment</h4>
                      <p>{selectedPatient.diagnosis}</p>
                    </div>

                    <div className="doctor-observations-box">
                      <h4>Attending Psychiatrist Clinical Observations</h4>
                      <p>{selectedPatient.doctorNotes}</p>
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
                    <TrendingUp size={18} className="text-emerald-600" />
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
                    <Layers size={18} className="text-emerald-600" />
                    <h3>EEG Waveband Spectral Distribution</h3>
                  </div>

                  <div className="card-body-content">
                    <p className="graph-subtext">Relative power distribution across Delta, Theta, Alpha, Beta, and Gamma wavebands.</p>
                    <div className="chart-container-wrapper">
                      <ResponsiveContainer width="100%" height={210}>
                        <BarChart data={selectedPatient.waveSpectrum || [
                          { wave: "Delta", power: 12 },
                          { wave: "Theta", power: 18 },
                          { wave: "Alpha", power: 24 },
                          { wave: "Beta", power: 78 },
                          { wave: "Gamma", power: 45 }
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

            {/* AI Dynamic Neuro-Clinical Recommendation Engine Window (Placed after basic details & graphs, before session logs) */}
            <ClinicalRecommendationEngine data={selectedPatient} />

            {/* Bottom Section: Recorded Session Logs Audit Table */}
            <div className="recorded-sessions-card mt-6">
              <div className="card-header-title">
                <Clock size={18} className="text-emerald-600" />
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
                    {selectedPatient.recordedSessions && selectedPatient.recordedSessions.length > 0 ? (
                      selectedPatient.recordedSessions.map(ses => (
                        <tr key={ses.id} className="patient-row">
                          <td className="font-mono font-bold text-xs">{ses.id}</td>
                          <td>
                            <div className="time-cell">
                              <Clock size={13} className="text-emerald-500" />
                              <span>{ses.date} at {ses.time}</span>
                            </div>
                          </td>
                          <td className="text-xs font-semibold">{ses.duration}</td>
                          <td>
                            <span className="edf-badge">
                              {ses.edfFile}
                            </span>
                          </td>
                          <td>
                            <span className="font-bold text-xs text-emerald-700">{ses.snnScore}% Spike Rate</span>
                          </td>
                          <td>
                            <span className={`status-badge ${ses.state.toLowerCase()}`}>
                              {ses.state}
                            </span>
                          </td>
                          <td className="text-xs text-[var(--text-secondary)] max-w-xs truncate">{ses.notes}</td>
                          <td>
                            <div className="actions-cell">
                              <button
                                className="btn-action-view"
                                onClick={() => { setActiveTab('analysis'); setSelectedAnalysisUploadId(ses.edfFile || null); }}
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

        {/* TAB 4: FILE ANALYSIS SCREEN */}
        {activeTab === 'analysis' && (
          <div className="workspace-content animate-fade-in">
            {selectedAnalysisUploadId ? (
              <EmbeddedAnalysisView
                uploadId={selectedAnalysisUploadId}
                onBack={() => setSelectedAnalysisUploadId(null)}
              />
            ) : (
              <FileUpload
                onUploadSuccess={(uploadId) => setSelectedAnalysisUploadId(uploadId)}
              />
            )}
          </div>
        )}

        {/* Modal for Registering New Clinical Patient Record */}
        <AddPatientModal
          isOpen={isAddPatientModalOpen}
          onClose={() => setIsAddPatientModalOpen(false)}
          onSavePatient={handleSaveNewPatient}
        />
      </main>
    </div>
  );
}
