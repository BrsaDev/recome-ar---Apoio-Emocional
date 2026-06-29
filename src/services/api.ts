import { User, Room, ForumTopic, ForumPost } from '../types';

/**
 * Configure your Node.js API connection below.
 * By default, the application uses local storage / in-memory state to protect the UI.
 * Set VITE_USE_API=true in your environment variables to route requests to your express server.
 */
const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || '/api';
const USE_API = (import.meta as any).env?.VITE_USE_API === 'true';

// Helpful console log to guide future developers during backend integration
if (USE_API) {
  console.log(`[API Integration] Operational. Route points to Node.js server: ${API_BASE_URL}`);
} else {
  console.log(`[API Integration] Prototype Sandbox active. Utilizing isolated local storage and browser state.`);
}

/**
 * Custom Error helper to parse unified JSON errors from your Node.js server
 */
export class APIError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'APIError';
    this.status = status;
  }
}

/**
 * General helper to perform fetch requests with default JSON/CORS headers
 */
async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = localStorage.getItem('fapem_token');

  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  try {
    const response = await fetch(url, { ...options, headers });

    if (!response.ok) {
      if (response.status === 401 && endpoint !== '/auth/access' && endpoint !== '/auth/google') {
        // Optional: Trigger logout or refresh
        console.warn('[API Auth] Unauthorized access detected.');
      }
      let errorMsg = `Server error ${response.status}`;
      try {
        const errJson = await response.json();
        errorMsg = errJson.message || errJson.error || errorMsg;
      } catch {
        // Fallback if not JSON
      }
      throw new APIError(errorMsg, response.status);
    }

    const data = await response.json();
    return data as T;
  } catch (error) {
    console.error(`[API Network-Error] Failed to communicate with: ${url}`, error);
    throw error;
  }
}

/**
 * EXPORTED API SERVICE FOR THE NODE.JS SERVER
 */
