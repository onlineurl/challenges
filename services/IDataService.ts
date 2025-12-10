import type { Event, Challenge, Participant, CompletedChallenge, EventType, NewChallenge, TimerMode } from '../types';

export interface AdminAccessCode {
    id: string;
    code: string;
    created_at: string;
    event_title?: string;
    event_status?: string;
    host_email?: string;
}

export interface IDataService {
  // Admin Methods
  getAdminAccessCodes(): Promise<AdminAccessCode[]>;
  generateAccessCode(prefix: string): Promise<string>;

  // Events
  getEvents(): Promise<Event[]>;
  getEvent(id: string): Promise<Event | null>;
  findEventByCode(code: string): Promise<{ event: Event | null; reason?: 'not_found' | 'not_yet_started' | 'ended' }>;
  createEvent(data: { title: string; description: string; type: EventType; timer_mode: TimerMode; start_time?: string; end_time?: string; access_code: string; }): Promise<void>;
  deleteEvent(eventId: string): Promise<void>;
  startGlobalChallenge(eventId: string, challengeId: string): Promise<void>;

  // Challenges
  getChallengesForEvent(eventId: string): Promise<Challenge[]>;
  getChallenge(id: string): Promise<Challenge | null>;
  addChallengeToEvent(eventId: string, challengeData: NewChallenge): Promise<void>;
  updateChallenge(challengeId: string, challengeData: NewChallenge): Promise<void>;
  deleteChallenge(challengeId: string): Promise<void>;
  
  // Participants
  getParticipantsForEvent(eventId: string): Promise<Participant[]>;
  getParticipant(id: string): Promise<Participant | null>;
  createParticipant(eventId: string, name: string): Promise<Participant>;
  deleteParticipant(participantId: string): Promise<void>;
  updateParticipantScore(participantId: string, pointsToAdd: number): Promise<void>;

  // Completed Challenges
  getCompletedForEvent(eventId: string): Promise<CompletedChallenge[]>;
  completeChallenge(participantId: string, challengeId: string, photoFile: File, compressedSize: number): Promise<void>;
  deleteChallengeSubmission(submissionId: string): Promise<void>;
}