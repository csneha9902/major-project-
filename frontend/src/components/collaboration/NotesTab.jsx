import React, { useState, useEffect } from 'react';
import {
  FileText,
  User,
  Users,
  Clock,
  AlertTriangle,
  CheckCircle2,
  X,
  Eye,
  Plus,
  Trash2,
  Settings,
  ShieldCheck,
  Activity,
  Stethoscope,
  Calendar,
  Lock
} from 'lucide-react';

export default function NotesTab({
  notes = [],
  patients = [],
  selectedPatient,
  onSelectPatient,
  onClearPatientSelection,
  newNote,
  setNewNote,
  onCreateNote,
  collaborationApi
}) {
  const [showForm, setShowForm] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  const [filterParams, setFilterParams] = useState({
    patient_id: selectedPatient ? selectedPatient.id : null,
    created_by: null,
    is_confidential: null,
    note_type: null
  });

  // Update filters when patient selection changes
  useEffect(() => {
    setFilterParams(prev => ({
      ...prev,
      patient_id: selectedPatient ? selectedPatient.id : null
    }));
  }, [selectedPatient]);

  // Get user info for display
  const getUserName = (userId) => {
    const userMap = {
      1: 'System Administrator',
      2: 'Dr. Sarah Smith',
      3: 'Alex Johnson'
    };
    return userMap[userId] || `User ${userId}`;
  };

  const getPatientName = (patientId) => {
    if (!patientId) return null;
    const patient = (patients || []).find(p => p.id === patientId || p.patient_id === patientId);
    return patient ? patient.name : `Patient ${patientId}`;
  };


  // Filtered notes
  const filteredNotes = notes.filter(note => {
    // Apply filters
    if (filterParams.patient_id && note.patient_id !== filterParams.patient_id) return false;
    if (filterParams.created_by && note.created_by !== filterParams.created_by) return false;
    if (filterParams.is_confidential !== null && note.is_confidential !== filterParams.is_confidential) return false;
    if (filterParams.note_type && note.note_type !== filterParams.note_type) return false;
    return true;
  }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at)); // Newest first

  return (
    <div className="notes-tab">
      {/* Note Filters */}
      <div className="notes-filters">
        <div className="filter-row">
          <div className="filter-group">
            <label>Patient:</label>
            <select
              value={filterParams.patient_id || ''}
              onChange={(e) => setFilterParams(prev => ({ ...prev, patient_id: e.target.value ? Number(e.target.value) : null }))}
            >
              <option value="">All Patients</option>
              {patients.map(patient => (
                <option key={patient.id} value={patient.id}>
                  {patient.name}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Created By:</label>
            <select
              value={filterParams.created_by || ''}
              onChange={(e) => setFilterParams(prev => ({ ...prev, created_by: e.target.value ? Number(e.target.value) : null }))}
            >
              <option value="">All Creators</option>
              {[1, 2, 3].map(id => (
                <option key={id} value={id}>
                  {getUserName(id)}
                </option>
              ))}
            </select>

          </div>

          <div className="filter-group">
            <label>Confidentiality:</label>
            <select
              value={filterParams.is_confidential === null ? '' : String(filterParams.is_confidential)}
              onChange={(e) => setFilterParams(prev => ({
                ...prev,
                is_confidential: e.target.value === '' ? null : e.target.value === 'true'
              }))}
            >
              <option value="">All</option>
              <option value="true">Confidential Only</option>
              <option value="false">Non-Confidential Only</option>
            </select>
          </div>
        </div>

        <div className="filter-row">
          <div className="filter-group">
            <label>Note Type:</label>
            <select
              value={filterParams.note_type || ''}
              onChange={(e) => setFilterParams(prev => ({ ...prev, note_type: e.target.value || null }))}
            >
              <option value="">All Types</option>
              <option value="progress_note">Progress Note</option>
              <option value="consultation_note">Consultation Note</option>
              <option value="discharge_summary">Discharge Summary</option>
              <option value="assessment_note">Assessment Note</option>
              <option value="treatment_plan">Treatment Plan</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notes List */}
      <div className="notes-list">
        {filteredNotes.length > 0 ? (
          filteredNotes.map((note) => (
            <div key={note.id} className={`note-card ${note.is_confidential ? 'note-confidential' : ''}`}>
              <div className="note-header">
                <div className="note-info">
                  <div className="note-title">
                    <h3>{note.title || 'Untitled Note'}</h3>
                    {note.is_confidential && (
                      <span className="confidential-badge">
                        <Lock size={16} className="text-red-500" />
                        CONFIDENTIAL
                      </span>
                    )}
                  </div>

                  <div className="note-meta">
                    <div className="meta-item">
                      <User size={16} className="text-blue-600" />
                      <span>By: {getUserName(note.created_by)}</span>
                    </div>
                    <div className="meta-item">
                      <Calendar size={16} className="text-muted" />
                      <span>{new Date(note.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="note-actions">
                  <button
                    onClick={() => setSelectedNote(note)}
                    className="btn-note-action"
                  >
                    <Eye size={16} />
                    <span>View</span>
                  </button>
                </div>
              </div>

              {note.patient_id && (
                <div className="note-patient">
                  <Stethoscope size={16} className="text-blue-500" />
                  <span>Patient: {getPatientName(note.patient_id)}</span>
                </div>
              )}


            <div className="note-preview">
              <p>{note.content.substring(0, 200)}{note.content.length > 200 ? '...' : ''}</p>
            </div>
          </div>
        ))
      ) : (
        <div className="empty-state">
          <FileText size={48} className="opacity-20 mb-4" />
          <h3>No Notes Found</h3>
          <p>Try adjusting your filters or create a new note to get started.</p>
        </div>
      )}
    </div>

    {/* Note Detail View */}
    {selectedNote && (
      <div className="note-detail-panel">
        <div className="note-detail-header">
          <h3>{selectedNote.title || 'Untitled Note'}</h3>
          {selectedNote.is_confidential && (
            <span className="confidential-badge">
              <Lock size={16} className="text-red-500" />
              CONFIDENTIAL
            </span>
          )}
          <button onClick={() => setSelectedNote(null)} className="btn-close-detail">
            <X size={20} />
          </button>
        </div>

        <div className="note-detail-content">
          <div className="detail-section">
            <h4>Note Information</h4>
            <div className="detail-field">
              <label>Title:</label>
              <span>{selectedNote.title || 'Untitled Note'}</span>
            </div>

            <div className="detail-field">
              <label>Content:</label>
              <div className="note-content-full">
                <p>{selectedNote.content}</p>
              </div>
            </div>

            <div className="detail-field">
              <label>Created By:</label>
              <span>{getUserName(selectedNote.created_by)}</span>
            </div>

            <div className="detail-field">
              <label>Created At:</label>
              <span>{new Date(selectedNote.created_at).toLocaleString()}</span>
            </div>

            <div className="detail-field">
              <label>Updated At:</label>
              <span>{new Date(selectedNote.updated_at).toLocaleString()}</span>
            </div>

            <div className="detail-field">
              <label>Confidential:</label>
              <span className={`${selectedNote.is_confidential ? 'text-red-500' : 'text-blue-600'}`}>
                {selectedNote.is_confidential ? 'Yes' : 'No'}
              </span>
            </div>

            <div className="detail-field">
              <label>Note Type:</label>
              <span>{selectedNote.note_type.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}</span>
            </div>
          </div>

          {selectedNote.patient_id && (
            <div className="detail-section">
              <h4>Patient Information</h4>
              <div className="detail-field">
                <label>Patient:</label>
                <span>{getPatientName(selectedNote.patient_id)}</span>
              </div>
            </div>
          )}

          <div className="note-detail-actions">
            <button
              onClick={() => {
                // In a real app, this would edit the note
                alert('Edit note functionality would go here');
              }}
              className="btn-detail-action"
            >
              <Settings size={16} />
              <span>Edit Note</span>
            </button>
            <button
              onClick={() => {
                if (window.confirm(`Are you sure you want to delete the note "${selectedNote.title || 'Untitled Note'}"?`)) {
                  // In a real app, this would delete the note
                  alert('Delete note functionality would go here');
                }
              }}
              className="btn-detail-action destructive"
            >
              <Trash2 size={16} />
              <span>Delete Note</span>
            </button>
            <button
              onClick={() => setSelectedNote(null)}
              className="btn-detail-action secondary"
            >
              <X size={16} />
              <span>Close</span>
            </button>
          </div>
        </div>
      </div>
    )}


      {/* New Note Form */}
      {showForm && (
        <div className="new-note-form">
          <div className="form-header">
            <h3>Create New Note</h3>
            <button onClick={() => setShowForm(false)} className="btn-close-form">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={onCreateNote} className="note-form">
            <div className="form-group">
              <label>Patient:</label>
              <select
                value={newNote.patient_id || ''}
                onChange={(e) => setNewNote(prev => ({ ...prev, patient_id: e.target.value ? Number(e.target.value) : null }))}
                required
              >
                <option value="">Select Patient</option>
                {patients.map(patient => (
                  <option key={patient.id} value={patient.id}>
                    {patient.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Created By:</label>
              <select
                value={newNote.created_by || ''}
                onChange={(e) => setNewNote(prev => ({ ...prev, created_by: e.target.value ? Number(e.target.value) : null }))}
              >
                <option value="">Select Creator</option>
                {[1, 2, 3].map(id => (
                  <option key={id} value={id}>
                    {getUserName(id)}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Title:</label>
              <input
                type="text"
                placeholder="Enter note title..."
                value={newNote.title}
                onChange={(e) => setNewNote(prev => ({ ...prev, title: e.target.value }))}
                required
              />
            </div>

            <div className="form-group">
              <label>Content:</label>
              <textarea
                placeholder="Enter note content..."
                value={newNote.content}
                onChange={(e) => setNewNote(prev => ({ ...prev, content: e.target.value }))}
                rows={6}
              />
            </div>

            <div className="form-group">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={newNote.is_confidential}
                  onChange={(e) => setNewNote(prev => ({ ...prev, is_confidential: e.target.checked }))}
                />
                Confidential Note
              </label>
            </div>


            <div className="form-group">
              <label>Note Type:</label>
              <select
                value={newNote.note_type || ''}
                onChange={(e) => setNewNote(prev => ({ ...prev, note_type: e.target.value }))}
              >
                <option value="progress_note">Progress Note</option>
                <option value="consultation_note">Consultation Note</option>
                <option value="discharge_summary">Discharge Summary</option>
                <option value="assessment_note">Assessment Note</option>
                <option value="treatment_plan">Treatment Plan</option>
              </select>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-submit">
                <FileText size={18} />
                <span>Create Note</span>
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="btn-cancel"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* New Note Button */}
      {!showForm && (
        <div className="new-note-float">
          <button
            onClick={() => setShowForm(true)}
            className="btn-float-action"
          >
            <FileText size={24} />
            <span>New Note</span>
          </button>
        </div>
      )}
    </div>
  );
}