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
import { Home, PartyPopper, ShieldAlert, MessageCircle, ShoppingBag, Camera, Zap } from 'lucide-react';
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
          <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-slate-50 relative overflow-hidden">
            {/* Modern Abstract Background */}
            <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-purple-200/40 rounded-full blur-[100px] pointer-events-none"></div>
            <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-indigo-200/40 rounded-full blur-[100px] pointer-events-none"></div>
            
            <div className="relative z-10 w-full max-w-lg px-6 flex flex-col h-full justify-between py-10">
              
              {/* Header / Logo Area */}
              <div className="flex-1 flex flex-col items-center justify-center mt-4">
                <div className="relative mb-6">
                    <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-20 rounded-full"></div>
                    <div className="relative bg-gradient-to-br from-indigo-600 to-violet-600 w-24 h-24 rounded-3xl rotate-3 flex items-center justify-center shadow-2xl shadow-indigo-300 ring-4 ring-white">
                        <Camera className="text-white w-12 h-12" />
                        <div className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 p-1.5 rounded-full shadow-sm">
                            <Zap className="w-4 h-4 fill-current" />
                        </div>
                    </div>
                </div>
                
                <h1 className="text-5xl font-black text-slate-900 tracking-tight text-center leading-none mb-2">
                  ATR <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Party</span>
                </h1>
                
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-900 text-white rounded-full text-xs font-bold tracking-widest uppercase mb-6">
                    <PartyPopper className="w-3 h-3 text-yellow-400" />
                    A Todo Reto
                </div>

                <p className="text-lg text-slate-500 font-medium text-center max-w-xs leading-relaxed">
                  El juego de retos fotográficos para llevar tu evento al siguiente nivel.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 w-full mb-8">
                <button 
                    onClick={() => setView('guest_join')} 
                    className="group w-full relative overflow-hidden rounded-2xl bg-slate-900 p-4 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-violet-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="relative flex items-center justify-center gap-3">
                        <div className="bg-white/20 p-2 rounded-lg"><Zap className="w-6 h-6 text-white fill-current"/></div>
                        <span className="text-xl font-bold text-white tracking-wide">JUGAR AHORA</span>
                    </div>
                </button>

                <button 
                    onClick={() => setView(session ? 'host_dashboard' : 'host_auth')} 
                    className="w-full text-lg font-bold text-slate-700 bg-white hover:bg-slate-50 active:scale-95 rounded-2xl p-4 shadow-sm border-2 border-slate-100 transition-all"
                >
                    Soy Anfitrión
                </button>
              </div>

              {/* Purchase / Contact Footer */}
              <div className="w-full">
                  <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
                      <button 
                        onClick={handleBuyCode}
                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-colors"
                      >
                          <ShoppingBag className="w-5 h-5"/>
                          <span className="font-bold text-sm">Comprar Código</span>
                      </button>
                      <button 
                         onClick={handleBuyCode}
                         className="flex-1 flex items-center justify-center gap-2 py-3 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl transition-colors"
                      >
                          <MessageCircle className="w-5 h-5 text-green-500"/>
                          <span className="font-bold text-sm">Contacto</span>
                      </button>
                  </div>
              </div>

              {showAdminEntry && (
                   <button onClick={() => setView('admin_dashboard')} className="absolute top-4 right-4 text-slate-300 hover:text-red-400 transition">
                      <ShieldAlert className="w-5 h-5" />
                   </button>
              )}
            </div>
          </div>
        );
    }
  };

  return (
    <main className="max-w-md mx-auto font-sans bg-slate-50 min-h-[100dvh] shadow-2xl relative">
      {view !== 'home' && view !== 'host_auth' && view !== 'admin_dashboard' && (
        <header className="p-4 flex justify-between items-center bg-white shadow-sm sticky top-0 z-10 pt-safe">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-1.5 rounded-lg">
                <PartyPopper className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold text-slate-800">ATR Party</span>
          </div>
          <button onClick={navigateHome} className="p-2 rounded-full hover:bg-slate-100 transition" aria-label="Ir al inicio"><Home className="h-5 w-5 text-slate-600"/><span className="sr-only">Inicio</span></button>
        </header>
      )}
      {renderView()}
    </main>
  );
}