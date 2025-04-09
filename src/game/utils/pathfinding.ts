import { Position, Direction } from '../types';
import { Snake } from '../Snake';

// Pathfinding utility functions
export function manhattanDistance(a: Position, b: Position): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

export function planPathToFood(
  snake: Snake, 
  target: Position, 
  otherSnakes: Snake[], 
  gridSize: number
): Position[] {
  // Simple A* pathfinding implementation
  const start = snake.body[0];
  const openSet: Position[] = [start];
  const cameFrom = new Map<string, Position>();
  
  const gScore = new Map<string, number>();
  const fScore = new Map<string, number>();
  
  const posKey = (pos: Position) => `${pos.x},${pos.y}`;
  
  gScore.set(posKey(start), 0);
  fScore.set(posKey(start), manhattanDistance(start, target));
  
  const maxIterations = 100; // Prevent long pathfinding operations
  let iterations = 0;
  
  while (openSet.length > 0 && iterations < maxIterations) {
    iterations++;
    
    // Find position with lowest fScore
    let current = openSet[0];
    let lowestFScore = fScore.get(posKey(current)) || Infinity;
    
    for (let i = 1; i < openSet.length; i++) {
      const fScoreI = fScore.get(posKey(openSet[i])) || Infinity;
      if (fScoreI < lowestFScore) {
        lowestFScore = fScoreI;
        current = openSet[i];
      }
    }
    
    // Check if we reached the target
    if (current.x === target.x && current.y === target.y) {
      // Reconstruct path
      const path = [current];
      let currentKey = posKey(current);
      
      while (cameFrom.has(currentKey)) {
        current = cameFrom.get(currentKey)!;
        path.unshift(current);
        currentKey = posKey(current);
      }
      
      // Return path without the starting position
      return path.slice(1);
    }
    
    // Remove current from openSet
    openSet.splice(openSet.indexOf(current), 1);
    
    // Consider neighbors
    const neighbors = [
      { x: current.x + 1, y: current.y },
      { x: current.x - 1, y: current.y },
      { x: current.x, y: current.y + 1 },
      { x: current.x, y: current.y - 1 }
    ];
    
    for (const neighbor of neighbors) {
      // Check boundaries and collisions
      if (
        neighbor.x < 0 || neighbor.x >= gridSize ||
        neighbor.y < 0 || neighbor.y >= gridSize ||
        wouldCollide(neighbor, snake, otherSnakes, gridSize, false)
      ) {
        continue;
      }
      
      // Calculate tentative gScore
      const tentativeGScore = (gScore.get(posKey(current)) || Infinity) + 1;
      
      if (tentativeGScore < (gScore.get(posKey(neighbor)) || Infinity)) {
        // This path is better
        cameFrom.set(posKey(neighbor), current);
        gScore.set(posKey(neighbor), tentativeGScore);
        fScore.set(posKey(neighbor), tentativeGScore + manhattanDistance(neighbor, target));
        
        // Add to openSet if not there
        if (!openSet.some(pos => pos.x === neighbor.x && pos.y === neighbor.y)) {
          openSet.push(neighbor);
        }
      }
    }
  }
  
  // No path found
  return [];
}

export function findSortedFood(snake: Snake, food: Position[]): Position[] {
  return [...food].sort((a, b) => {
    const distA = manhattanDistance(snake.body[0], a);
    const distB = manhattanDistance(snake.body[0], b);
    return distA - distB;
  });
}

export function findClosestFood(snake: Snake, food: Position[]): Position {
  if (food.length === 0) {
    return { x: 0, y: 0 }; // Default position if no food
  }
  
  let closest = food[0];
  let minDistance = Number.MAX_VALUE;

  food.forEach(f => {
    const distance = manhattanDistance(snake.body[0], f);
    if (distance < minDistance) {
      minDistance = distance;
      closest = f;
    }
  });

  return closest;
}

export function calculateDirection(snake: Position, target: Position): Direction {
  const dx = target.x - snake.x;
  const dy = target.y - snake.y;

  if (Math.abs(dx) > Math.abs(dy)) {
    return { x: Math.sign(dx), y: 0 };
  } else {
    return { x: 0, y: Math.sign(dy) };
  }
}

export function countOpenSpaces(
  pos: Position, 
  snake: Snake,
  otherSnakes: Snake[], 
  gridSize: number, 
  maxCount: number = 30
): number {
  const visited = new Set<string>();
  const toVisit: Position[] = [pos];
  
  while (toVisit.length > 0 && visited.size < maxCount) {
    const current = toVisit.shift()!;
    const key = `${current.x},${current.y}`;
    
    if (visited.has(key)) continue;
    
    // Check boundaries and collisions
    if (
      current.x < 0 || current.x >= gridSize ||
      current.y < 0 || current.y >= gridSize ||
      snake.body.some(segment => segment.x === current.x && segment.y === current.y) ||
      otherSnakes.some(s => 
        s.isAlive && s.body.some(segment => 
          segment.x === current.x && segment.y === current.y
        )
      )
    ) {
      continue;
    }
    
    visited.add(key);
    
    // Add adjacent positions
    toVisit.push({ x: current.x + 1, y: current.y });
    toVisit.push({ x: current.x - 1, y: current.y });
    toVisit.push({ x: current.x, y: current.y + 1 });
    toVisit.push({ x: current.x, y: current.y - 1 });
  }
  
  return visited.size;
}

export function wouldCollide(
  nextPos: Position, 
  snake: Snake,
  otherSnakes: Snake[], 
  gridSize: number,
  checkShield: boolean = true
): boolean {
  // If we have a shield power-up, we don't collide with other snakes
  if (checkShield && snake.hasPowerUp("shield")) {
    // Only check for wall collisions
    return (
      nextPos.x < 0 ||
      nextPos.x >= gridSize ||
      nextPos.y < 0 ||
      nextPos.y >= gridSize
    );
  }
  
  // Check walls
  if (
    nextPos.x < 0 ||
    nextPos.x >= gridSize ||
    nextPos.y < 0 ||
    nextPos.y >= gridSize
  ) {
    return true;
  }

  // Check self collision with entire body
  if (snake.body.some(segment => segment.x === nextPos.x && segment.y === nextPos.y)) {
    return true;
  }

  // Check other snakes collision with entire body
  return otherSnakes.some(otherSnake => {
    if (!otherSnake.isAlive) return false;
    
    // Skip collision check with invisible snakes
    if (otherSnake.hasPowerUp("invisible") && Math.random() < 0.7) {
      return false;
    }
    
    return otherSnake.body.some(segment => {
      // Check if we would collide with any part of the other snake's body
      const wouldCollide = segment.x === nextPos.x && segment.y === nextPos.y;
      
      // Check if we would cross paths (snake moving in opposite directions)
      const headToHead = otherSnake.body[0].x === nextPos.x && 
                        otherSnake.body[0].y === nextPos.y;
      
      return wouldCollide || headToHead;
    });
  });
}
