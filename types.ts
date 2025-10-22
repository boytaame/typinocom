export interface Word {
  id: number;
  text: string;
  x: number; // Lane index (0, 1, 2, ...)
  y: number; // Vertical position (0-100)
  status: 'falling' | 'completed';
}

export enum GameStatus {
  Ready,
  TransitioningToGame,
  Starting,
  Playing,
  GameOver,
  ReturningToMenuFromPlaying,
  ReturningToMenu,
  Restarting,
}

export interface Particle {
  id: number;
  x: number; // x position in %
  y: number; // y position in %
  vx: number; // velocity x
  vy: number; // velocity y
  opacity: number;
  size: number;
  color: string;
}

export enum PowerUpType {
  TimeWarp,
  ScoreSurge,
  SystemShock,
}

export interface ActivePowerUp {
  type: PowerUpType;
  timeLeft: number;
}

export interface ScorePopup {
  id: number;
  text: string;
  x: number; // %
  y: number; // %
  color: 'green' | 'red';
}

export interface PowerUpNotificationInfo {
  id: number;
  type: PowerUpType;
}

export interface ScoreHistoryEntry {
  score: number;
  date: number; // as timestamp
}