
import { Snake } from '../Snake';

export class CollisionManager {
  private gridSize: number;
  private playerDeathDetected: boolean = false;

  constructor(gridSize: number) {
    this.gridSize = gridSize;
  }

  checkCollisions(snakes: Snake[]) {
    snakes.forEach(snake => {
      if (!snake.isAlive) return;
      
      const head = snake.body[0];
      if (!head) return; // Safety check for empty body
      
      // Skip collision check if snake has shield
      if (snake.isPlayer && snake.hasPowerUp && snake.hasPowerUp("shield")) {
        return;
      }
      
      // Check wall collision
      if (head.x < 0 || head.x >= this.gridSize || head.y < 0 || head.y >= this.gridSize) {
        snake.isAlive = false;
        if (snake.isPlayer) {
          this.playerDeathDetected = true;
        }
        return;
      }
      
      // Improved self collision check - skip more segments if snake is long
      // This prevents false positives when the snake is growing or moving in tight patterns
      const minSegmentsToSkip = Math.max(2, Math.min(4, Math.floor(snake.body.length / 10)));
      for (let i = minSegmentsToSkip; i < snake.body.length; i++) {
        if (head.x === snake.body[i].x && head.y === snake.body[i].y) {
          snake.isAlive = false;
          if (snake.isPlayer) {
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
            snake.isAlive = false;
            if (snake.isPlayer) {
              this.playerDeathDetected = true;
            }
            return;
          }
        }
      }
    });
  }

  isPlayerDeathDetected(): boolean {
    return this.playerDeathDetected;
  }

  resetPlayerDeathFlag(): void {
    this.playerDeathDetected = false;
  }
}
