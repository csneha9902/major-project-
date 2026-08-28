import React, { useState, useEffect } from 'react';
import {
  MessageSquareMore,
  MessageSquare,
  Users,
  User,
  Clock,
  AlertTriangle,
  CheckCircle2,
  X,
  Eye,
  ChevronRight,
  Circle,
  Stethoscope
} from 'lucide-react';


export default function MessagesTab({
  messages = [],
  setMessages,
  channels = [],
  patients = [],
  selectedPatient,
  onSelectPatient,
  onClearPatientSelection,
  newMessage,
  setNewMessage,
  onSendMessage,
  collaborationApi
}) {
  const [showForm, setShowForm] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [filterParams, setFilterParams] = useState({
    sender_id: null,
    recipient_id: null,
    patient_id: selectedPatient ? selectedPatient.id : null,
    channel_id: null,
    is_unread_only: false,
    is_urgent_only: false
  });

  // Update filters when patient selection changes
  useEffect(() => {
    setFilterParams(prev => ({
      ...prev,
      patient_id: selectedPatient ? selectedPatient.id : null
    }));
  }, [selectedPatient]);

  // Filtered messages
  const filteredMessages = (messages || []).filter(msg => {
    if (!msg) return false;
    // Apply filters
    if (filterParams.sender_id && msg.sender_id !== filterParams.sender_id) return false;
    if (filterParams.recipient_id && msg.recipient_id !== filterParams.recipient_id) return false;
    if (filterParams.patient_id && msg.patient_id !== filterParams.patient_id) return false;
    if (filterParams.channel_id && msg.channel_id !== filterParams.channel_id) return false;
    if (filterParams.is_unread_only && msg.is_read) return false;
    if (filterParams.is_urgent_only && !msg.is_urgent) return false;
    return true;
  }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at)); // Newest first

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

  const getChannelName = (channelId) => {
    if (!channelId) return null;
    const channel = (channels || []).find(c => c.id === channelId);
    return channel ? channel.name : `Channel ${channelId}`;
  };

  const handleMessageAction = (action, messageId) => {
    switch (action) {
      case 'markRead':
        if (collaborationApi?.markMessageAsRead) {
          collaborationApi.markMessageAsRead(messageId).then(() => {
            if (setMessages) {
              setMessages(prev =>
                prev.map(msg =>
                  msg.id === messageId ? { ...msg, is_read: true, read_at: new Date().toISOString() } : msg
                )
              );
            }
          }).catch(err => console.error('Failed to mark read:', err));
        }
        break;
      default:
        break;
    }
  };


  return (
    <div className="messages-tab">
      {/* Message Filters */}
      <div className="messages-filters">
        <div className="filter-row">
          <div className="filter-group">
            <label>From:</label>
            <select
              value={filterParams.sender_id || ''}
              onChange={(e) => setFilterParams(prev => ({ ...prev, sender_id: e.target.value ? Number(e.target.value) : null }))}
            >
              <option value="">All Senders</option>
              {[1, 2, 3].map(id => (
                <option key={id} value={id}>
                  {getUserName(id)}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>To:</label>
            <select
              value={filterParams.recipient_id || ''}
              onChange={(e) => setFilterParams(prev => ({ ...prev, recipient_id: e.target.value ? Number(e.target.value) : null }))}
            >
              <option value="">All Recipients</option>
              <option value={null}>Everyone (Channel)</option>
              {[1, 2, 3].map(id => (
                <option key={id} value={id}>
                  {getUserName(id)}
                </option>
              ))}
            </select>
          </div>

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
        </div>

        <div className="filter-row">
          <div className="filter-group">
            <label>Channel:</label>
            <select
              value={filterParams.channel_id || ''}
              onChange={(e) => setFilterParams(prev => ({ ...prev, channel_id: e.target.value ? Number(e.target.value) : null }))}
            >
              <option value="">All Channels</option>
              {channels.map(channel => (
                <option key={channel.id} value={channel.id}>
                  {channel.name}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filterParams.is_unread_only}
                onChange={(e) => setFilterParams(prev => ({ ...prev, is_unread_only: e.target.checked }))}
              />
              Unread Only
            </label>
          </div>

          <div className="filter-group">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filterParams.is_urgent_only}
                onChange={(e) => setFilterParams(prev => ({ ...prev, is_urgent_only: e.target.checked }))}
              />
              Urgent Only
            </label>
          </div>
        </div>
      </div>

      {/* Messages List */}
      <div className="messages-list">
        {filteredMessages.length > 0 ? (
          filteredMessages.map((message) => (
            <div key={message.id} className={`message-card ${!message.is_read ? 'message-unread' : ''}`}>
              <div className="message-header">
                <div className="message-sender">
                  <User size={20} className="text-blue-600" />
                  <span>{getUserName(message.sender_id)}</span>
                  {message.is_urgent && (
                    <AlertTriangle size={14} className="text-red-500 ml-1" />
                  )}
                </div>
                <div className="message-time">
                  <Clock size={16} className="text-muted" />
                  <span>{new Date(message.created_at).toLocaleTimeString()}</span>
                </div>
              </div>

              {message.subject && (
                <div className="message-subject font-medium">
                  {message.subject}
                </div>
              )}

              <div className="message-content">
                <p>{message.content}</p>
              </div>

              <div className="message-footer">
                <div className="message-context">
                  {message.patient_id && (
                    <span>
                      <Stethoscope size={14} className="text-blue-500" />
                      {" "}{getPatientName(message.patient_id)}
                    </span>
                  )}
                  {message.channel_id && (
                    <span className="ml-4">
                      <Users size={14} className="text-blue-500" />
                      {" "}{getChannelName(message.channel_id)}
                    </span>
                  )}
                </div>

                <div className="message-actions">
                  {!message.is_read && (
                    <button
                      onClick={() => handleMessageAction('markRead', message.id)}
                      className="btn-message-action"
                    >
                      <Circle size={16} className="text-blue-500" />
                      <span>Mark as Read</span>
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedMessage(message)}
                    className="btn-message-action"
                  >
                    <Eye size={16} />
                    <span>View Details</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <MessageSquare size={48} className="opacity-20 mb-4" />
            <h3>No Messages Found</h3>
            <p>Try adjusting your filters or send a new message to get started.</p>
          </div>
        )}
      </div>

      {/* Message Detail View */}
      {selectedMessage && (
        <div className="message-detail-panel">
          <div className="message-detail-header">
            <h3>Message Details</h3>
            <button onClick={() => setSelectedMessage(null)} className="btn-close-detail">
              <X size={20} />
            </button>
          </div>

          <div className="message-detail-content">
            <div className="detail-field">
              <label>From:</label>
              <span>{getUserName(selectedMessage.sender_id)}</span>
            </div>

            <div className="detail-field">
              <label>To:</label>
              <span>
                {selectedMessage.recipient_id
                  ? getUserName(selectedMessage.recipient_id)
                  : 'Everyone (Channel)'}
              </span>
            </div>

            {selectedMessage.subject && (
              <div className="detail-field">
                <label>Subject:</label>
                <span>{selectedMessage.subject}</span>
              </div>
            )}

            <div className="detail-field">
              <label>Message:</label>
              <p className="detail-content">{selectedMessage.content}</p>
            </div>

            <div className="detail-field">
              <label>Sent:</label>
              <span>{new Date(selectedMessage.created_at).toLocaleString()}</span>
            </div>

            {selectedMessage.read_at && (
              <div className="detail-field">
                <label>Read:</label>
                <span>{new Date(selectedMessage.read_at).toLocaleString()}</span>
              </div>
            )}

            <div className="detail-field">
              <label>Patient:</label>
              <span>{selectedMessage.patient_id ? getPatientName(selectedMessage.patient_id) : 'General'}</span>
            </div>

            <div className="detail-field">
              <label>Channel:</label>
              <span>{selectedMessage.channel_id ? getChannelName(selectedMessage.channel_id) : 'Direct Message'}</span>
            </div>

            <div className="detail-field">
              <label>Type:</label>
              <span>{selectedMessage.message_type}</span>
            </div>

            <div className="detail-field">
              <label>Priority:</label>
              <span className={`priority-tag ${selectedMessage.is_urgent ? 'urgent' : 'normal'}`}>
                {selectedMessage.is_urgent ? 'Urgent' : 'Normal'}
              </span>
            </div>
          </div>

          <div className="message-detail-actions">
            {!selectedMessage.is_read && (
              <button
                onClick={() => {
                  collaborationApi.markMessageAsRead(selectedMessage.id).then(() => {
                    setSelectedMessage(null);
                    // Update local state
                    setMessages(prev =>
                      prev.map(msg =>
                        msg.id === selectedMessage.id ? { ...msg, is_read: true, read_at: new Date().toISOString() } : msg
                      )
                    );
                  });
                }}
                className="btn-detail-action"
              >
                <CheckCircle2 size={16} />
                <span>Mark as Read</span>
              </button>
            )}
            <button
              onClick={() => setSelectedMessage(null)}
              className="btn-detail-action secondary"
            >
              <X size={16} />
              <span>Close</span>
            </button>
          </div>
        </div>
      )}



      {/* New Message Form */}
      {showForm && (
        <div className="new-message-form">
          <div className="form-header">
            <h3>Send New Message</h3>
            <button onClick={() => setShowForm(false)} className="btn-close-form">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={onSendMessage} className="message-form">
            <div className="form-group">
              <label>To:</label>
              <select
                value={newMessage.recipient_id || ''}
                onChange={(e) => setNewMessage(prev => ({ ...prev, recipient_id: e.target.value ? Number(e.target.value) : null }))}
              >
                <option value={null}>Everyone (Channel)</option>
                {[1, 2, 3].map(id => (
                  <option key={id} value={id}>
                    {getUserName(id)}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Patient (Optional):</label>
              <select
                value={newMessage.patient_id || ''}
                onChange={(e) => setNewMessage(prev => ({ ...prev, patient_id: e.target.value ? Number(e.target.value) : null }))}
              >
                <option value="">No Specific Patient</option>
                {patients.map(patient => (
                  <option key={patient.id} value={patient.id}>
                    {patient.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Channel (Optional):</label>
              <select
                value={newMessage.channel_id || ''}
                onChange={(e) => setNewMessage(prev => ({ ...prev, channel_id: e.target.value ? Number(e.target.value) : null }))}
              >
                <option value="">Direct Message</option>
                {channels.map(channel => (
                  <option key={channel.id} value={channel.id}>
                    {channel.name}
                  </option>
                ))}
              </select>
            </div>


            <div className="form-group">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={newMessage.is_urgent}
                  onChange={(e) => setNewMessage(prev => ({ ...prev, is_urgent: e.target.checked }))}
                />
                Urgent Message
              </label>
            </div>

            <div className="form-group">
              <label>Message Type:</label>
              <select
                value={newMessage.message_type}
                onChange={(e) => setNewMessage(prev => ({ ...prev, message_type: e.target.value }))}
              >
                <option value="general">General</option>
                <option value="consultation">Consultation</option>
                <option value="update">Update</option>
                <option value="question">Question</option>
                <option value="alert">Alert</option>
              </select>
            </div>

            <div className="form-group">
              <label>Subject (Optional):</label>
              <input
                type="text"
                placeholder="Enter subject..."
                value={newMessage.subject || ''}
                onChange={(e) => setNewMessage(prev => ({ ...prev, subject: e.target.value }))}
              />
            </div>

            <div className="form-group">
              <label>Message:</label>
              <textarea
                id="message-content"
                placeholder="Type your message here..."
                value={newMessage.content}
                onChange={(e) => setNewMessage(prev => ({ ...prev, content: e.target.value }))}
                rows={4}
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-submit">
                <MessageSquare size={18} />
                <span>Send Message</span>
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

      {/* New Message Button */}
      {!showForm && (
        <div className="new-message-float">
          <button
            onClick={() => setShowForm(true)}
            className="btn-float-action"
          >
            <MessageSquare size={24} />
            <span>New Message</span>
          </button>
        </div>
      )}
    </div>
  );
}