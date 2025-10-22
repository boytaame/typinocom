import React, { useRef, useState, useEffect } from 'react';
import GameScreen from './components/GameScreen';
import Controls from './components/Controls';
import useTypingGame from './hooks/useTypingGame';
import { GameStatus, PowerUpType, ScoreHistoryEntry } from './types';
import PowerUpAnimationLayer from './components/PowerUpAnimationLayer';
import ScoreHistoryModal from './components/ScoreHistoryModal';
import OptionsMenu from './components/OptionsMenu';
import MenuBackgroundEffects from './components/MenuBackgroundEffects';

const App: React.FC = () => {
  const {
    gameStatus,
    words,
    typedWord,
    score,
    lives,
    startGame,
    resetGame,
    returnToMenu,
    returnToMenuFromPlaying,
    restartFromPlaying,
    particles,
    activeWord,
    currentSpeed,
    powerUps,
    activePowerUps,
    activatePowerUp,
    scorePopups,
    powerUpNotifications,
    handleAnimationComplete,
    gameInputRef,
    handleInputChange,
  } = useTypingGame();

  const [scoreHistory, setScoreHistory] = useState<ScoreHistoryEntry[]>([]);
  const [isScoreHistoryVisible, setIsScoreHistoryVisible] = useState(false);
  const [isOptionsVisible, setIsOptionsVisible] = useState(false);
  const [theme, setTheme] = useState('neon-pulse');

  const showScoreHistoryModal = () => setIsScoreHistoryVisible(true);
  const hideScoreHistoryModal = () => setIsScoreHistoryVisible(false);
  const showOptionsModal = () => setIsOptionsVisible(true);
  const hideOptionsModal = () => setIsOptionsVisible(false);

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    try {
      localStorage.setItem('neon-type-racer-theme', newTheme);
    } catch (error) {
      console.error("Failed to save theme:", error);
    }
  };

  // Load theme from localStorage on initial mount
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('neon-type-racer-theme');
      if (savedTheme) {
        setTheme(savedTheme);
      }
    } catch (error) {
      console.error("Failed to load theme:", error);
    }
  }, []);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Focus the hidden game input when the game starts
  useEffect(() => {
    if (gameStatus === GameStatus.Playing) {
      gameInputRef.current?.focus();
    } else {
      gameInputRef.current?.blur();
    }
  }, [gameStatus, gameInputRef]);

  // Load score history from localStorage on initial mount
  useEffect(() => {
    try {
      const savedScoresRaw = localStorage.getItem('neon-type-racer-scores');
      if (savedScoresRaw) {
        const savedScores = JSON.parse(savedScoresRaw);
        setScoreHistory(savedScores);
      }
    } catch (error) {
      console.error("Failed to load score history:", error);
    }
  }, []);

  // Save score to history when game is over
  useEffect(() => {
    if (gameStatus === GameStatus.GameOver && score > 0) {
      const newEntry: ScoreHistoryEntry = { score, date: Date.now() };
      setScoreHistory(prevHistory => {
        const updatedHistory = [...prevHistory, newEntry];
        try {
          localStorage.setItem('neon-type-racer-scores', JSON.stringify(updatedHistory));
        } catch (error) {
          console.error("Failed to save score history:", error);
        }
        return updatedHistory;
      });
    }
  }, [gameStatus, score]);
  
  // Handle game state transitions for menu and restart
  useEffect(() => {
    const transitionDuration = 700; // This should match the main transition duration
    if (gameStatus === GameStatus.ReturningToMenu || gameStatus === GameStatus.ReturningToMenuFromPlaying) {
      const timer = setTimeout(() => {
        resetGame(); // This returns to the main menu
      }, transitionDuration); 
      return () => clearTimeout(timer);
    } else if (gameStatus === GameStatus.Restarting) {
      // After the 'restarting' transition, start a new game
      const timer = setTimeout(() => {
        startGame(); // This resets state and starts a new game
      }, transitionDuration);
      return () => clearTimeout(timer);
    }
  }, [gameStatus, resetGame, startGame]);

  const handleContainerClick = () => {
    // If the game is playing, any click on the container should refocus the input.
    if (gameStatus === GameStatus.Playing) {
      gameInputRef.current?.focus();
    }
  };

  const isMenu = gameStatus === GameStatus.Ready;
  const gameHasStarted = gameStatus !== GameStatus.Ready;
  const isGameActiveOrOver = gameStatus === GameStatus.Playing || gameStatus === GameStatus.GameOver;
  const isGameScreenFocused = gameStatus !== GameStatus.Ready && gameStatus !== GameStatus.TransitioningToGame && gameStatus !== GameStatus.ReturningToMenu && gameStatus !== GameStatus.Restarting && gameStatus !== GameStatus.ReturningToMenuFromPlaying;
  
  const bgAnimationDuration = Math.max(0.5, 30 / currentSpeed);
  const bgSvg = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIj48ZGVmcz48cGF0dGVybiBpZD0icCIgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48Y2lyY2xlIGN4PSIyIiBjeT0iMiIgcj0iMSIgZmlsbD0icmdiYSg4MCwgNTAsIDE0MCwgMC4yKSIvPjwvcGF0dGVybi48L2RlZnM+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZhtPSIyMDAiIGZpbGw9InVybCgjcCkiLz48L3N2Zz4=";

  const isTimeWarpActive = activePowerUps.some(p => p.type === PowerUpType.TimeWarp);
  
  const powerUpSlotRefs = {
    [PowerUpType.TimeWarp]: useRef<HTMLDivElement>(null),
    [PowerUpType.ScoreSurge]: useRef<HTMLDivElement>(null),
    [PowerUpType.SystemShock]: useRef<HTMLDivElement>(null),
  };
  const gameScreenContainerRef = useRef<HTMLDivElement>(null);

  return (
    <div 
      className={`${gameHasStarted ? 'h-screen' : 'min-h-screen'} bg-gradient-to-b from-[var(--color-bg-start)] to-[var(--color-bg-end)] text-[var(--color-text-base)] font-mono overflow-hidden relative flex flex-col items-center p-4 ${isTimeWarpActive ? 'time-warp-effect' : ''}`}
      onClick={handleContainerClick}
    >
      <div 
        className="absolute top-0 left-0 w-full h-full bg-repeat background-grid-animated opacity-50 z-0"
        style={{ 
          backgroundImage: `url("${bgSvg}")`,
          animationDuration: `${bgAnimationDuration}s`
        }}
      ></div>

      {/* Menu Background Decorations */}
      <div className={`absolute inset-0 w-full h-full pointer-events-none transition-opacity duration-700 ${isMenu ? 'opacity-100' : 'opacity-0'}`}>
        <MenuBackgroundEffects />
      </div>

      {/* Hidden input to capture keyboard events for a native-like typing experience */}
      <input
        ref={gameInputRef}
        type="text"
        value={typedWord}
        onChange={handleInputChange}
        autoCapitalize="none"
        autoComplete="off"
        autoCorrect="off"
        spellCheck="false"
        className="absolute -top-full -left-full opacity-0 pointer-events-none"
        aria-hidden="true"
        tabIndex={-1}
      />
      
      <button
        onClick={returnToMenuFromPlaying}
        className={`absolute top-6 left-6 z-30 p-2 bg-[var(--color-ui-medium)] text-[var(--color-text-base)] rounded-lg shadow-[0_0_10px_rgba(100,116,139,0.5)] hover:bg-[var(--color-ui-light)] transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-light)]
                    ${gameStatus === GameStatus.Playing ? 'animate-fade-in' : 'opacity-0 pointer-events-none'}`}
        aria-label="Return to Menu"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
        </svg>
      </button>

      <button
        onClick={restartFromPlaying}
        className={`absolute top-6 right-6 z-30 px-4 py-2 bg-[var(--color-secondary)]/50 text-[var(--color-secondary-text-on-dark)] font-bold rounded-lg border-2 border-[var(--color-secondary-light)] shadow-[0_0_10px_var(--color-secondary)] hover:bg-[var(--color-secondary)]/70 hover:text-white transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-secondary-light)]
                    ${gameStatus === GameStatus.Playing ? 'animate-fade-in' : 'opacity-0 pointer-events-none'}`}
        aria-label="Restart Game"
      >
        Restart
      </button>

      {/* Unified Layout Container */}
      <div className="w-full max-w-5xl mx-auto flex flex-col items-center relative z-10 flex-grow">
        
        {/* Header section (moves up and scales) */}
        <div className={`text-center transition-all duration-700 ease-in-out ${gameHasStarted ? 'pt-4' : 'pt-24 md:pt-32'}`}>
          <h1 className="text-5xl font-bold text-[var(--color-primary-light)] tracking-widest transition-all duration-700" style={{ textShadow: '0 0 5px var(--color-primary-light), 0 0 15px var(--color-primary), 0 0 30px var(--color-primary), 2px 2px 4px rgba(0,0,0,0.3)' }}>
            typino.com
          </h1>
          <p className={`text-[var(--color-secondary-text-on-dark)] mt-2 mb-8 transition-opacity duration-500 ${isMenu ? 'opacity-100' : 'opacity-0'}`}>
            Type the falling words before they hit the bottom!
          </p>
        </div>

        {/* Controls Container (cross-fades between menu and game controls) */}
        <div className="relative w-full h-24">
          {/* Menu Controls (Start Button) */}
          <div className={`absolute inset-0 transition-opacity duration-500 ${isMenu ? 'opacity-100 z-20' : 'opacity-0 pointer-events-none z-10'}`}>
            <Controls
              gameStatus={GameStatus.Ready}
              score={score}
              lives={lives}
              onStart={startGame}
              powerUps={powerUps}
              activePowerUps={activePowerUps}
              onActivatePowerUp={activatePowerUp}
              onShowScoreHistory={showScoreHistoryModal}
              onShowOptions={showOptionsModal}
            />
          </div>

          {/* Game Controls (Stats Bar) */}
          <div className={`absolute inset-0 transition-opacity duration-700 ${isGameActiveOrOver ? 'opacity-100 z-20' : 'opacity-0 pointer-events-none z-10'}`}>
            <Controls
              gameStatus={gameStatus}
              score={score}
              lives={lives}
              onStart={startGame}
              powerUps={powerUps}
              activePowerUps={activePowerUps}
              onActivatePowerUp={activatePowerUp}
              powerUpSlotRefs={powerUpSlotRefs}
            />
          </div>
        </div>
        
        {/* Game Screen Container (comes into focus) */}
        <div ref={gameScreenContainerRef} className={`w-full flex-grow relative origin-top transition-all duration-700 ease-in-out ${isGameScreenFocused ? 'opacity-100 blur-0 scale-100' : 'opacity-50 blur-sm scale-90'}`}>
            <GameScreen 
              gameStatus={gameStatus}
              words={isMenu ? [] : words} 
              typedWord={isMenu ? '' : typedWord} 
              particles={isMenu ? [] : particles} 
              activeWord={isMenu ? null : activeWord} 
              scorePopups={isMenu ? [] : scorePopups} 
            />
        </div>

        {/* GameOver Overlay */}
        {(gameStatus === GameStatus.GameOver || gameStatus === GameStatus.ReturningToMenu) && (
          <div className={`absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex flex-col justify-center items-center z-20 ${gameStatus === GameStatus.ReturningToMenu ? 'animate-fade-out' : 'animate-fade-in'}`}>
            <div className="text-center p-8 rounded-xl border-2 border-[var(--color-danger)]/50 bg-slate-900/50 shadow-[inset_0_0_10px_rgba(0,0,0,0.6),0_0_5px_var(--color-danger-light),0_0_15px_var(--color-danger),5px_5px_20px_rgba(0,0,0,0.5)]">
              <h2 className="text-7xl font-bold text-[var(--color-danger-light)] animate-game-over-glow opacity-0 animate-fade-in-up animation-delay-200">GAME OVER</h2>
              <p className="text-xl mt-2 text-[var(--color-secondary-text-on-dark)] opacity-0 animate-fade-in-up animation-delay-300">Your race has ended.</p>
              <div className="mt-8 bg-black/20 p-4 rounded-lg opacity-0 animate-fade-in-up animation-delay-400">
                <p className="text-lg text-[var(--color-text-muted)]">Final Score</p>
                <p className="text-5xl mt-1 font-bold text-[var(--color-primary-light)]">{score.toLocaleString()}</p>
              </div>
              <div className="flex justify-center items-center gap-6 mt-10 opacity-0 animate-fade-in-up animation-delay-500">
                <button
                  onClick={returnToMenu}
                  className="px-8 py-3 bg-[var(--color-ui-medium)] text-[var(--color-text-base)] font-bold rounded-lg shadow-[inset_0_0_6px_rgba(0,0,0,0.8),2px_2px_10px_rgba(0,0,0,0.6)] hover:bg-[var(--color-ui-light)] hover:text-white transition-all duration-300 text-lg"
                >
                  Return to Menu
                </button>
                <button
                  onClick={startGame}
                  className="px-8 py-4 bg-[var(--color-primary)] text-[var(--color-text-dark)] font-bold rounded-lg shadow-[var(--shadow-primary)] hover:bg-[var(--color-primary-dark)] hover:scale-105 transition-all duration-300 text-xl"
                >
                  Play Again
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <PowerUpAnimationLayer 
        notifications={powerUpNotifications}
        onAnimationComplete={handleAnimationComplete}
      />

      <ScoreHistoryModal 
        isOpen={isScoreHistoryVisible}
        scores={scoreHistory}
        onClose={hideScoreHistoryModal}
      />

      <OptionsMenu
        isOpen={isOptionsVisible}
        onClose={hideOptionsModal}
        currentTheme={theme}
        onSetTheme={handleThemeChange}
      />
    </div>
  );
};

export default App;