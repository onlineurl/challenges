export type EventType = 'wedding' | 'baby_shower' | 'birthday' | 'other';
export type ChallengeDifficulty = 'easy' | 'medium' | 'hard';
export type EventStatus = 'pending' | 'active' | 'completed';
export type TimerMode = 'individual' | 'global';

export interface EventConfig {
  timePerChallenge: number;
  maxParticipants: number;
  autoAssign: boolean;
  points: { [key in ChallengeDifficulty]: number };
  compression: { quality: number; maxWidth: number };
  timer_mode: TimerMode;
}

export interface Event {
  id: string;
  host_id: string;
  title: string;
  type: EventType;
  description?: string;
  config: EventConfig;
  join_code: string;
  qr_code_url: string;
  status: EventStatus;
  start_time?: string;
  end_time?: string;
  created_at: string;
  is_demo?: boolean;
  // For global timer mode
  current_global_challenge_id?: string;
  global_challenge_expires_at?: string;
}

export interface Challenge {
  id: string;
  event_id: string;
  title: string;
  description: string;
  difficulty: ChallengeDifficulty;
  time_limit: number; // in seconds
  points: number;
  is_active: boolean;
  is_special?: boolean;
}

// Used for creating/editing challenges before they have an ID
export type NewChallenge = Omit<Challenge, 'id' | 'event_id' | 'is_active'>;


export interface Participant {
  id: string;
  event_id: string;
  name: string;
  device_id: string; // For uniqueness without login
  total_points: number;
  total_time_taken_seconds: number;
  avatar_color: string;
  avatar_emoji: string;
  current_challenge_id?: string;
  challenge_assigned_at?: string;
  challenge_expires_at?: string;
}

export interface CompletedChallenge {
  id: string;
  participant_id: string;
  challenge_id: string;
  media_url: string; // The URL to the compressed photo
  original_filename: string;
  compressed_size: number;
  points_awarded: number;
  completed_at: string;
  time_taken_seconds: number;
  // Enriched data for gallery
  participant_name: string;
  challenge_title: string;
}