import { useAuth } from '../context/AuthContext';

export const useCollaborationApi = () => {
  const { getAuthHeaders } = useAuth();

  // Care Team Messages
  const getMessages = async (params = {}) => {
    const queryParams = new URLSearchParams(params);
    const response = await fetch(`/api/collaboration/messages?${queryParams}`, {
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      }
    });
    if (!response.ok) throw new Error('Failed to fetch messages');
    return response.json();
  };

  const sendMessage = async (messageData) => {
    const response = await fetch('/api/collaboration/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(messageData)
    });
    if (!response.ok) throw new Error('Failed to send message');
    return response.json();
  };

  const markMessageAsRead = async (messageId) => {
    const response = await fetch(`/api/collaboration/messages/${messageId}/read`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      }
    });
    if (!response.ok) throw new Error('Failed to mark message as read');
    return response.json();
  };

  const updateMessage = async (messageId, updateData) => {
    const response = await fetch(`/api/collaboration/messages/${messageId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(updateData)
    });
    if (!response.ok) throw new Error('Failed to update message');
    return response.json();
  };

  // Care Team Channels
  const getChannels = async (params = {}) => {
    const queryParams = new URLSearchParams(params);
    const response = await fetch(`/api/collaboration/channels?${queryParams}`, {
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      }
    });
    if (!response.ok) throw new Error('Failed to fetch channels');
    return response.json();
  };

  const createChannel = async (channelData) => {
    const response = await fetch('/api/collaboration/channels', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(channelData)
    });
    if (!response.ok) throw new Error('Failed to create channel');
    return response.json();
  };

  const updateChannel = async (channelId, updateData) => {
    const response = await fetch(`/api/collaboration/channels/${channelId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(updateData)
    });
    if (!response.ok) throw new Error('Failed to update channel');
    return response.json();
  };

  const addChannelMember = async (channelId, memberData) => {
    const response = await fetch(`/api/collaboration/channels/${channelId}/members`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(memberData)
    });
    if (!response.ok) throw new Error('Failed to add channel member');
    return response.json();
  };

  const removeChannelMember = async (channelId, userId) => {
    const response = await fetch(`/api/collaboration/channels/${channelId}/members/${userId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      }
    });
    if (!response.ok) throw new Error('Failed to remove channel member');
    return response.json();
  };

  // Clinical Tasks
  const getTasks = async (params = {}) => {
    const queryParams = new URLSearchParams(params);
    const response = await fetch(`/api/collaboration/tasks?${queryParams}`, {
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      }
    });
    if (!response.ok) throw new Error('Failed to fetch tasks');
    return response.json();
  };

  const createTask = async (taskData) => {
    const response = await fetch('/api/collaboration/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(taskData)
    });
    if (!response.ok) throw new Error('Failed to create task');
    return response.json();
  };

  const updateTask = async (taskId, updateData) => {
    const response = await fetch(`/api/collaboration/tasks/${taskId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(updateData)
    });
    if (!response.ok) throw new Error('Failed to update task');
    return response.json();
  };

  const completeTask = async (taskId) => {
    const response = await fetch(`/api/collaboration/tasks/${taskId}/complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      }
    });
    if (!response.ok) throw new Error('Failed to complete task');
    return response.json();
  };

  // Shared Notes
  const getNotes = async (params = {}) => {
    const queryParams = new URLSearchParams(params);
    const response = await fetch(`/api/collaboration/notes?${queryParams}`, {
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      }
    });
    if (!response.ok) throw new Error('Failed to fetch notes');
    return response.json();
  };

  const createNote = async (noteData) => {
    const response = await fetch('/api/collaboration/notes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(noteData)
    });
    if (!response.ok) throw new Error('Failed to create note');
    return response.json();
  };

  const updateNote = async (noteId, updateData) => {
    const response = await fetch(`/api/collaboration/notes/${noteId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(updateData)
    });
    if (!response.ok) throw new Error('Failed to update note');
    return response.json();
  };

  return {
    // Messages
    getMessages,
    sendMessage,
    markMessageAsRead,
    updateMessage,

    // Channels
    getChannels,
    createChannel,
    updateChannel,
    addChannelMember,
    removeChannelMember,

    // Tasks
    getTasks,
    createTask,
    updateTask,
    completeTask,

    // Notes
    getNotes,
    createNote,
    updateNote
  };
};