// Fix: Import React to resolve the "Cannot find namespace 'React'" error.
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Word, GameStatus, Particle, PowerUpType, ActivePowerUp, ScorePopup, PowerUpNotificationInfo } from '../types';
import {
  WORD_LIST,
  LANES,
  INITIAL_SPEED,
  MAX_SPEED,
  SPEED_RAMP_UP_DURATION_MS,
  INITIAL_WORD_SPAWN_RATE_MS,
  MIN_WORD_SPAWN_RATE_MS,
  SPAWN_RATE_RAMP_UP_DURATION_MS,
  BASE_FALL_RATE,
  INITIAL_LIVES,
  PARTICLES_PER_WORD,
  WORD_COMPLETE_ANIMATION_MS,
  POWER_UP_CONFIG,
  TYPO_PENALTY,
} from '../constants';

const useTypingGame = () => {
  const [gameStatus, setGameStatus] = useState<GameStatus>(GameStatus.Ready);
  const [words, setWords] = useState<Word[]>([]);
  const [typedWord, setTypedWord] = useState('');
  const [activeWord, setActiveWord] = useState<Word | null>(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(INITIAL_LIVES);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [currentSpeed, setCurrentSpeed] = useState(INITIAL_SPEED);
  const [powerUps, setPowerUps] = useState<Record<PowerUpType, number>>({
    [PowerUpType.TimeWarp]: 0,
    [PowerUpType.ScoreSurge]: 0,
    [PowerUpType.SystemShock]: 0,
  });
  const [activePowerUps, setActivePowerUps] = useState<ActivePowerUp[]>([]);
  const [scorePopups, setScorePopups] = useState<ScorePopup[]>([]);
  const [powerUpNotifications, setPowerUpNotifications] = useState<PowerUpNotificationInfo[]>([]);

  const animationFrameId = useRef<number | null>(null);
  const lastFrameTime = useRef<number>(0);
  const timeSinceLastSpawn = useRef<number>(0);
  const gameTimeElapsed = useRef<number>(0);
  const prevTypedWordRef = useRef('');
  const gameInputRef = useRef<HTMLInputElement>(null);

  const loopStateRef = useRef({ gameStatus, activeWord, activePowerUps, powerUps, words });
  useEffect(() => {
    loopStateRef.current = { gameStatus, activeWord, activePowerUps, powerUps, words };
  });

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow input during the 'Playing' state.
    if (loopStateRef.current.gameStatus === GameStatus.Playing) {
      setTypedWord(e.target.value.toLowerCase());
    }
  }, []);

  const createParticles = useCallback((word: Word) => {
    const laneWidth = 100 / LANES;
    const particleColors = ['#00ffff', '#7df9ff', '#ffffff'];
    const newParticles: Particle[] = Array.from({ length: PARTICLES_PER_WORD }).map((_, i) => {
        const angle = (i / PARTICLES_PER_WORD) * 2 * Math.PI + (Math.random() - 0.5) * 0.5;
        const velocity = Math.random() * 3 + 2;
        return {
            id: Math.random(),
            x: word.x * laneWidth + laneWidth / 2,
            y: word.y,
            vx: Math.cos(angle) * velocity * 0.25,
            vy: Math.sin(angle) * velocity * 0.25,
            opacity: 1,
            size: Math.random() * 4 + 2,
            color: particleColors[Math.floor(Math.random() * particleColors.length)],
        }
    });
    setParticles(prev => [...prev, ...newParticles]);
  }, []);

  const trySpawnPowerUp = useCallback((completedWord: Word) => {
    const rand = Math.random();
    let cumulativeChance = 0;
    for (const key in POWER_UP_CONFIG) {
      const type = Number(key) as PowerUpType;
      const config = POWER_UP_CONFIG[type as keyof typeof POWER_UP_CONFIG];
      cumulativeChance += config.spawnChance;
      if (rand < cumulativeChance) {
        setPowerUps(prev => ({ ...prev, [type]: prev[type] + 1 }));
        const newNotification: PowerUpNotificationInfo = {
            id: Math.random(),
            type: type,
        };
        setPowerUpNotifications(prev => [...prev, newNotification]);
        break; 
      }
    }
  }, []);
  
  const spawnWord = useCallback(() => {
    const { powerUps: currentPowerUps } = loopStateRef.current;
    setWords(prevWords => {
      const activeFirstLetters = new Set(prevWords.map(w => w.text[0]));

      const forbiddenFirstLetters = new Set<string>();
      if (currentPowerUps[PowerUpType.TimeWarp] > 0) forbiddenFirstLetters.add(POWER_UP_CONFIG[PowerUpType.TimeWarp].activationWord[0]);
      if (currentPowerUps[PowerUpType.ScoreSurge] > 0) forbiddenFirstLetters.add(POWER_UP_CONFIG[PowerUpType.ScoreSurge].activationWord[0]);
      if (currentPowerUps[PowerUpType.SystemShock] > 0) forbiddenFirstLetters.add(POWER_UP_CONFIG[PowerUpType.SystemShock].activationWord[0]);

      const availableWords = WORD_LIST.filter(w => !activeFirstLetters.has(w[0]) && !forbiddenFirstLetters.has(w[0]));
      
      if (availableWords.length === 0) return prevWords;

      const text = availableWords[Math.floor(Math.random() * availableWords.length)];
      const lane = Math.floor(Math.random() * LANES);

      const newWord: Word = {
        id: Date.now() + Math.random(),
        text,
        x: lane,
        y: 0,
        status: 'falling',
      };
      return [...prevWords, newWord];
    });
  }, []);
  
  const gameLoop = useCallback((timestamp: number) => {
    animationFrameId.current = requestAnimationFrame(gameLoop);

    const { gameStatus: currentStatus, activeWord: currentActiveWord, activePowerUps: currentActivePowerUps } = loopStateRef.current;
    
    if (currentStatus !== GameStatus.Playing) return;

    if (lastFrameTime.current === 0) {
      lastFrameTime.current = timestamp;
      return;
    }

    const deltaTime = timestamp - lastFrameTime.current;
    lastFrameTime.current = timestamp;
    const cappedDeltaTime = Math.min(deltaTime, 100);

    // Apply a time multiplier for the Time Warp power-up to slow the entire game down
    const isTimeWarpActive = currentActivePowerUps.some(p => p.type === PowerUpType.TimeWarp);
    const timeMultiplier = isTimeWarpActive ? POWER_UP_CONFIG[PowerUpType.TimeWarp].fallRateMultiplier : 1;
    const effectiveDeltaTime = cappedDeltaTime * timeMultiplier;

    // Game timer and speed ramp-up are now affected by the time multiplier
    gameTimeElapsed.current += effectiveDeltaTime;
    const speedRampUpProgress = Math.min(gameTimeElapsed.current / SPEED_RAMP_UP_DURATION_MS, 1);
    const calculatedSpeed = INITIAL_SPEED + (MAX_SPEED - INITIAL_SPEED) * speedRampUpProgress;
    setCurrentSpeed(calculatedSpeed);
    
    // Power-up durations should tick down in real-time, not game-time
    setActivePowerUps(prev => prev.map(p => ({ ...p, timeLeft: p.timeLeft - cappedDeltaTime })).filter(p => p.timeLeft > 0));

    // Word fall speed is now based on the effective (slowed) delta time
    setWords(prevWords => {
      return prevWords
        .map(word => ({ ...word, y: word.y + BASE_FALL_RATE * calculatedSpeed * (effectiveDeltaTime / 16) }))
        .filter(word => {
          if (word.y >= 100) { // Word is lost when it hits the bottom
            setLives(l => l - 1);
            if (currentActiveWord?.id === word.id) {
                setTypedWord('');
                setActiveWord(null);
            }
            return false;
          }
          return true;
        });
    });

    setParticles(prev => prev.map(p => ({
        ...p, x: p.x + p.vx, y: p.y + p.vy, opacity: p.opacity - 0.02,
    })).filter(p => p.opacity > 0));

    // Word spawn rate is also affected by the time multiplier
    timeSinceLastSpawn.current += effectiveDeltaTime;
    const rampUpProgress = Math.min(gameTimeElapsed.current / SPAWN_RATE_RAMP_UP_DURATION_MS, 1);
    const currentBaseSpawnRate = INITIAL_WORD_SPAWN_RATE_MS - (INITIAL_WORD_SPAWN_RATE_MS - MIN_WORD_SPAWN_RATE_MS) * rampUpProgress;
    const spawnRate = currentBaseSpawnRate / (calculatedSpeed * 0.5 + 0.5);

    if (timeSinceLastSpawn.current > spawnRate) {
      timeSinceLastSpawn.current = 0;
      spawnWord();
    }
  }, [spawnWord, createParticles]);

  const activatePowerUp = useCallback((type: PowerUpType) => {
    if (powerUps[type] <= 0) return;
  
    setPowerUps(prev => ({ ...prev, [type]: prev[type] - 1 }));
  
    if (type === PowerUpType.SystemShock) {
      setWords(prev => {
        const fallingWords = prev.filter(w => w.status === 'falling');
        fallingWords.forEach(w => {
            createParticles(w);
            setScore(s => s + w.text.length);
        });
        return prev.filter(w => w.status !== 'falling');
      });
      setActiveWord(null);
      setTypedWord('');
    } else {
      const config = POWER_UP_CONFIG[type as keyof typeof POWER_UP_CONFIG];
      setActivePowerUps(prev => {
          const otherPowerups = prev.filter(p => p.type !== type);
          return [...otherPowerups, { type, timeLeft: config.duration }];
      });
    }
  }, [powerUps, createParticles]);

  const handleAnimationComplete = useCallback((id: number) => {
    setPowerUpNotifications(prev => prev.filter(p => p.id !== id));
  }, []);
  
  const resetGame = useCallback(() => {
    setGameStatus(GameStatus.Ready);
    setWords([]);
    setTypedWord('');
    setActiveWord(null);
    setScore(0);
    setLives(INITIAL_LIVES);
    setParticles([]);
    setCurrentSpeed(INITIAL_SPEED);
    setPowerUps({ [PowerUpType.TimeWarp]: 0, [PowerUpType.ScoreSurge]: 0, [PowerUpType.SystemShock]: 0 });
    setActivePowerUps([]);
    setScorePopups([]);
    setPowerUpNotifications([]);
    lastFrameTime.current = 0;
    timeSinceLastSpawn.current = 0;
    gameTimeElapsed.current = 0;
  }, []);

  const returnToMenu = useCallback(() => {
    if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
        animationFrameId.current = null;
    }
    setGameStatus(GameStatus.ReturningToMenu);
  }, []);
  
  const returnToMenuFromPlaying = useCallback(() => {
    if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
        animationFrameId.current = null;
    }
    setGameStatus(GameStatus.ReturningToMenuFromPlaying);
  }, []);

  const restartFromPlaying = useCallback(() => {
    if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
        animationFrameId.current = null;
    }
    setGameStatus(GameStatus.Restarting);
  }, []);

  const startGame = useCallback(() => {
    setWords([]);
    setTypedWord('');
    setActiveWord(null);
    setScore(0);
    setLives(INITIAL_LIVES);
    setParticles([]);
    setCurrentSpeed(INITIAL_SPEED);
    setPowerUps({ [PowerUpType.TimeWarp]: 0, [PowerUpType.ScoreSurge]: 0, [PowerUpType.SystemShock]: 0 });
    setActivePowerUps([]);
    setScorePopups([]);
    setPowerUpNotifications([]);
    lastFrameTime.current = 0;
    timeSinceLastSpawn.current = 0;
    gameTimeElapsed.current = 0;
  
    setGameStatus(GameStatus.TransitioningToGame);
  
    setTimeout(() => {
      setGameStatus(GameStatus.Starting);
    }, 300);

    setTimeout(() => {
      setGameStatus(GameStatus.Playing);
      // The game loop will start running now, but we will manually spawn the first word.
    }, 300 + 400);

    // Schedule the first word to appear 2 seconds after the game starts.
    setTimeout(() => {
      spawnWord();
      // Reset the spawn timer to ensure the next word spawns after a normal delay.
      timeSinceLastSpawn.current = 0;
    }, 2000);
  }, [spawnWord]);
  
  useEffect(() => {
    if (gameStatus === GameStatus.Playing) {
        lastFrameTime.current = 0;
        timeSinceLastSpawn.current = 0;
        animationFrameId.current = requestAnimationFrame(gameLoop);
    } else if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
        animationFrameId.current = null;
    }
    return () => { if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current); }
  }, [gameStatus, gameLoop]);
  
  useEffect(() => {
    if (lives <= 0 && gameStatus === GameStatus.Playing) setGameStatus(GameStatus.GameOver);
  }, [lives, gameStatus]);
  
  // This is the main logic loop for handling user input.
  useEffect(() => {
    if (gameStatus !== GameStatus.Playing) {
      if (typedWord !== '') setTypedWord('');
      return;
    }

    // 1. Check for full Power-up Activation word match first. This is the highest priority.
    let powerUpActivated = false;
    for (const key in POWER_UP_CONFIG) {
        const type = Number(key) as PowerUpType;
        const config = POWER_UP_CONFIG[type as keyof typeof POWER_UP_CONFIG];
        if (powerUps[type] > 0 && typedWord === config.activationWord) {
            activatePowerUp(type);
            setTypedWord('');
            setActiveWord(null);
            powerUpActivated = true;
            break;
        }
    }
    if (powerUpActivated) return;


    // 2. Handle logic when a word is already active
    if (activeWord) {
      if (typedWord === activeWord.text) { // Word completed
        const scoreMultiplier = activePowerUps.some(p => p.type === PowerUpType.ScoreSurge) ? POWER_UP_CONFIG[PowerUpType.ScoreSurge].scoreMultiplier : 1;
        const pointsGained = activeWord.text.length * 10 * scoreMultiplier;
        setScore(s => s + pointsGained);
        
        const laneWidth = 100 / LANES;
        const newPopup: ScorePopup = {
            id: Math.random(),
            text: `+${pointsGained}`,
            x: activeWord.x * laneWidth + laneWidth / 2,
            y: activeWord.y,
            color: 'green',
        };
        setScorePopups(prev => [...prev, newPopup]);
        setTimeout(() => setScorePopups(prev => prev.filter(p => p.id !== newPopup.id)), 1500);

        const completedWord = activeWord;
        setWords(prev => prev.map(w => w.id === completedWord.id ? { ...w, status: 'completed' } : w));
        setTimeout(() => setWords(prev => prev.filter(w => w.id !== completedWord.id)), WORD_COMPLETE_ANIMATION_MS);

        createParticles(activeWord);
        trySpawnPowerUp(completedWord);
        setTypedWord('');
        setActiveWord(null);
      } else if (!activeWord.text.startsWith(typedWord) && typedWord.length > prevTypedWordRef.current.length) { // Typo
        setScore(s => Math.max(0, s - TYPO_PENALTY));
        const laneWidth = 100 / LANES;
        const newPopup: ScorePopup = {
            id: Math.random(),
            text: `-${TYPO_PENALTY}`,
            x: activeWord.x * laneWidth + laneWidth / 2,
            y: activeWord.y,
            color: 'red',
        };
        setScorePopups(prev => [...prev, newPopup]);
        setTimeout(() => setScorePopups(prev => prev.filter(p => p.id !== newPopup.id)), 1500);
      } else if (typedWord === '') { // User deleted all text
        setActiveWord(null);
      }
    } 
    // 3. Handle logic when NO word is active (try to find one or a power-up)
    else if (typedWord.length > 0) {
      // Prioritize power-up words. Check if the user is typing a prefix of an available power-up.
      const availableActivationWords = Object.entries(POWER_UP_CONFIG)
        .filter(([key]) => powerUps[Number(key) as PowerUpType] > 0)
        .map(([, config]) => config.activationWord);
      
      const isTypingPowerUpPrefix = availableActivationWords.some(w => w.startsWith(typedWord));

      if (isTypingPowerUpPrefix) {
        // User is potentially typing a power-up word. Do nothing and wait for more input.
        // Do not lock onto a regular word that might share the same prefix.
        return;
      }

      // If not typing a power-up, try to find a regular word to target.
      const targetWord = words.find(word => word.text.startsWith(typedWord) && word.status === 'falling');
      if (targetWord) {
          setActiveWord(targetWord);
      } else {
          // An invalid prefix was typed from a neutral state and it's not a power-up prefix.
          // This prevents the game from getting stuck with an unmatchable word.
          setTypedWord('');
      }
    }

  }, [typedWord, gameStatus, words, activeWord, powerUps, createParticles, trySpawnPowerUp, activatePowerUp, activePowerUps]);
  
  useEffect(() => {
    prevTypedWordRef.current = typedWord;
  });

  return { gameStatus, words, typedWord, score, lives, startGame, resetGame, returnToMenu, returnToMenuFromPlaying, restartFromPlaying, particles, activeWord, currentSpeed, powerUps, activePowerUps, activatePowerUp, scorePopups, powerUpNotifications, handleAnimationComplete, gameInputRef, handleInputChange };
};

export default useTypingGame;
