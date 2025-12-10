import { useState, useEffect } from 'react';
import { useDataService } from '../../hooks/useDataService';
import type { Event, Participant } from '../../types';
import { ArrowLeft, Trophy, Info, Settings, Trash2, Share2 } from 'lucide-react';
import { Spinner } from '../common/Spinner';
import ScoreAdjustmentModal from './ScoreAdjustmentModal';

interface LeaderboardProps {
  eventId: string;
  onBack: () => void;
}

export default function Leaderboard({ eventId, onBack }: LeaderboardProps) {
  const dataService = useDataService();
  const [event, setEvent] = useState<Event | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isScoreModalOpen, setIsScoreModalOpen] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    const [eventData, participantsData] = await Promise.all([
        dataService.getEvent(eventId),
        dataService.getParticipantsForEvent(eventId)
    ]);
    setEvent(eventData);
    setParticipants(participantsData);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [eventId, dataService]);

  const handleKickParticipant = async (participant: Participant) => {
    if (window.confirm(`¿Estás seguro de eliminar a ${participant.name}? Se borrarán todas sus fotos y puntos.`)) {
        await dataService.deleteParticipant(participant.id);
        fetchData();
    }
  }

  const handleScoreAdjust = (participant: Participant) => {
    setSelectedParticipant(participant);
    setIsScoreModalOpen(true);
  }
  
  const handleSaveScore = async (points: number) => {
    if (!selectedParticipant) return;
    await dataService.updateParticipantScore(selectedParticipant.id, points);
    fetchData();
    setIsScoreModalOpen(false);
    setSelectedParticipant(null);
  }

  const handleShare = () => {
    const top3 = participants.slice(0, 3).map((p, i) => `${['🥇', '🥈', '🥉'][i]} ${p.name} - ${p.total_points} pts`).join('\n');
    const shareText = `🏆 Ranking para "${event?.title}" 🏆\n\n${top3}\n\n¡Crea tu propio evento en ATR!`;
    
    if (navigator.share) {
        navigator.share({
            title: `Ranking para ${event?.title}`,
            text: shareText,
            url: window.location.href,
        }).catch(console.error);
    } else {
        navigator.clipboard.writeText(shareText);
        alert("¡Resultados copiados al portapapeles!");
    }
  };

  if (isLoading) {
      return <div className="p-6 text-center flex justify-center"><Spinner /></div>
  }

  if (!event) {
    return <div className="p-6 text-center"><h2 className="text-xl font-semibold text-red-600">¡Evento no encontrado!</h2></div>;
  }

  const getTrophy = (rank: number) => {
    if (rank === 0) return <Trophy className="w-6 h-6 text-yellow-500" />;
    if (rank === 1) return <Trophy className="w-6 h-6 text-slate-400" />;
    if (rank === 2) return <Trophy className="w-6 h-6 text-amber-600" />;
    return <span className="text-slate-500 w-6 text-center font-bold">{rank + 1}</span>;
  };

  return (
    <>
    {selectedParticipant && <ScoreAdjustmentModal isOpen={isScoreModalOpen} onClose={() => setIsScoreModalOpen(false)} participant={selectedParticipant} onSave={handleSaveScore} />}
    <div className="p-4 md:p-6 bg-slate-50 min-h-screen">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 rounded-full hover:bg-slate-200 transition"><ArrowLeft className="w-6 h-6 text-slate-700" /></button>
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Ranking</h1>
            <p className="text-slate-500 mt-1">Puntajes para "{event.title}"</p>
          </div>
        </div>
        <button onClick={handleShare} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition shadow-sm"><Share2 className="w-4 h-4"/> Compartir</button>
      </div>
      
       <div className="mb-4 bg-blue-50 border-l-4 border-blue-400 p-3 rounded-r-lg"><div className="flex"><div className="flex-shrink-0"><Info className="h-5 w-5 text-blue-400" /></div><div className="ml-3"><p className="text-sm text-blue-700">En caso de empate, gana quien haya tardado menos tiempo total.</p></div></div></div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <ul className="divide-y divide-slate-200">
          {participants.length > 0 ? (
            participants.map((p, index) => (
              <li key={p.id} className="p-3 sm:p-4 flex items-center justify-between group hover:bg-slate-50">
                <div className="flex items-center gap-3 sm:gap-4">
                  {getTrophy(index)}
                  <div className="text-3xl sm:text-4xl">{p.avatar_emoji}</div>
                  <div>
                    <p className="font-semibold text-slate-800 text-base sm:text-lg">{p.name}</p>
                    <p className="text-xs sm:text-sm text-slate-500">{Math.floor(p.total_time_taken_seconds / 60)}m {p.total_time_taken_seconds % 60}s total</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 sm:gap-2">
                    <div className="text-right">
                        <div className="font-bold text-xl sm:text-2xl text-indigo-600">{p.total_points}</div>
                        <p className="text-xs text-slate-400">Puntos</p>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex">
                      <button onClick={() => handleScoreAdjust(p)} className="p-2 text-slate-500 hover:bg-slate-200 rounded-full"><Settings className="w-4 h-4"/></button>
                      <button onClick={() => handleKickParticipant(p)} className="p-2 text-red-600 hover:bg-red-100 rounded-full"><Trash2 className="w-4 h-4"/></button>
                    </div>
                </div>
              </li>
            ))
          ) : (
            <li className="p-8 text-center text-slate-500">Aún no hay participantes.</li>
          )}
        </ul>
      </div>
    </div>
    </>
  );
}