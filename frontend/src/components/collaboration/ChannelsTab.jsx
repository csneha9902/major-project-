import React, { useState } from 'react';
import {
  Users,
  User,
  MessageSquareMore,
  CheckCircle2,
  X,
  Eye,
  Plus,
  Trash2,
  Settings,
  ShieldCheck,
  Lock,
  Filter
} from 'lucide-react';


export default function ChannelsTab({
  channels = [],
  setChannels,
  patients = [],
  selectedPatient,
  onSelectPatient,
  onClearPatientSelection,
  newChannel,
  setNewChannel,
  onCreateChannel,
  collaborationApi
}) {

  const [showForm, setShowForm] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [channelMembers, setChannelMembers] = useState({}); // channelId -> members array

  // Get user info for display
  const getUserName = (userId) => {
    const userMap = {
      1: 'System Administrator',
      2: 'Dr. Sarah Smith',
      3: 'Alex Johnson'
    };
    return userMap[userId] || `User ${userId}`;
  };

  const loadChannelMembers = async (channelId) => {
    try {
      // In a real implementation, this would be an API call
      // For now, we'll simulate with sample data
      const sampleMembers = [
        { id: 1, user_id: 1, role: 'owner', joined_at: new Date().toISOString() },
        { id: 2, user_id: 2, role: 'moderator', joined_at: new Date().toISOString() },
        { id: 3, user_id: 3, role: 'member', joined_at: new Date().toISOString() }
      ];
      setChannelMembers(prev => ({ ...prev, [channelId]: sampleMembers }));
    } catch (err) {
      console.error('Failed to load channel members:', err);
    }
  };

  const handleAddMember = async (channelId, userId, role) => {
    try {
      await collaborationApi.addChannelMember(channelId, { user_id: userId, role });
      // Refresh members
      await loadChannelMembers(channelId);
    } catch (err) {
      console.error('Failed to add member:', err);
      alert('Failed to add member to channel');
    }
  };

  const handleRemoveMember = async (channelId, userId) => {
    try {
      await collaborationApi.removeChannelMember(channelId, userId);
      // Refresh members
      await loadChannelMembers(channelId);
    } catch (err) {
      console.error('Failed to remove member:', err);
      alert('Failed to remove member from channel');
    }
  };

  return (
    <div className="channels-tab">
      {/* Channel Filters & Search */}
      <div className="channels-header">
        <div className="channels-search">
          <input
            type="text"
            placeholder="Search channels..."
            className="search-input"
          />
          <button className="btn-filter">
            <Filter size={18} />
            <span>Filter</span>
          </button>
        </div>

        <div className="channel-stats">
          <span>{channels.length} Active Channels</span>
        </div>
      </div>

      {/* Channels List */}
      <div className="channels-list">
        {channels.length > 0 ? (
          channels.map((channel) => (
            <div key={channel.id} className="channel-card">
              <div className="channel-header">
                <div className="channel-info">
                  <div className="channel-icon">
                    {channel.is_private ? (
                      <Lock size={20} className="text-muted" />
                    ) : (
                      <Users size={20} className="text-blue-600" />
                    )}
                  </div>
                  <div>
                    <h3 className="channel-name">{channel.name}</h3>
                    <p className="channel-description text-muted">
                      {channel.description || 'No description'}
                    </p>
                  </div>
                </div>

                <div className="channel-meta">
                  <span className={`channel-${channel.is_private ? 'private' : 'public'}`}>
                    {channel.is_private ? 'Private' : 'Public'}
                  </span>
                  <span className="channel-created">
                    Created by {getUserName(channel.created_by)}
                  </span>
                </div>
              </div>

              <div className="channel-actions">
                <button
                  onClick={() => {
                    setSelectedChannel(channel);
                    loadChannelMembers(channel.id);
                  }}
                  className="btn-channel-action"
                >
                  <Eye size={16} />
                  <span>View</span>
                </button>
                <button
                  onClick={() => {
                    alert('Edit channel functionality would go here');
                  }}
                  className="btn-channel-action secondary"
                >
                  <Settings size={16} />
                  <span>Edit</span>
                </button>
              </div>

              <div className="channel-members-preview">
                <span>Members:</span>
                {channelMembers[channel.id]?.slice(0, 3).map((member, index) => (
                  <span key={index} className="member-badge">
                    {getUserName(member.user_id)} ({member.role})
                  </span>
                ))}
                {channelMembers[channel.id]?.length > 3 && (
                  <span className="member-badge">
                    +{channelMembers[channel.id].length - 3} more
                  </span>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">

            <Users size={48} className="opacity-20 mb-4" />
            <h3>No Channels Found</h3>
            <p>Create a new channel to start collaborating with your care team.</p>
          </div>
        )}
      </div>

      {/* Channel Detail View */}
      {selectedChannel && (
        <div className="channel-detail-panel">
          <div className="channel-detail-header">
            <h3>{selectedChannel.name}</h3>
            <button onClick={() => setSelectedChannel(null)} className="btn-close-detail">
              <X size={20} />
            </button>
          </div>

          <div className="channel-detail-content">
            <div className="detail-section">
              <h4>Channel Information</h4>
              <div className="detail-field">
                <label>Name:</label>
                <span>{selectedChannel.name}</span>
              </div>

              <div className="detail-field">
                <label>Description:</label>
                <span>{selectedChannel.description || 'No description provided'}</span>
              </div>

              <div className="detail-field">
                <label>Type:</label>
                <span className={`channel-type-${selectedChannel.is_private ? 'private' : 'public'}`}>
                  {selectedChannel.is_private ? 'Private' : 'Public'}
                </span>
              </div>

              <div className="detail-field">
                <label>Status:</label>
                <span className={`channel-status-${selectedChannel.is_active ? 'active' : 'inactive'}`}>
                  {selectedChannel.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="detail-field">
                <label>Created By:</label>
                <span>{getUserName(selectedChannel.created_by)}</span>
              </div>

              <div className="detail-field">
                <label>Created At:</label>
                <span>{new Date(selectedChannel.created_at).toLocaleDateString()}</span>
              </div>

              <div className="detail-field">
                <label>Updated At:</label>
                <span>{new Date(selectedChannel.updated_at).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="detail-section">
              <h4>Channel Members</h4>
              {channelMembers[selectedChannel.id] && channelMembers[selectedChannel.id].length > 0 ? (
                <div className="members-list">
                  {channelMembers[selectedChannel.id].map((member) => (
                    <div key={member.id} className="member-item">
                      <div className="member-info">
                        <User size={24} className="text-blue-600" />
                        <div>
                          <div className="member-name">{getUserName(member.user_id)}</div>
                          <div className="member-role text-muted">{member.role}</div>
                        </div>
                      </div>

                      <div className="member-actions">
                        {member.role !== 'owner' && (
                          <button
                            onClick={() => handleRemoveMember(selectedChannel.id, member.user_id)}
                            className="btn-remove-member"
                          >
                            <Trash2 size={16} />
                            <span>Remove</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <p>Loading members...</p>
                </div>
              )}

              {/* Add Member Form */}
              <div className="add-member-form">
                <h4>Add Member</h4>
                <div className="form-group">
                  <label>User:</label>
                  <select id="member-user-select">
                    <option value="">Select User</option>
                    {[1, 2, 3].map(id => (
                      <option key={id} value={id}>
                        {getUserName(id)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Role:</label>
                  <select id="member-role-select">
                    <option value="member">Member</option>
                    <option value="moderator">Moderator</option>
                    <option value="owner">Owner</option>
                  </select>
                </div>

                <button
                  onClick={() => {
                    const userId = document.getElementById('member-user-select').value;
                    const role = document.getElementById('member-role-select').value;
                    if (userId) {
                      handleAddMember(selectedChannel.id, Number(userId), role);
                    }
                  }}
                  className="btn-add-member"
                >
                  <Plus size={16} />
                  <span>Add Member</span>
                </button>
              </div>
            </div>

          </div>

          <div className="channel-detail-actions">
            <button
              onClick={() => {
                // In a real app, this would delete the channel
                if (window.confirm(`Are you sure you want to delete the channel "${selectedChannel.name}"?`)) {
                  alert('Delete channel functionality would go here');
                }
              }}
              className="btn-delete-channel"
            >
              <Trash2 size={16} />
              <span>Delete Channel</span>
            </button>
            <button
              onClick={() => setSelectedChannel(null)}
              className="btn-close-detail secondary"
            >
              <X size={16} />
              <span>Close</span>
            </button>
          </div>
        </div>
      )}



      {/* New Channel Form */}
      {showForm && (
        <div className="new-channel-form">
          <div className="form-header">
            <h3>Create New Channel</h3>
            <button onClick={() => setShowForm(false)} className="btn-close-form">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={onCreateChannel} className="channel-form">
            <div className="form-group">
              <label>Channel Name:</label>
              <input
                type="text"
                placeholder="Enter channel name..."
                value={newChannel.name}
                onChange={(e) => setNewChannel(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>

            <div className="form-group">
              <label>Description (Optional):</label>
              <textarea
                placeholder="Describe the purpose of this channel..."
                value={newChannel.description}
                onChange={(e) => setNewChannel(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="form-group">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={newChannel.is_private}
                  onChange={(e) => setNewChannel(prev => ({ ...prev, is_private: e.target.checked }))}
                />
                Private Channel
              </label>
            </div>

            <div className="form-group">
              <label>Created By:</label>
              <select
                value={newChannel.created_by || ''}
                onChange={(e) => setNewChannel(prev => ({ ...prev, created_by: e.target.value ? Number(e.target.value) : null }))}
              >
                <option value="">Select Creator</option>
                {[1, 2, 3].map(id => (
                  <option key={id} value={id}>
                    {getUserName(id)}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-submit">
                <Users size={18} />
                <span>Create Channel</span>
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

      {/* New Channel Button */}
      {!showForm && (
        <div className="new-channel-float">
          <button
            onClick={() => setShowForm(true)}
            className="btn-float-action"
          >
            <Users size={24} />
            <span>New Channel</span>
          </button>
        </div>
      )}
    </div>
  );
}