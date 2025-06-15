
import { Snake } from '../Snake';
import { Position } from '../types';
import { POWER_UPS } from '../GameAssets';

export class PowerUpManager {
  private gridSize: number;
  private powerUpSpawnInterval: number = 10000; // 10 seconds
  private lastPowerUpSpawn: number = 0;

  constructor(gridSize: number) {
    this.gridSize = gridSize;
  }

  updatePowerUps(
    powerUps: Position[],
    powerUpTypes: string[],
    food: Position[],
    snakes: Snake[]
  ) {
    // Spawn power-ups periodically
    const now = Date.now();
    if (now - this.lastPowerUpSpawn > this.powerUpSpawnInterval) {
      this.spawnPowerUp(powerUps, powerUpTypes, food, snakes);
      this.lastPowerUpSpawn = now;
    }
  }

  handlePowerUpPickup(
    snake: Snake,
    powerUps: Position[],
    powerUpTypes: string[]
  ) {
    if (!snake.isAlive) return;
    
    const powerUpIndex = powerUps.findIndex(
      p => p.x === snake.body[0].x && p.y === snake.body[0].y
    );
    
    if (powerUpIndex !== -1) {
      const powerUpType = powerUpTypes[powerUpIndex];
      const powerUp = POWER_UPS.find(p => p.id === powerUpType);
      
      if (powerUp) {
        snake.addPowerUp(powerUp.id, powerUp.effect, powerUp.duration);
      }
      
      // Remove the power-up
      powerUps.splice(powerUpIndex, 1);
      powerUpTypes.splice(powerUpIndex, 1);
    }
  }

  private spawnPowerUp(
    powerUps: Position[],
    powerUpTypes: string[],
    food: Position[],
    snakes: Snake[]
  ) {
    if (powerUps.length >= 3) return; // Max 3 power-ups at once
    
    const pos = this.getRandomPosition();
    
    // Check if position is valid (not on food or snake)
    const isValidPosition = !food.some(f => f.x === pos.x && f.y === pos.y) &&
                          !snakes.some(s => s.body.some(b => b.x === pos.x && b.y === pos.y)) &&
                          !powerUps.some(p => p.x === pos.x && p.y === pos.y);
    
    if (isValidPosition) {
      powerUps.push(pos);
      
      // Randomly select power-up type
      const powerUpIndex = Math.floor(Math.random() * POWER_UPS.length);
      powerUpTypes.push(POWER_UPS[powerUpIndex].id);
    }
  }

  private getRandomPosition(): Position {
    return {
      x: Math.floor(Math.random() * this.gridSize),
      y: Math.floor(Math.random() * this.gridSize)
    };
  }
}
