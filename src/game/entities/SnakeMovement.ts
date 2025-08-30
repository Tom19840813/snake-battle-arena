
import { Position, Direction } from '../types';
import { wouldCollide } from '../utils/pathfinding';

export class SnakeMovement {
  static setDirection(snake: any, newDirection: Direction) {
    // Prevent 180-degree turns unless we have the split ability active
    if (
      snake.body.length > 1 &&
      !snake.hasPowerUp("split") &&
      (snake.direction.x === -newDirection.x && snake.direction.y === 0 && newDirection.y === 0) ||
      (snake.direction.y === -newDirection.y && snake.direction.x === 0 && newDirection.x === 0)
    ) {
      return;
    }
    
    snake.direction = newDirection;
  }

  static move(snake: any, food: Position[]): boolean {
    if (!snake.isAlive) return false;
    
    // Update power-ups
    snake.updatePowerUps();
    
    // Calculate movement speed based on power-ups
    const speed = snake.hasPowerUp("speed") ? 2 : 1;
    
    let hasEatenFood = false;
    
    // For speed powerup, we move multiple steps per tick
    for (let i = 0; i < speed; i++) {
      const newHead = {
        x: snake.body[0].x + snake.direction.x,
        y: snake.body[0].y + snake.direction.y
      };
      
      // Food magnet power-up: attract nearby food
      if (snake.hasPowerUp("magnet")) {
        this.magnetizeFoodTowards(snake.body[0], food, snake.magnetRange);
      }

      // Check if eating food BEFORE any body manipulation
      const foodIndex = food.findIndex(f => f.x === newHead.x && f.y === newHead.y);
      const isEatingFood = foodIndex !== -1;

      if (isEatingFood) {
        snake.score += 10;
        hasEatenFood = true;
      }

      // Add new head first
      snake.body.unshift(newHead);
      
      // Only remove tail if NOT eating food
      if (!isEatingFood) {
        snake.body.pop();
      }
      
      // Only continue multi-step movement if not eating
      if (isEatingFood) {
        break;
      }
    }
    
    // Update split snake if it exists
    if (snake.splitSnake) {
      const splitAte = this.move(snake.splitSnake, food);
      if (splitAte) {
        snake.score += 5; // Half the points for split snake eating
      }
      
      // Remove split snake if it's dead
      if (!snake.splitSnake.isAlive) {
        snake.splitSnake = null;
      }
    }
    
    return hasEatenFood;
  }

  private static magnetizeFoodTowards(head: Position, food: Position[], range: number) {
    food.forEach(f => {
      const distance = Math.abs(f.x - head.x) + Math.abs(f.y - head.y);
      if (distance <= range) {
        if (f.x > head.x) f.x--;
        else if (f.x < head.x) f.x++;
        if (f.y > head.y) f.y--;
        else if (f.y < head.y) f.y++;
      }
    });
  }
}
