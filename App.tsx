import { useState, useCallback, useEffect } from 'react';
import type { Session } from '@supabase/supabase-js';
import HostDashboard from './components/host/HostDashboard';
import JoinScreen from './components/guest/JoinScreen';
import ChallengeView from './components/guest/ChallengeView';
import Leaderboard from './components/host/Leaderboard';
import ChallengeManager from './components/host/ChallengeManager';
import PhotoGallery from './components/host/PhotoGallery';
import AdminDashboard from './components/admin/AdminDashboard';
import { useDataService } from './hooks/useDataService';
import type { Participant, Event } from './types';
import { Home, PartyPopper, ShieldAlert, MessageCircle, ShoppingBag } from 'lucide-react';
import { Spinner } from './components/common/Spinner';
import { supabase } from './supabaseClient';
import AuthView from './components/host/AuthView';
import { WHATSAPP_CONTACT_URL } from './utils/links';


type View = 'home' | 'host_auth' | 'host_dashboard' | 'guest_join' | 'guest_challenge' | 'leaderboard' | 'challenge_manager' | 'photo_gallery' | 'admin_dashboard';

const SESSION_KEY = 'party-challenges-session';

export default function App() {
  const [view, setView] = useState<View>('home');
  const [session, setSession] = useState<Session | null>(null);
  const [currentParticipant, setCurrentParticipant] = useState<Participant | null>(null);
  const [currentEvent, setCurrentEvent] = useState<Event | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [initialJoinCode, setInitialJoinCode] = useState<string | null>(null);
  const [showAdminEntry, setShowAdminEntry] = useState(false);
  
  const dataService = useDataService();

  useEffect(() => {
    // Check for secret admin url param (support both for convenience)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('adminadmin') === 'true' || urlParams.get('admin') === 'true') {
        setShowAdminEntry(true);
    }

    // Handle host authentication state
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      // If user signs in successfully while on auth screen, auto-navigate to dashboard
      if (_event === 'SIGNED_IN' && view === 'host_auth') {
        setView('host_dashboard');
      }
    });
    return () => subscription.unsubscribe();
  }, [view]); // Dependency on view ensures we don't have a stale closure

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const sessionData = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
        if (sessionData && sessionData.participantId && sessionData.eventId) {
          const [participant, event] = await Promise.all([
            dataService.getParticipant(sessionData.participantId),
            dataService.getEvent(sessionData.eventId)
          ]);

          if (participant && event) {
            setCurrentParticipant(participant);
            setCurrentEvent(event);
            setView('guest_challenge');
            return; // Exit early if guest session is restored
          }
        }
      } catch (error) {
        console.error("Failed to restore session", error);
        localStorage.removeItem(SESSION_KEY);
      } finally {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        if (code) {
          setInitialJoinCode(code);
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
      if (reason === 'not_yet_started') return { success: false, message: 'Este evento aún no ha comenzado.' };
      if (reason === 'ended') return { success: false, message: 'Este evento ya ha terminado.' };
      return { success: false, message: 'Evento no encontrado. Verifica el código.' };
    }
    try {
      const participant = await dataService.createParticipant(event.id, name);
      setCurrentParticipant(participant);
      setCurrentEvent(event);
      localStorage.setItem(SESSION_KEY, JSON.stringify({ participantId: participant.id, eventId: event.id }));
      setView('guest_challenge');
      return { success: true, message: '¡Unido exitosamente!' };
    } catch (error) {
        return { success: false, message: 'Hubo un error al unirse al evento.' };
    }
  }, [dataService]);

  const handleChallengeComplete = async () => {
    if (!currentParticipant) return;
    const updatedParticipant = await dataService.getParticipant(currentParticipant.id);
    setCurrentParticipant(updatedParticipant);
  };
  
  const handleViewLeaderboard = (eventId: string) => { setSelectedEventId(eventId); setView('leaderboard'); };
  const handleManageChallenges = (eventId: string) => { setSelectedEventId(eventId); setView('challenge_manager'); };
  const handleViewGallery = (eventId: string) => { setSelectedEventId(eventId); setView('photo_gallery'); };

  const navigateHome = () => {
    localStorage.removeItem(SESSION_KEY);
    setView('home');
    setCurrentParticipant(null);
    setCurrentEvent(null);
    setSelectedEventId(null);
    window.history.replaceState({}, document.title, window.location.pathname);
  };

  const handleBuyCode = () => {
      window.open(WHATSAPP_CONTACT_URL, '_blank');
  };
  
  const renderView = () => {
    if (isLoadingSession) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen"><Spinner size="lg" /><p className="mt-4 text-slate-600">Cargando ATR Party...</p></div>
      );
    }

    switch(view) {
      case 'host_auth':
        return <AuthView />;
      case 'host_dashboard':
        return session ? <HostDashboard onViewLeaderboard={handleViewLeaderboard} onManageChallenges={handleManageChallenges} onViewGallery={handleViewGallery} /> : <AuthView />;
      case 'leaderboard':
        return <Leaderboard eventId={selectedEventId!} onBack={() => setView('host_dashboard')} />;
      case 'challenge_manager':
        return <ChallengeManager eventId={selectedEventId!} onBack={() => setView('host_dashboard')} />;
      case 'photo_gallery':
        return <PhotoGallery eventId={selectedEventId!} onBack={() => setView('host_dashboard')} />;
      case 'admin_dashboard':
        return <AdminDashboard onBack={() => setView('home')} />;
      case 'guest_join':
        return <JoinScreen onJoin={handleJoinEvent} initialCode={initialJoinCode} />;
      case 'guest_challenge':
        if (currentParticipant && currentEvent) {
          return <ChallengeView participant={currentParticipant} event={currentEvent} onComplete={handleChallengeComplete} />;
        }
        setView('guest_join');
        return <JoinScreen onJoin={handleJoinEvent} initialCode={initialJoinCode} />;
      case 'home':
      default:
        return (
          <div className="flex flex-col items-center justify-center min-h-[100dvh] p-6 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 text-center relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-10 left-10 text-yellow-300 opacity-20 animate-spin-slow"><PartyPopper size={80}/></div>
            <div className="absolute bottom-20 right-10 text-purple-300 opacity-20"><PartyPopper size={120}/></div>
            
            <div className="relative z-10 max-w-lg w-full">
              <div className="mb-10 animate-bounce-in">
                <PartyPopper className="mx-auto h-24 w-24 text-indigo-600 mb-4 drop-shadow-lg" />
                <h1 className="text-6xl font-black tracking-tighter text-slate-900 drop-shadow-sm leading-none">
                  ATR<br/><span className="text-indigo-600">Party</span>
                </h1>
                <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-pink-600 mt-2">
                  (A Todo Reto)
                </h2>
                <p className="mt-6 text-xl text-slate-600 font-medium leading-relaxed">
                  El juego definitivo para tus eventos. <br/>¡Cumple retos, saca fotos y gana!
                </p>
              </div>

              <div className="flex flex-col gap-4 w-full">
                <button 
                    onClick={() => setView('guest_join')} 
                    className="w-full text-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 rounded-2xl px-8 py-5 shadow-xl shadow-indigo-200 transition-all flex items-center justify-center gap-2"
                >
                    <PartyPopper className="w-6 h-6"/>
                    UNIRSE A EVENTO
                </button>
                <button 
                    onClick={() => setView(session ? 'host_dashboard' : 'host_auth')} 
                    className="w-full text-lg font-bold text-slate-700 bg-white hover:bg-slate-50 active:scale-95 rounded-2xl px-8 py-4 shadow-md border border-slate-200 transition-all"
                >
                    Soy Anfitrión (Login)
                </button>
              </div>

              {/* Purchase / Contact Section */}
              <div className="mt-12 pt-8 border-t border-slate-200/60">
                  <p className="text-sm text-slate-400 font-semibold uppercase tracking-widest mb-4">¿Organizas un evento?</p>
                  <div className="flex gap-3">
                      <button 
                        onClick={handleBuyCode}
                        className="flex-1 flex flex-col items-center justify-center p-4 bg-green-500 hover:bg-green-600 active:bg-green-700 text-white rounded-xl shadow-lg shadow-green-200 transition-colors"
                      >
                          <ShoppingBag className="w-6 h-6 mb-1"/>
                          <span className="font-bold text-sm">Comprar Código</span>
                      </button>
                      <button 
                         onClick={handleBuyCode}
                         className="flex-1 flex flex-col items-center justify-center p-4 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl shadow-sm transition-colors"
                      >
                          <MessageCircle className="w-6 h-6 mb-1 text-green-500"/>
                          <span className="font-bold text-sm">Contacto WP</span>
                      </button>
                  </div>
              </div>

              {showAdminEntry && (
                   <button onClick={() => setView('admin_dashboard')} className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-400 hover:text-red-500 transition w-full">
                      <ShieldAlert className="w-3 h-3" /> Acceso Super Admin
                   </button>
              )}
            </div>
          </div>
        );
    }
  };

  return (
    <main className="max-w-4xl mx-auto font-sans bg-slate-100 min-h-[100dvh]">
      {view !== 'home' && view !== 'host_auth' && view !== 'admin_dashboard' && (
        <header className="p-4 flex justify-between items-center bg-white shadow-sm sticky top-0 z-10 pt-safe">
          <div className="flex items-center gap-2">
            <PartyPopper className="h-6 w-6 text-indigo-500" />
            <span className="text-xl font-bold text-slate-800">ATR Party</span>
          </div>
          <button onClick={navigateHome} className="p-2 rounded-full hover:bg-slate-200 transition" aria-label="Ir al inicio"><Home className="h-5 w-5 text-slate-600"/><span className="sr-only">Inicio</span></button>
        </header>
      )}
      {renderView()}
    </main>
  );
}