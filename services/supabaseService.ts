import { supabase } from '../supabaseClient';
import type { IDataService, AdminAccessCode } from './IDataService';
import type { Event, Challenge, Participant, CompletedChallenge, EventType, TimerMode } from '../types';
import { addSeconds, isAfter, isBefore, parseISO, differenceInSeconds } from 'date-fns';

// Helper for real photo uploads
const uploadPhotoToStorage = async (eventId: string, participantId: string, photoFile: File): Promise<string> => {
    const fileExt = photoFile.name.split('.').pop() || 'jpg';
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${eventId}/${participantId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
        .from('event-media')
        .upload(filePath, photoFile);

    if (uploadError) {
        throw new Error(`Error subiendo archivo: ${uploadError.message}`);
    }

    const { data } = supabase.storage
        .from('event-media')
        .getPublicUrl(filePath);

    if (!data.publicUrl) {
        throw new Error('Error al obtener URL pública de la imagen.');
    }
    
    return data.publicUrl;
};


export const supabaseService: IDataService = {
  // --- Admin ---
  async getAdminAccessCodes(): Promise<AdminAccessCode[]> {
    const { data, error } = await supabase.rpc('get_admin_access_codes');
    if (error) throw new Error(error.message);
    return data as AdminAccessCode[];
  },

  async generateAccessCode(prefix: string): Promise<string> {
    const { data, error } = await supabase.rpc('generate_access_code', { prefix });
    if (error) throw new Error(error.message);
    return data as string;
  },

  // --- Events ---
  async getEvents(): Promise<Event[]> {
    const { data, error } = await supabase.from('events').select('*');
    if (error) {
      console.error('Error fetching events:', error);
      return [];
    }
    return data as Event[];
  },

  async getEvent(id: string): Promise<Event | null> {
    const { data, error } = await supabase.from('events').select('*').eq('id', id).single();
    if (error) {
      console.error('Error fetching event:', error);
      return null;
    }
    return data as Event;
  },
  
  async findEventByCode(code: string): Promise<{ event: Event | null; reason?: 'not_found' | 'not_yet_started' | 'ended' }> {
    const { data, error } = await supabase.from('events').select('*').eq('join_code', code.toUpperCase()).single();

    if (error || !data) return { event: null, reason: 'not_found' };
    
    const event = data as Event;
    const now = new Date();
    if (event.start_time && isAfter(parseISO(event.start_time), now)) return { event: null, reason: 'not_yet_started' };
    if (event.end_time && isBefore(parseISO(event.end_time), now)) return { event: null, reason: 'ended' };
    return { event };
  },

  async createEvent(eventData: { title: string; description: string; type: EventType; timer_mode: TimerMode; start_time?: string; end_time?: string; access_code: string; }) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Usuario no encontrado. Por favor inicia sesión.");

    const joinCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    // Use the Secure RPC function to validate the code and create the event
    const { error } = await supabase.rpc('create_event_with_code', {
      p_title: eventData.title,
      p_description: eventData.description,
      p_type: eventData.type,
      p_timer_mode: eventData.timer_mode,
      p_start_time: eventData.start_time || null,
      p_end_time: eventData.end_time || null,
      p_config: {
        timePerChallenge: 300,
        maxParticipants: 50,
        autoAssign: true,
        points: { easy: 10, medium: 20, hard: 30 },
        compression: { quality: 0.8, maxWidth: 1200 },
        timer_mode: eventData.timer_mode,
      },
      p_join_code: joinCode,
      p_access_code: eventData.access_code.toUpperCase()
    });

    if (error) {
        throw new Error(error.message);
    }
  },

  async deleteEvent(eventId: string) {
    const { error } = await supabase.from('events').delete().eq('id', eventId);
    if (error) throw new Error(`Error borrando evento: ${error.message}`);
  },

  async startGlobalChallenge(eventId, challengeId) {
     const challenge = await this.getChallenge(challengeId);
     if (!challenge) return;
     const expiresAt = addSeconds(new Date(), challenge.time_limit).toISOString();
     const { error } = await supabase.from('events').update({
         current_global_challenge_id: challengeId,
         global_challenge_expires_at: expiresAt
     }).eq('id', eventId);
     if (error) throw new Error(`Error iniciando reto global: ${error.message}`);
  },

  // --- Challenges ---
  async getChallengesForEvent(eventId: string): Promise<Challenge[]> {
    const { data, error } = await supabase.from('challenges').select('*').eq('event_id', eventId);
    if (error) return [];
    return data as Challenge[];
  },

  async getChallenge(id: string): Promise<Challenge | null> {
     const { data, error } = await supabase.from('challenges').select('*').eq('id', id).single();
     if (error) return null;
     return data as Challenge;
  },

  async addChallengeToEvent(eventId, challengeData) {
      const { error } = await supabase.from('challenges').insert({ ...challengeData, event_id: eventId });
      if (error) throw new Error(`Error añadiendo reto: ${error.message}`);
  },
  
  async updateChallenge(challengeId, challengeData) {
      const { error } = await supabase.from('challenges').update(challengeData).eq('id', challengeId);
      if (error) throw new Error(`Error actualizando reto: ${error.message}`);
  },

  async deleteChallenge(challengeId: string) {
      const { error } = await supabase.from('challenges').delete().eq('id', challengeId);
      if (error) throw new Error(`Error borrando reto: ${error.message}`);
  },

  // --- Participants ---
  async getParticipantsForEvent(eventId: string): Promise<Participant[]> {
    const { data, error } = await supabase.from('participants').select('*').eq('event_id', eventId)
      .order('total_points', { ascending: false })
      .order('total_time_taken_seconds', { ascending: true });
    if (error) return [];
    return data as Participant[];
  },

  async getParticipant(id: string): Promise<Participant | null> {
      const { data, error } = await supabase.from('participants').select('*').eq('id', id).single();
      if (error) return null;
      return data as Participant;
  },

  async createParticipant(eventId: string, name: string): Promise<Participant> {
    const { data, error } = await supabase.rpc('create_or_get_participant', {
      p_event_id: eventId,
      p_name: name
    });
    
    if (error || !data || data.length === 0) {
      throw new Error(error?.message || "No se pudo crear o recuperar el participante");
    }
    const participant = data[0] as Participant;

    // Assign challenge if it's a new participant without one
    if (!participant.current_challenge_id) {
       await supabase.rpc('assign_new_challenge', { p_id: participant.id });
       // Refetch to get the newly assigned challenge details
       const updatedParticipant = await this.getParticipant(participant.id);
       if (updatedParticipant) return updatedParticipant;
    }

    return participant;
  },
  
  async deleteParticipant(participantId: string): Promise<void> {
    const { error } = await supabase.from('participants').delete().eq('id', participantId);
    if (error) throw new Error(`Error borrando participante: ${error.message}`);
  },

  async updateParticipantScore(participantId: string, pointsToAdd: number): Promise<void> {
    const { error } = await supabase.rpc('adjust_manual_score', { p_id: participantId, points_to_add: pointsToAdd });
    if (error) throw new Error(`Error ajustando puntaje: ${error.message}`);
  },

  // --- Completed Challenges ---
  async getCompletedForEvent(eventId: string): Promise<CompletedChallenge[]> {
    const { data, error } = await supabase.rpc('get_gallery_for_event', { event_id_to_check: eventId });
    if (error) return [];
    
    // Client-side filtering just in case RPC returns rejected ones
    return (data as CompletedChallenge[]).filter(c => c.status !== 'rejected');
  },

  async completeChallenge(participantId, challengeId, photoFile, compressedSize) {
      const participant = await this.getParticipant(participantId);
      const challenge = await this.getChallenge(challengeId);
      if(!participant || !challenge) throw new Error("Participante o reto no encontrado");

      const publicUrl = await uploadPhotoToStorage(participant.event_id, participantId, photoFile);
      
      const completedAt = new Date();
      const timeTaken = participant.challenge_assigned_at 
          ? Math.max(0, differenceInSeconds(completedAt, parseISO(participant.challenge_assigned_at)))
          : challenge.time_limit;
      
      const { error: completeError } = await supabase.from('completed_challenges').insert({
          participant_id: participantId,
          challenge_id: challengeId,
          media_url: publicUrl,
          original_filename: photoFile.name,
          compressed_size: compressedSize,
          points_awarded: challenge.points,
          time_taken_seconds: timeTaken,
          status: 'valid'
      });

      if (completeError) throw new Error(`Error guardando entrega: ${completeError.message}`);

      await supabase.rpc('update_participant_score', {
        p_id: participantId,
        points: challenge.points,
        time_taken: timeTaken
      });
      
      await supabase.rpc('assign_new_challenge', { p_id: participantId });
  },

  async deleteChallengeSubmission(submissionId: string): Promise<void> {
      // Use soft_reject_submission instead of delete or plain reject
      const { error } = await supabase.rpc('soft_reject_submission', { submission_id: submissionId });
      if (error) throw new Error(`Error rechazando entrega: ${error.message}`);
  },
};