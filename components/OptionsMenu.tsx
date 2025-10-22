import React, { useState, useRef } from 'react';
import useFocusTrap from '../hooks/useFocusTrap';

interface OptionsMenuProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: string;
  onSetTheme: (theme: string) => void;
}

const THEMES = [
  { id: 'neon-pulse', name: 'Midnight Synthwave' },
  { id: 'cyber-sunset', name: 'Cyber Sunset' },
  { id: 'emerald-grid', name: 'Emerald Grid' },
  { id: 'blood-moon', name: 'Blood Moon' },
  { id: 'plasma-core', name: 'Plasma Core' },
];

const OptionsMenu: React.FC<OptionsMenuProps> = ({ isOpen, onClose, currentTheme, onSetTheme }) => {
  const [isClosing, setIsClosing] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useFocusTrap(modalRef, isOpen);

  React.useEffect(() => {
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

  const backdropAnimation = isClosing ? 'animate-fade-out' : 'animate-fade-in';
  const modalAnimation = isClosing ? 'animate-fade-out-down' : 'animate-subtle-zoom-in';

  return (
    <div
      className={`fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 ${backdropAnimation}`}
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="options-title"
    >
      <div
        ref={modalRef}
        className={`bg-[var(--color-ui-base)]/80 border-2 border-[var(--color-secondary)] rounded-lg shadow-[inset_0_0_10px_rgba(0,0,0,0.6),0_0_5px_var(--color-secondary-light),0_0_15px_var(--color-secondary),5px_5px_20px_rgba(0,0,0,0.5)] w-full max-w-lg flex flex-col ${modalAnimation}`}
        onClick={(e) => e.stopPropagation()}
        onAnimationEnd={handleAnimationEnd}
        tabIndex={-1} // Makes the container focusable for the trap
      >
        <div className="p-6 border-b border-[var(--color-secondary)]/50 opacity-0 animate-fade-in-up">
          <h2 id="options-title" className="text-3xl font-bold text-[var(--color-primary-light)]" style={{ textShadow: '0 0 5px var(--color-primary-light), 0 0 15px var(--color-primary), 0 0 30px var(--color-primary), 2px 2px 4px rgba(0,0,0,0.3)' }}>
            Options
          </h2>
        </div>

        <div className="p-6 space-y-6 opacity-0 animate-fade-in-up animation-delay-100">
          <div>
            <h3 className="text-xl font-bold text-[var(--color-text-base)] mb-3">Color Scheme</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {THEMES.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => onSetTheme(theme.id)}
                  className={`px-4 py-3 font-bold rounded-lg text-center transition-all duration-200 border-2 
                    ${currentTheme === theme.id 
                      ? 'bg-[var(--color-primary)] text-[var(--color-text-dark)] border-[var(--color-primary-light)] shadow-[inset_0_0_4px_rgba(0,0,0,0.7),0_0_2px_#fff,0_0_5px_var(--color-primary-light),0_0_10px_var(--color-primary),2px_2px_8px_rgba(0,0,0,0.5)] scale-105' 
                      : 'bg-[var(--color-ui-medium)] text-[var(--color-text-base)] border-transparent hover:border-[var(--color-primary-light)] hover:bg-[var(--color-ui-light)]'
                    }`
                  }
                  aria-pressed={currentTheme === theme.id}
                >
                  {theme.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-[var(--color-secondary)]/50 text-right opacity-0 animate-fade-in-up animation-delay-200">
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

export default OptionsMenu;