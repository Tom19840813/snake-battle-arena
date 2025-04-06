
import { Position, Direction } from '../types';
import { Snake } from '../Snake';
import { 
  findClosestFood, 
  calculateDirection, 
  wouldCollide, 
  countOpenSpaces,
  findSortedFood,
  planPathToFood
} from '../utils/pathfinding';

export function thinkBasic(snake: Snake, food: Position[], otherSnakes: Snake[]): void {
  let closestFood = findClosestFood(snake, food);
  let newDirection = calculateDirection(snake.body[0], closestFood);

  // Check if the new direction would cause a collision
  const nextPos = {
    x: snake.body[0].x + newDirection.x,
    y: snake.body[0].y + newDirection.y
  };

  if (wouldCollide(nextPos, snake, otherSnakes, snake.gridSize)) {
    // Try to find an alternative direction
    const alternatives = [
      { x: 1, y: 0 },
      { x: -1, y: 0 },
      { x: 0, y: 1 },
      { x: 0, y: -1 }
    ];

    let foundSafeDirection = false;
    for (const alt of alternatives) {
      const altPos = {
        x: snake.body[0].x + alt.x,
        y: snake.body[0].y + alt.y
      };
      if (!wouldCollide(altPos, snake, otherSnakes, snake.gridSize)) {
        newDirection = alt;
        foundSafeDirection = true;
        break;
      }
    }

    // If no safe direction is found, mark snake as dead
    if (!foundSafeDirection) {
      snake.isAlive = false;
      return;
    }
  }

  snake.direction = newDirection;
}

export function thinkIntermediate(snake: Snake, food: Position[], otherSnakes: Snake[]): void {
  let closestFood = findClosestFood(snake, food);
  let newDirection = calculateDirection(snake.body[0], closestFood);
  
  // Look 2 steps ahead for collisions
  const nextPos = {
    x: snake.body[0].x + newDirection.x,
    y: snake.body[0].y + newDirection.y
  };
  
  const twoStepsAhead = {
    x: nextPos.x + newDirection.x,
    y: nextPos.y + newDirection.y
  };
  
  // Check current step and two steps ahead
  if (wouldCollide(nextPos, snake, otherSnakes, snake.gridSize) || 
      wouldCollide(twoStepsAhead, snake, otherSnakes, snake.gridSize)) {
    // Consider all possible directions and pick the safest
    const alternatives = [
      { x: 1, y: 0 },
      { x: -1, y: 0 },
      { x: 0, y: 1 },
      { x: 0, y: -1 }
    ];

    let bestDirection = null;
    let maxSafePath = -1;
    
    for (const alt of alternatives) {
      // Skip if it's a 180-degree turn
      if (alt.x === -snake.direction.x && alt.y === 0 && snake.body.length > 1) {
        continue;
      }
      
      const altPos = {
        x: snake.body[0].x + alt.x,
        y: snake.body[0].y + alt.y
      };
      
      if (!wouldCollide(altPos, snake, otherSnakes, snake.gridSize)) {
        // Look for how many steps we can go safely
        let steps = 1;
        let currentPos = altPos;
        
        while (steps < 3) {
          const nextStepPos = {
            x: currentPos.x + alt.x,
            y: currentPos.y + alt.y
          };
          
          if (wouldCollide(nextStepPos, snake, otherSnakes, snake.gridSize)) {
            break;
          }
          
          currentPos = nextStepPos;
          steps++;
        }
        
        // Prioritize directions that lead to food
        const distanceToFood = Math.abs(altPos.x - closestFood.x) + Math.abs(altPos.y - closestFood.y);
        const safetyScore = steps * 3 - distanceToFood;
        
        if (safetyScore > maxSafePath) {
          maxSafePath = safetyScore;
          bestDirection = alt;
        }
      }
    }
    
    if (bestDirection) {
      newDirection = bestDirection;
    } else {
      // Fall back to basic thinking if no good direction found
      thinkBasic(snake, food, otherSnakes);
      return;
    }
  }
  
  snake.direction = newDirection;
}

export function thinkAdvanced(snake: Snake, food: Position[], otherSnakes: Snake[]): void {
  // Find all food, not just closest
  const sortedFood = findSortedFood(snake, food);
  
  if (sortedFood.length === 0) {
    thinkIntermediate(snake, food, otherSnakes);
    return;
  }
  
  // Consider multiple food options and choose the safest path
  for (const foodItem of sortedFood.slice(0, 3)) { // Consider top 3 closest food items
    // Plan a rough path to the food
    const pathToFood = planPathToFood(snake, foodItem, otherSnakes, snake.gridSize);
    
    if (pathToFood.length > 0) {
      // Use the first step of the path
      const firstStep = pathToFood[0];
      snake.direction = {
        x: firstStep.x - snake.body[0].x,
        y: firstStep.y - snake.body[0].y
      };
      return;
    }
  }
  
  // If no path found to any food, try to survive
  // Check all four directions
  const alternatives = [
    { x: 1, y: 0 },
    { x: -1, y: 0 },
    { x: 0, y: 1 },
    { x: 0, y: -1 }
  ];
  
  // Filter out the 180-degree turn
  const validAlternatives = alternatives.filter(alt => 
    !(alt.x === -snake.direction.x && alt.y === -snake.direction.y && snake.body.length > 1)
  );
  
  // Find direction with most open space
  let bestDirection = null;
  let mostOpenSpace = -1;
  
  for (const alt of validAlternatives) {
    const nextPos = {
      x: snake.body[0].x + alt.x,
      y: snake.body[0].y + alt.y
    };
    
    if (!wouldCollide(nextPos, snake, otherSnakes, snake.gridSize)) {
      const openSpace = countOpenSpaces(nextPos, snake, otherSnakes, snake.gridSize);
      if (openSpace > mostOpenSpace) {
        mostOpenSpace = openSpace;
        bestDirection = alt;
      }
    }
  }
  
  if (bestDirection) {
    snake.direction = bestDirection;
  } else {
    // Fall back to intermediate thinking if no good direction found
    thinkIntermediate(snake, food, otherSnakes);
  }
}
