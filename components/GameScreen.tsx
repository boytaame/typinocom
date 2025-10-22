import React from 'react';
import { Word, Particle as ParticleType, ScorePopup as ScorePopupType, GameStatus } from '../types';
import WordTile from './WordTile';
import Particle from './Particle';
import ScorePopup from './ScorePopup';
import { BOARD_TILT_DEGREES } from '../constants';

type WordFacing = 'tilted' | 'upright';

interface GameScreenProps {
  gameStatus: GameStatus;
  words: Word[];
  typedWord: string;
  particles: ParticleType[];
  activeWord: Word | null;
  scorePopups: ScorePopupType[];
  wordFacing: WordFacing;
}

const GameScreen: React.FC<GameScreenProps> = ({ gameStatus, words, typedWord, particles, activeWord, scorePopups, wordFacing }) => {
  const isPlaying = gameStatus === GameStatus.Playing;

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
        {particles.map(particle => (
          <Particle key={particle.id} particle={particle} />
        ))}

        {/* Score Popups */}
        {scorePopups.map(popup => (
          <ScorePopup key={popup.id} popup={popup} />
        ))}
      </div>
    </div>
  );
};

export default React.memo(GameScreen);