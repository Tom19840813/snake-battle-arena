
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
    
    console.log(`Snake move called - body length: ${snake.body.length}, direction: ${snake.direction.x},${snake.direction.y}`);
    
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
      
      console.log(`New head position: ${newHead.x},${newHead.y}`);
      
      // Food magnet power-up: attract nearby food
      if (snake.hasPowerUp("magnet")) {
        this.magnetizeFoodTowards(snake.body[0], food, snake.magnetRange);
      }

      // Check if eating food BEFORE any body manipulation
      const foodIndex = food.findIndex(f => f.x === newHead.x && f.y === newHead.y);
      const isEatingFood = foodIndex !== -1;
      
      console.log(`Food check - eating: ${isEatingFood}, food index: ${foodIndex}`);

      if (isEatingFood) {
        console.log(`Snake eating food! Score before: ${snake.score}`);
        snake.score += 10;
        hasEatenFood = true;
        console.log(`Score after eating: ${snake.score}`);
      }

      // Add new head first
      snake.body.unshift(newHead);
      console.log(`Body length after adding head: ${snake.body.length}`);
      
      // Only remove tail if NOT eating food
      if (!isEatingFood) {
        snake.body.pop();
        console.log(`Removed tail - body length now: ${snake.body.length}`);
      } else {
        console.log(`Did not remove tail because we ate food - body length: ${snake.body.length}`);
      }
      
      // Only continue multi-step movement if not eating
      if (isEatingFood) {
        console.log("Breaking movement loop because we ate food");
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
    
    console.log(`Move completed - ate food: ${hasEatenFood}, final body length: ${snake.body.length}`);
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
