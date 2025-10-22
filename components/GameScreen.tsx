import React from 'react';
import { Word, Particle, ScorePopup, GameStatus } from '../types';
import WordTile from './WordTile';
import { LANES, BOARD_TILT_DEGREES, PERSPECTIVE_STRENGTH, PERSPECTIVE_HORIZONTAL_FACTOR, WORD_MIN_SCALE, WORD_MAX_SCALE } from '../constants';

type WordFacing = 'tilted' | 'upright';

interface GameScreenProps {
  gameStatus: GameStatus;
  words: Word[];
  typedWord: string;
  particles: Particle[];
  activeWord: Word | null;
  scorePopups: ScorePopup[];
  wordFacing: WordFacing;
}

const GameScreen: React.FC<GameScreenProps> = ({ gameStatus, words, typedWord, particles, activeWord, scorePopups, wordFacing }) => {
  const isPlaying = gameStatus === GameStatus.Playing;

  const COS_TILT = Math.cos(BOARD_TILT_DEGREES * Math.PI / 180);
  const boardProjectedHeight = 100 * COS_TILT;
  const boardTopOffset = (100 - boardProjectedHeight) / 2;

  const getProjectedY = (y: number): number => {
    const normalizedY = y / 100;
    // Apply a power curve to simulate perspective: slow at the top, fast at the bottom.
    const perspectiveY = Math.pow(normalizedY, PERSPECTIVE_STRENGTH);
    return boardTopOffset + (perspectiveY * boardProjectedHeight);
  };


  return (
    <div className="w-full h-full relative" style={{ perspective: '1000px' }}>
      {/* Layer 1: The 3D Tilted Board */}
      <div className="absolute inset-0" style={{ transformStyle: 'preserve-3d', transform: `rotateX(${BOARD_TILT_DEGREES}deg)` }}>
        {/* Game board background */}
        <div className="absolute inset-0 bg-black/30 backdrop-blur-sm border-2 border-[var(--color-secondary)]/50 rounded-lg shadow-[inset_0_0_10px_rgba(0,0,0,0.6),0_0_5px_var(--color-secondary-light),0_0_15px_var(--color-secondary),5px_5px_20px_rgba(0,0,0,0.5)]">
          {/* Grid lines */}
          <div className="absolute inset-0 grid grid-cols-10 grid-rows-10">
            {Array.from({ length: 100 }).map((_, i) => (
              <div key={i} className="border-r border-b border-[var(--color-secondary)]/10"></div>
            ))}
          </div>
        </div>
        
        {/* Hit Zone (in 3D space) */}
        {isPlaying && (
          <>
            <div className="absolute bottom-0 left-0 w-full h-[10%] bg-gradient-to-t from-[var(--color-danger)] to-transparent pointer-events-none">
            </div>
            <div className="absolute bottom-0 left-0 w-full h-[10%] flex justify-center items-center text-[var(--color-danger-light)] font-bold tracking-[0.5em] text-3xl opacity-100">
                DANGER ZONE
            </div>
          </>
        )}

        {/* Words are always rendered inside the 3D container now. */}
        {/* The WordTile component will handle the visual difference between 'tilted' and 'upright'. */}
        {words.map(word => (
          <WordTile key={word.id} word={word} typedWord={typedWord} activeWord={activeWord} wordFacing={wordFacing} />
        ))}
      </div>

      {/* Layer 2: The 2D Overlay (for Particles, Popups) */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Particles */}
        {particles.map(particle => {
          const topPosition = getProjectedY(particle.y);
          const normalizedY = particle.y / 100;
          const perspectiveY = Math.pow(normalizedY, PERSPECTIVE_STRENGTH);
          const scale = WORD_MIN_SCALE + (WORD_MAX_SCALE - WORD_MIN_SCALE) * perspectiveY;
          const centerOffset = particle.x - 50;
          const horizontalScale = 1 + (PERSPECTIVE_HORIZONTAL_FACTOR - 1) * perspectiveY;
          const left = 50 + centerOffset * horizontalScale;

          return (
            <div
              key={particle.id}
              className="absolute rounded-full"
              style={{
                left: `${left}%`,
                top: `${topPosition}%`,
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                opacity: particle.opacity,
                transform: `translate(-50%, -50%) scale(${scale})`,
                transition: 'opacity 0.5s ease-out',
                backgroundColor: particle.color,
                boxShadow: `0 0 8px ${particle.color}`,
              }}
            />
          );
        })}

        {/* Score Popups */}
        {scorePopups.map(popup => {
          const topPosition = getProjectedY(popup.y);
          const normalizedY = popup.y / 100;
          const perspectiveY = Math.pow(normalizedY, PERSPECTIVE_STRENGTH);
          const scale = WORD_MIN_SCALE + (WORD_MAX_SCALE - WORD_MIN_SCALE) * perspectiveY;
          const centerOffset = popup.x - 50;
          const horizontalScale = 1 + (PERSPECTIVE_HORIZONTAL_FACTOR - 1) * perspectiveY;
          const left = 50 + centerOffset * horizontalScale;

          return (
            <div
              key={popup.id}
              className={`absolute text-3xl font-bold score-popup pointer-events-none ${popup.color === 'green' ? 'text-[var(--color-success-light)]' : 'text-[var(--color-danger)]'}`}
              style={{
                left: `${left}%`,
                top: `${topPosition}%`,
                transform: `translateX(-50%) scale(${scale})`,
                textShadow: `0 0 4px ${popup.color === 'green' ? 'var(--color-success-light)' : 'var(--color-danger-light)'}, 0 0 10px ${popup.color === 'green' ? 'var(--color-success)' : 'var(--color-danger)'}`,
                zIndex: 20,
              }}
            >
              {popup.text}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GameScreen;