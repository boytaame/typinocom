import React from 'react';
import { Word } from '../types';
import { LANES } from '../constants';

interface WordTileProps {
  word: Word;
  typedWord: string;
  activeWord: Word | null;
}

const WordTile: React.FC<WordTileProps> = ({ word, typedWord, activeWord }) => {
  const isTheActiveWord = activeWord?.id === word.id;
  const isPotentialTarget = !activeWord && typedWord.length > 0 && word.text.startsWith(typedWord);
  const isCompleted = word.status === 'completed';

  const laneWidth = 100 / LANES;
  const leftPosition = word.x * laneWidth + laneWidth / 2;

  const tileBaseStyle = "absolute text-3xl font-bold p-2 rounded-lg transition-colors transition-shadow duration-150 flex items-center justify-center";
  const tileColorStyle = isTheActiveWord 
    ? "bg-[var(--color-ui-base)] border-2 border-[var(--color-primary-light)] text-[var(--color-text-base)] shadow-[inset_0_0_6px_rgba(0,0,0,0.8),0_0_2px_#fff,0_0_6px_var(--color-primary-light),0_0_12px_var(--color-primary),3px_3px_10px_rgba(0,0,0,0.6)]" 
    : "bg-[var(--color-ui-base)] border-2 border-[var(--color-secondary-light)] text-[var(--color-secondary-text-on-dark)] shadow-[inset_0_0_6px_rgba(0,0,0,0.8),0_0_2px_#fff,0_0_6px_var(--color-secondary-light),0_0_12px_var(--color-secondary),3px_3px_10px_rgba(0,0,0,0.6)]";
  
  const completedClass = isCompleted ? 'word-completed' : '';

  const renderContent = () => {
    if (isCompleted) {
      return (
          <span className="text-[var(--color-success-light)] drop-shadow-[0_0_5px_var(--color-success)]">
              {word.text}
          </span>
      );
    }
    
    // This is the active word the user is currently typing
    if (isTheActiveWord) {
      let diffIndex = -1;
      // Find the first character that doesn't match
      for (let i = 0; i < typedWord.length; i++) {
        if (i >= word.text.length || typedWord[i] !== word.text[i]) {
          diffIndex = i;
          break;
        }
      }

      // Case 1: Everything typed so far is correct
      if (diffIndex === -1) {
        const typedPart = word.text.substring(0, typedWord.length);
        const remainingPart = word.text.substring(typedWord.length);
        return (
          <>
            <span className="text-[var(--color-success-light)] drop-shadow-[0_0_5px_var(--color-success)]">
              {typedPart}
            </span>
            <span className="text-[var(--color-text-base)]">
              {remainingPart}
            </span>
          </>
        );
      } 
      // Case 2: A typo has been made. Show the user's input directly.
      else {
        const correctPart = word.text.substring(0, diffIndex);
        const incorrectTypedPart = typedWord.substring(diffIndex);
        const untypedOriginalPart = word.text.substring(typedWord.length);
        
        return (
          <>
            {/* The part typed correctly */}
            <span className="text-[var(--color-success-light)] drop-shadow-[0_0_5px_var(--color-success)]">
              {correctPart}
            </span>
            {/* The incorrect part of what was typed, which replaces the original text */}
            <span 
              className="text-[var(--color-danger-light)] font-bold typo-shake"
              style={{ textShadow: '0 0 6px var(--color-danger)' }}
            >
              {incorrectTypedPart}
            </span>
            {/* The rest of the original word that hasn't been reached by the typo */}
            <span className="text-[var(--color-text-base)]">
              {untypedOriginalPart}
            </span>
          </>
        );
      }
    }
    
    // For non-active words, just show potential matches
    const typedLength = isPotentialTarget ? typedWord.length : 0;
    return (
      <>
        <span className="text-[var(--color-success-light)] drop-shadow-[0_0_5px_var(--color-success)]">
          {word.text.substring(0, typedLength)}
        </span>
        <span className="text-[var(--color-text-base)]">
          {word.text.substring(typedLength)}
        </span>
      </>
    );
  };

  return (
    <div
      data-word-id={word.id}
      className={`${tileBaseStyle} ${tileColorStyle} ${completedClass}`}
      style={{
        top: `${word.y}%`,
        left: `${leftPosition}%`,
        transform: `translateX(-50%) translateY(-50%)`,
        minWidth: `${word.text.length * 1.4}rem`
      }}
      role="term"
      aria-label={word.text}
    >
      {renderContent()}
    </div>
  );
};

export default WordTile;