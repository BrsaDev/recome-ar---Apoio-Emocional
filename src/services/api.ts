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
  
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(options.headers || {}),
  };

  try {
    const response = await fetch(url, { ...options, headers });
    
    if (!response.ok) {
      let errorMsg = `Server error ${response.status}`;
      try {
        const errJson = await response.json();
        errorMsg = errJson.message || errJson.error || errorMsg;
      } catch {
        // Fallback if not JSON
      }
      throw new APIError(errorMsg, response.status);
    }
    
    return await response.json() as T;
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
  profile: {
    /**
     * Synchronizes local logged-in User profile with the Node.js database
     */
    async sync(user: User): Promise<User> {
      if (!USE_API) {
        // Return local copy instantly during sandbox mode
        return Promise.resolve(user);
      }
      return apiRequest<User>('/user/sync', {
        method: 'POST',
        body: JSON.stringify(user)
      });
    },

    /**
     * Explicitly commits the immutable signed Terms & Conditions to backend logs
     */
    async acceptTerms(name: string, acceptedAt: string, version: string): Promise<{ success: boolean; data: any }> {
      if (!USE_API) {
        console.log(`[Terms Sandbox] Accepted locally by '${name}' on ${acceptedAt} w/ version ${version}`);
        return Promise.resolve({ success: true, data: { name, acceptedAt, version } });
      }
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
      return apiRequest<ForumTopic[]>('/forum/topics');
    },

    /**
     * Pulls replies and individual interactions for a specific chosen topic ID
     */
    async fetchTopicDetails(topicId: string): Promise<ForumTopic> {
      if (!USE_API) {
        return Promise.reject(new Error('Sandbox mode. Run through local view resolvers.'));
      }
      return apiRequest<ForumTopic>(`/forum/topics/${topicId}`);
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
      return apiRequest<any>(`/forum/topics/${topicId}/posts/${postId}/react`, {
        method: 'POST',
        body: JSON.stringify({ reaction })
      });
    }
  },

  /**
   * -------------------------------------------------------------
   * GEMINI ENGINE PROXY (Server-to-Server)
   * -------------------------------------------------------------
   * Keeps client browser keyless!
   * Proxies chat queries to the Node server which hosts the safe AI prompts.
   */
  aiProxy: {
    async query(prompt: string, context: string): Promise<{ text: string }> {
      if (!USE_API) {
        return Promise.reject(new Error('Calling raw client gemini service instead in sandbox'));
      }
      return apiRequest<{ text: string }>('/ai/chat', {
        method: 'POST',
        body: JSON.stringify({ prompt, context })
      });
    }
  }
};
