import React from 'react';
import { Word, Particle, ScorePopup, GameStatus } from '../types';
import WordTile from './WordTile';
import { LANES } from '../constants';

interface GameScreenProps {
  gameStatus: GameStatus;
  words: Word[];
  typedWord: string;
  particles: Particle[];
  activeWord: Word | null;
  scorePopups: ScorePopup[];
}

const GameScreen: React.FC<GameScreenProps> = ({ gameStatus, words, typedWord, particles, activeWord, scorePopups }) => {
  const isPlaying = gameStatus === GameStatus.Playing;

  return (
    <div className="w-full h-full" style={{ perspective: '1000px' }}>
      <div className="relative w-full h-full overflow-hidden rounded-lg" style={{ transformStyle: 'preserve-3d', transform: 'rotateX(55deg)' }}>
        {/* Game board */}
        <div className="absolute inset-0 bg-black/30 backdrop-blur-sm border-2 border-[var(--color-secondary)]/50 rounded-lg shadow-[inset_0_0_10px_rgba(0,0,0,0.6),0_0_5px_var(--color-secondary-light),0_0_15px_var(--color-secondary),5px_5px_20px_rgba(0,0,0,0.5)]">
          {/* Grid lines */}
          <div className="absolute inset-0 grid grid-cols-10 grid-rows-10">
            {Array.from({ length: 100 }).map((_, i) => (
              <div key={i} className="border-r border-b border-[var(--color-secondary)]/10"></div>
            ))}
          </div>
        </div>

        {/* Words */}
        {words.map(word => (
          <WordTile key={word.id} word={word} typedWord={typedWord} activeWord={activeWord} />
        ))}

        {/* Particles */}
        {particles.map(particle => (
           <div
            key={particle.id}
            className="absolute rounded-full"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              opacity: particle.opacity,
              transform: 'translate(-50%, -50%)',
              transition: 'opacity 0.5s ease-out',
              backgroundColor: particle.color,
              boxShadow: `0 0 8px ${particle.color}`,
            }}
          />
        ))}

        {/* Score Popups */}
        {scorePopups.map(popup => (
          <div
            key={popup.id}
            className={`absolute text-3xl font-bold score-popup pointer-events-none ${popup.color === 'green' ? 'text-[var(--color-success-light)]' : 'text-[var(--color-danger)]'}`}
            style={{
              left: `${popup.x}%`,
              top: `${popup.y}%`,
              textShadow: `0 0 4px ${popup.color === 'green' ? 'var(--color-success-light)' : 'var(--color-danger-light)'}, 0 0 10px ${popup.color === 'green' ? 'var(--color-success)' : 'var(--color-danger)'}`,
              zIndex: 20,
            }}
          >
            {popup.text}
          </div>
        ))}
        
        {/* Hit Zone */}
        {isPlaying && (
          <>
            <div className="absolute bottom-0 left-0 w-full h-[10%] bg-gradient-to-t from-[var(--color-danger)] to-transparent pointer-events-none">
            </div>
            <div className="absolute bottom-0 left-0 w-full h-[10%] flex justify-center items-center text-[var(--color-danger-light)] font-bold tracking-[0.5em] text-3xl opacity-100">
                DANGER ZONE
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default GameScreen;