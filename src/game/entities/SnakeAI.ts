
import { Position } from '../types';
import { thinkBasic, thinkIntermediate, thinkAdvanced } from '../ai/snakeAI';

export class SnakeAI {
  static think(snake: any, food: Position[], otherSnakes: any[]) {
    if (!snake.isAlive || snake.isPlayerControlled) return;
    
    // Reset teleport flag
    snake.hasTeleported = false;
    
    // Update power-ups
    snake.updatePowerUps();
    
    // Use unique ability occasionally
    if (snake.uniqueAbility && Math.random() < 0.005) {
      snake.addPowerUp(snake.uniqueAbility, snake.uniqueAbility, 5);
    }

    // Different thinking strategies based on difficulty
    if (snake.difficulty === 1) {
      thinkBasic(snake, food, otherSnakes);
    } else if (snake.difficulty === 2) {
      thinkIntermediate(snake, food, otherSnakes);
    } else {
      thinkAdvanced(snake, food, otherSnakes);
    }
    
    // Update split snake if exists
    if (snake.splitSnake) {
      this.think(snake.splitSnake, food, [...otherSnakes, snake]);
    }
  }
}
