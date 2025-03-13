import { Snake, Position } from './Snake';

interface GameStats {
  topSnakes: {
    color: string;
    score: number;
  }[];
  activeSnakes: number;
  foodItems: number;
  elapsedTime: string;
  playerScore: number | null;
  difficulty: number;
}

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
  private playerSnake: Snake | null = null;
  private isPlayerMode: boolean = false;
  private keyboardListener: ((e: KeyboardEvent) => void) | null = null;
  private difficulty: number = 1;
  
  public onStatsUpdate: ((stats: GameStats) => void) | null = null;

  constructor(ctx: CanvasRenderingContext2D, numSnakes: number = 20, isPlayerMode: boolean = false, difficulty: number = 1) {
    this.ctx = ctx;
    this.gridSize = 40;
    this.cellSize = ctx.canvas.width / this.gridSize;
    this.snakes = [];
    this.food = [];
    this.lastUpdate = 0;
    this.updateInterval = 100; // Update every 100ms
    this.animationFrame = 0;
    this.startTime = Date.now();
    this.isPlayerMode = isPlayerMode;
    this.difficulty = difficulty;

    const predefinedColors = [
      '#FF5252', // Red (Snake 1)
      '#E6E633', // Yellow (Snake 2)
      '#4CAF50', // Green (Snake 3)
      '#26C6DA', // Cyan (Snake 4)
      '#5C6BC0'  // Blue (Snake 5)
    ];

    if (this.isPlayerMode) {
      const playerPos = this.getRandomPosition();
      this.playerSnake = new Snake(playerPos, predefinedColors[0], this.gridSize, true, 1);
      this.snakes.push(this.playerSnake);
      
      this.keyboardListener = this.handleKeyDown.bind(this);
      window.addEventListener('keydown', this.keyboardListener);
      this.setupTouchControls();
    }

    const aiCount = this.isPlayerMode ? numSnakes - 1 : numSnakes;
    for (let i = 0; i < aiCount; i++) {
      const pos = this.getRandomPosition();
      
      const colorIndex = this.isPlayerMode ? i + 1 : i;
      const color = colorIndex < 5 ? predefinedColors[colorIndex] : `hsl(${(colorIndex * 360) / numSnakes}, 70%, 60%)`;
      
      const snakeDifficulty = i < 3 ? this.difficulty : Math.max(1, this.difficulty - 1);
      this.snakes.push(new Snake(pos, color, this.gridSize, false, snakeDifficulty));
    }

    for (let i = 0; i < 10; i++) {
      this.spawnFood();
    }
  }

  private setupTouchControls() {
    const canvas = this.ctx.canvas;
    let startX = 0;
    let startY = 0;
    
    canvas.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      e.preventDefault();
    }, { passive: false });
    
    canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
    }, { passive: false });
    
    canvas.addEventListener('touchend', (e) => {
      if (!this.playerSnake || !this.playerSnake.isAlive) return;
      
      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      
      const deltaX = endX - startX;
      const deltaY = endY - startY;
      
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX > 0) {
          this.playerSnake.setDirection({ x: 1, y: 0 });
        } else {
          this.playerSnake.setDirection({ x: -1, y: 0 });
        }
      } else {
        if (deltaY > 0) {
          this.playerSnake.setDirection({ x: 0, y: 1 });
        } else {
          this.playerSnake.setDirection({ x: 0, y: -1 });
        }
      }
      
      e.preventDefault();
    }, { passive: false });
  }

  private handleKeyDown(e: KeyboardEvent) {
    if (!this.playerSnake || !this.playerSnake.isAlive) return;
    
    switch (e.key) {
      case 'ArrowUp':
        this.playerSnake.setDirection({ x: 0, y: -1 });
        e.preventDefault();
        break;
      case 'ArrowDown':
        this.playerSnake.setDirection({ x: 0, y: 1 });
        e.preventDefault();
        break;
      case 'ArrowLeft':
        this.playerSnake.setDirection({ x: -1, y: 0 });
        e.preventDefault();
        break;
      case 'ArrowRight':
        this.playerSnake.setDirection({ x: 1, y: 0 });
        e.preventDefault();
        break;
    }
  }
  
  setDifficulty(difficulty: number) {
    if (difficulty < 1 || difficulty > 3) return;
    this.difficulty = difficulty;
    
    this.snakes.forEach((snake, index) => {
      if (!snake.isPlayerControlled) {
        snake.difficulty = index < 3 ? this.difficulty : Math.max(1, this.difficulty - 1);
      }
    });
  }
  
  setPlayerMode(isPlayerMode: boolean) {
    if (this.isPlayerMode === isPlayerMode) return;
    
    this.stop();
    if (this.keyboardListener) {
      window.removeEventListener('keydown', this.keyboardListener);
      this.keyboardListener = null;
    }
    
    this.isPlayerMode = isPlayerMode;
    this.snakes = [];
    this.food = [];
    this.lastUpdate = 0;
    this.startTime = Date.now();
    
    const numSnakes = 20;
    
    const predefinedColors = [
      '#FF5252', // Red (Snake 1)
      '#E6E633', // Yellow (Snake 2)
      '#4CAF50', // Green (Snake 3)
      '#26C6DA', // Cyan (Snake 4)
      '#5C6BC0'  // Blue (Snake 5)
    ];

    if (this.isPlayerMode) {
      const playerPos = this.getRandomPosition();
      this.playerSnake = new Snake(playerPos, predefinedColors[0], this.gridSize, true, 1);
      this.snakes.push(this.playerSnake);
      
      this.keyboardListener = this.handleKeyDown.bind(this);
      window.addEventListener('keydown', this.keyboardListener);
      this.setupTouchControls();
    } else {
      this.playerSnake = null;
    }
    
    const aiCount = this.isPlayerMode ? numSnakes - 1 : numSnakes;
    for (let i = 0; i < aiCount; i++) {
      const pos = this.getRandomPosition();
      
      const colorIndex = this.isPlayerMode ? i + 1 : i;
      const color = colorIndex < 5 ? predefinedColors[colorIndex] : `hsl(${(colorIndex * 360) / numSnakes}, 70%, 60%)`;
      
      const snakeDifficulty = i < 3 ? this.difficulty : Math.max(1, this.difficulty - 1);
      this.snakes.push(new Snake(pos, color, this.gridSize, false, snakeDifficulty));
    }

    for (let i = 0; i < 10; i++) {
      this.spawnFood();
    }
    
    this.start();
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

  updateDifficultyBasedOnScore() {
    if (this.playerSnake && this.playerSnake.isAlive) {
      const score = this.playerSnake.score;
      let newDifficulty = 1;
      
      if (score >= 100) {
        newDifficulty = 3;  // Advanced
      } else if (score >= 50) {
        newDifficulty = 2;  // Intermediate
      }
      
      if (newDifficulty !== this.difficulty) {
        this.setDifficulty(newDifficulty);
      }
    }
  }

  private update() {
    const now = performance.now();
    if (now - this.lastUpdate < this.updateInterval) return;
    this.lastUpdate = now;

    if (this.isPlayerMode) {
      this.updateDifficultyBasedOnScore();
    }

    this.snakes.forEach(snake => {
      snake.think(this.food, this.snakes.filter(s => s !== snake));
    });

    if (this.playerSnake && this.playerSnake.isAlive) {
      const nextPos = {
        x: this.playerSnake.body[0].x + this.playerSnake.direction.x,
        y: this.playerSnake.body[0].y + this.playerSnake.direction.y
      };
      
      if (
        nextPos.x < 0 ||
        nextPos.x >= this.gridSize ||
        nextPos.y < 0 ||
        nextPos.y >= this.gridSize
      ) {
        this.playerSnake.isAlive = false;
      } 
      else if (this.playerSnake.body.slice(1).some(segment => 
        segment.x === nextPos.x && segment.y === nextPos.y
      )) {
        this.playerSnake.isAlive = false;
      }
      else if (this.snakes.filter(s => s !== this.playerSnake).some(snake => 
        snake.isAlive && snake.body.some(segment => 
          segment.x === nextPos.x && segment.y === nextPos.y
        )
      )) {
        this.playerSnake.isAlive = false;
      }
    }

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

    this.updateStats();
  }

  private updateLeaderboard() {
    const topSnakes = [...this.snakes]
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
      
    const leaderboardItems = document.getElementById('leaderboard')?.children;
    if (leaderboardItems) {
      for (let i = 0; i < Math.min(5, leaderboardItems.length); i++) {
        const item = leaderboardItems[i];
        const scoreElement = item.querySelector('span:last-child');
        
        if (scoreElement && topSnakes[i]) {
          scoreElement.textContent = topSnakes[i].score.toString();
        }
      }
    }
  }
  
  private updateStats() {
    const seconds = Math.floor((Date.now() - this.startTime) / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    const formattedTime = `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    
    const activeSnakesElement = document.getElementById('activeSnakes');
    const foodItemsElement = document.getElementById('foodItems');
    const elapsedTimeElement = document.getElementById('elapsedTime');

    if (activeSnakesElement) {
      activeSnakesElement.textContent = this.snakes.filter(s => s.isAlive).length.toString();
    }
    
    if (foodItemsElement) {
      foodItemsElement.textContent = this.food.length.toString();
    }
    
    if (elapsedTimeElement) {
      elapsedTimeElement.textContent = formattedTime;
    }
    
    if (this.onStatsUpdate) {
      const topSnakes = [...this.snakes]
        .sort((a, b) => b.score - a.score)
        .slice(0, 5)
        .map(snake => ({
          color: snake.color,
          score: snake.score
        }));
        
      this.onStatsUpdate({
        topSnakes,
        activeSnakes: this.snakes.filter(s => s.isAlive).length,
        foodItems: this.food.length,
        elapsedTime: formattedTime,
        playerScore: this.playerSnake?.score || null,
        difficulty: this.difficulty
      });
    }
  }

  private draw() {
    const { width, height } = this.ctx.canvas;
    this.ctx.clearRect(0, 0, width, height);

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

    this.food.forEach(f => {
      this.ctx.fillStyle = '#ea384c';
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

    this.snakes.forEach(snake => {
      if (!snake.isAlive) return;

      snake.body.forEach((segment, index) => {
        const alpha = index === 0 ? 1 : 1 - (index / snake.body.length) * 0.6;
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
