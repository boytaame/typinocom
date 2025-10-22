import { PowerUpType } from "./types";

export const WORD_LIST = [
  "about", "above", "add", "after", "again", "air", "all", "almost", "along",
  "also", "always", "america", "an", "and", "animal", "another", "answer",
  "any", "are", "around", "as", "ask", "at", "away", "back", "be", "because",
  "been", "before", "began", "begin", "being", "below", "between", "big",
  "book", "both", "boy", "but", "by", "call", "came", "can", "car", "carry",
  "change", "children", "city", "close", "come", "could", "country", "cut",
  "day", "did", "different", "do", "does", "dont", "down", "each", "earth",
  "eat", "end", "enough", "even", "every", "example", "eye", "face", "fact",
  "family", "far", "father", "feet", "few", "find", "first", "follow",
  "food", "for", "form", "found", "four", "from", "get", "girl", "give", "go",
  "good", "got", "great", "group", "grow", "had", "hand", "hard", "has",
  "have", "he", "head", "hear", "help", "her", "here", "high", "him", "his",
  "home", "house", "how", "idea", "if", "important", "in", "indian", "into",
  "is", "it", "its", "just", "keep", "kind", "know", "land", "large", "last",
  "later", "learn", "leave", "left", "let", "letter", "life", "light",
  "like", "line", "list", "little", "live", "long", "look", "made", "make",
  "man", "many", "may", "me", "mean", "men", "might", "mile", "miss", "money",
  "more", "most", "mother", "move", "much", "must", "my", "name", "near",
  "need", "never", "new", "next", "night", "no", "not", "now", "number", "of",
  "off", "often", "oil", "old", "on", "once", "one", "only", "open", "or",
  "other", "our", "out", "over", "own", "page", "paper", "part", "people",
  "perhaps", "picture", "place", "plant", "play", "point", "port", "press",
  "pretty", "pull", "put", "queen", "question", "quick", "quickly", "quiet",
  "rain", "ran", "read", "real", "red", "right", "river", "road", "rock",
  "room", "run", "said", "same", "saw", "say", "school", "sea", "second",
  "see", "seem", "self", "sentence", "set", "she", "should", "show", "side",
  "since", "small", "so", "some", "something", "sometimes", "soon", "sound",
  "spell", "start", "state", "still", "stop", "story", "study", "such",
  "sun", "take", "talk", "tell", "than", "that", "the", "their", "them",
  "then", "there", "these", "they", "thing", "think", "this", "those",
  "thought", "three", "through", "time", "to", "together", "too", "took",
  "tree", "try", "turn", "two", "under", "until", "up", "us", "use",
  "usually", "very", "voice", "visit", "walk", "want", "war", "was",
  "watch", "water", "way", "we", "well", "went", "were", "what", "when",
  "where", "which", "while", "white", "who", "why", "will", "with",
  "without", "word", "work", "world", "would", "write", "year", "yellow",
  "yes", "yet", "you", "young", "your", "zero", "zoo"
];

export const LANES = 4;
export const INITIAL_SPEED = 1.6;
export const MAX_SPEED = 8;
export const SPEED_RAMP_UP_DURATION_MS = 180000; // 3 minutes
export const INITIAL_WORD_SPAWN_RATE_MS = 3500; // Start spawning one word every 3.5 seconds
export const MIN_WORD_SPAWN_RATE_MS = 2000; // Ramp up to one word every 2 seconds
export const SPAWN_RATE_RAMP_UP_DURATION_MS = 90000; // Ramp up over 90 seconds
export const BASE_FALL_RATE = 0.05;
export const INITIAL_LIVES = 5;
export const PARTICLES_PER_WORD = 12;
export const WORD_COMPLETE_ANIMATION_MS = 300;
export const TYPO_PENALTY = 5;

export const POWER_UP_ORDER: PowerUpType[] = [
  PowerUpType.TimeWarp,
  PowerUpType.ScoreSurge,
  PowerUpType.SystemShock,
];

export const POWER_UP_CONFIG = {
  [PowerUpType.TimeWarp]: {
    name: 'Time Warp',
    activationWord: 'slow',
    spawnChance: 0.03, // 3%
    duration: 8000, // 8 seconds
    fallRateMultiplier: 0.5,
  },
  [PowerUpType.ScoreSurge]: {
    name: 'Score Surge',
    activationWord: 'points',
    spawnChance: 0.03, // 3%
    duration: 10000, // 10 seconds
    scoreMultiplier: 2,
  },
  [PowerUpType.SystemShock]: {
    name: 'System Shock',
    activationWord: 'blast',
    spawnChance: 0.01, // 1%
    duration: 0, // Instant
  },
};