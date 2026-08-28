import React, { useState, useEffect } from 'react';
import { useCollaborationApi } from '../../services/collaborationApi';
import { useAuth } from '../../context/AuthContext';
import {
  Users,
  Calendar,
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
  MessageSquare,
  MessageSquareMore,
  List,
  ClipboardList,
  FileText as FileTextIcon
} from 'lucide-react';
import MessagesTab from './MessagesTab';
import ChannelsTab from './ChannelsTab';
import TasksTab from './TasksTab';
import NotesTab from './NotesTab';

class CollaborationErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Collaboration tab crash caught by ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="collaboration-error">
          <AlertTriangle size={24} className="text-red-500 mb-2" />
          <h3 className="text-base font-bold text-slate-800">Tab View Error</h3>
          <p className="text-sm text-slate-500 mb-4">{this.state.error?.message || 'An unexpected rendering error occurred.'}</p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="btn-retry"
          >
            Reload Tab
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function CollaborationDashboard({ patients = [], getAuthHeaders }) {
  const [activeTab, setActiveTab] = useState('messages'); // 'messages' | 'channels' | 'tasks' | 'notes'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);

  // Collaboration data
  const [messages, setMessages] = useState([]);
  const [channels, setChannels] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [notes, setNotes] = useState([]);

  // Form states
  const [newMessage, setNewMessage] = useState({
    sender_id: 2, // Default to doctor
    content: '',
    patient_id: null,
    channel_id: null,
    recipient_id: null,
    is_urgent: false,
    message_type: 'general'
  });

  const [newChannel, setNewChannel] = useState({
    name: '',
    description: '',
    is_private: false,
    created_by: 1 // Default to admin
  });

  const [newTask, setNewTask] = useState({
    patient_id: null,
    assigned_by: 2, // Default to doctor
    assigned_to: 2, // Default to doctor (self-assigned)
    title: '',
    description: '',
    status: 'pending',
    priority: 'medium',
    task_type: 'follow_up_assessment',
    due_date: null
  });

  const [newNote, setNewNote] = useState({
    patient_id: null,
    created_by: 2, // Default to doctor
    title: '',
    content: '',
    is_confidential: false,
    note_type: 'progress_note'
  });

  const collaborationApi = useCollaborationApi();

  const loadAllData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all data in parallel with per-request fallback safety
      const [
        messagesResp,
        channelsResp,
        tasksResp,
        notesResp
      ] = await Promise.all([
        collaborationApi.getMessages({ limit: 50 }).catch(e => { console.warn('Messages load fallback:', e); return []; }),
        collaborationApi.getChannels({ limit: 50, is_active_only: true }).catch(e => { console.warn('Channels load fallback:', e); return []; }),
        collaborationApi.getTasks({ limit: 50, include_completed: true }).catch(e => { console.warn('Tasks load fallback:', e); return []; }),
        collaborationApi.getNotes({ limit: 50 }).catch(e => { console.warn('Notes load fallback:', e); return []; })
      ]);

      setMessages(Array.isArray(messagesResp) ? messagesResp : []);
      setChannels(Array.isArray(channelsResp) ? channelsResp : []);
      setTasks(Array.isArray(tasksResp) ? tasksResp : []);
      setNotes(Array.isArray(notesResp) ? notesResp : []);
    } catch (err) {
      console.error('Failed to load collaboration data:', err);
      setError('Failed to load collaboration data');
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on mount
  useEffect(() => {
    loadAllData();
  }, []);

  // Handle patient selection
  const handleSelectPatient = (patient) => {
    setSelectedPatient(patient);
    // Update form defaults with selected patient
    setNewTask(prev => ({ ...prev, patient_id: patient.id }));
    setNewNote(prev => ({ ...prev, patient_id: patient.id }));
    setNewMessage(prev => ({ ...prev, patient_id: patient.id }));
  };

  const handleClearPatientSelection = () => {
    setSelectedPatient(null);
    setNewTask(prev => ({ ...prev, patient_id: null }));
    setNewNote(prev => ({ ...prev, patient_id: null }));
    setNewMessage(prev => ({ ...prev, patient_id: null }));
  };

  // Handle form submissions
  const handleSendMessage = async (e) => {
    e.preventDefault();
    try {
      await collaborationApi.sendMessage(newMessage);
      setNewMessage(prev => ({ ...prev, content: '' }));
      // Refresh messages
      const updatedMessages = await collaborationApi.getMessages({ limit: 50 });
      setMessages(updatedMessages);
    } catch (err) {
      console.error('Failed to send message:', err);
      alert('Failed to send message');
    }
  };

  const handleCreateChannel = async (e) => {
    e.preventDefault();
    try {
      await collaborationApi.createChannel(newChannel);
      setNewChannel(prev => ({ ...prev, name: '', description: '' }));
      // Refresh channels
      const updatedChannels = await collaborationApi.getChannels({ limit: 50, is_active_only: true });
      setChannels(updatedChannels);
    } catch (err) {
      console.error('Failed to create channel:', err);
      alert('Failed to create channel');
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await collaborationApi.createTask(newTask);
      setNewTask(prev => ({
        ...prev,
        title: '',
        description: '',
        status: 'pending',
        priority: 'medium'
      }));
      // Refresh tasks
      const updatedTasks = await collaborationApi.getTasks({ limit: 50, include_completed: true });
      setTasks(updatedTasks);
    } catch (err) {
      console.error('Failed to create task:', err);
      alert('Failed to create task');
    }
  };

  const handleCreateNote = async (e) => {
    e.preventDefault();
    try {
      await collaborationApi.createNote(newNote);
      setNewNote(prev => ({
        ...prev,
        title: '',
        content: ''
      }));
      // Refresh notes
      const updatedNotes = await collaborationApi.getNotes({ limit: 50 });
      setNotes(updatedNotes);
    } catch (err) {
      console.error('Failed to create note:', err);
      alert('Failed to create note');
    }
  };

  if (loading) {
    return (
      <div className="collaboration-loading">
        <div className="loading-spinner" />
        <p>Loading care team collaboration...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="collaboration-error">
        <AlertTriangle size={20} className="text-red-500 mb-2" />
        <p className="text-red-500">{error}</p>
        <button
          onClick={loadAllData}
          className="btn-retry"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="collaboration-dashboard">
      {/* Sidebar Navigation */}
      <aside className="collaboration-sidebar">
        <div className="sidebar-header">
          <h2>Care Team Collaboration</h2>
          <p>Secure communication & task management</p>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`nav-item ${activeTab === 'messages' ? 'active' : ''}`}
            onClick={() => setActiveTab('messages')}
          >
            <MessageSquare size={18} />
            <span>Messages</span>
            {messages.length > 0 && (
              <span className="badge-dot" title="Unread Messages" />
            )}
          </button>

          <button
            className={`nav-item ${activeTab === 'channels' ? 'active' : ''}`}
            onClick={() => setActiveTab('channels')}
          >
            <Users size={18} />
            <span>Channels</span>
          </button>

          <button
            className={`nav-item ${activeTab === 'tasks' ? 'active' : ''}`}
            onClick={() => setActiveTab('tasks')}
          >
            <ClipboardList size={18} />
            <span>Tasks</span>
          </button>

          <button
            className={`nav-item ${activeTab === 'notes' ? 'active' : ''}`}
            onClick={() => setActiveTab('notes')}
          >
            <FileTextIcon size={18} />
            <span>Notes</span>
          </button>
        </nav>

        {/* Quick Stats */}
        <div className="sidebar-stats mt-6">
          <div className="stat-item">
            <span className="stat-label">Active Channels</span>
            <span className="stat-value">{channels.length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Pending Tasks</span>
            <span className="stat-value">{tasks.filter(t => t.status !== 'completed').length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Shared Notes</span>
            <span className="stat-value">{notes.length}</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="collaboration-main">
        {/* Tab Header */}
        <header className="collaboration-header">
          <h1>
            {activeTab === 'messages' && 'Care Team Messaging'}
            {activeTab === 'channels' && 'Team Channels'}
            {activeTab === 'tasks' && 'Clinical Tasks'}
            {activeTab === 'notes' && 'Shared Patient Notes'}
          </h1>

          <div className="header-actions">
            {selectedPatient && (
              <button
                className="btn-back-patients"
                onClick={handleClearPatientSelection}
              >
                <ArrowLeft size={16} />
                <span>Back to All Patients</span>
              </button>
            )}

            <button
              className={`btn-new-item ${activeTab === 'messages' ? 'text-blue-500' : ''}`}
              onClick={() => {
                if (activeTab === 'messages') {
                  document.getElementById('message-content')?.focus();
                }
              }}
            >
              <Plus size={18} />
              <span>New Item</span>
            </button>
          </div>
        </header>

        {/* Tab Content wrapped in ErrorBoundary */}
        <div className="collaboration-content">
          <CollaborationErrorBoundary key={activeTab}>
            {activeTab === 'messages' && (
              <MessagesTab
                messages={messages}
                setMessages={setMessages}
                channels={channels}
                patients={patients}
                selectedPatient={selectedPatient}
                onSelectPatient={handleSelectPatient}
                onClearPatientSelection={handleClearPatientSelection}
                newMessage={newMessage}
                setNewMessage={setNewMessage}
                onSendMessage={handleSendMessage}
                collaborationApi={collaborationApi}
              />
            )}

            {activeTab === 'channels' && (
              <ChannelsTab
                channels={channels}
                setChannels={setChannels}
                patients={patients}
                selectedPatient={selectedPatient}
                onSelectPatient={handleSelectPatient}
                onClearPatientSelection={handleClearPatientSelection}
                newChannel={newChannel}
                setNewChannel={setNewChannel}
                onCreateChannel={handleCreateChannel}
                collaborationApi={collaborationApi}
              />
            )}

            {activeTab === 'tasks' && (
              <TasksTab
                tasks={tasks}
                setTasks={setTasks}
                patients={patients}
                selectedPatient={selectedPatient}
                onSelectPatient={handleSelectPatient}
                onClearPatientSelection={handleClearPatientSelection}
                newTask={newTask}
                setNewTask={setNewTask}
                onCreateTask={handleCreateTask}
                collaborationApi={collaborationApi}
              />
            )}

            {activeTab === 'notes' && (
              <NotesTab
                notes={notes}
                setNotes={setNotes}
                patients={patients}
                selectedPatient={selectedPatient}
                onSelectPatient={handleSelectPatient}
                onClearPatientSelection={handleClearPatientSelection}
                newNote={newNote}
                setNewNote={setNewNote}
                onCreateNote={handleCreateNote}
                collaborationApi={collaborationApi}
              />
            )}
          </CollaborationErrorBoundary>
        </div>
      </main>
    </div>
  );
}