import React, { useState, useEffect, useCallback } from 'react';
import type { Participant, Event, Challenge } from '../../types';
import { useDataService } from '../../hooks/useDataService';
import ChallengeTimer from './ChallengeTimer';
import PhotoUpload from './PhotoUpload';
import { Award, Star, Users } from 'lucide-react';
import { Spinner } from '../common/Spinner';

interface ChallengeViewProps {
  participant: Participant;
  event: Event;
  onComplete: () => void;
}

export default function ChallengeView({ participant, event, onComplete }: ChallengeViewProps) {
  const dataService = useDataService();
  
  const [currentChallenge, setCurrentChallenge] = useState<Challenge | null | undefined>(undefined);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);

  const fetchAndSetChallenge = useCallback(async () => {
    // Get the most up-to-date data for both participant and event
    const freshParticipant = await dataService.getParticipant(participant.id);
    const freshEvent = await dataService.getEvent(event.id);

    if (!freshParticipant || !freshEvent) {
      // Handle case where data might be gone (e.g., event deleted)
      setCurrentChallenge(null);
      return;
    }

    let challengeId: string | undefined;
    let expiry: string | undefined;

    if (freshEvent.config.timer_mode === 'global') {
      challengeId = freshEvent.current_global_challenge_id;
      expiry = freshEvent.global_challenge_expires_at;
    } else {
      challengeId = freshParticipant.current_challenge_id;
      expiry = freshParticipant.challenge_expires_at;
    }
    
    if (challengeId) {
      const challenge = await dataService.getChallenge(challengeId);
      setCurrentChallenge(challenge);
      setExpiresAt(expiry || new Date().toISOString());

      // If the timer has already expired upon load, trigger time up logic
      if (expiry && new Date(expiry) < new Date()) {
        handleTimeUp();
      }
    } else {
      setCurrentChallenge(null); // No challenge assigned
    }
  }, [participant.id, event.id, dataService]);

  useEffect(() => {
    fetchAndSetChallenge();
  }, [fetchAndSetChallenge]);
  
  const handleTimeUp = () => {
    // Time's up, refresh to see if a new challenge is available or if it's over
    console.log("Time's up for this challenge!");
    fetchAndSetChallenge();
  };

  const handleUploadComplete = async (photoFile: File, compressedSize: number) => {
    if(currentChallenge) {
        await dataService.completeChallenge(participant.id, currentChallenge.id, photoFile, compressedSize);
        onComplete();
    }
  };

  if (currentChallenge === undefined) {
      return <div className="flex justify-center items-center p-10 min-h-[50vh]"><Spinner size="lg"/></div>;
  }

  if (currentChallenge === null) {
      return (
          <div className="text-center p-8 bg-white rounded-lg shadow-md m-4">
              <h2 className="text-2xl font-bold text-slate-800">All Challenges Done!</h2>
              <p className="mt-2 text-slate-600">Great job, {participant.name}! You've completed all available challenges.</p>
              <p className="mt-4 text-3xl">{participant.avatar_emoji}</p>
          </div>
      );
  }
  
  return (
    <div className="p-4 space-y-4 pb-safe">
      {currentChallenge.is_special && (
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-4 rounded-xl shadow-lg flex items-center gap-3 animate-pulse">
            <Star className="w-8 h-8 flex-shrink-0"/>
            <div>
                <h3 className="font-extrabold text-lg">Special Challenge!</h3>
                <p className="text-sm">This one is worth more. Give it your best shot!</p>
            </div>
        </div>
      )}
       {event.config.timer_mode === 'global' && (
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-4 rounded-xl shadow-lg flex items-center gap-3">
            <Users className="w-8 h-8 flex-shrink-0"/>
            <div>
                <h3 className="font-extrabold text-lg">Global Challenge!</h3>
                <p className="text-sm">Everyone is on this challenge at the same time. Go, go, go!</p>
            </div>
        </div>
      )}
      <div className="bg-white p-6 rounded-2xl shadow-lg">
        <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-semibold text-indigo-600">YOUR CHALLENGE</p>
              <h1 className="text-3xl font-extrabold text-slate-900 mt-1">{currentChallenge.title}</h1>
            </div>
            <div className={`capitalize text-sm font-bold px-3 py-1 rounded-full ${
                currentChallenge.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                currentChallenge.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
            }`}>
                {currentChallenge.difficulty}
            </div>
        </div>

        <div className="mt-4 text-slate-600 space-y-4">
            <p className="text-lg">{currentChallenge.description}</p>
        </div>

        <div className="mt-6 border-t border-slate-200 pt-4 flex items-center justify-between text-sm text-slate-500">
            <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-yellow-500" />
                <span className="font-bold text-base">{currentChallenge.points} Points</span>
            </div>
            {expiresAt && <ChallengeTimer expiresAt={expiresAt} onTimeUp={handleTimeUp} timeLimit={currentChallenge.time_limit} />}
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-lg">
        <PhotoUpload 
          onUploadComplete={handleUploadComplete} 
          compressionQuality={event.config.compression.quality}
          compressionMaxWidth={event.config.compression.maxWidth}
          isSpecial={!!currentChallenge.is_special}
        />
      </div>
    </div>
  );
}