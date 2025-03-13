export interface Position {
  x: number;
  y: number;
}

export interface Direction {
  x: number;
  y: number;
}

export interface PowerUpState {
  type: string;
  effect: string;
  timeLeft: number;
  startTime: number;
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
  public skinId: string = "default";
  public activePattern: string | null = null;
  public glowEffect: boolean = false;
  public activePowerUps: PowerUpState[] = [];
  public uniqueAbility: string | null = null;
  public hasTeleported: boolean = false;
  public splitSnake: Snake | null = null;
  private baseSpeed: number = 1;
  private magnetRange: number = 5;

  constructor(startPos: Position, color: string, gridSize: number, isPlayerControlled: boolean = false, difficulty: number = 1) {
    this.body = [startPos];
    this.direction = { x: 0, y: 0 };
    this.score = 0;
    this.isAlive = true;
    this.color = color;
    this.gridSize = gridSize;
    this.isPlayerControlled = isPlayerControlled;
    this.difficulty = difficulty;
    
    // Assign a random unique ability to AI snakes
    if (!isPlayerControlled && Math.random() < 0.3) {
      const abilities = ["teleport", "split", "magnet"];
      this.uniqueAbility = abilities[Math.floor(Math.random() * abilities.length)];
    }
  }

  // Apply a skin to the snake
  applySkin(skinId: string, skinColor: string, pattern: string | undefined, glow: boolean | undefined) {
    this.skinId = skinId;
    this.color = skinColor;
    this.activePattern = pattern || null;
    this.glowEffect = glow || false;
  }

  // Add a power-up to the snake
  addPowerUp(powerUpId: string, effect: string, duration: number) {
    // Don't stack same power-ups, just refresh the timer
    const existingPowerUpIndex = this.activePowerUps.findIndex(p => p.effect === effect);
    
    if (existingPowerUpIndex >= 0) {
      this.activePowerUps[existingPowerUpIndex].timeLeft = duration;
      this.activePowerUps[existingPowerUpIndex].startTime = Date.now();
    } else {
      this.activePowerUps.push({
        type: powerUpId,
        effect,
        timeLeft: duration,
        startTime: Date.now()
      });
    }

    // Handle instant effects
    if (effect === "teleport") {
      this.teleport();
    } else if (effect === "split" && !this.splitSnake && this.body.length > 3) {
      this.createSplitSnake();
    }
  }

  // Update power-up timers
  updatePowerUps() {
    const now = Date.now();
    this.activePowerUps = this.activePowerUps.filter(powerUp => {
      const elapsedSeconds = (now - powerUp.startTime) / 1000;
      return elapsedSeconds < powerUp.timeLeft;
    });
  }

  // Check if a specific power-up is active
  hasPowerUp(effect: string): boolean {
    return this.activePowerUps.some(p => p.effect === effect);
  }

  // Teleport to a random safe location
  teleport() {
    if (this.hasTeleported) return; // Prevent multiple teleports in a single tick
    
    const maxAttempts = 20;
    let attempts = 0;
    let newPos: Position | null = null;
    
    while (!newPos && attempts < maxAttempts) {
      const candidate = {
        x: Math.floor(Math.random() * this.gridSize),
        y: Math.floor(Math.random() * this.gridSize)
      };
      
      // Check if position is safe (not too close to other snakes)
      const isSafe = true; // We'll simplify for now, but we'd check for collisions here
      
      if (isSafe) {
        newPos = candidate;
      }
      attempts++;
    }
    
    if (newPos) {
      this.body = [newPos];
      this.hasTeleported = true;
    }
  }

