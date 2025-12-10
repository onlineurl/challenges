import { useMemo } from 'react';
import type { Event, Challenge, Participant, CompletedChallenge } from '../types';
import { addSeconds, isAfter, isBefore, parseISO, differenceInSeconds } from 'date-fns';
import type { IDataService, AdminAccessCode } from '../services/IDataService';

// --- INITIAL DATA STORE (EMPTY FOR PRODUCTION) ---
// Demo data has been removed to prevent unauthorized "free" usage simulation.

const dataStore: {
  events: Event[];
  challenges: Challenge[];
  participants: Participant[];
  completedChallenges: CompletedChallenge[];
  usedAccessCodes: Map<string, string>; // Maps access_code -> event_id
  adminCodes: AdminAccessCode[];
} = {
  events: [],
  challenges: [],
  participants: [],
  completedChallenges: [],
  usedAccessCodes: new Map(),
  adminCodes: []
};


export function useMockData(): IDataService {
  
  return useMemo(() => {
    
    const getDeviceId = () => {
      let deviceId = localStorage.getItem('deviceId');
      if (!deviceId) {
          deviceId = `dev_${Math.random().toString(36).substr(2, 9)}`;
          localStorage.setItem('deviceId', deviceId);
      }
      return deviceId;
    }

    const assignNewChallenge = (participantId: string): void => {
        const participant = dataStore.participants.find(p => p.id === participantId);
        if (!participant) return;
        
        const event = dataStore.events.find(e => e.id === participant.event_id);
        if (event?.config.timer_mode === 'global') {
            participant.current_challenge_id = undefined;
            return;
        }

        // Only count valid completions
        const completedChallenges = dataStore.completedChallenges
            .filter(c => c.participant_id === participantId && c.status !== 'rejected')
            .map(c => c.challenge_id);
        
        const availableChallenges = dataStore.challenges.filter(c => c.event_id === participant.event_id && !completedChallenges.includes(c.id));
        
        if (availableChallenges.length === 0) {
            participant.current_challenge_id = undefined;
            participant.challenge_expires_at = undefined;
            return;
        }
        
        const newChallenge = availableChallenges[Math.floor(Math.random() * availableChallenges.length)];
        
        participant.current_challenge_id = newChallenge.id;
        participant.challenge_assigned_at = new Date().toISOString();
        participant.challenge_expires_at = addSeconds(new Date(), newChallenge.time_limit).toISOString();
    };

    return {
        // Mock Admin Methods
        async getAdminAccessCodes() {
            return Promise.resolve(dataStore.adminCodes.map(ac => {
                const eventId = dataStore.usedAccessCodes.get(ac.code);
                const event = eventId ? dataStore.events.find(e => e.id === eventId) : undefined;
                return {
                    ...ac,
                    event_title: event?.title,
                    event_status: event?.status,
                    host_email: event ? 'mock_host@test.com' : undefined
                };
            }));
        },
        async generateAccessCode(prefix: string) {
            const newCode = `${prefix}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
            dataStore.adminCodes.unshift({
                id: `ac_${Date.now()}`,
                code: newCode,
                created_at: new Date().toISOString()
            });
            return Promise.resolve(newCode);
        },

        async getEvents() { return Promise.resolve(dataStore.events); },
        async getEvent(id) { return Promise.resolve(dataStore.events.find(e => e.id === id) || null); },
        async findEventByCode(code) {
            const event = dataStore.events.find(e => e.join_code.toUpperCase() === code.toUpperCase() && (e.status === 'active' || e.is_demo));
            if (!event) return { event: null, reason: 'not_found' };
            const now = new Date();
            if (event.start_time && isAfter(parseISO(event.start_time), now)) return { event: null, reason: 'not_yet_started' };
            if (event.end_time && isBefore(parseISO(event.end_time), now)) return { event: null, reason: 'ended' };
            return { event };
        },
        async createEvent(data) {
            // Check if code exists in admin list for mock
            const validCode = dataStore.adminCodes.find(ac => ac.code === data.access_code);
            // Allow 'ADMIN' prefix bypass for testing without generating
            if (!validCode && !data.access_code.startsWith('ADMIN')) {
                throw new Error("Código de licencia inválido");
            }

            // Check if code is already in use
            if (dataStore.usedAccessCodes.has(data.access_code)) {
                throw new Error("El código de licencia ya está siendo usado en otro evento activo.");
            }

            const newEventId = `evt_${Date.now()}`;
            const newEvent: Event = {
                id: newEventId, host_id: 'user_host_1', title: data.title, type: data.type, description: data.description,
                join_code: Math.random().toString(36).substring(2, 8).toUpperCase(), status: 'active', qr_code_url: 'dummy_url',
                created_at: new Date().toISOString(), start_time: data.start_time || undefined, end_time: data.end_time || undefined,
                config: {
                    timePerChallenge: 300, maxParticipants: 50, autoAssign: true,
                    points: { easy: 10, medium: 20, hard: 30 }, compression: { quality: 0.8, maxWidth: 1200 },
                    timer_mode: data.timer_mode,
                },
            };
            
            dataStore.events.push(newEvent);
            // Mark code as used for this event
            dataStore.usedAccessCodes.set(data.access_code, newEventId);
            
            return Promise.resolve();
        },
        async deleteEvent(eventId) {
            // Find which code was used for this event and free it
            for (const [code, evtId] of dataStore.usedAccessCodes.entries()) {
                if (evtId === eventId) {
                    dataStore.usedAccessCodes.delete(code);
                    break;
                }
            }
            
            dataStore.events = dataStore.events.filter(e => e.id !== eventId);
            return Promise.resolve();
        },
        async startGlobalChallenge(eventId, challengeId) {
            const event = dataStore.events.find(e => e.id === eventId);
            const challenge = dataStore.challenges.find(c => c.id === challengeId);
            if (!event || !challenge) return;
            event.current_global_challenge_id = challengeId;
            event.global_challenge_expires_at = addSeconds(new Date(), challenge.time_limit).toISOString();
        },
        async getChallengesForEvent(eventId) { return Promise.resolve(dataStore.challenges.filter(c => c.event_id === eventId)); },
        async getChallenge(id) { return Promise.resolve(dataStore.challenges.find(c => c.id === id) || null); },
        async addChallengeToEvent(eventId, challengeData) {
            const newChallenge: Challenge = { ...challengeData, id: `ch_${Date.now()}`, event_id: eventId, is_active: true };
            dataStore.challenges.push(newChallenge);
            return Promise.resolve();
        },
        async addChallengesToEvent(eventId, challenges) {
            const newChallenges: Challenge[] = challenges.map((c, i) => ({
                ...c,
                id: `ch_${Date.now()}_${i}`,
                event_id: eventId,
                is_active: true
            }));
            dataStore.challenges.push(...newChallenges);
            return Promise.resolve();
        },
        async updateChallenge(challengeId, challengeData) {
            const index = dataStore.challenges.findIndex(c => c.id === challengeId);
            if (index !== -1) {
                dataStore.challenges[index] = { ...dataStore.challenges[index], ...challengeData };
            }
            return Promise.resolve();
        },
        async deleteChallenge(challengeId) {
            dataStore.challenges = dataStore.challenges.filter(c => c.id !== challengeId);
            return Promise.resolve();
        },
        async getParticipantsForEvent(eventId) {
            return Promise.resolve(dataStore.participants.filter(p => p.event_id === eventId)
                .sort((a, b) => (b.total_points - a.total_points) || (a.total_time_taken_seconds - b.total_time_taken_seconds))
            );
        },
        async getParticipant(id) { return Promise.resolve(dataStore.participants.find(p => p.id === id) || null); },
        async createParticipant(eventId, name) {
            const deviceId = getDeviceId();
            let participant = dataStore.participants.find(p => p.event_id === eventId && p.device_id === deviceId);
            if (participant) return Promise.resolve(participant);
            
            const newParticipant: Participant = {
                id: `part_${Date.now()}`, event_id: eventId, name, device_id: deviceId, total_points: 0, total_time_taken_seconds: 0,
                avatar_color: `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`,
                avatar_emoji: ['🥳', '😎', '🤩', '🎉', '📸', '✨'][Math.floor(Math.random() * 6)],
            };
            dataStore.participants.push(newParticipant);
            assignNewChallenge(newParticipant.id);
            const finalParticipant = dataStore.participants.find(p => p.id === newParticipant.id)!;
            return Promise.resolve(finalParticipant);
        },
        async deleteParticipant(participantId) {
            dataStore.participants = dataStore.participants.filter(p => p.id !== participantId);
            return Promise.resolve();
        },
        async updateParticipantScore(participantId, pointsToAdd) {
            const participant = dataStore.participants.find(p => p.id === participantId);
            if (participant) participant.total_points += pointsToAdd;
            return Promise.resolve();
        },
        async getCompletedForEvent(eventId) {
            const eventParticipants = dataStore.participants.filter(p => p.event_id === eventId).map(p => p.id);
            // Filter out rejected photos in mock
            return Promise.resolve(dataStore.completedChallenges.filter(c => eventParticipants.includes(c.participant_id) && c.status !== 'rejected'));
        },
        async completeChallenge(participantId, challengeId, photoFile, compressedSize) {
            const participant = dataStore.participants.find(p => p.id === participantId);
            const challenge = dataStore.challenges.find(c => c.id === challengeId);
            if (!participant || !challenge) return Promise.resolve();

            const completedAt = new Date();
            const timeTaken = participant.challenge_assigned_at ? differenceInSeconds(completedAt, parseISO(participant.challenge_assigned_at)) : challenge.time_limit;
            
            const newCompleted: CompletedChallenge = {
                id: `comp_${Date.now()}`, participant_id: participantId, challenge_id: challengeId,
                media_url: URL.createObjectURL(photoFile), original_filename: photoFile.name, compressed_size: compressedSize,
                points_awarded: challenge.points, completed_at: completedAt.toISOString(), time_taken_seconds: timeTaken,
                participant_name: participant.name, challenge_title: challenge.title, status: 'valid'
            };
            dataStore.completedChallenges.push(newCompleted);
            
            participant.total_points += challenge.points;
            participant.total_time_taken_seconds += timeTaken;
            
            assignNewChallenge(participantId);
            return Promise.resolve();
        },
        async deleteChallengeSubmission(submissionId) {
            // Mock soft reject logic
            const submissionIndex = dataStore.completedChallenges.findIndex(c => c.id === submissionId);
            if (submissionIndex === -1) return Promise.resolve();
            
            const submission = dataStore.completedChallenges[submissionIndex];
            const participant = dataStore.participants.find(p => p.id === submission.participant_id);

            if (participant) {
                participant.total_points -= submission.points_awarded;
                participant.total_time_taken_seconds -= submission.time_taken_seconds;
            }

            // Instead of splicing, just mark as rejected
            dataStore.completedChallenges[submissionIndex].status = 'rejected';
            
            return Promise.resolve();
        }
    };
  }, []);
}