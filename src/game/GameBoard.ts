
import { Snake, Position } from './Snake';

export class GameBoard {
  private ctx: CanvasRenderingContext2D;
  private snakes: Snake[];
  private food: Position[];
  private gridSize: number;
  private cellSize: number;
  private animationFrame: number;
  private lastUpdate: number;
  private updateInterval: number;
  private startTime: number;

  constructor(ctx: CanvasRenderingContext2D, numSnakes: number = 20) {
    this.ctx = ctx;
    this.gridSize = 40;
    this.cellSize = ctx.canvas.width / this.gridSize;
    this.snakes = [];
    this.food = [];
    this.lastUpdate = 0;
    this.updateInterval = 100; // Update every 100ms
    this.animationFrame = 0;
    this.startTime = Date.now();

    // Initialize snakes
    for (let i = 0; i < numSnakes; i++) {
      const pos = this.getRandomPosition();
      const color = `hsl(${(i * 360) / numSnakes}, 70%, 60%)`;
      this.snakes.push(new Snake(pos, color, this.gridSize));
    }

    // Initialize food
    for (let i = 0; i < 10; i++) {
      this.spawnFood();
    }
  }

  private getRandomPosition(): Position {
    return {
      x: Math.floor(Math.random() * this.gridSize),
      y: Math.floor(Math.random() * this.gridSize)
    };
  }

  private spawnFood() {
    let pos = this.getRandomPosition();
    while (
      this.food.some(f => f.x === pos.x && f.y === pos.y) ||
      this.snakes.some(s =>
        s.body.some(b => b.x === pos.x && b.y === pos.y)
      )
    ) {
      pos = this.getRandomPosition();
    }
    this.food.push(pos);
  }

  private update() {
    const now = performance.now();
    if (now - this.lastUpdate < this.updateInterval) return;
    this.lastUpdate = now;

    // Update snake AI
    this.snakes.forEach(snake => {
      snake.think(this.food, this.snakes.filter(s => s !== snake));
    });

    // Move snakes and check for food consumption
    this.snakes.forEach(snake => {
      const ate = snake.move(this.food);
      if (ate) {
        const foodIndex = this.food.findIndex(
          f => f.x === snake.body[0].x && f.y === snake.body[0].y
        );
        this.food.splice(foodIndex, 1);
        this.spawnFood();
      }
    });

    // Update leaderboard
    this.updateLeaderboard();
    
    // Update stats
    this.updateStats();
  }

  private updateLeaderboard() {
    const leaderboard = document.getElementById('leaderboard');
    if (!leaderboard) return;

    const topSnakes = [...this.snakes]
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    const leaderboardItems = leaderboard.children;
    for (let i = 0; i < Math.min(5, leaderboardItems.length); i++) {
      const item = leaderboardItems[i];
      const colorIndicator = item.querySelector('.snake-indicator') as HTMLElement;
      const scoreElement = item.querySelector('span:last-child');
      
      if (scoreElement && colorIndicator && topSnakes[i]) {
        scoreElement.textContent = topSnakes[i].score.toString();
        colorIndicator.style.backgroundColor = topSnakes[i].color;
      }
    }
  }
  
  private updateStats() {
    const activeSnakes = document.getElementById('activeSnakes');
    const foodItems = document.getElementById('foodItems');
    const elapsedTime = document.getElementById('elapsedTime');

    if (activeSnakes) {
      activeSnakes.textContent = this.snakes.filter(s => s.isAlive).length.toString();
    }
    
    if (foodItems) {
      foodItems.textContent = this.food.length.toString();
    }
    
    if (elapsedTime) {
      const seconds = Math.floor((Date.now() - this.startTime) / 1000);
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      elapsedTime.textContent = `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
  }

  private draw() {
    const { width, height } = this.ctx.canvas;
    this.ctx.clearRect(0, 0, width, height);

    // Draw grid
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    this.ctx.lineWidth = 1;
    for (let i = 0; i <= this.gridSize; i++) {
      const pos = i * this.cellSize;
      this.ctx.beginPath();
      this.ctx.moveTo(pos, 0);
      this.ctx.lineTo(pos, height);
      this.ctx.stroke();
      this.ctx.beginPath();
      this.ctx.moveTo(0, pos);
      this.ctx.lineTo(width, pos);
      this.ctx.stroke();
    }

    // Draw food
    this.food.forEach(f => {
      this.ctx.fillStyle = '#ea384c'; // Red apple color
      this.ctx.beginPath();
      this.ctx.arc(
        (f.x + 0.5) * this.cellSize,
        (f.y + 0.5) * this.cellSize,
        this.cellSize / 4,
        0,
        Math.PI * 2
      );
      this.ctx.fill();
    });

    // Draw snakes with their specific colors
    this.snakes.forEach(snake => {
      if (!snake.isAlive) return;

      snake.body.forEach((segment, index) => {
        // Calculate alpha for gradient effect along the snake body
        const alpha = index === 0 ? 1 : 1 - (index / snake.body.length) * 0.6;
        // Use the snake's specific color with proper alpha
        const alphaHex = Math.floor(alpha * 255).toString(16).padStart(2, '0');
        this.ctx.fillStyle = `${snake.color}${alphaHex}`;
        
        this.ctx.fillRect(
          segment.x * this.cellSize,
          segment.y * this.cellSize,
          this.cellSize,
          this.cellSize
        );
      });
    });
  }

  private gameLoop = () => {
    this.update();
    this.draw();
    this.animationFrame = requestAnimationFrame(this.gameLoop);
  };

  start() {
    this.gameLoop();
  }

  stop() {
    cancelAnimationFrame(this.animationFrame);
  }
}
