
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

  constructor(startPos: Position, color: string, gridSize: number, isPlayerControlled: boolean = false) {
    this.body = [startPos];
    this.direction = { x: 0, y: 0 };
    this.score = 0;
    this.isAlive = true;
    this.color = color;
    this.gridSize = gridSize;
    this.isPlayerControlled = isPlayerControlled;
  }

  think(food: Position[], otherSnakes: Snake[]) {
    if (!this.isAlive || this.isPlayerControlled) return;

    // Simple AI: Find closest food and move towards it while avoiding collisions
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
