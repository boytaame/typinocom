import React, { useState, useEffect, useRef } from 'react';
import { ScoreHistoryEntry } from '../types';
import useFocusTrap from '../hooks/useFocusTrap';

interface ScoreHistoryModalProps {
  isOpen: boolean;
  scores: ScoreHistoryEntry[];
  onClose: () => void;
}

const ScoreHistoryModal: React.FC<ScoreHistoryModalProps> = ({ isOpen, scores, onClose }) => {
  const [isClosing, setIsClosing] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useFocusTrap(modalRef, isOpen);

  useEffect(() => {
    if (isOpen) {
      setIsClosing(false);
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleClose = () => {
    setIsClosing(true);
  };

  const handleAnimationEnd = () => {
    if (isClosing) {
      onClose();
    }
  };

  const sortedScores = [...scores].sort((a, b) => b.score - a.score);

  const dateFormatter = new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const animationClass = isClosing ? 'animate-fade-out-down' : 'animate-subtle-zoom-in';

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 animate-fade-in"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="score-history-title"
    >
      <div
        ref={modalRef}
        className={`bg-slate-900/80 border-2 border-[var(--color-secondary)] rounded-lg shadow-[inset_0_0_10px_rgba(0,0,0,0.6),0_0_5px_var(--color-secondary-light),0_0_15px_var(--color-secondary),5px_5px_20px_rgba(0,0,0,0.5)] w-full max-w-lg max-h-[80vh] flex flex-col ${animationClass}`}
        onClick={(e) => e.stopPropagation()}
        onAnimationEnd={handleAnimationEnd}
        tabIndex={-1} // Makes the container focusable for the trap
      >
        <div className="p-6 border-b border-[var(--color-secondary)]/50 opacity-0 animate-fade-in-up animation-delay-100">
          <h2 id="score-history-title" className="text-3xl font-bold text-[var(--color-primary-light)]" style={{ textShadow: '0 0 5px var(--color-primary-light), 0 0 15px var(--color-primary), 0 0 30px var(--color-primary), 2px 2px 4px rgba(0,0,0,0.3)' }}>
            Score History
          </h2>
        </div>

        <div className="p-6 overflow-y-auto opacity-0 animate-fade-in-up animation-delay-200">
          {sortedScores.length > 0 ? (
            <ul className="space-y-4">
              {sortedScores.map((entry, index) => (
                <li key={entry.date} className="flex justify-between items-center bg-black/20 p-4 rounded-md border border-[var(--color-secondary-light)]/30">
                  <div className="flex items-center">
                    <span className="text-xl font-bold text-[var(--color-secondary-text-on-dark)] w-8">{index + 1}.</span>
                    <div>
                      <p className="text-2xl font-bold text-[var(--color-text-base)]">{entry.score.toLocaleString()} PTS</p>
                      <p className="text-sm text-[var(--color-text-muted)]">{dateFormatter.format(new Date(entry.date))}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-[var(--color-text-muted)] py-8">
              No completed games yet. Play a round to see your score here!
            </p>
          )}
        </div>

        <div className="p-6 border-t border-[var(--color-secondary)]/50 text-right opacity-0 animate-fade-in-up animation-delay-300">
          <button
            onClick={handleClose}
            className="px-6 py-2 bg-[var(--color-primary)] text-[var(--color-text-dark)] font-bold rounded-lg shadow-[var(--shadow-primary)] hover:bg-[var(--color-primary-dark)] transition-all duration-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScoreHistoryModal;