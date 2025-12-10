import React, { useState, useEffect } from 'react';
import { differenceInSeconds } from 'date-fns';

interface ChallengeTimerProps {
  expiresAt: string;
  onTimeUp: () => void;
  timeLimit: number;
}

interface TimeLeft {
  total: number;
  minutes: number;
  seconds: number;
}

function calculateTimeLeft(expires: string): TimeLeft {
  const total = differenceInSeconds(new Date(expires), new Date());
  if (total <= 0) {
    return { total: 0, minutes: 0, seconds: 0 };
  }
  return {
    total,
    minutes: Math.floor(total / 60),
    seconds: total % 60,
  };
}

const CircularProgress: React.FC<{ percentage: number; color: string; isPulsing: boolean }> = ({ percentage, color, isPulsing }) => {
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <svg width="120" height="120" viewBox="0 0 120 120" className="transform -rotate-90">
      <circle
        className="text-slate-200"
        strokeWidth="10"
        stroke="currentColor"
        fill="transparent"
        r={radius}
        cx="60"
        cy="60"
      />
      <circle
        className={`transition-all duration-500 ${isPulsing ? 'animate-pulse' : ''}`}
        strokeWidth="10"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        stroke={color}
        fill="transparent"
        r={radius}
        cx="60"
        cy="60"
      />
    </svg>
  );
};


export default function ChallengeTimer({ expiresAt, onTimeUp, timeLimit }: ChallengeTimerProps) {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(expiresAt));

  useEffect(() => {
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft(expiresAt);
      setTimeLeft(newTimeLeft);

      if (newTimeLeft.total <= 0) {
        clearInterval(timer);
        onTimeUp();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [expiresAt, onTimeUp]);

  const isDanger = timeLeft.total > 0 && timeLeft.total <= 10;
  const isWarning = timeLeft.total > 0 && timeLeft.total <= 30;
  
  const timerColor = isDanger ? '#ef4444' // red-500
                   : isWarning ? '#f59e0b' // amber-500
                   : '#22c55e'; // green-500

  const percentage = Math.max(0, (timeLeft.total / timeLimit) * 100);

  return (
    <div className={`relative w-32 h-32 flex items-center justify-center ${isDanger ? 'animate-shake' : ''}`}>
      <CircularProgress percentage={percentage} color={timerColor} isPulsing={isDanger} />
      <div className="absolute flex flex-col items-center justify-center">
        <span className="font-mono text-3xl font-bold" style={{ color: timerColor }}>
          {timeLeft.total > 0 ? `${timeLeft.minutes.toString().padStart(2, '0')}:${timeLeft.seconds.toString().padStart(2, '0')}` : "00:00"}
        </span>
         <span className="text-xs text-slate-500">{timeLeft.total > 0 ? "Restante" : "¡Tiempo!"}</span>
      </div>
    </div>
  );
}

// Add shake animation to tailwind config or a global CSS file if needed
// For this component, let's define it in a style tag in index.html for simplicity if it doesn't exist.
const style = document.createElement('style');
style.innerHTML = `
@keyframes shake {
  10%, 90% { transform: translate3d(-1px, 0, 0); }
  20%, 80% { transform: translate3d(2px, 0, 0); }
  30%, 50%, 70% { transform: translate3d(-3px, 0, 0); }
  40%, 60% { transform: translate3d(3px, 0, 0); }
}
.animate-shake {
  animation: shake 0.82s cubic-bezier(.36,.07,.19,.97) both;
}
`;
document.head.appendChild(style);