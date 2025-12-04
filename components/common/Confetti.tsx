import React, { useEffect, useState } from 'react';

const CONFETTI_COUNT = 100;
const COLORS = ['#22c55e', '#3b82f6', '#ec4899', '#f59e0b', '#8b5cf6'];

const ConfettiPiece: React.FC<{ initialX: number; initialY: number; rotation: number; color: string }> = ({ initialX, initialY, rotation, color }) => {
  // FIX: Use type assertion to allow CSS custom properties in the style object.
  const style = {
    '--initial-x': `${initialX}vw`,
    '--initial-y': `${initialY}vh`,
    '--rotation': `${rotation}deg`,
    backgroundColor: color,
    animation: 'fall 5s linear forwards',
    position: 'absolute',
    width: '8px',
    height: '16px',
    top: 0,
    left: 0,
    opacity: 0,
  } as React.CSSProperties;
  return <div style={style} />;
};

export const Confetti: React.FC = () => {
  const [pieces, setPieces] = useState<React.ReactNode[]>([]);

  useEffect(() => {
    const newPieces = Array.from({ length: CONFETTI_COUNT }).map((_, index) => (
      <ConfettiPiece
        key={index}
        initialX={Math.random() * 100}
        initialY={-20 - Math.random() * 30}
        rotation={Math.random() * 360}
        color={COLORS[Math.floor(Math.random() * COLORS.length)]}
      />
    ));
    setPieces(newPieces);
  }, []);
  
  // Add animation keyframes to a style tag
  useEffect(() => {
    const styleId = 'confetti-styles';
    if (document.getElementById(styleId)) return;
    
    const style = document.createElement('style');
    style.id = styleId;
    style.innerHTML = `
      @keyframes fall {
        0% {
          transform: translate(var(--initial-x), var(--initial-y)) rotate(var(--rotation));
          opacity: 1;
        }
        100% {
          transform: translate(calc(var(--initial-x) + ${Math.random() * 20 - 10}vw), 110vh) rotate(calc(var(--rotation) + 360deg));
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        {pieces}
    </div>
  );
};