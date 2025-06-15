
import { Position, Direction, PowerUpState } from '../types';
import { SnakeMovement } from './SnakeMovement';
import { SnakePowerUps } from './SnakePowerUps';
import { SnakeAI } from './SnakeAI';
import { SnakeVisuals } from './SnakeVisuals';

export class Snake {
  public body: Position[];
  public direction: Direction;
  public score: number;
  public isAlive: boolean;
  public color: string;
  public gridSize: number;
  public isPlayerControlled: boolean;
  public difficulty: number;
  public skinId: string = "default";
  public activePattern: string | null = null;
  public glowEffect: boolean = false;
  public activePowerUps: PowerUpState[] = [];
  public uniqueAbility: string | null = null;
  public hasTeleported: boolean = false;
  public splitSnake: Snake | null = null;
  private baseSpeed: number = 1;
  private magnetRange: number = 5;
  
  // Alias property for compatibility with GameBoard.ts
  get isPlayer(): boolean {
    return this.isPlayerControlled;
  }

  constructor(startPos: Position, color: string, gridSize: number, isPlayerControlled: boolean = false, difficulty: number = 1) {
    this.body = [startPos];
    this.direction = { x: 0, y: 0 };
    this.score = 0;
    this.isAlive = true;
    this.color = color;
    this.gridSize = gridSize;
    this.isPlayerControlled = isPlayerControlled;
    this.difficulty = difficulty;
    
    // Assign a random unique ability to AI snakes
    if (!isPlayerControlled && Math.random() < 0.3) {
      const abilities = ["teleport", "split", "magnet"];
      this.uniqueAbility = abilities[Math.floor(Math.random() * abilities.length)];
    }
  }

  // Delegate methods to specialized classes
  setDifficulty(newDifficulty: number): void {
    SnakeVisuals.setDifficulty(this, newDifficulty);
  }

  applySkin(skinId: string, skinColor: string, pattern: string | undefined, glow: boolean | undefined) {
    SnakeVisuals.applySkin(this, skinId, skinColor, pattern, glow);
  }

  addPowerUp(powerUpId: string, effect: string, duration: number) {
    SnakePowerUps.addPowerUp(this, powerUpId, effect, duration);
  }

  updatePowerUps() {
    SnakePowerUps.updatePowerUps(this);
  }

  hasPowerUp(effect: string): boolean {
    return SnakePowerUps.hasPowerUp(this, effect);
  }

  think(food: Position[], otherSnakes: Snake[]) {
    SnakeAI.think(this, food, otherSnakes);
  }

  setDirection(newDirection: Direction) {
    SnakeMovement.setDirection(this, newDirection);
  }

  move(food: Position[]): boolean {
    return SnakeMovement.move(this, food);
  }
}
