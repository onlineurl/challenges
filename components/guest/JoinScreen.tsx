import React, { useState, useEffect, useRef } from 'react';
import { Ticket, User, AlertCircle, ScanLine, X, Sparkles } from 'lucide-react';

interface JoinScreenProps {
  onJoin: (joinCode: string, name: string) => Promise<{ success: boolean; message: string }>;
  initialCode?: string | null;
}

export default function JoinScreen({ onJoin, initialCode }: JoinScreenProps) {
  const [joinCode, setJoinCode] = useState(initialCode || '');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Modal state
  const [showNameModal, setShowNameModal] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialCode) {
      setJoinCode(initialCode);
      // Show modal if entered via code
      setShowNameModal(true);
    }
  }, [initialCode]);

  const closeNameModal = () => {
      setShowNameModal(false);
      // Focus the input when modal closes
      setTimeout(() => nameInputRef.current?.focus(), 100);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (joinCode.trim() && name.trim()) {
      setIsLoading(true);
      setError(null);
      
      const result = await onJoin(joinCode.trim().toUpperCase(), name.trim());

      if (!result.success) {
          setError(result.message);
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] flex items-center justify-center p-4 bg-slate-50 relative">
      
      {/* Name Prompt Modal */}
      {showNameModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
              <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full text-center relative animate-bounce-in">
                  <button onClick={closeNameModal} className="absolute top-2 right-2 p-2 text-slate-400 hover:text-slate-600"><X className="w-5 h-5"/></button>
                  <div className="mx-auto w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                      <Sparkles className="w-8 h-8 text-indigo-600 animate-pulse" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">¡Casi listo!</h3>
                  <p className="text-slate-600 mb-6">Para comenzar a jugar y sumar puntos, necesitamos saber quién eres.</p>
                  <button 
                    onClick={closeNameModal}
                    className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-200"
                  >
                      Escribir mi nombre
                  </button>
              </div>
          </div>
      )}

      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg">
        <h2 className="text-3xl font-bold text-center text-slate-800 mb-2">¡Únete a la Fiesta!</h2>
        <p className="text-center text-slate-500 mb-8">Ingresa el código del evento y tu nombre para comenzar.</p>
        
        {initialCode && (
             <div className="mb-6 bg-indigo-50 border-l-4 border-indigo-400 p-4 rounded-r-lg">
                <div className="flex">
                <div className="flex-shrink-0">
                    <ScanLine className="h-5 w-5 text-indigo-500" />
                </div>
                <div className="ml-3">
                    <p className="text-sm font-medium text-indigo-800">Código detectado correctamente.</p>
                </div>
                </div>
            </div>
        )}

        {error && (
          <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="joinCode" className="block text-sm font-medium text-slate-700">Código del Evento</label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Ticket className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                id="joinCode"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                className="block w-full rounded-md border-slate-300 pl-10 focus:border-indigo-500 focus:ring-indigo-500 sm:text-lg"
                placeholder="ej. DEMO123"
                maxLength={8}
                required
                autoCapitalize="characters"
                style={{ textTransform: 'uppercase' }}
                disabled={!!initialCode} 
              />
            </div>
          </div>
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-700">Tu Nombre</label>
            <div className="mt-1 relative rounded-md shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <User className="h-5 w-5 text-slate-400" />
                </div>
                <input
                    ref={nameInputRef}
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full rounded-md border-slate-300 pl-10 focus:border-indigo-500 focus:ring-indigo-500 sm:text-lg"
                    placeholder="ej. Fiestero Supremo"
                    required
                />
            </div>
          </div>
          <button
            type="submit"
            disabled={isLoading || !joinCode.trim() || !name.trim()}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-md text-lg font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed transition transform active:scale-95"
          >
            {isLoading ? 'Entrando...' : '¡A Jugar!'}
          </button>
        </form>
      </div>
    </div>
  );
}