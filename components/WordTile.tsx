import React from 'react';
import { Word } from '../types';
import { LANES, BOARD_TILT_DEGREES, PERSPECTIVE_STRENGTH, PERSPECTIVE_HORIZONTAL_FACTOR, WORD_MIN_SCALE, WORD_MAX_SCALE } from '../constants';

type WordFacing = 'tilted' | 'upright';

interface WordTileProps {
  word: Word;
  typedWord: string;
  activeWord: Word | null;
  wordFacing: WordFacing;
}

const WordTile: React.FC<WordTileProps> = ({ word, typedWord, activeWord, wordFacing }) => {
  const isTheActiveWord = activeWord?.id === word.id;
  const isPotentialTarget = !activeWord && typedWord.length > 0 && word.text.startsWith(typedWord);
  const isCompleted = word.status === 'completed';
  const hasTypo = isTheActiveWord && !word.text.startsWith(typedWord);

  const completedClass = isCompleted ? 'word-completed' : '';
  const typoAnimationClass = hasTypo ? 'typo-shake' : '';

  let tileStateStyle = '';
  if (hasTypo) {
    // Danger state for typo - increased opacity
    tileStateStyle = 'bg-[var(--color-danger)]/30 border-[var(--color-danger-light)] shadow-[0_0_2px_#fff,0_0_8px_var(--color-danger),0_0_15px_var(--color-danger-light),4px_4px_10px_rgba(0,0,0,0.7)]';
  } else if (isTheActiveWord) {
    // Active word state
    tileStateStyle = 'bg-[var(--color-ui-medium)] border-[var(--color-primary-light)] shadow-[0_0_2px_#fff,0_0_8px_var(--color-primary),0_0_15px_var(--color-primary-dark),4px_4px_10px_rgba(0,0,0,0.7)]';
  } else if (isPotentialTarget) {
    // Potential target state
    tileStateStyle = 'bg-[var(--color-ui-base)] border-[var(--color-secondary-light)]/80 shadow-[0_0_6px_var(--color-secondary),0_0_12px_var(--color-secondary-light),2px_2px_8px_rgba(0,0,0,0.6)]';
  } else {
    // Default, inactive state - now more opaque
    tileStateStyle = 'bg-[var(--color-ui-base)] border-[var(--color-ui-light)] shadow-[2px_2px_8px_rgba(0,0,0,0.6)]';
  }
  
  // --- Perspective Calculation ---
  const normalizedY = word.y / 100;
  const perspectiveY = Math.pow(normalizedY, PERSPECTIVE_STRENGTH);
  
  // Vertical position (as a percentage of the parent height)
  const top = perspectiveY * 100;

  // Horizontal position and scaling
  const laneWidth = 100 / LANES;
  const baseLeft = word.x * laneWidth + laneWidth / 2;
  const centerOffset = baseLeft - 50;
  const horizontalScale = 1 + (PERSPECTIVE_HORIZONTAL_FACTOR - 1) * perspectiveY;
  const left = 50 + centerOffset * horizontalScale;

  // Word scaling
  let scale = WORD_MIN_SCALE + (WORD_MAX_SCALE - WORD_MIN_SCALE) * perspectiveY;
  if (wordFacing === 'tilted') {
    scale *= 1.25; // Make words 25% larger in tilted mode for better readability
  }

  // Word counter-rotation and positioning for 'upright' mode
  const uprightTransform = wordFacing === 'upright' ? `rotateX(-${BOARD_TILT_DEGREES}deg)` : '';
  const uprightTranslate = wordFacing === 'upright' ? 'translate(-50%, -100%)' : 'translate(-50%, -50%)';
  const uprightOrigin = wordFacing === 'upright' ? 'center bottom' : 'center center';

  const baseTransform = `${uprightTranslate} scale(${scale}) ${uprightTransform}`;

  // Fix: Explicitly type the style object as React.CSSProperties to allow for the use of CSS custom properties like '--base-transform'.
  const tileStyle = {
    left: `${left}%`,
    top: `${top}%`,
    '--base-transform': baseTransform,
    transform: baseTransform,
    transformOrigin: uprightOrigin,
    overflow: 'visible', // Allow the typo overlay to spill out
  } as React.CSSProperties;

  return (
    <div
      className={`absolute px-4 py-2 rounded-md border-2 transition-colors transition-shadow duration-100 ${tileStateStyle} ${completedClass} ${typoAnimationClass}`}
      style={tileStyle}
    >
      <p className="text-3xl font-bold tracking-widest whitespace-nowrap" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
        {isTheActiveWord ? (
          <>
            {/* Active Word: Render the typed word with character-by-character validation */}
            {typedWord.split('').map((char, index) => {
              const isCorrect = index < word.text.length && word.text[index] === char;
              const colorClass = isCorrect ? 'text-[var(--color-primary-light)]' : 'text-[var(--color-danger)]';
              return (
                <span key={`typed-${index}`} className={colorClass}>
                  {char}
                </span>
              );
            })}
            {/* Render the rest of the original word that hasn't been typed yet */}
            <span className="text-[var(--color-text-muted)]">
              {word.text.substring(typedWord.length)}
            </span>
          </>
        ) : isPotentialTarget ? (
          <>
            {/* Potential Target Word: Highlight the matching prefix */}
            <span className={'text-[var(--color-primary-light)]'}>
              {word.text.substring(0, typedWord.length)}
            </span>
            <span className="text-[var(--color-text-muted)]">
              {word.text.substring(typedWord.length)}
            </span>
          </>
        ) : (
          <>
            {/* Default Word: Display normally */}
            <span className="text-[var(--color-text-base)]">{word.text}</span>
          </>
        )}
      </p>
    </div>
  );
};

export default React.memo(WordTile);