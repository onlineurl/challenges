import React, { useState } from 'react';
import type { EventType, TimerMode } from '../../types';
import { X, User, Users } from 'lucide-react';

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: { title: string; description: string; type: EventType; timer_mode: TimerMode; start_time?: string; end_time?: string; }) => void;
}

export default function CreateEventModal({ isOpen, onClose, onCreate }: CreateEventModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<EventType>('other');
  const [timerMode, setTimerMode] = useState<TimerMode>('individual');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onCreate({ title, description, type, timer_mode: timerMode, start_time: startTime || undefined, end_time: endTime || undefined });
      // Reset form
      setTitle('');
      setDescription('');
      setType('other');
      setTimerMode('individual');
      setStartTime('');
      setEndTime('');
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div 
        className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative overflow-y-auto max-h-screen"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
      >
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 p-1 rounded-full text-slate-500 hover:bg-slate-200"
          aria-label="Cerrar modal"
        >
          <X className="w-5 h-5" />
        </button>
        
        <h2 id="modal-title" className="text-2xl font-bold text-slate-800 mb-4">Crear Nuevo Evento</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-slate-700">Título del Evento</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="ej. La Boda de Ana y Juan"
              required
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-slate-700">Descripción</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              rows={3}
              placeholder="Una descripción corta para tus invitados."
            />
          </div>
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-slate-700">Tipo de Evento</label>
            <select
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value as EventType)}
              className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="other">Otro</option>
              <option value="birthday">Cumpleaños</option>
              <option value="wedding">Boda</option>
              <option value="baby_shower">Baby Shower</option>
            </select>
          </div>
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                  <label htmlFor="start_time" className="block text-sm font-medium text-slate-700">Inicio (Opcional)</label>
                  <input
                      type="datetime-local"
                      id="start_time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
              </div>
              <div>
                  <label htmlFor="end_time" className="block text-sm font-medium text-slate-700">Fin (Opcional)</label>
                  <input
                      type="datetime-local"
                      id="end_time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
              </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Modo de Temporizador</label>
            <div className="mt-2 grid grid-cols-2 gap-3">
              <label className={`relative flex cursor-pointer rounded-lg border bg-white p-4 shadow-sm focus:outline-none ${timerMode === 'individual' ? 'border-indigo-500 ring-2 ring-indigo-500' : 'border-gray-300'}`}>
                <input type="radio" name="timer-mode" value="individual" className="sr-only" checked={timerMode === 'individual'} onChange={() => setTimerMode('individual')} />
                <span className="flex flex-1">
                  <span className="flex flex-col">
                    <span className="flex items-center text-sm font-medium text-slate-900"><User className="w-4 h-4 mr-1"/> Individual</span>
                    <span className="mt-1 flex items-center text-xs text-slate-500">Cada invitado tiene su propio tiempo.</span>
                  </span>
                </span>
              </label>
               <label className={`relative flex cursor-pointer rounded-lg border bg-white p-4 shadow-sm focus:outline-none ${timerMode === 'global' ? 'border-indigo-500 ring-2 ring-indigo-500' : 'border-gray-300'}`}>
                <input type="radio" name="timer-mode" value="global" className="sr-only" checked={timerMode === 'global'} onChange={() => setTimerMode('global')} />
                <span className="flex flex-1">
                  <span className="flex flex-col">
                    <span className="flex items-center text-sm font-medium text-slate-900"><Users className="w-4 h-4 mr-1"/> Global</span>
                    <span className="mt-1 flex items-center text-xs text-slate-500">Tú controlas el tiempo para todos.</span>
                  </span>
                </span>
              </label>
            </div>
          </div>


          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-md hover:bg-slate-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-indigo-300"
            >
              Crear Evento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}