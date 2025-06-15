
import { Position, Direction, PowerUpState } from './types';
import { thinkBasic, thinkIntermediate, thinkAdvanced } from './ai/snakeAI';
import { wouldCollide } from './utils/pathfinding';
import { teleport, createSplitSnake, magnetizeFoodTowards } from './powers/powerUps';

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

  // Add a method to set difficulty
  setDifficulty(newDifficulty: number): void {
    this.difficulty = newDifficulty;
  }

  // Apply a skin to the snake
  applySkin(skinId: string, skinColor: string, pattern: string | undefined, glow: boolean | undefined) {
    this.skinId = skinId;
    this.color = skinColor;
    this.activePattern = pattern || null;
    this.glowEffect = glow || false;
  }

  // Add a power-up to the snake
  addPowerUp(powerUpId: string, effect: string, duration: number) {
    // Don't stack same power-ups, just refresh the timer
    const existingPowerUpIndex = this.activePowerUps.findIndex(p => p.effect === effect);
    
    if (existingPowerUpIndex >= 0) {
      this.activePowerUps[existingPowerUpIndex].timeLeft = duration;
      this.activePowerUps[existingPowerUpIndex].startTime = Date.now();
    } else {
      this.activePowerUps.push({
        type: powerUpId,
        effect,
        timeLeft: duration,
        startTime: Date.now()
      });
    }

    // Handle instant effects
    if (effect === "teleport") {
      teleport(this);
    } else if (effect === "split" && !this.splitSnake && this.body.length > 3) {
      createSplitSnake(this);
    }
  }

  // Update power-up timers
  updatePowerUps() {
    const now = Date.now();
    this.activePowerUps = this.activePowerUps.filter(powerUp => {
      const elapsedSeconds = (now - powerUp.startTime) / 1000;
      return elapsedSeconds < powerUp.timeLeft;
    });
  }

  // Check if a specific power-up is active
  hasPowerUp(effect: string): boolean {
    return this.activePowerUps.some(p => p.effect === effect);
  }

  think(food: Position[], otherSnakes: Snake[]) {
    if (!this.isAlive || this.isPlayerControlled) return;
    
    // Reset teleport flag
    this.hasTeleported = false;
    
    // Update power-ups
    this.updatePowerUps();
    
    // Use unique ability occasionally
    if (this.uniqueAbility && Math.random() < 0.005) {
      this.addPowerUp(this.uniqueAbility, this.uniqueAbility, 5);
    }

    // Different thinking strategies based on difficulty
    if (this.difficulty === 1) {
      thinkBasic(this, food, otherSnakes);
    } else if (this.difficulty === 2) {
      thinkIntermediate(this, food, otherSnakes);
    } else {
      thinkAdvanced(this, food, otherSnakes);
    }
    
    // Update split snake if exists
    if (this.splitSnake) {
      this.splitSnake.think(food, [...otherSnakes, this]);
    }
  }

  setDirection(newDirection: Direction) {
    // Prevent 180-degree turns unless we have the split ability active
    if (
      this.body.length > 1 &&
      !this.hasPowerUp("split") &&
      (this.direction.x === -newDirection.x && this.direction.y === 0 && newDirection.y === 0) ||
      (this.direction.y === -newDirection.y && this.direction.x === 0 && newDirection.x === 0)
    ) {
      return;
    }
    
    this.direction = newDirection;
  }

  move(food: Position[]): boolean {
    if (!this.isAlive) return false;
    
    console.log(`Snake move called - body length: ${this.body.length}, direction: ${this.direction.x},${this.direction.y}`);
    
    // Update power-ups
    this.updatePowerUps();
    
    // Calculate movement speed based on power-ups
    const speed = this.hasPowerUp("speed") ? 2 : 1;
    
    let hasEatenFood = false;
    
    // For speed powerup, we move multiple steps per tick
    for (let i = 0; i < speed; i++) {
      const newHead = {
        x: this.body[0].x + this.direction.x,
        y: this.body[0].y + this.direction.y
      };
      
      console.log(`New head position: ${newHead.x},${newHead.y}`);
      
      // Food magnet power-up: attract nearby food
      if (this.hasPowerUp("magnet")) {
        magnetizeFoodTowards(this.body[0], food, this.magnetRange);
      }

      // Check if eating food BEFORE any body manipulation
      const foodIndex = food.findIndex(f => f.x === newHead.x && f.y === newHead.y);
      const isEatingFood = foodIndex !== -1;
      
      console.log(`Food check - eating: ${isEatingFood}, food index: ${foodIndex}`);

      if (isEatingFood) {
        console.log(`Snake eating food! Score before: ${this.score}`);
        this.score += 10;
        hasEatenFood = true;
        console.log(`Score after eating: ${this.score}`);
      }

      // Add new head first
      this.body.unshift(newHead);
      console.log(`Body length after adding head: ${this.body.length}`);
      
      // Only remove tail if NOT eating food
      if (!isEatingFood) {
        this.body.pop();
        console.log(`Removed tail - body length now: ${this.body.length}`);
      } else {
        console.log(`Did not remove tail because we ate food - body length: ${this.body.length}`);
      }
      
      // Only continue multi-step movement if not eating
      if (isEatingFood) {
        console.log("Breaking movement loop because we ate food");
        break;
      }
    }
    
    // Update split snake if it exists
    if (this.splitSnake) {
      const splitAte = this.splitSnake.move(food);
      if (splitAte) {
        this.score += 5; // Half the points for split snake eating
      }
      
      // Remove split snake if it's dead
      if (!this.splitSnake.isAlive) {
        this.splitSnake = null;
      }
    }
    
    console.log(`Move completed - ate food: ${hasEatenFood}, final body length: ${this.body.length}`);
    return hasEatenFood;
  }
}
