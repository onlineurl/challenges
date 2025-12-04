import React, { useState, useEffect, useCallback } from 'react';
import { useDataService } from '../../hooks/useDataService';
import { ArrowLeft, PlusCircle, PlayCircle, Star, Clock, Trash2, Edit } from 'lucide-react';
import type { Event, Challenge, NewChallenge } from '../../types';
import ChallengeEditorModal from './ChallengeEditorModal';
import { Spinner } from '../common/Spinner';

interface ChallengeManagerProps {
  eventId: string;
  onBack: () => void;
}

const ChallengeCard: React.FC<{ 
    challenge: Challenge; 
    onStartGlobal: (challengeId: string) => void; 
    onDelete: (challengeId: string) => void;
    onEdit: (challenge: Challenge) => void;
    isGlobalMode: boolean 
}> = ({ challenge, onStartGlobal, onDelete, onEdit, isGlobalMode }) => {
    
    const handleDelete = () => {
        if(window.confirm(`Are you sure you want to delete the challenge "${challenge.title}"?`)) {
            onDelete(challenge.id);
        }
    }

    return (
        <li className="p-4 flex items-center justify-between bg-white rounded-lg shadow-sm">
            <div>
                <div className="flex items-center gap-2">
                    {challenge.is_special && <Star className="w-4 h-4 text-yellow-500" />}
                    <p className="font-semibold text-slate-800">{challenge.title}</p>
                </div>
                <p className="text-sm text-slate-500 mt-1 max-w-prose">{challenge.description}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-slate-600">
                    <span className="font-bold capitalize px-2 py-0.5 rounded-full bg-slate-100">{challenge.difficulty}</span>
                    <span>{challenge.points}pts</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3"/> {challenge.time_limit}s</span>
                </div>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
                {isGlobalMode && (
                    <button 
                        onClick={() => onStartGlobal(challenge.id)}
                        className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-green-700 bg-green-100 rounded-lg hover:bg-green-200 transition"
                    >
                        <PlayCircle className="w-4 h-4" />
                        <span className="hidden sm:inline">Start</span>
                    </button>
                )}
                 <button onClick={() => onEdit(challenge)} className="p-2 text-slate-600 hover:bg-slate-200 rounded-full transition">
                    <Edit className="w-4 h-4" />
                    <span className="sr-only">Edit Challenge</span>
                </button>
                 <button onClick={handleDelete} className="p-2 text-red-600 hover:bg-red-100 rounded-full transition">
                    <Trash2 className="w-4 h-4" />
                    <span className="sr-only">Delete Challenge</span>
                </button>
            </div>
        </li>
    );
}

export default function ChallengeManager({ eventId, onBack }: ChallengeManagerProps) {
  const dataService = useDataService();
  const [event, setEvent] = useState<Event | null>(null);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState<Challenge | undefined>(undefined);
  
  const fetchData = useCallback(async () => {
    // No need to set loading true on refetch
    const [eventData, challengesData] = await Promise.all([
        dataService.getEvent(eventId),
        dataService.getChallengesForEvent(eventId)
    ]);
    setEvent(eventData);
    setChallenges(challengesData);
    setIsLoading(false);
  }, [eventId, dataService]);

  useEffect(() => {
    setIsLoading(true);
    fetchData();
  }, [fetchData]);
  
  const handleOpenCreateModal = () => {
    setEditingChallenge(undefined);
    setIsModalOpen(true);
  }

  const handleOpenEditModal = (challenge: Challenge) => {
    setEditingChallenge(challenge);
    setIsModalOpen(true);
  }

  const handleSaveChallenge = async (challengeData: NewChallenge) => {
    if (editingChallenge) {
        await dataService.updateChallenge(editingChallenge.id, challengeData);
    } else {
        await dataService.addChallengeToEvent(eventId, challengeData);
    }
    setIsModalOpen(false);
    fetchData();
  }
  
  const handleDeleteChallenge = async (challengeId: string) => {
      await dataService.deleteChallenge(challengeId);
      fetchData();
  }

  const handleStartGlobal = async (challengeId: string) => {
    if (confirm("Are you sure you want to start this challenge for everyone? This will replace any current global challenge.")) {
        await dataService.startGlobalChallenge(eventId, challengeId);
        fetchData();
    }
  }

  if (isLoading) {
      return <div className="p-6 text-center flex justify-center"><Spinner size="lg" /></div>
  }

  if (!event) {
    return <div className="p-6 text-center"><h2 className="text-xl font-semibold text-red-600">Event not found!</h2></div>;
  }
  
  const isGlobalMode = event.config.timer_mode === 'global';
  const currentGlobalChallenge = challenges.find(c => c.id === event.current_global_challenge_id);

  return (
    <>
      <ChallengeEditorModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveChallenge}
        challenge={editingChallenge}
      />
      <div className="p-4 md:p-6 bg-slate-50 min-h-screen">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={onBack} className="p-2 rounded-full hover:bg-slate-200 transition">
            <ArrowLeft className="w-6 h-6 text-slate-700" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Manage Challenges</h1>
            <p className="text-slate-500 mt-1">For "{event.title}"</p>
          </div>
        </div>

        {isGlobalMode && (
            <div className="mb-6 p-4 bg-blue-100 border-l-4 border-blue-500 text-blue-800 rounded-r-lg">
                <h4 className="font-bold">Global Timer Mode is Active</h4>
                <p className="text-sm">Click the "Start" button on a challenge to begin the countdown for all participants simultaneously.</p>
                {currentGlobalChallenge && <p className="text-sm mt-2"><b>Current Active Challenge:</b> {currentGlobalChallenge.title}</p>}
            </div>
        )}
        
        <div className="flex justify-end mb-4">
            <button 
                onClick={handleOpenCreateModal}
                className="flex items-center justify-center gap-2 px-5 py-3 font-semibold text-white bg-indigo-600 rounded-lg shadow-sm hover:bg-indigo-700 transition"
            >
                <PlusCircle className="w-5 h-5" />
                Add Challenge
            </button>
        </div>
        
        <div className="bg-slate-100 rounded-lg">
          <ul className="space-y-2">
            {challenges.length > 0 ? (
              challenges.map((c) => (
                <ChallengeCard 
                    key={c.id} 
                    challenge={c} 
                    onStartGlobal={handleStartGlobal} 
                    onDelete={handleDeleteChallenge}
                    onEdit={handleOpenEditModal}
                    isGlobalMode={isGlobalMode}
                />
              ))
            ) : (
              <li className="p-8 text-center text-slate-500 bg-white rounded-lg shadow-sm">
                No challenges created for this event yet. Add one to get started!
              </li>
            )}
          </ul>
        </div>
      </div>
    </>
  );
}