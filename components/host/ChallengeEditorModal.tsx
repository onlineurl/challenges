import React, { useState, useEffect } from 'react';
import type { Challenge, NewChallenge } from '../../types';
import { X, Star } from 'lucide-react';

interface ChallengeEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (challenge: NewChallenge) => void;
  challenge?: Challenge;
}

// Internal state type allowing strings for numeric inputs during editing
interface LocalChallengeState extends Omit<NewChallenge, 'points' | 'time_limit'> {
    points: number | string;
    time_limit: number | string;
}

const initialState: LocalChallengeState = {
    title: '', description: '', difficulty: 'easy',
    points: 10, time_limit: 300, is_special: false
};

export default function ChallengeEditorModal({ isOpen, onClose, onSave, challenge }: ChallengeEditorModalProps) {
  const [formData, setFormData] = useState<LocalChallengeState>(initialState);

  useEffect(() => {
    if (isOpen) {
        if (challenge) {
            // If editing, populate form with existing challenge data
            const { title, description, difficulty, points, time_limit, is_special } = challenge;
            setFormData({ title, description, difficulty, points, time_limit, is_special: is_special || false });
        } else {
            // If creating, reset to initial state
            setFormData(initialState);
        }
    }
  }, [challenge, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
        const { checked } = e.target as HTMLInputElement;
        setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
        // Critical Fix: Allow empty string to be set in state so users can delete the value completely
        setFormData(prev => ({ ...prev, [name]: value === '' ? '' : parseFloat(value) }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.title.trim()) {
        // Convert back to strict numbers for the API. Default to 0 if empty.
        const payload: NewChallenge = {
            ...formData,
            points: Number(formData.points) || 0,
            time_limit: Number(formData.time_limit) || 60
        };
        onSave(payload);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 relative overflow-y-auto max-h-screen" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 p-1 rounded-full text-slate-500 hover:bg-slate-200" aria-label="Cerrar modal"><X className="w-5 h-5" /></button>
        <h2 id="modal-title" className="text-2xl font-bold text-slate-800 mb-4">{challenge ? 'Editar Reto' : 'Añadir Nuevo Reto'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-slate-700">Título</label>
            <input type="text" name="title" id="title" value={formData.title} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" placeholder="ej. Selfie Grupal Divertida" required />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-slate-700">Descripción</label>
            <textarea name="description" id="description" value={formData.description} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" rows={3} placeholder="Instrucciones para los participantes." />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
                <label htmlFor="difficulty" className="block text-sm font-medium text-slate-700">Dificultad</label>
                <select name="difficulty" id="difficulty" value={formData.difficulty} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                    <option value="easy">Fácil</option>
                    <option value="medium">Media</option>
                    <option value="hard">Difícil</option>
                </select>
            </div>
            <div>
                <label htmlFor="points" className="block text-sm font-medium text-slate-700">Puntos</label>
                <input type="number" name="points" id="points" value={formData.points} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" inputMode="numeric" />
            </div>
            <div>
                <label htmlFor="time_limit" className="block text-sm font-medium text-slate-700">Tiempo (seg)</label>
                <input type="number" name="time_limit" id="time_limit" value={formData.time_limit} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" inputMode="numeric" />
            </div>
          </div>
          <div className="flex items-start">
            <div className="flex h-5 items-center"><input id="is_special" name="is_special" type="checkbox" checked={formData.is_special} onChange={handleChange} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" /></div>
            <div className="ml-3 text-sm">
                <label htmlFor="is_special" className="font-medium text-gray-700 flex items-center gap-1"><Star className="w-4 h-4 text-yellow-500"/> Reto Especial</label>
                <p className="text-gray-500">Destaca este reto para los participantes.</p>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-md hover:bg-slate-200">Cancelar</button>
            <button type="submit" disabled={!formData.title.trim()} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-indigo-300">Guardar Reto</button>
          </div>
        </form>
      </div>
    </div>
  );
}