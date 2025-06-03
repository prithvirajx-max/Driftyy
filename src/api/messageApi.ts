import axios from 'axios';

// Create axios instance with base URL and authentication handling
const api = axios.create({
  baseURL: 'http://localhost:3001/api', // Match the server port (3001)
  withCredentials: true,  // Important for cookies/authentication
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Message types
export interface MessagePayload {
  receiverId: string;
  messageType: 'text' | 'emoji' | 'photo' | 'location';
  content: string;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
}

export interface MessageResponse {
  _id: string;
  sender: {
    _id: string;
    displayName: string;
    photoURL: string;
  };
  receiver: {
    _id: string;
    displayName: string;
    photoURL: string;
  };
  conversationId: string;
  messageType: 'text' | 'emoji' | 'photo' | 'location';
  content: string;
  photoUrl?: string;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  isRead: boolean;
  createdAt: string;
}

export interface ConversationResponse {
  conversationId: string;
  otherUser: {
    _id: string;
    displayName: string;
    photoURL: string;
  };
  lastMessage: MessageResponse;
}

export interface PaginatedMessagesResponse {
  messages: MessageResponse[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

// API functions
export const messageApi = {
  // Get all conversations for the current user
  getConversations: async (): Promise<ConversationResponse[]> => {
    const response = await api.get('/messages/conversations');
    return response.data.data;
  },

  // Get messages for a specific conversation
  getConversation: async (
    conversationId: string,
    page = 1,
    limit = 20
  ): Promise<PaginatedMessagesResponse> => {
    const response = await api.get(`/messages/conversations/${conversationId}`, {
      params: { page, limit },
    });
    return response.data.data;
  },

  // Send a text or emoji message
  sendMessage: async (payload: MessagePayload): Promise<MessageResponse> => {
    const response = await api.post('/messages/send', payload);
    return response.data.data;
  },

  // Upload a photo and get its URL
  uploadPhoto: async (photo: File): Promise<string> => {
    const formData = new FormData();
    formData.append('photo', photo);
    
    const response = await api.post('/messages/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data.data.photoUrl;
  },

  // Send a photo message (upload photo and send message in one call)
  sendPhotoMessage: async (receiverId: string, photo: File, content = 'Photo'): Promise<MessageResponse> => {
    const formData = new FormData();
    formData.append('photo', photo);
    formData.append('receiverId', receiverId);
    formData.append('messageType', 'photo');
    formData.append('content', content);
    
    const response = await api.post('/messages/send-photo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data.data;
  },

  // Mark messages as read in a conversation
  markAsRead: async (conversationId: string): Promise<{ updated: number }> => {
    const response = await api.put(`/messages/conversations/${conversationId}/read`);
    return response.data.data;
  },
};

export default messageApi;
