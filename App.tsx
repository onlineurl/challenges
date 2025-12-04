import React, { useState, useCallback, useEffect } from 'react';
import HostDashboard from './components/host/HostDashboard';
import JoinScreen from './components/guest/JoinScreen';
import ChallengeView from './components/guest/ChallengeView';
import Leaderboard from './components/host/Leaderboard';
import ChallengeManager from './components/host/ChallengeManager';
import PhotoGallery from './components/host/PhotoGallery';
import { useDataService } from './hooks/useDataService';
import type { Participant, Event } from './types';
import { Home, PartyPopper } from 'lucide-react';
import { Spinner } from './components/common/Spinner';

type View = 'home' | 'host' | 'guest_join' | 'guest_challenge' | 'leaderboard' | 'challenge_manager' | 'photo_gallery';

const SESSION_KEY = 'party-challenges-session';

export default function App() {
  const [view, setView] = useState<View>('home');
  const [currentParticipant, setCurrentParticipant] = useState<Participant | null>(null);
  const [currentEvent, setCurrentEvent] = useState<Event | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [initialJoinCode, setInitialJoinCode] = useState<string | null>(null);
  
  const dataService = useDataService();

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const session = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
        if (session && session.participantId && session.eventId) {
          const [participant, event] = await Promise.all([
            dataService.getParticipant(session.participantId),
            dataService.getEvent(session.eventId)
          ]);

          if (participant && event) {
            setCurrentParticipant(participant);
            setCurrentEvent(event);
            setView('guest_challenge');
          } else {
            localStorage.removeItem(SESSION_KEY);
          }
        }
      } catch (error) {
        console.error("Failed to restore session", error);
        localStorage.removeItem(SESSION_KEY);
      } finally {
        // Check for QR code link after attempting session restore
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        if (code) {
          setInitialJoinCode(code);
          // If not in a session, go to join screen
          if (!localStorage.getItem(SESSION_KEY)) {
             setView('guest_join');
          }
        }
        setIsLoadingSession(false);
      }
    };
    restoreSession();
  }, [dataService]);

  const handleJoinEvent = useCallback(async (joinCode: string, name: string): Promise<{ success: boolean; message: string }> => {
    const { event, reason } = await dataService.findEventByCode(joinCode);
    if (!event) {
      if (reason === 'not_yet_started') return { success: false, message: 'This event has not started yet. Please try again later.' };
      if (reason === 'ended') return { success: false, message: 'This event has already ended.' };
      return { success: false, message: 'Event not found. Please check the code and try again.' };
    }
    try {
      // createParticipant now handles re-joining intelligently
      const participant = await dataService.createParticipant(event.id, name);
      setCurrentParticipant(participant);
      setCurrentEvent(event);
      
      // Save session
      localStorage.setItem(SESSION_KEY, JSON.stringify({ participantId: participant.id, eventId: event.id }));
      
      setView('guest_challenge');
      return { success: true, message: 'Joined successfully!' };
    } catch (error) {
        return { success: false, message: 'There was an error joining the event.' };
    }
  }, [dataService]);

  const handleChallengeComplete = async () => {
    if (!currentParticipant) return;
    // Refetch participant to get the next challenge assigned by the backend
    const updatedParticipant = await dataService.getParticipant(currentParticipant.id);
    setCurrentParticipant(updatedParticipant);
  };
  
  const handleViewLeaderboard = (eventId: string) => {
      setSelectedEventId(eventId);
      setView('leaderboard');
  };
  
  const handleManageChallenges = (eventId: string) => {
      setSelectedEventId(eventId);
      setView('challenge_manager');
  };
  
  const handleViewGallery = (eventId: string) => {
      setSelectedEventId(eventId);
      setView('photo_gallery');
  };

  const navigateHome = () => {
    localStorage.removeItem(SESSION_KEY);
    setView('home');
    setCurrentParticipant(null);
    setCurrentEvent(null);
    setSelectedEventId(null);
    // Clean up URL params
    window.history.replaceState({}, document.title, window.location.pathname);
  };
  
  const renderView = () => {
    if (isLoadingSession) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen">
          <Spinner size="lg" />
          <p className="mt-4 text-slate-600">Loading your party...</p>
        </div>
      );
    }

    switch(view) {
      case 'host':
        return <HostDashboard 
          onViewLeaderboard={handleViewLeaderboard} 
          onManageChallenges={handleManageChallenges}
          onViewGallery={handleViewGallery}
        />;
      case 'leaderboard':
        return <Leaderboard eventId={selectedEventId!} onBack={() => setView('host')} />;
      case 'challenge_manager':
        return <ChallengeManager eventId={selectedEventId!} onBack={() => setView('host')} />;
      case 'photo_gallery':
        return <PhotoGallery eventId={selectedEventId!} onBack={() => setView('host')} />;
      case 'guest_join':
        return <JoinScreen onJoin={handleJoinEvent} initialCode={initialJoinCode} />;
      case 'guest_challenge':
        if (currentParticipant && currentEvent) {
          return <ChallengeView participant={currentParticipant} event={currentEvent} onComplete={handleChallengeComplete} />;
        }
        // Fallback to join screen if state is lost
        setView('guest_join');
        return <JoinScreen onJoin={handleJoinEvent} initialCode={initialJoinCode} />;
      case 'home':
      default:
        return (
          <div className="flex flex-col items-center justify-center min-h-[100dvh] p-4 bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="text-center">
              <PartyPopper className="mx-auto h-20 w-20 text-indigo-500 animate-bounce" />
              <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-slate-800 sm:text-5xl">Party Challenges</h1>
              <p className="mt-4 max-w-xl mx-auto text-lg text-slate-600">The ultimate game for your social events. Complete photo challenges and create lasting memories!</p>
            </div>
            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <button onClick={() => setView('guest_join')} className="w-full sm:w-auto text-lg font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300 rounded-lg px-8 py-4 transition-transform transform hover:scale-105">
                Join Event
              </button>
              <button onClick={() => setView('host')} className="w-full sm:w-auto text-lg font-semibold text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:ring-4 focus:ring-indigo-200 rounded-lg px-8 py-4 transition-transform transform hover:scale-105">
                I'm the Host
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <main className="max-w-4xl mx-auto font-sans bg-slate-100 min-h-[100dvh]">
      {view !== 'home' && (
        <header className="p-4 flex justify-between items-center bg-white shadow-sm sticky top-0 z-10 pt-safe">
          <div className="flex items-center gap-2">
            <PartyPopper className="h-6 w-6 text-indigo-500" />
            <span className="text-xl font-bold text-slate-800">Party Challenges</span>
          </div>
          <button onClick={navigateHome} className="p-2 rounded-full hover:bg-slate-200 transition" aria-label="Go to home page">
            <Home className="h-5 w-5 text-slate-600"/>
            <span className="sr-only">Go Home</span>
          </button>
        </header>
      )}
      {renderView()}
    </main>
  );
}