  // Create a split snake (clone) that follows similar behavior
  createSplitSnake() {
    if (this.body.length < 4) return;
    
    // Take half of the current snake's body for the new one
    const splitPoint = Math.floor(this.body.length / 2);
    const splitBody = this.body.splice(splitPoint);
    
    // Use the last segment of the remaining body as the head of the split snake
    const splitHead = { ...splitBody[0] };
    
    // Create the split snake with the same properties as the parent
    this.splitSnake = new Snake(
      splitHead,
      this.color,
      this.gridSize,
      false,
      this.difficulty
    );
    
    // Assign the rest of the split body
    this.splitSnake.body = splitBody;
    
    // Give it a slightly different direction
    this.splitSnake.direction = { ...this.direction };
    if (this.direction.x !== 0) {
      this.splitSnake.direction.y = Math.random() > 0.5 ? 1 : -1;
      this.splitSnake.direction.x = 0;
    } else {
      this.splitSnake.direction.x = Math.random() > 0.5 ? 1 : -1;
      this.splitSnake.direction.y = 0;
    }
  }

  think(food: Position[], otherSnakes: Snake[]) {
    if (!this.isAlive || this.isPlayerControlled) return;
    
    // Reset teleport flag
    this.hasTeleported = false;
    
    // Update power-ups
    this.updatePowerUps();
    
    // Use unique ability occasionally
    if (this.uniqueAbility && Math.random() < 0.005) {
      this.addPowerUp(this.uniqueAbility, this.uniqueAbility, 5);
    }

    // Different thinking strategies based on difficulty
    if (this.difficulty === 1) {
      this.thinkBasic(food, otherSnakes);
    } else if (this.difficulty === 2) {
      this.thinkIntermediate(food, otherSnakes);
    } else {
      this.thinkAdvanced(food, otherSnakes);
    }
    
    // Update split snake if exists
    if (this.splitSnake) {
      this.splitSnake.think(food, [...otherSnakes, this]);
    }
  }

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
        if (alt.x === -this.direction.x && alt.y === 0 && this.body.length > 1) {
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
    // Prevent 180-degree turns unless we have the split ability active
    if (
      this.body.length > 1 &&
      !this.hasPowerUp("split") &&
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
    // If we have a shield power-up, we don't collide with other snakes
    if (this.hasPowerUp("shield")) {
      // Only check for wall collisions
      return (
        nextPos.x < 0 ||
        nextPos.x >= this.gridSize ||
        nextPos.y < 0 ||
        nextPos.y >= this.gridSize
      );
    }
    
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
      
      // Skip collision check with invisible snakes
      if (snake.hasPowerUp("invisible") && Math.random() < 0.7) {
        return false;
      }
      
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
    
    // Update power-ups
    this.updatePowerUps();
    
    // Calculate movement speed based on power-ups
    const speed = this.hasPowerUp("speed") ? 2 : 1;
    
    let eating = false;
    
    // For speed powerup, we move multiple steps per tick
    for (let i = 0; i < speed; i++) {
      const newHead = {
        x: this.body[0].x + this.direction.x,
        y: this.body[0].y + this.direction.y
      };
      
      // Food magnet power-up: attract nearby food
      if (this.hasPowerUp("magnet")) {
        food.forEach(f => {
          const distance = Math.abs(f.x - this.body[0].x) + Math.abs(f.y - this.body[0].y);
          if (distance <= this.magnetRange) {
            // Move food slightly closer to snake head
            if (f.x < this.body[0].x) f.x++;
            else if (f.x > this.body[0].x) f.x--;
            
            if (f.y < this.body[0].y) f.y++;
            else if (f.y > this.body[0].y) f.y--;
          }
        });
      }

      // Check if eating food
      const foodIndex = food.findIndex(f => f.x === newHead.x && f.y === newHead.y);
      const currentEating = foodIndex !== -1;

      if (currentEating) {
        this.score += 10;
        eating = true;
      } else if (i === 0) { // Only remove tail on first step if not eating
        this.body.pop();
      }

      this.body.unshift(newHead);
      
      // Only continue multi-step movement if not eating
      if (currentEating) break;
    }
    
    // Update split snake if it exists
    if (this.splitSnake) {
      const splitAte = this.splitSnake.move(food);
      if (splitAte) {
        this.score += 5; // Half the points for split snake eating
      }
      
      // Remove split snake if it's dead
      if (!this.splitSnake.isAlive) {
        this.splitSnake = null;
      }
    }
    
    return eating;
  }
}
