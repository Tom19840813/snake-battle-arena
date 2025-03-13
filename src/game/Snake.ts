
export interface Position {
  x: number;
  y: number;
}

export interface Direction {
  x: number;
  y: number;
}

export class Snake {
  public body: Position[];
  public direction: Direction;
  public score: number;
  public isAlive: boolean;
  public color: string;
  private gridSize: number;
  public isPlayerControlled: boolean;
  public difficulty: number;

  constructor(startPos: Position, color: string, gridSize: number, isPlayerControlled: boolean = false, difficulty: number = 1) {
    this.body = [startPos];
    this.direction = { x: 0, y: 0 };
    this.score = 0;
    this.isAlive = true;
    this.color = color;
    this.gridSize = gridSize;
    this.isPlayerControlled = isPlayerControlled;
    this.difficulty = difficulty;
  }

  think(food: Position[], otherSnakes: Snake[]) {
    if (!this.isAlive || this.isPlayerControlled) return;

    // Different thinking strategies based on difficulty
    if (this.difficulty === 1) {
      this.thinkBasic(food, otherSnakes);
    } else if (this.difficulty === 2) {
      this.thinkIntermediate(food, otherSnakes);
    } else {
      this.thinkAdvanced(food, otherSnakes);
    }
  }

  // Basic AI: Just find closest food, minimal obstacle avoidance
  private thinkBasic(food: Position[], otherSnakes: Snake[]) {
    let closestFood = this.findClosestFood(food);
    let newDirection = this.calculateDirection(closestFood);

    // Check if the new direction would cause a collision
    const nextPos = {
      x: this.body[0].x + newDirection.x,
      y: this.body[0].y + newDirection.y
    };

    if (this.wouldCollide(nextPos, otherSnakes)) {
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
          x: this.body[0].x + alt.x,
          y: this.body[0].y + alt.y
        };
        if (!this.wouldCollide(altPos, otherSnakes)) {
          newDirection = alt;
          foundSafeDirection = true;
          break;
        }
      }

