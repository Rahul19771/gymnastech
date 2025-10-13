import { Request } from 'express';

export type UserRole = 'admin' | 'judge' | 'official' | 'athlete' | 'public';

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  is_active: boolean;
  created_at: Date;
}

export interface AuthRequest extends Request {
  user?: User;
}

export interface Apparatus {
  id: number;
  name: string;
  code: string;
  description?: string;
  discipline: string;
  is_active: boolean;
  config: any;
}

export interface Event {
  id: number;
  name: string;
  description?: string;
  event_date: Date;
  start_time?: string;
  location?: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  config: any;
  created_by?: number;
}

export interface Athlete {
  id: number;
  user_id?: number;
  first_name: string;
  last_name: string;
  date_of_birth?: Date;
  country?: string;
  club?: string;
  registration_number?: string;
  is_active: boolean;
}

export interface Performance {
  id: number;
  event_id: number;
  athlete_id: number;
  apparatus_id: number;
  order_number?: number;
  status: 'pending' | 'in_progress' | 'scored' | 'reviewed' | 'finalized';
  video_url?: string;
  notes?: string;
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
  submitted_at: Date;
}

export interface FinalScore {
  id: number;
  performance_id: number;
  d_score: number;
  e_score: number;
  neutral_deductions: number;
  final_score: number;
  e_scores_detail: any;
  calculation_method: string;
  is_official: boolean;
  calculated_at: Date;
  published_at?: Date;
}

export interface JWTPayload {
  userId: number;
  email: string;
  role: UserRole;
}


