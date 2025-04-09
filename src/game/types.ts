
// Common types used across game files
export interface Position {
  x: number;
  y: number;
}

export interface Direction {
  x: number;
  y: number;
}

export interface PowerUpState {
  type: string;
  effect: string;
  timeLeft: number;
  startTime: number;
}

// Game types for Brain Runner
export interface Fact {
  id: string;
  date: string;
  content: string;
  category: string;
  collected: boolean;
}

export interface PlayerStats {
  streak: number;
  totalCollected: number;
  lastPlayed: string;
  highScore: number;
}

export interface GameState {
  isRunning: boolean;
  score: number;
  distance: number;
  speed: number;
  facts: Fact[];
  currentFact: Fact | null;
}

export interface Obstacle {
  x: number;
  y: number;
  width: number;
  height: number;
  type: string;
}

export interface Collectible {
  x: number;
  y: number;
  width: number;
  height: number;
  fact: Fact;
  collected: boolean;
}

export interface Character {
  x: number;
  y: number;
  width: number;
  height: number;
  velocityY: number;
  isJumping: boolean;
  frame: number;
}

export interface GameAssets {
  background: HTMLImageElement | null;
  ground: HTMLImageElement | null;
  character: HTMLImageElement | null;
  obstacles: Record<string, HTMLImageElement | null>;
  collectibles: Record<string, HTMLImageElement | null>;
  sounds: Record<string, HTMLAudioElement | null>;
}