      // If no safe direction is found, mark snake as dead
      if (!foundSafeDirection) {
        this.isAlive = false;
        return;
      }
    }

    this.direction = newDirection;
  }

  // Intermediate AI: Looks further ahead to avoid obstacles
  private thinkIntermediate(food: Position[], otherSnakes: Snake[]) {
    let closestFood = this.findClosestFood(food);
    let newDirection = this.calculateDirection(closestFood);
    
    // Look 2 steps ahead for collisions
    const nextPos = {
      x: this.body[0].x + newDirection.x,
      y: this.body[0].y + newDirection.y
    };
    
    const twoStepsAhead = {
      x: nextPos.x + newDirection.x,
      y: nextPos.y + newDirection.y
    };
    
    // Check current step and two steps ahead
    if (this.wouldCollide(nextPos, otherSnakes) || this.wouldCollide(twoStepsAhead, otherSnakes)) {
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
        if (alt.x === -this.direction.x && alt.y === -this.direction.y && this.body.length > 1) {
          continue;
        }
        
        const altPos = {
          x: this.body[0].x + alt.x,
          y: this.body[0].y + alt.y
        };
        
        if (!this.wouldCollide(altPos, otherSnakes)) {
          // Look for how many steps we can go safely
          let steps = 1;
          let currentPos = altPos;
          
          while (steps < 3) {
            const nextStepPos = {
              x: currentPos.x + alt.x,
              y: currentPos.y + alt.y
            };
            
            if (this.wouldCollide(nextStepPos, otherSnakes)) {
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
        this.thinkBasic(food, otherSnakes);
        return;
      }
    }
    
    this.direction = newDirection;
  }

  // Advanced AI: Uses more sophisticated path planning, targets food more effectively
  private thinkAdvanced(food: Position[], otherSnakes: Snake[]) {
    // Find all food, not just closest
    const sortedFood = this.findSortedFood(food);
    
    if (sortedFood.length === 0) {
      this.thinkIntermediate(food, otherSnakes);
      return;
    }
    
    // Consider multiple food options and choose the safest path
    for (const foodItem of sortedFood.slice(0, 3)) { // Consider top 3 closest food items
      // Plan a rough path to the food
      const pathToFood = this.planPathToFood(foodItem, otherSnakes);
      
      if (pathToFood.length > 0) {
        // Use the first step of the path
        const firstStep = pathToFood[0];
        this.direction = {
          x: firstStep.x - this.body[0].x,
          y: firstStep.y - this.body[0].y
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
      !(alt.x === -this.direction.x && alt.y === -this.direction.y && this.body.length > 1)
    );
    
    // Find direction with most open space
    let bestDirection = null;
    let mostOpenSpace = -1;
    
    for (const alt of validAlternatives) {
      const nextPos = {
        x: this.body[0].x + alt.x,
        y: this.body[0].y + alt.y
      };
      
      if (!this.wouldCollide(nextPos, otherSnakes)) {
        const openSpace = this.countOpenSpaces(nextPos, otherSnakes);
        if (openSpace > mostOpenSpace) {
          mostOpenSpace = openSpace;
          bestDirection = alt;
        }
      }
    }
    
    if (bestDirection) {
      this.direction = bestDirection;
    } else {
      // Fall back to intermediate thinking if no good direction found
      this.thinkIntermediate(food, otherSnakes);
    }
  }
  
  // Count open spaces in a flood fill manner
  private countOpenSpaces(pos: Position, otherSnakes: Snake[], maxCount: number = 30): number {
    const visited = new Set<string>();
    const toVisit: Position[] = [pos];
    
    while (toVisit.length > 0 && visited.size < maxCount) {
      const current = toVisit.shift()!;
      const key = `${current.x},${current.y}`;
      
      if (visited.has(key)) continue;
      
      // Check boundaries and collisions
      if (
        current.x < 0 || current.x >= this.gridSize ||
        current.y < 0 || current.y >= this.gridSize ||
        this.body.some(segment => segment.x === current.x && segment.y === current.y) ||
        otherSnakes.some(snake => 
          snake.isAlive && snake.body.some(segment => 
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
  
  private planPathToFood(target: Position, otherSnakes: Snake[]): Position[] {
    // Simple A* pathfinding implementation
    const start = this.body[0];
    const openSet: Position[] = [start];
    const cameFrom = new Map<string, Position>();
    
    const gScore = new Map<string, number>();
    const fScore = new Map<string, number>();
    
    const posKey = (pos: Position) => `${pos.x},${pos.y}`;
    
    gScore.set(posKey(start), 0);
    fScore.set(posKey(start), this.manhattanDistance(start, target));
    
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
          neighbor.x < 0 || neighbor.x >= this.gridSize ||
          neighbor.y < 0 || neighbor.y >= this.gridSize ||
          this.wouldCollide(neighbor, otherSnakes)
        ) {
          continue;
        }
        
        // Calculate tentative gScore
        const tentativeGScore = (gScore.get(posKey(current)) || Infinity) + 1;
        
        if (tentativeGScore < (gScore.get(posKey(neighbor)) || Infinity)) {
          // This path is better
          cameFrom.set(posKey(neighbor), current);
          gScore.set(posKey(neighbor), tentativeGScore);
          fScore.set(posKey(neighbor), tentativeGScore + this.manhattanDistance(neighbor, target));
          
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
  
  private findSortedFood(food: Position[]): Position[] {
    return [...food].sort((a, b) => {
      const distA = this.manhattanDistance(this.body[0], a);
      const distB = this.manhattanDistance(this.body[0], b);
      return distA - distB;
    });
  }
  
  private manhattanDistance(a: Position, b: Position): number {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
  }

  setDirection(newDirection: Direction) {
    // Prevent 180-degree turns
    if (
      this.body.length > 1 &&
      (this.direction.x === -newDirection.x && this.direction.y === 0 && newDirection.y === 0) ||
      (this.direction.y === -newDirection.y && this.direction.x === 0 && newDirection.x === 0)
    ) {
      return;
    }
    
    this.direction = newDirection;
  }

  private findClosestFood(food: Position[]): Position {
    let closest = food[0];
    let minDistance = Number.MAX_VALUE;

    food.forEach(f => {
      const distance = Math.abs(f.x - this.body[0].x) + Math.abs(f.y - this.body[0].y);
      if (distance < minDistance) {
        minDistance = distance;
        closest = f;
      }
    });

    return closest;
  }

  private calculateDirection(target: Position): Direction {
    const dx = target.x - this.body[0].x;
    const dy = target.y - this.body[0].y;

    if (Math.abs(dx) > Math.abs(dy)) {
      return { x: Math.sign(dx), y: 0 };
    } else {
      return { x: 0, y: Math.sign(dy) };
    }
  }

  private wouldCollide(nextPos: Position, otherSnakes: Snake[]): boolean {
    // Check walls
    if (
      nextPos.x < 0 ||
      nextPos.x >= this.gridSize ||
      nextPos.y < 0 ||
      nextPos.y >= this.gridSize
    ) {
      return true;
    }

    // Check self collision with entire body
    if (this.body.some(segment => segment.x === nextPos.x && segment.y === nextPos.y)) {
      return true;
    }

    // Check other snakes collision with entire body
    return otherSnakes.some(snake => {
      if (!snake.isAlive) return false;
      return snake.body.some(segment => {
        // Check if we would collide with any part of the other snake's body
        const wouldCollide = segment.x === nextPos.x && segment.y === nextPos.y;
        
        // Check if we would cross paths (snake moving in opposite directions)
        const headToHead = snake.body[0].x === nextPos.x && 
                          snake.body[0].y === nextPos.y;
        
        return wouldCollide || headToHead;
      });
    });
  }

  move(food: Position[]): boolean {
    if (!this.isAlive) return false;

    const newHead = {
      x: this.body[0].x + this.direction.x,
      y: this.body[0].y + this.direction.y
    };

    // Check if eating food
    const foodIndex = food.findIndex(f => f.x === newHead.x && f.y === newHead.y);
    const eating = foodIndex !== -1;

    if (eating) {
      this.score += 10;
    } else {
      this.body.pop();
    }

    this.body.unshift(newHead);
    return eating;
  }
}
