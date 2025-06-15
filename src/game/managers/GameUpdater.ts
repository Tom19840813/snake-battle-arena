
import { Snake } from '../Snake';
import { Position } from '../types';
import { POWER_UPS } from '../GameAssets';

export class GameUpdater {
  private gridSize: number;
  private powerUpSpawnInterval: number = 10000; // 10 seconds
  private lastPowerUpSpawn: number = 0;
  private playerDeathDetected: boolean = false;

  constructor(gridSize: number) {
    this.gridSize = gridSize;
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
    // Spawn power-ups periodically
    const now = Date.now();
    if (now - this.lastPowerUpSpawn > this.powerUpSpawnInterval) {
      this.spawnPowerUp(powerUps, powerUpTypes, food, snakes);
      this.lastPowerUpSpawn = now;
    }

    if (isPlayerMode) {
      this.updateDifficultyBasedOnScore(snakes, difficulty);
    }

    // Update all snakes AI first
    snakes.forEach(snake => {
      if (!snake.isPlayer) {
        snake.think(food, snakes.filter(s => s !== snake));
      }
    });

    // Store which snakes ate food this frame for collision detection
    const snakesAtFood = new Map<Snake, boolean>();

    // Move snakes and check for food/power-up consumption FIRST
    snakes.forEach(snake => {
      if (!snake.isAlive) return;
      
      const ate = snake.move(food);
      snakesAtFood.set(snake, ate);
      
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
      if (snake.isAlive) {
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
    });

    // THEN check for collisions AFTER movement and food consumption
    this.checkCollisions(snakes, snakesAtFood);
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

  private updateDifficultyBasedOnScore(snakes: Snake[], difficulty: number) {
    const playerSnake = snakes.find(s => s.isPlayer);
    if (playerSnake && playerSnake.isAlive) {
      const score = playerSnake.score;
      let newDifficulty = 1;
      
      if (score >= 100) {
        newDifficulty = 3;  // Advanced
      } else if (score >= 50) {
        newDifficulty = 2;  // Intermediate
      }
      
      if (newDifficulty !== difficulty) {
        // Update existing snake difficulties
        snakes.forEach((snake, index) => {
          if (!snake.isPlayer) {
            const snakeDifficulty = index < 3 ? newDifficulty : Math.max(1, newDifficulty - 1);
            snake.setDifficulty(snakeDifficulty);
          }
        });
      }
    }
  }

  private checkCollisions(snakes: Snake[], snakesAtFood: Map<Snake, boolean>) {
    snakes.forEach(snake => {
      if (!snake.isAlive) return;
      
      const head = snake.body[0];
      const ateFood = snakesAtFood.get(snake) || false;
      
      console.log(`Collision check for snake - head: ${head.x},${head.y}, ate food: ${ateFood}, body length: ${snake.body.length}`);
      
      // Skip collision check if snake has shield
      if (snake.isPlayer && snake.hasPowerUp && snake.hasPowerUp("shield")) {
        return;
      }
      
      // Check wall collision
      if (head.x < 0 || head.x >= this.gridSize || head.y < 0 || head.y >= this.gridSize) {
        console.log("Snake died from wall collision");
        snake.isAlive = false;
        if (snake.isPlayer) {
          console.log("Player collision with wall detected!");
          this.playerDeathDetected = true;
        }
        return;
      }
      
      // Check self collision (skip head, start from index 1)
      // If snake just ate food, we need to be more careful with self-collision
      const startIndex = ateFood ? 2 : 1; // Skip more segments if just ate food
      for (let i = startIndex; i < snake.body.length; i++) {
        if (head.x === snake.body[i].x && head.y === snake.body[i].y) {
          console.log(`Snake died from self-collision at segment ${i}`);
          snake.isAlive = false;
          if (snake.isPlayer) {
            console.log("Player self-collision detected!");
            this.playerDeathDetected = true;
          }
          return;
        }
      }
      
      // Check collision with other snakes
      for (const otherSnake of snakes) {
        if (otherSnake === snake || !otherSnake.isAlive) continue;
        
        for (const segment of otherSnake.body) {
          if (head.x === segment.x && head.y === segment.y) {
            console.log("Snake died from collision with another snake");
            snake.isAlive = false;
            if (snake.isPlayer) {
              console.log("Player collision with other snake detected!");
              this.playerDeathDetected = true;
            }
            return;
          }
        }
      }
      
      console.log("Snake survived collision checks");
    });
  }
}
