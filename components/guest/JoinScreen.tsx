import React, { useState, useEffect } from 'react';
import { Ticket, User, AlertCircle } from 'lucide-react';

interface JoinScreenProps {
  onJoin: (joinCode: string, name: string) => Promise<{ success: boolean; message: string }>;
  initialCode?: string | null;
}

export default function JoinScreen({ onJoin, initialCode }: JoinScreenProps) {
  const [joinCode, setJoinCode] = useState(initialCode || '');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialCode) {
      setJoinCode(initialCode);
    }
  }, [initialCode]);

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
    <div className="min-h-[100dvh] flex items-center justify-center p-4 bg-slate-50">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg">
        <h2 className="text-3xl font-bold text-center text-slate-800 mb-2">Join the Party!</h2>
        <p className="text-center text-slate-500 mb-8">Enter the event code and your name to start the fun.</p>
        
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
            <label htmlFor="joinCode" className="block text-sm font-medium text-slate-700">Event Code</label>
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
                placeholder="e.g., DEMO123"
                maxLength={8}
                required
                autoCapitalize="characters"
                style={{ textTransform: 'uppercase' }}
              />
            </div>
          </div>
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-700">Your Name</label>
            <div className="mt-1 relative rounded-md shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <User className="h-5 w-5 text-slate-400" />
                </div>
                <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full rounded-md border-slate-300 pl-10 focus:border-indigo-500 focus:ring-indigo-500 sm:text-lg"
                    placeholder="e.g., Party Animal"
                    required
                />
            </div>
          </div>
          <button
            type="submit"
            disabled={isLoading || !joinCode.trim() || !name.trim()}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Joining...' : 'Let\'s Go!'}
          </button>
        </form>
      </div>
    </div>
  );
}