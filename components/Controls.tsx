
import React from 'react';
import { GameStatus, PowerUpType, ActivePowerUp } from '../types';
import { POWER_UP_ORDER, POWER_UP_CONFIG } from '../constants';

interface ControlsProps {
  gameStatus: GameStatus;
  score: number;
  lives: number;
  onStart: () => void;
  powerUps: Record<PowerUpType, number>;
  activePowerUps: ActivePowerUp[];
  onActivatePowerUp: (type: PowerUpType) => void;
  powerUpSlotRefs?: Record<PowerUpType, React.RefObject<HTMLDivElement>>;
  onShowScoreHistory?: () => void;
  onShowOptions?: () => void;
}

const PowerUpIcons: Record<PowerUpType, React.FC<{className: string}>> = {
  [PowerUpType.TimeWarp]: ({className}) => ( // Clock
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  ),
  [PowerUpType.ScoreSurge]: ({className}) => ( // Bolt
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
    </svg>
  ),
  [PowerUpType.SystemShock]: ({className}) => ( // Sparkles/burst
     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" />
     </svg>
  ),
};

const Controls: React.FC<ControlsProps> = ({ gameStatus, score, lives, onStart, powerUps, activePowerUps, onActivatePowerUp, powerUpSlotRefs, onShowScoreHistory, onShowOptions }) => {
  const HeartIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-[var(--color-danger)] drop-shadow-[0_0_5px_var(--color-danger)]">
      <path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-1.344-.912l-1.604-1.16-1.732-1.29a12.062 12.062 0 0 1-5.03-8.878V5.987a4.502 4.502 0 0 1 2.223-3.956c1.072-.635 2.297-1.022 3.482-1.022s2.41.387 3.482 1.022a4.502 4.502 0 0 1 2.223 3.956v3.57a12.062 12.062 0 0 1-5.03 8.878l-1.732 1.29-1.604 1.16-1.344.912a3.376 3.376 0 0 1-.809.428l-.022.012-.007.003Z" />
    </svg>
  );

  if (gameStatus === GameStatus.Ready) {
    return (
      <div className="text-center my-8 z-10 flex flex-col items-center gap-4">
        <button
          onClick={onStart}
          className="w-80 px-8 py-4 bg-[var(--color-primary)] text-[var(--color-text-dark)] font-bold rounded-lg shadow-[var(--shadow-primary)] hover:bg-[var(--color-primary-dark)] transition-all duration-300 text-xl opacity-0 animate-fade-in-up"
        >
          Start Game
        </button>
        <button
          onClick={onShowScoreHistory}
          className="w-80 px-8 py-4 bg-[var(--color-ui-medium)] text-[var(--color-text-base)] font-bold rounded-lg shadow-[inset_0_0_6px_rgba(0,0,0,0.8),2px_2px_10px_rgba(0,0,0,0.6)] hover:bg-[var(--color-ui-light)] transition-all duration-300 text-xl cursor-pointer opacity-0 animate-fade-in-up animation-delay-100"
        >
          Score History
        </button>
        <button
          className="w-80 px-8 py-4 bg-[var(--color-ui-medium)] text-[var(--color-text-base)] font-bold rounded-lg shadow-[inset_0_0_6px_rgba(0,0,0,0.8),2px_2px_10px_rgba(0,0,0,0.6)] hover:bg-[var(--color-ui-light)] transition-all duration-300 text-xl cursor-pointer opacity-0 animate-fade-in-up animation-delay-200"
        >
          Leaderboard
        </button>
        <button
          onClick={onShowOptions}
          className="w-80 px-8 py-4 bg-[var(--color-ui-medium)] text-[var(--color-text-base)] font-bold rounded-lg shadow-[inset_0_0_6px_rgba(0,0,0,0.8),2px_2px_10px_rgba(0,0,0,0.6)] hover:bg-[var(--color-ui-light)] transition-all duration-300 text-xl cursor-pointer opacity-0 animate-fade-in-up animation-delay-300"
        >
          Options
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl p-4 bg-slate-900/50 border border-[var(--color-secondary)]/30 rounded-lg flex justify-between items-center backdrop-blur-sm z-10">
      <div className="flex items-center space-x-6">
        <div>
          <span className="text-[var(--color-secondary-text-on-dark)] text-sm">SCORE</span>
          <p className="text-3xl font-bold text-[var(--color-primary-light)]">{score.toString().padStart(6, '0')}</p>
        </div>
        <div className="flex items-center space-x-1">
          {Array.from({ length: lives }).map((_, i) => <HeartIcon key={i} />)}
        </div>
      </div>

      <div>
        <span className="text-[var(--color-secondary-text-on-dark)] text-sm block text-right mb-1">TYPE TO ACTIVATE</span>
        <div className="flex items-center space-x-4">
          {POWER_UP_ORDER.map((type) => {
            const count = powerUps[type];
            const isActive = activePowerUps.some(p => p.type === type);
            const Icon = PowerUpIcons[type];
            const config = POWER_UP_CONFIG[type as keyof typeof POWER_UP_CONFIG];
            
            return (
              <div
                key={type}
                ref={powerUpSlotRefs?.[type]}
                className={`relative w-24 h-20 bg-black/20 rounded-lg border-2 p-2 flex flex-col items-center justify-center transition-all duration-300
                  ${isActive ? 'power-up-active border-[var(--color-primary-light)]' : 'border-[var(--color-secondary-light)]/50'}
                  ${count > 0 ? 'opacity-100' : 'opacity-40'}
                `}
                title={`${config.name}${count > 0 ? ` (Available: ${count})` : ' (Not Available)'}`}
              >
                <Icon className="w-8 h-8 text-[var(--color-primary-text-on-dark)]" />
                <span className="text-sm font-bold text-[var(--color-primary-light)] mt-1 uppercase tracking-wider">{config.activationWord}</span>
                {count > 0 && (
                  <span className="absolute -top-2 -right-2 w-6 h-6 bg-[var(--color-primary-light)] text-[var(--color-text-dark)] text-sm font-bold rounded-full flex items-center justify-center border-2 border-slate-800">
                    {count}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  );
};

export default Controls;