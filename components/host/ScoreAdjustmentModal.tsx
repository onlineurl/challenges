import React, { useState } from 'react';
import type { Participant } from '../../types';
import { X } from 'lucide-react';

interface ScoreAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (points: number) => void;
  participant: Participant;
}

export default function ScoreAdjustmentModal({ isOpen, onClose, onSave, participant }: ScoreAdjustmentModalProps) {
  const [points, setPoints] = useState(0);

  const handleSave = () => {
    onSave(points);
    setPoints(0); // Reset for next time
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-6 relative" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 p-1 rounded-full text-slate-500 hover:bg-slate-200" aria-label="Close modal">
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-bold text-slate-800">Adjust Score</h2>
        <p className="text-sm text-slate-500 mb-4">For {participant.name} (Current: {participant.total_points} pts)</p>

        <div>
          <label htmlFor="points-adjust" className="block text-sm font-medium text-slate-700">Points to Add/Subtract</label>
          <input
            type="number"
            id="points-adjust"
            value={points}
            onChange={(e) => setPoints(parseInt(e.target.value, 10) || 0)}
            className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="e.g., 50 or -10"
          />
          <p className="text-xs text-slate-500 mt-1">Use a negative number to subtract points.</p>
        </div>

        <div className="flex justify-end gap-3 pt-6">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-md hover:bg-slate-200">Cancel</button>
          <button onClick={handleSave} disabled={points === 0} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-indigo-300">Save Adjustment</button>
        </div>
      </div>
    </div>
  );
}