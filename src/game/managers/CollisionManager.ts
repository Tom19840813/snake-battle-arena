
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
      
      console.log(`Pre-move collision check for snake - head: ${head.x},${head.y}, body length: ${snake.body.length}`);
      
      // Skip collision check if snake has shield
      if (snake.isPlayer && snake.hasPowerUp && snake.hasPowerUp("shield")) {
        console.log("Snake has shield, skipping collision check");
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
      
      // Improved self collision check - skip more segments if snake is long
      // This prevents false positives when the snake is growing or moving in tight patterns
      const minSegmentsToSkip = Math.max(2, Math.min(4, Math.floor(snake.body.length / 10)));
      for (let i = minSegmentsToSkip; i < snake.body.length; i++) {
        if (head.x === snake.body[i].x && head.y === snake.body[i].y) {
          console.log(`Snake died from self-collision at segment ${i}, skipped ${minSegmentsToSkip} segments`);
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
      
      console.log("Snake survived pre-move collision checks");
    });
  }
}
