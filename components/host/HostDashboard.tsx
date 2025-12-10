import React, { useMemo, useState, useEffect } from 'react';
import type { Event } from '../../types';
import { useDataService } from '../../hooks/useDataService';
import { PlusCircle, Users, Camera, BarChart2, Edit, Share2, Trash2, GalleryVertical, TestTube2, LogOut } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import CreateEventModal from './CreateEventModal';
import ShareModal from './ShareModal';
import { Spinner } from '../common/Spinner';
import { supabase } from '../../supabaseClient';

const EventCard: React.FC<{ 
    event: Event; 
    onViewLeaderboard: (eventId: string) => void; 
    onManageChallenges: (eventId: string) => void;
    onViewGallery: (eventId: string) => void;
    onDelete: (eventId: string) => void;
}> = ({ event, onViewLeaderboard, onManageChallenges, onViewGallery, onDelete }) => {
    const dataService = useDataService();
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    
    // These could also be fetched on demand
    const [participantCount, setParticipantCount] = useState(0);
    const [photoCount, setPhotoCount] = useState(0);

    useEffect(() => {
        dataService.getParticipantsForEvent(event.id).then(p => setParticipantCount(p.length));
        dataService.getCompletedForEvent(event.id).then(c => setPhotoCount(c.length));
    }, [dataService, event.id]);


    const eventTypeClasses: { [key in Event['type']]: string } = {
        wedding: 'bg-event-wedding border-amber-300',
        baby_shower: 'bg-event-baby border-blue-300',
        birthday: 'bg-event-birthday border-pink-300',
        other: 'bg-event-other border-slate-300'
    };

    const eventTypeName: { [key in Event['type']]: string } = {
        wedding: 'Boda',
        baby_shower: 'Baby Shower',
        birthday: 'Cumpleaños',
        other: 'Otro'
    };
    
    const handleDelete = () => {
        if (event.is_demo) {
            alert("El evento demo no se puede eliminar.");
            return;
        }
        if (window.confirm(`¿Estás seguro de que quieres eliminar el evento "${event.title}"? Esta acción es permanente y borrará todos los datos asociados.`)) {
            onDelete(event.id);
        }
    };
    
    // Robust URL construction
    const joinUrl = `${window.location.protocol}//${window.location.host}/?code=${event.join_code}`;

    return (
        <>
            <ShareModal 
                isOpen={isShareModalOpen}
                onClose={() => setIsShareModalOpen(false)}
                joinCode={event.join_code}
            />
            <div className={`p-6 rounded-xl border ${eventTypeClasses[event.type]} shadow-sm transition-all hover:shadow-md`}>
                <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4">
                    <div>
                        <div className="flex items-center gap-3">
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{eventTypeName[event.type]}</p>
                            {event.is_demo && (
                                <span className="flex items-center gap-1 text-xs font-bold text-purple-800 bg-purple-200 px-2 py-0.5 rounded-full">
                                    <TestTube2 className="w-3 h-3"/> DEMO
                                </span>
                            )}
                        </div>
                        <h3 className="text-2xl font-bold text-slate-800">{event.title}</h3>
                        <p className="mt-2 text-slate-600">{event.description}</p>
                        <p className="mt-1 text-xs text-slate-500 capitalize">Modo Temporizador: {event.config.timer_mode === 'global' ? 'Global' : 'Individual'}</p>
                    </div>
                     <div className="text-center bg-white/70 p-3 rounded-lg self-start flex flex-col items-center">
                        <QRCodeSVG value={joinUrl} size={80} includeMargin={true} />
                        <p className="mt-2 font-mono text-xl font-bold tracking-widest text-slate-700">{event.join_code}</p>
                        <button onClick={() => setIsShareModalOpen(true)} className="mt-2 flex items-center gap-1 text-xs text-indigo-600 hover:underline">
                            <Share2 className="w-3 h-3"/> Compartir
                        </button>
                     </div>
                </div>
                <div className="mt-6 border-t border-slate-300/50 pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-6 text-slate-700">
                        <div className="flex items-center gap-2">
                            <Users className="w-5 h-5" />
                            <span className="font-semibold">{participantCount}</span> <span className="text-sm">Invitados</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Camera className="w-5 h-5" />
                            <span className="font-semibold">{photoCount}</span> <span className="text-sm">Fotos</span>
                        </div>
                    </div>
                     <div className="flex flex-wrap items-center gap-2">
                        <button onClick={() => onManageChallenges(event.id)} className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-slate-700 bg-white rounded-lg hover:bg-slate-100 transition border border-slate-300">
                            <Edit className="w-4 h-4" />
                            Retos
                        </button>
                        <button onClick={() => onViewGallery(event.id)} className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-slate-700 bg-white rounded-lg hover:bg-slate-100 transition border border-slate-300">
                            <GalleryVertical className="w-4 h-4" />
                            Galería
                        </button>
                        <button onClick={() => onViewLeaderboard(event.id)} className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-indigo-700 bg-indigo-100 rounded-lg hover:bg-indigo-200 transition">
                            <BarChart2 className="w-4 h-4" />
                            Ranking
                        </button>
                        <button onClick={handleDelete} className="p-2 text-red-600 hover:bg-red-100 rounded-full transition disabled:text-slate-400 disabled:hover:bg-transparent" disabled={event.is_demo}>
                            <Trash2 className="w-4 h-4" />
                            <span className="sr-only">Eliminar Evento</span>
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}

export default function HostDashboard({ 
    onViewLeaderboard, 
    onManageChallenges, 
    onViewGallery
}: { 
    onViewLeaderboard: (eventId: string) => void; 
    onManageChallenges: (eventId: string) => void;
    onViewGallery: (eventId: string) => void;
}) {
  const dataService = useDataService();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchEvents = () => {
      setIsLoading(true);
      dataService.getEvents().then(data => {
          setEvents(data);
          setIsLoading(false);
      });
  };

  useEffect(() => {
      fetchEvents();
  }, [dataService]);

  const handleCreateEvent = async (data: { title: string; description: string; type: Event['type']; timer_mode: Event['config']['timer_mode']; start_time?: string; end_time?: string; access_code: string; }) => {
    try {
      await dataService.createEvent(data);
      setIsModalOpen(false);
      fetchEvents(); // Refresh list on success
      alert("¡Evento activado y creado exitosamente!");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Ocurrió un error desconocido.';
      alert(`Error al crear evento: ${errorMessage}\n\nVerifica que tu código de licencia sea válido y no haya sido usado.`);
    }
  }

  const handleDeleteEvent = async (eventId: string) => {
      await dataService.deleteEvent(eventId);
      fetchEvents(); // Refresh list
  }
  
  const handleSignOut = async () => {
    await supabase.auth.signOut();
  }

  return (
    <>
      <CreateEventModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreateEvent}
      />
      <div className="p-4 md:p-6 bg-slate-50 min-h-screen">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
          <div>
              <h1 className="text-3xl font-bold text-slate-800">Panel de Anfitrión</h1>
              <p className="text-slate-500 mt-1">Gestiona tus eventos y ve el progreso en tiempo real.</p>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center justify-center gap-2 px-5 py-3 font-semibold text-white bg-indigo-600 rounded-lg shadow-sm hover:bg-indigo-700 transition"
            >
              <PlusCircle className="w-5 h-5" />
              Crear Nuevo Evento
            </button>
             <button 
              onClick={handleSignOut}
              className="p-3 text-slate-600 bg-slate-200 rounded-lg hover:bg-slate-300 transition"
              aria-label="Cerrar sesión"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>

        {isLoading ? (
            <div className="flex justify-center py-12"><Spinner /></div>
        ) : (
            <div className="space-y-6">
            {events.length > 0 ? (
                [...events].sort((a,b) => (a.is_demo ? -1 : b.is_demo ? 1 : 0)).map(event => <EventCard 
                    key={event.id} 
                    event={event} 
                    onViewLeaderboard={onViewLeaderboard}
                    onManageChallenges={onManageChallenges} 
                    onViewGallery={onViewGallery}
                    onDelete={handleDeleteEvent}
                />)
            ) : (
                <div className="text-center py-12 border-2 border-dashed border-slate-300 rounded-lg">
                <h3 className="text-xl font-semibold text-slate-700">¡Aún no hay eventos!</h3>
                <p className="text-slate-500 mt-2">Haz clic en "Crear Nuevo Evento" para comenzar.</p>
                </div>
            )}
            </div>
        )}
      </div>
    </>
  );
}