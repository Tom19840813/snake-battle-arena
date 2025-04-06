
import { PowerUpState, Position, Direction } from '../types';
import { Snake } from '../Snake';

export function teleport(snake: Snake): void {
  if (snake.hasTeleported) return; // Prevent multiple teleports in a single tick
  
  const maxAttempts = 20;
  let attempts = 0;
  let newPos: Position | null = null;
  
  while (!newPos && attempts < maxAttempts) {
    const candidate = {
      x: Math.floor(Math.random() * snake.gridSize),
      y: Math.floor(Math.random() * snake.gridSize)
    };
    
    // Check if position is safe (not too close to other snakes)
    const isSafe = true; // Simplified check
    
    if (isSafe) {
      newPos = candidate;
    }
    attempts++;
  }
  
  if (newPos) {
    snake.body = [newPos];
    snake.hasTeleported = true;
  }
}

export function createSplitSnake(snake: Snake): void {
  if (snake.body.length < 4) return;
  
  // Take half of the current snake's body for the new one
  const splitPoint = Math.floor(snake.body.length / 2);
  const splitBody = snake.body.splice(splitPoint);
  
  // Use the last segment of the remaining body as the head of the split snake
  const splitHead = { ...splitBody[0] };
  
  // Create the split snake with the same properties as the parent
  snake.splitSnake = new Snake(
    splitHead,
    snake.color,
    snake.gridSize,
    false,
    snake.difficulty
  );
  
  // Assign the rest of the split body
  snake.splitSnake.body = splitBody;
  
  // Give it a slightly different direction
  snake.splitSnake.direction = { ...snake.direction };
  if (snake.direction.x !== 0) {
    snake.splitSnake.direction.y = Math.random() > 0.5 ? 1 : -1;
    snake.splitSnake.direction.x = 0;
  } else {
    snake.splitSnake.direction.x = Math.random() > 0.5 ? 1 : -1;
    snake.splitSnake.direction.y = 0;
  }
}

export function magnetizeFoodTowards(snake: Position, food: Position[], magnetRange: number): void {
  food.forEach(f => {
    const distance = Math.abs(f.x - snake.x) + Math.abs(f.y - snake.y);
    if (distance <= magnetRange) {
      // Move food slightly closer to snake head
      if (f.x < snake.x) f.x++;
      else if (f.x > snake.x) f.x--;
      
      if (f.y < snake.y) f.y++;
      else if (f.y > snake.y) f.y--;
    }
  });
}
