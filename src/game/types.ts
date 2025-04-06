
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
