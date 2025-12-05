import React, { useState, useEffect, useCallback } from 'react';
import type { Participant, Event, Challenge } from '../../types';
import { useDataService } from '../../hooks/useDataService';
import ChallengeTimer from './ChallengeTimer';
import PhotoUpload from './PhotoUpload';
import { Award, Star, Users, Info, X } from 'lucide-react';
import { Spinner } from '../common/Spinner';
import { useFirstVisit } from '../../hooks/useFirstVisit';

interface ChallengeViewProps {
  participant: Participant;
  event: Event;
  onComplete: () => void;
}

export default function ChallengeView({ participant, event, onComplete }: ChallengeViewProps) {
  const dataService = useDataService();
  
  const [currentChallenge, setCurrentChallenge] = useState<Challenge | null | undefined>(undefined);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  const { isFirstVisit, markAsVisited } = useFirstVisit('atr_tutorial_seen');
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    if (isFirstVisit) setShowTutorial(true);
  }, [isFirstVisit]);

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
    console.log("¡Tiempo agotado!");
    fetchAndSetChallenge();
  };

  const handleUploadComplete = async (photoFile: File, compressedSize: number) => {
    if(currentChallenge) {
        setIsTransitioning(true); // Start transition state to hide timer glitch
        try {
            await dataService.completeChallenge(participant.id, currentChallenge.id, photoFile, compressedSize);
            onComplete();
            // Fetch next challenge immediately
            await fetchAndSetChallenge();
        } catch (e) {
            console.error(e);
            alert("Error al subir el reto. Intenta de nuevo.");
        } finally {
            setIsTransitioning(false);
        }
    }
  };

  const closeTutorial = () => {
      markAsVisited();
      setShowTutorial(false);
  }

  if (isTransitioning) {
      return (
          <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center">
              <Spinner size="lg" color="border-indigo-500"/>
              <h2 className="mt-4 text-xl font-bold text-slate-800">¡Foto subida!</h2>
              <p className="text-slate-600">Cargando siguiente reto...</p>
          </div>
      );
  }

  if (currentChallenge === undefined) {
      return <div className="flex justify-center items-center p-10 min-h-[50vh]"><Spinner size="lg"/></div>;
  }

  if (currentChallenge === null) {
      return (
          <div className="text-center p-8 bg-white rounded-lg shadow-md m-4">
              <h2 className="text-2xl font-bold text-slate-800">¡Todos los retos completados!</h2>
              <p className="mt-2 text-slate-600">¡Gran trabajo, {participant.name}! Has completado todos los retos disponibles.</p>
              <p className="mt-4 text-6xl">{participant.avatar_emoji}</p>
          </div>
      );
  }
  
  return (
    <div className="p-4 space-y-4 pb-safe relative">
      {/* Tutorial Overlay */}
      {showTutorial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full relative animate-bounce-in">
                <button onClick={closeTutorial} className="absolute top-2 right-2 p-2 text-slate-400 hover:text-slate-600"><X className="w-6 h-6"/></button>
                <div className="text-center">
                    <div className="mx-auto w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                        <Info className="w-6 h-6 text-indigo-600"/>
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">¡Bienvenido a ATR!</h3>
                    <p className="text-slate-600 mb-4">Completa los retos tomando fotos divertidas antes de que se acabe el tiempo.</p>
                    <ul className="text-left text-sm text-slate-600 space-y-2 mb-6 bg-slate-50 p-3 rounded-lg">
                        <li className="flex gap-2">📸 <span>Toma la foto según la descripción.</span></li>
                        <li className="flex gap-2">⏱️ <span>¡Cuidado con el reloj!</span></li>
                        <li className="flex gap-2">🏆 <span>Gana puntos y sube en el ranking.</span></li>
                    </ul>
                    <button onClick={closeTutorial} className="w-full py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition">
                        ¡Entendido, a jugar!
                    </button>
                </div>
            </div>
        </div>
      )}

      {currentChallenge.is_special && (
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-4 rounded-xl shadow-lg flex items-center gap-3 animate-pulse">
            <Star className="w-8 h-8 flex-shrink-0"/>
            <div>
                <h3 className="font-extrabold text-lg">¡Reto Especial!</h3>
                <p className="text-sm">Este vale más puntos. ¡Dalo todo!</p>
            </div>
        </div>
      )}
       {event.config.timer_mode === 'global' && (
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-4 rounded-xl shadow-lg flex items-center gap-3">
            <Users className="w-8 h-8 flex-shrink-0"/>
            <div>
                <h3 className="font-extrabold text-lg">¡Reto Global!</h3>
                <p className="text-sm">Todos están en este reto al mismo tiempo. ¡Corre!</p>
            </div>
        </div>
      )}
      <div className="bg-white p-6 rounded-2xl shadow-lg">
        <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-semibold text-indigo-600 uppercase">TU RETO</p>
              <h1 className="text-3xl font-extrabold text-slate-900 mt-1">{currentChallenge.title}</h1>
            </div>
            <div className={`capitalize text-sm font-bold px-3 py-1 rounded-full ${
                currentChallenge.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                currentChallenge.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
            }`}>
                {currentChallenge.difficulty === 'easy' ? 'Fácil' : currentChallenge.difficulty === 'medium' ? 'Media' : 'Difícil'}
            </div>
        </div>

        <div className="mt-4 text-slate-600 space-y-4">
            <p className="text-lg">{currentChallenge.description}</p>
        </div>

        <div className="mt-6 border-t border-slate-200 pt-4 flex items-center justify-between text-sm text-slate-500">
            <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-yellow-500" />
                <span className="font-bold text-base">{currentChallenge.points} Puntos</span>
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