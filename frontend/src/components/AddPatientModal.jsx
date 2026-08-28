import React, { useState } from 'react';
import { X, UserPlus, Stethoscope, CheckCircle2, AlertCircle } from 'lucide-react';
import GlowButton from './ui/GlowButton';
import { useAuth } from '../context/AuthContext';

const API_BASE = import.meta.env.VITE_API_URL || "";

export default function AddPatientModal({ isOpen, onClose, onPatientCreated }) {
  const [formData, setFormData] = useState({
    name: '',
    age: 28,
    gender: 'Female',
    blood_type: 'A+',
    phone_number: '',
    email: '',
    medical_history: '',
    primary_care_physician: 'Dr. Sarah Jenkins, MD (Neuropsychiatry)',
    consent_given: true,
    data_sharing_consent: true,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const { getAuthHeaders } = useAuth();

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'age' ? parseInt(value, 10) || 0 : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.name.trim()) {
      setError("Patient name is required.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    const generatedId = `PAT-${Math.floor(10000 + Math.random() * 90000)}`;

    try {
      const payload = {
        name: formData.name.trim(),
        age: formData.age || 28,
        gender: formData.gender || 'Female',
        blood_type: formData.blood_type || 'A+',
        primary_care_physician: formData.primary_care_physician || 'Dr. Sarah Jenkins, MD',
        consent_given: Boolean(formData.consent_given),
        data_sharing_consent: Boolean(formData.data_sharing_consent),
        patient_id: generatedId,
        date_of_birth: new Date(new Date().getFullYear() - (formData.age || 28), 0, 1).toISOString().split('T')[0],
        email: formData.email && formData.email.trim() ? formData.email.trim() : null,
        phone_number: formData.phone_number && formData.phone_number.trim() ? formData.phone_number.trim() : null,
        medical_history: formData.medical_history && formData.medical_history.trim() ? formData.medical_history.trim() : null,
      };

      const res = await fetch(`${API_BASE}/api/patients/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Failed to create patient profile.");
      }

      setSuccess(`Patient profile for ${formData.name} created successfully (${generatedId})!`);
      
      const transformed = {
        id: data.patient_id,
        name: data.name,
        age: data.age || formData.age,
        gender: data.gender || formData.gender,
        bloodType: data.blood_type || formData.blood_type,
        attendingDoctor: data.primary_care_physician || formData.primary_care_physician,
        cognitiveState: 'Neutral',
        snnRiskScore: 20,
        betaAlphaRatio: '1.02 (Normal)',
        heartRate: 72,
        sessionDate: new Date().toISOString().split('T')[0],
        sessionTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        edfStatus: 'Uploaded',
        chiefComplaint: data.medical_history || formData.medical_history || 'Routine Neurological Baseline',
        checkupProblems: ['Baseline cognitive assessment', 'Telemetry calibration'],
        diagnosis: 'Baseline Neurological Check',
        doctorNotes: 'Patient registered in clinical portal. Ready for EEG wave recording.',
        icdCode: 'ICD-11: QA02.3 Routine Neurological Examination',
        treatmentPlan: 'Conduct baseline SNN cognitive stress mapping.',
        recordedSessions: [],
        graphData: [
          { time: "09:00", snnSpikes: 15, heartRate: 70 },
          { time: "09:15", snnSpikes: 20, heartRate: 72 },
          { time: "09:30", snnSpikes: 18, heartRate: 71 }
        ],
        waveSpectrum: [
          { wave: "Delta", power: 12 },
          { wave: "Theta", power: 18 },
          { wave: "Alpha", power: 85 },
          { wave: "Beta", power: 22 },
          { wave: "Gamma", power: 10 }
        ]
      };

      if (onPatientCreated) {
        onPatientCreated(transformed);
      }

      setTimeout(() => {
        setSuccess(null);
        onClose();
      }, 1500);
    } catch (err) {
      console.error("Patient registration error:", err);
      setError(err.message || "Failed to create patient.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-[var(--border-glass)] relative animate-scale-up max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 transition-colors"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
            <UserPlus size={22} />
          </div>
          <div>
            <h3 className="text-lg font-bold font-heading text-slate-900">
              Register New Clinical Patient
            </h3>
            <p className="text-xs text-slate-500">
              Create a neurological record and assign an attending physician.
            </p>
          </div>
        </div>

        {success && (
          <div className="mb-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-fade-in">
            <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-semibold flex items-center gap-2 animate-fade-in">
            <AlertCircle size={16} className="text-red-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                required
                placeholder="e.g. Liam Foster"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-xs font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Age
              </label>
              <input
                type="number"
                name="age"
                min={1}
                max={120}
                value={formData.age}
                onChange={handleChange}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-xs font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Gender
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-xs font-medium bg-white"
              >
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Blood Type
              </label>
              <select
                name="blood_type"
                value={formData.blood_type}
                onChange={handleChange}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-xs font-medium bg-white"
              >
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Contact Phone
              </label>
              <input
                type="text"
                name="phone_number"
                placeholder="555-0199"
                value={formData.phone_number}
                onChange={handleChange}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-xs font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Patient Email
              </label>
              <input
                type="email"
                name="email"
                placeholder="patient@email.com"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-xs font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Attending Physician
            </label>
            <input
              type="text"
              name="primary_care_physician"
              value={formData.primary_care_physician}
              onChange={handleChange}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-xs font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Chief Complaint & Medical History
            </label>
            <textarea
              name="medical_history"
              rows={3}
              placeholder="e.g. Reports acute cognitive fatigue, focus drops under tight deadlines, and tension headaches."
              value={formData.medical_history}
              onChange={handleChange}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-xs font-medium resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <GlowButton variant="ghost" onClick={onClose} disabled={loading} type="button">
              Cancel
            </GlowButton>
            <GlowButton variant="success" type="submit" disabled={loading} className="inline-flex items-center gap-2">
              <UserPlus size={15} />
              <span>{loading ? "Registering..." : "Save Patient Profile"}</span>
            </GlowButton>
          </div>
        </form>
      </div>
    </div>
  );
}
