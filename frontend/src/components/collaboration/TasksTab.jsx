import React, { useState, useEffect } from 'react';
import {
  ClipboardList,
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
  Calendar
} from 'lucide-react';

export default function TasksTab({
  tasks = [],
  setTasks,
  patients = [],
  selectedPatient,
  onSelectPatient,
  onClearPatientSelection,
  newTask,
  setNewTask,
  onCreateTask,
  collaborationApi
}) {
  const [showForm, setShowForm] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [filterParams, setFilterParams] = useState({
    patient_id: selectedPatient ? selectedPatient.id : null,
    assigned_to: null,
    assigned_by: null,
    status: null,
    priority: null,
    task_type: null,
    include_completed: false
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

  // Filtered tasks
  const filteredTasks = (tasks || []).filter(task => {
    if (!task) return false;
    // Apply filters
    if (filterParams.patient_id && task.patient_id !== filterParams.patient_id) return false;
    if (filterParams.assigned_to && task.assigned_to !== filterParams.assigned_to) return false;
    if (filterParams.assigned_by && task.assigned_by !== filterParams.assigned_by) return false;
    if (filterParams.status && task.status !== filterParams.status) return false;
    if (filterParams.priority && task.priority !== filterParams.priority) return false;
    if (filterParams.task_type && task.task_type !== filterParams.task_type) return false;
    if (!filterParams.include_completed && task.status === 'completed') return false;
    return true;
  }).sort((a, b) => {
    // Sort by priority (urgent first) then by due date
    const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
    const aPriority = priorityOrder[a.priority] || 0;
    const bPriority = priorityOrder[b.priority] || 0;
    if (aPriority !== bPriority) return bPriority - aPriority;

    const aDue = a.due_date ? new Date(a.due_date).getTime() : Infinity;
    const bDue = b.due_date ? new Date(b.due_date).getTime() : Infinity;
    return aDue - bDue;
  });

  const handleTaskAction = async (action, taskId) => {
    switch (action) {
      case 'complete':
        try {
          if (collaborationApi?.completeTask) {
            await collaborationApi.completeTask(taskId);
          }
          // Update local state if setTasks is provided
          if (setTasks) {
            setTasks(prev =>
              prev.map(t =>
                t.id === taskId ? { ...t, status: 'completed', completed_at: new Date().toISOString() } : t
              )
            );
          }
          setSelectedTask(null);
        } catch (err) {
          console.error('Failed to complete task:', err);
          alert('Failed to complete task');
        }
        break;
      default:
        break;
    }
  };


  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'text-red-500';
      case 'high': return 'text-orange-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-blue-600';
      default: return 'text-muted';
    }
  };

  return (
    <div className="tasks-tab">
      {/* Task Filters */}
      <div className="tasks-filters">
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
            <label>Assigned To:</label>
            <select
              value={filterParams.assigned_to || ''}
              onChange={(e) => setFilterParams(prev => ({ ...prev, assigned_to: e.target.value ? Number(e.target.value) : null }))}
            >
              <option value="">All Assignees</option>
              {[1, 2, 3].map(id => (
                <option key={id} value={id}>
                  {getUserName(id)}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Assigned By:</label>
            <select
              value={filterParams.assigned_by || ''}
              onChange={(e) => setFilterParams(prev => ({ ...prev, assigned_by: e.target.value ? Number(e.target.value) : null }))}
            >
              <option value="">All Assigners</option>
              {[1, 2, 3].map(id => (
                <option key={id} value={id}>
                  {getUserName(id)}
                </option>
              ))}
            </select>

          </div>
        </div>

        <div className="filter-row">
          <div className="filter-group">
            <label>Status:</label>
            <select
              value={filterParams.status || ''}
              onChange={(e) => setFilterParams(prev => ({ ...prev, status: e.target.value || null }))}
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Priority:</label>
            <select
              value={filterParams.priority || ''}
              onChange={(e) => setFilterParams(prev => ({ ...prev, priority: e.target.value || null }))}
            >
              <option value="">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Task Type:</label>
            <select
              value={filterParams.task_type || ''}
              onChange={(e) => setFilterParams(prev => ({ ...prev, task_type: e.target.value || null }))}
            >
              <option value="">All Types</option>
              <option value="follow_up_assessment">Follow-up Assessment</option>
              <option value="medication_review">Medication Review</option>
              <option value="lab_order">Lab Order</option>
              <option value="appointment_scheduling">Appointment Scheduling</option>
              <option value="patient_education">Patient Education</option>
              <option value="follow_up_call">Follow-up Call</option>
            </select>
          </div>
        </div>

        <div className="filter-row">
          <div className="filter-group">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filterParams.include_completed}
                onChange={(e) => setFilterParams(prev => ({ ...prev, include_completed: e.target.checked }))}
              />
              Include Completed Tasks
            </label>
          </div>
        </div>
      </div>

      {/* Tasks List */}
      <div className="tasks-list">
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task) => (
            <div key={task.id} className={`task-card ${task.status === 'completed' ? 'task-completed' : ''}`}>
              <div className="task-header">
                <div className="task-info">
                  <div className="task-title">
                    <h3>{task.title}</h3>
                    <div className="task-meta">
                      <span className="priority-tag" style={{ color: getPriorityColor(task.priority) }}>
                        {task.priority.toUpperCase()}
                      </span>
                      <span className="task-status status-{task.status}">
                        {task.status.toUpperCase().replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  <div className="task-assignment">
                    <div className="assignee">
                      <User size={16} className="text-blue-600" />
                      <span>Assigned to: {getUserName(task.assigned_to)}</span>
                    </div>
                    <div className="assigner">
                      <ShieldCheck size={16} className="text-muted" />
                      <span>Assigned by: {getUserName(task.assigned_by)}</span>
                    </div>
                  </div>
                </div>

                <div className="task-metadata">
                  {task.due_date && (
                    <div className="due-date">
                      <Calendar size={16} className="text-muted" />
                      <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>
                    </div>
                  )}
                  {task.task_type && (
                    <div className="task-type">
                      <Activity size={16} className="text-blue-500" />
                      <span>{task.task_type.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}</span>
                    </div>
                  )}
                </div>
              </div>

              {task.description && (
                <div className="task-description">
                  <p>{task.description}</p>
                </div>
              )}


            {task.patient_id && (
              <div className="task-patient">
                <Stethoscope size={16} className="text-blue-500" />
                <span>Patient: {getPatientName(task.patient_id)}</span>
              </div>
            )}

            <div className="task-actions">
              {task.status !== 'completed' && (
                <button
                  onClick={() => handleTaskAction('complete', task.id)}
                  className="btn-task-action"
                >
                  <CheckCircle2 size={16} />
                  <span>Mark Complete</span>
                </button>
              )}
              <button
                onClick={() => setSelectedTask(task)}
                className="btn-task-action"
              >
                <Eye size={16} />
                <span>View Details</span>
              </button>
            </div>
          </div>
        ))
      ) : (
        <div className="empty-state">
          <ClipboardList size={48} className="opacity-20 mb-4" />
          <h3>No Tasks Found</h3>
          <p>Try adjusting your filters or create a new task to get started.</p>
        </div>
      )}
    </div>

    {/* Task Detail View */}
    {selectedTask && (
      <div className="task-detail-panel">
        <div className="task-detail-header">
          <h3>{selectedTask.title}</h3>
          <button onClick={() => setSelectedTask(null)} className="btn-close-detail">
            <X size={20} />
          </button>
        </div>

        <div className="task-detail-content">
          <div className="detail-section">
            <h4>Task Information</h4>
            <div className="detail-field">
              <label>Title:</label>
              <span>{selectedTask.title}</span>
            </div>

            <div className="detail-field">
              <label>Description:</label>
              <span>{selectedTask.description || 'No description provided'}</span>
            </div>

            <div className="detail-field">
              <label>Status:</label>
              <span className={`task-status-${selectedTask.status}`}>
                {selectedTask.status.replace('_', ' ').toUpperCase()}
              </span>
            </div>

            <div className="detail-field">
              <label>Priority:</label>
              <span className={`priority-tag ${getPriorityColor(selectedTask.priority)}`}>
                {selectedTask.priority.toUpperCase()}
              </span>
            </div>

            <div className="detail-field">
              <label>Task Type:</label>
              <span>{selectedTask.task_type.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}</span>
            </div>

            <div className="detail-field">
              <label>Assigned To:</label>
              <span>{getUserName(selectedTask.assigned_to)}</span>
            </div>

            <div className="detail-field">
              <label>Assigned By:</label>
              <span>{getUserName(selectedTask.assigned_by)}</span>
            </div>

            {selectedTask.related_appointment_id && (
              <div className="detail-field">
                <label>Related Appointment:</label>
                <span>Appointment ID: {selectedTask.related_appointment_id}</span>
              </div>
            )}

            <div className="detail-field">
              <label>Created At:</label>
              <span>{new Date(selectedTask.created_at).toLocaleDateString()}</span>
            </div>

            {selectedTask.updated_at && (
              <div className="detail-field">
                <label>Updated At:</label>
                <span>{new Date(selectedTask.updated_at).toLocaleDateString()}</span>
              </div>
            )}

            {selectedTask.completed_at && (
              <div className="detail-field">
                <label>Completed At:</label>
                <span>{new Date(selectedTask.completed_at).toLocaleDateString()}</span>
              </div>
            )}

            <div className="detail-field">
              <label>Due Date:</label>
              <span>{selectedTask.due_date ? new Date(selectedTask.due_date).toLocaleDateString() : 'No due date set'}</span>
            </div>
          </div>

          {selectedTask.patient_id && (
            <div className="detail-section">
              <h4>Patient Information</h4>
              <div className="detail-field">
                <label>Patient:</label>
                <span>{getPatientName(selectedTask.patient_id)}</span>
              </div>
            </div>
          )}

          <div className="task-detail-actions">
            {selectedTask.status !== 'completed' && (
              <button
                onClick={() => {
                  collaborationApi.completeTask(selectedTask.id).then(() => {
                    setSelectedTask(null);
                    // Update local state
                    setTasks(prev =>
                      prev.map(t =>
                        t.id === selectedTask.id ? { ...t, status: 'completed', completed_at: new Date().toISOString() } : t
                      )
                    );
                  });
                }}
                className="btn-detail-action"
              >
                <CheckCircle2 size={16} />
                <span>Mark as Complete</span>
              </button>
            )}
            <button
              onClick={() => setSelectedTask(null)}
              className="btn-detail-action secondary"
            >
              <X size={16} />
              <span>Close</span>
            </button>
          </div>
        </div>
      </div>
    )}


      {/* New Task Form */}
      {showForm && (
        <div className="new-task-form">
          <div className="form-header">
            <h3>Create New Task</h3>
            <button onClick={() => setShowForm(false)} className="btn-close-form">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={onCreateTask} className="task-form">
            <div className="form-group">
              <label>Patient:</label>
              <select
                value={newTask.patient_id || ''}
                onChange={(e) => setNewTask(prev => ({ ...prev, patient_id: e.target.value ? Number(e.target.value) : null }))}
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
              <label>Assigned To:</label>
              <select
                value={newTask.assigned_to || ''}
                onChange={(e) => setNewTask(prev => ({ ...prev, assigned_to: e.target.value ? Number(e.target.value) : null }))}
              >
                <option value="">Select Assignee</option>
                {[1, 2, 3].map(id => (
                  <option key={id} value={id}>
                    {getUserName(id)}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Assigned By:</label>
              <select
                value={newTask.assigned_by || ''}
                onChange={(e) => setNewTask(prev => ({ ...prev, assigned_by: e.target.value ? Number(e.target.value) : null }))}
              >
                <option value="">Select Assigner</option>
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
                placeholder="Enter task title..."
                value={newTask.title}
                onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                required
              />
            </div>

            <div className="form-group">
              <label>Description (Optional):</label>
              <textarea
                placeholder="Enter task description..."
                value={newTask.description}
                onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="form-group">
              <label>Status:</label>
              <select
                value={newTask.status || ''}
                onChange={(e) => setNewTask(prev => ({ ...prev, status: e.target.value }))}
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="form-group">
              <label>Priority:</label>
              <select
                value={newTask.priority || ''}
                onChange={(e) => setNewTask(prev => ({ ...prev, priority: e.target.value }))}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div className="form-group">
              <label>Task Type:</label>
              <select
                value={newTask.task_type || ''}
                onChange={(e) => setNewTask(prev => ({ ...prev, task_type: e.target.value }))}
              >
                <option value="follow_up_assessment">Follow-up Assessment</option>
                <option value="medication_review">Medication Review</option>
                <option value="lab_order">Lab Order</option>
                <option value="appointment_scheduling">Appointment Scheduling</option>
                <option value="patient_education">Patient Education</option>
                <option value="follow_up_call">Follow-up Call</option>
              </select>
            </div>

            <div className="form-group">
              <label>Due Date (Optional):</label>
              <input
                type="date"
                value={newTask.due_date || ''}
                onChange={(e) => setNewTask(prev => ({ ...prev, due_date: e.target.value || null }))}
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-submit">
                <ClipboardList size={18} />
                <span>Create Task</span>
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

      {/* New Task Button */}
      {!showForm && (
        <div className="new-task-float">
          <button
            onClick={() => setShowForm(true)}
            className="btn-float-action"
          >
            <ClipboardList size={24} />
            <span>New Task</span>
          </button>
        </div>
      )}
    </div>
  );
}