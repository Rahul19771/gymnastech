export type UserRole = 'admin' | 'judge' | 'official' | 'athlete' | 'public';

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  is_active: boolean;
}

export interface Apparatus {
  id: number;
  name: string;
  code: string;
  description?: string;
  discipline: string;
  is_active: boolean;
}

export interface Event {
  id: number;
  name: string;
  description?: string;
  event_date: string;
  start_time?: string;
  location?: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
}

export interface Athlete {
  id: number;
  first_name: string;
  last_name: string;
  date_of_birth?: string;
  country?: string;
  club?: string;
  registration_number?: string;
}

export interface Performance {
  id: number;
  event_id: number;
  athlete_id: number;
  apparatus_id: number;
  first_name: string;
  last_name: string;
  country?: string;
  apparatus_name: string;
  apparatus_code: string;
  order_number?: number;
  status: string;
  d_score?: number;
  e_score?: number;
  neutral_deductions?: number;
  final_score?: number;
  is_official?: boolean;
}

export interface Score {
  id: number;
  performance_id: number;
  judge_id: number;
  score_type: 'd_score' | 'e_score';
  score_value: number;
  deductions?: any[];
  penalties?: any[];
  comments?: string;
  first_name?: string;
  last_name?: string;
}

export interface ScoreSubmission {
  performance_id: number;
  score_type: 'd_score' | 'e_score';
  score_value: number;
  deductions?: any[];
  penalties?: any[];
  comments?: string;
}

export interface LeaderboardEntry {
  performance_id: number;
  athlete_id: number;
  first_name: string;
  last_name: string;
  country?: string;
  club?: string;
  apparatus_name: string;
  d_score: number;
  e_score: number;
  neutral_deductions: number;
  final_score: number;
  is_official: boolean;
}