export const apiService = {
  /**
   * -------------------------------------------------------------
   * USER PROFILE & TERMS OF SERVICE ENDPOINTS
   * -------------------------------------------------------------
   */
  auth: {
    async access(nickname: string, avatarId: string, email?: string): Promise<{ user: User; token: string }> {
      return apiRequest<{ user: User; token: string }>('/auth/access', {
        method: 'POST',
        body: JSON.stringify({ nickname, avatarId, email })
      });
    },

    async googleLogin(idToken: string, avatarId?: string): Promise<{ user: User; token: string }> {
      return apiRequest<{ user: User; token: string }>('/auth/google', {
        method: 'POST',
        body: JSON.stringify({ idToken, avatarId })
      });
    },

    async getMe(): Promise<User> {
      return apiRequest<User>('/user/me');
    },

    async updatePublicKey(publicKey: string): Promise<void> {
      return apiRequest<void>('/user/public-key', {
        method: 'PATCH',
        body: JSON.stringify({ publicKey })
      });
    },

    async getUserPublicKey(userId: string): Promise<string> {
      const data = await apiRequest<{ publicKey: string }>(`/user/${userId}/public-key`);
      return data.publicKey;
    }
  },

  profile: {
    /**
     * Explicitly commits the immutable signed Terms & Conditions to backend logs
     */
    async acceptTerms(name: string, acceptedAt: string, version: string): Promise<{ success: boolean; data: any }> {
      if (!USE_API) {
        console.log(`[Terms Sandbox] Accepted locally by '${name}' on ${acceptedAt} w/ version ${version}`);
        return Promise.resolve({ success: true, data: { name, acceptedAt, version } });
      }
      // Note: Backend might need this route or handled via profile update
      return apiRequest<{ success: boolean; data: any }>('/user/accept-terms', {
        method: 'POST',
        body: JSON.stringify({ name, acceptedAt, version })
      });
    }
  },

  /**
   * -------------------------------------------------------------
   * CHAT ROOM & INTEGRATION ROOMS ENDPOINTS
   * -------------------------------------------------------------
   */
  rooms: {
    /**
     * Retrieves list of active public and VIP rooms from the Express database
     */
    async fetchAll(): Promise<Room[]> {
      if (!USE_API) {
        // In local sandbox mode, client resolves lists gracefully from App state
        return Promise.reject(new Error('Use local state first in sandbox'));
      }
      return apiRequest<Room[]>('/rooms');
    },

    /**
     * Persists new custom/VIP room into the Node.js server
     */
    async create(room: Room): Promise<Room> {
      if (!USE_API) {
        return Promise.resolve(room);
      }
      return apiRequest<Room>('/rooms', {
        method: 'POST',
        body: JSON.stringify(room)
      });
    },

    /**
     * Track active user joining statistics/logs inside rooms for security compliance
     */
    async logJoin(roomId: string, username: string): Promise<void> {
      if (!USE_API) return;
      return apiRequest<void>(`/rooms/${roomId}/join`, {
        method: 'POST',
        body: JSON.stringify({ username })
      });
    }
  },

  /**
   * -------------------------------------------------------------
   * FORUM & MUTUAL AID GROUP DISCUSSIONS ENDPOINTS
   * -------------------------------------------------------------
   */
  forum: {
    /**
     * Downloads list of active support categories and topics from server
     */
    async fetchTopics(): Promise<ForumTopic[]> {
      if (!USE_API) {
        return Promise.reject(new Error('Sandbox operational. Retrieve from local forum state.'));
      }
      const data = await apiRequest<any[]>('/forum/topics');
      return data.map(topic => ({
        id: topic.id,
        title: topic.title,
        category: topic.category,
        authorName: topic.author?.nickname || 'Viajante',
        authorAvatarId: topic.author?.avatarId || 'm1',
        lastUpdate: new Date(topic.updatedAt).getTime(),
        repliesCount: topic.repliesCount || 0,
        viewsCount: topic.viewsCount || 0,
        posts: []
      }));
    },

    /**
     * Pulls replies and individual interactions for a specific chosen topic ID
     */
    async fetchTopicDetails(topicId: string): Promise<ForumTopic> {
      if (!USE_API) {
        return Promise.reject(new Error('Sandbox mode. Run through local view resolvers.'));
      }
      const topic = await apiRequest<any>(`/forum/topics/${topicId}`);
      return {
        id: topic.id,
        title: topic.title,
        category: topic.category,
        authorName: topic.author?.nickname || 'Viajante',
        authorAvatarId: topic.author?.avatarId || 'm1',
        lastUpdate: new Date(topic.updatedAt).getTime(),
        repliesCount: topic.repliesCount || 0,
        viewsCount: topic.viewsCount || 0,
        posts: (topic.posts || []).map((p: any) => ({
          id: p.id,
          authorName: p.author?.nickname || 'Viajante',
          authorAvatarId: p.author?.avatarId || 'm1',
          content: p.content,
          timestamp: new Date(p.createdAt).getTime(),
          likes: p.likes || 0,
          reactions: p.reactions || {}
        }))
      };
    },

    /**
     * Registers a new thread topic
     */
    async createTopic(topic: ForumTopic): Promise<ForumTopic> {
      if (!USE_API) {
        return Promise.resolve(topic);
      }
      return apiRequest<ForumTopic>('/forum/topics', {
        method: 'POST',
        body: JSON.stringify(topic)
      });
    },

    /**
     * Persists a supportive reply post under a thread
     */
    async reply(topicId: string, reply: ForumPost): Promise<ForumPost> {
      if (!USE_API) {
        return Promise.resolve(reply);
      }
      return apiRequest<ForumPost>(`/forum/topics/${topicId}/replies`, {
        method: 'POST',
        body: JSON.stringify(reply)
      });
    },

    /**
     * Interacts with reactions (heart, like, hug) in a secure way on the backend
     */
    async react(topicId: string, postId: string, reaction: string): Promise<any> {
      if (!USE_API) return Promise.resolve({ success: true });
      return apiRequest<any>(`/forum/posts/${postId}/react`, {
        method: 'POST',
        body: JSON.stringify({ reaction })
      });
    }
  },

  /**
   * -------------------------------------------------------------
   * ADMIN DASHBOARD ENDPOINTS
   * -------------------------------------------------------------
   */
  admin: {
    async getStats(): Promise<any> {
      return apiRequest<any>('/admin/stats');
    },
    async getUsers(): Promise<User[]> {
      return apiRequest<User[]>('/admin/users');
    },
    async updateUserPlan(userId: string, plan: string): Promise<User> {
      return apiRequest<User>(`/admin/users/${userId}/plan`, {
        method: 'PATCH',
        body: JSON.stringify({ plan })
      });
    },
    async banUser(userId: string): Promise<User> {
      return apiRequest<User>(`/admin/users/${userId}/ban`, {
        method: 'POST'
      });
    },
    async getTickets(): Promise<any[]> {
      return apiRequest<any[]>('/admin/tickets');
    },
    async replyTicket(ticketId: string, reply: string): Promise<any> {
      return apiRequest<any>(`/admin/tickets/${ticketId}/reply`, {
        method: 'POST',
        body: JSON.stringify({ reply })
      });
    }
  }
};
