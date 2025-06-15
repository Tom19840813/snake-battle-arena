
import { Snake } from '../Snake';
import { Position } from '../types';
import { CollisionManager } from './CollisionManager';
import { PowerUpManager } from './PowerUpManager';
import { DifficultyManager } from './DifficultyManager';

export class GameUpdater {
  private collisionManager: CollisionManager;
  private powerUpManager: PowerUpManager;
  private difficultyManager: DifficultyManager;

  constructor(gridSize: number) {
    this.collisionManager = new CollisionManager(gridSize);
    this.powerUpManager = new PowerUpManager(gridSize);
    this.difficultyManager = new DifficultyManager();
  }

  update(
    snakes: Snake[],
    food: Position[],
    powerUps: Position[],
    powerUpTypes: string[],
    isPlayerMode: boolean,
    difficulty: number,
    spawnFood: () => void
  ) {
    // Update power-ups
    this.powerUpManager.updatePowerUps(powerUps, powerUpTypes, food, snakes);

    if (isPlayerMode) {
      this.difficultyManager.updateDifficultyBasedOnScore(snakes, difficulty);
    }

    // Check collisions BEFORE any movement or food consumption
    this.collisionManager.checkCollisions(snakes);

    // Move snakes and check for food/power-up consumption AFTER collision check
    snakes.forEach(snake => {
      if (!snake.isAlive) return;
      
      const ate = snake.move(food);
      
      if (ate) {
        const foodIndex = food.findIndex(
          f => f.x === snake.body[0].x && f.y === snake.body[0].y
        );
        if (foodIndex !== -1) {
          food.splice(foodIndex, 1);
          spawnFood();
        }
      }
      
      // Check for power-up pickup
      this.powerUpManager.handlePowerUpPickup(snake, powerUps, powerUpTypes);
    });
  }
}
