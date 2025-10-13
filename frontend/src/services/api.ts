import axios from 'axios';
import type { User, Event, Athlete, Apparatus, Performance, Score, ScoreSubmission } from '../types';

// GymnaTech API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email: string, password: string) =>
    api.post<{ user: User; token: string }>('/auth/login', { email, password }),
  
  register: (data: any) =>
    api.post<{ user: User; token: string }>('/auth/register', data),
  
  getCurrentUser: () =>
    api.get<{ user: User }>('/auth/me')
};

// Events API
export const eventsAPI = {
  getAll: () => api.get<{ events: Event[] }>('/events'),
  
  getById: (id: number) => api.get<{ event: Event }>(`/events/${id}`),
  
  create: (data: Partial<Event>) => api.post<{ event: Event }>('/events', data),
  
  update: (id: number, data: Partial<Event>) =>
    api.put<{ event: Event }>(`/events/${id}`, data),
  
  getAthletes: (id: number) =>
    api.get<{ athletes: any[] }>(`/events/${id}/athletes`),
  
  registerAthlete: (eventId: number, data: { athlete_id: number; apparatus_ids: number[] }) =>
    api.post(`/events/${eventId}/athletes`, data)
};

// Athletes API
export const athletesAPI = {
  getAll: () => api.get<{ athletes: Athlete[] }>('/athletes'),
  
  getById: (id: number) => api.get<{ athlete: Athlete }>(`/athletes/${id}`),
  
  create: (data: Partial<Athlete>) => api.post<{ athlete: Athlete }>('/athletes', data),
  
  update: (id: number, data: Partial<Athlete>) =>
    api.put<{ athlete: Athlete }>(`/athletes/${id}`, data)
};

// Apparatus API
export const apparatusAPI = {
  getAll: (discipline?: string) =>
    api.get<{ apparatus: Apparatus[] }>('/apparatus', { params: { discipline } })
};

// Scoring API
export const scoringAPI = {
  getPerformances: (eventId: number, apparatusId?: number) =>
    api.get<{ performances: Performance[] }>(`/scoring/performances/event/${eventId}`, {
      params: { apparatus_id: apparatusId }
    }),
  
  createPerformance: (data: any) =>
    api.post<{ performance: Performance }>('/scoring/performances', data),
  
  submitScore: (data: ScoreSubmission) =>
    api.post<{ score: Score }>('/scoring/scores', data),
  
  getScores: (performanceId: number) =>
    api.get<{ scores: Score[] }>(`/scoring/scores/performance/${performanceId}`),
  
  getLeaderboard: (eventId: number, apparatusId?: number) =>
    api.get<{ leaderboard: any[] }>(`/scoring/leaderboard/${eventId}`, {
      params: { apparatus_id: apparatusId }
    }),
  
  publishScores: (performanceIds: number[]) =>
    api.post('/scoring/publish', { performance_ids: performanceIds })
};

export default api;


