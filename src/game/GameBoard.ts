import { Snake, Position, PowerUpState } from './Snake';
import { POWER_UPS, SKINS, getUnlockedSkins } from './GameAssets';

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
  unlockedSkins: number;
  activePowerUps: PowerUpState[];
}

export class GameBoard {
  private ctx: CanvasRenderingContext2D;
  private snakes: Snake[];
  private food: Position[];
  private powerUps: Position[] = [];
  private powerUpTypes: string[] = [];
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
  private powerUpSpawnInterval: number = 10000; // 10 seconds
  private lastPowerUpSpawn: number = 0;
  private playerSkin: string = "default";
  
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
      
      // Apply default skin
      const defaultSkin = SKINS[0];
      this.playerSkin = defaultSkin.id;
      if (this.playerSnake) {
        this.playerSnake.applySkin(
          defaultSkin.id,
          defaultSkin.color,
          defaultSkin.pattern,
          defaultSkin.glow
        );
      }
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
  
  setPlayerSkin(skinId: string) {
    if (!this.playerSnake) return;
    
    const skin = SKINS.find(s => s.id === skinId);
    if (!skin) return;
    
    this.playerSkin = skinId;
    this.playerSnake.applySkin(
      skin.id,
      skin.color,
      skin.pattern,
      skin.glow
    );
  }

  spawnPowerUp() {
    if (this.powerUps.length >= 3) return; // Max 3 power-ups at once
    
    const pos = this.getRandomPosition();
    
    // Check if position is valid (not on food or snake)
    const isValidPosition = !this.food.some(f => f.x === pos.x && f.y === pos.y) &&
                          !this.snakes.some(s => s.body.some(b => b.x === pos.x && b.y === pos.y)) &&
                          !this.powerUps.some(p => p.x === pos.x && p.y === pos.y);
    
    if (isValidPosition) {
      this.powerUps.push(pos);
      
      // Randomly select power-up type
      const powerUpIndex = Math.floor(Math.random() * POWER_UPS.length);
      this.powerUpTypes.push(POWER_UPS[powerUpIndex].id);
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

    // Spawn power-ups periodically
    if (now - this.lastPowerUpSpawn > this.powerUpSpawnInterval) {
      this.spawnPowerUp();
      this.lastPowerUpSpawn = now;
    }

    if (this.isPlayerMode) {
      this.updateDifficultyBasedOnScore();
    }

    // Update all snakes
    this.snakes.forEach(snake => {
      snake.think(this.food, this.snakes.filter(s => s !== snake));
    });

    // Check player collision
    if (this.playerSnake && this.playerSnake.isAlive) {
      const nextPos = {
        x: this.playerSnake.body[0].x + this.playerSnake.direction.x,
        y: this.playerSnake.body[0].y + this.playerSnake.direction.y
      };
      
      // Skip collision check if player has shield
      if (!this.playerSnake.hasPowerUp("shield")) {
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
    }

    // Move snakes and check for food/power-up consumption
    this.snakes.forEach(snake => {
      const ate = snake.move(this.food);
      if (ate) {
        const foodIndex = this.food.findIndex(
          f => f.x === snake.body[0].x && f.y === snake.body[0].y
        );
        this.food.splice(foodIndex, 1);
        this.spawnFood();
      }
      
      // Check for power-up pickup
      if (snake.isAlive) {
        const powerUpIndex = this.powerUps.findIndex(
          p => p.x === snake.body[0].x && p.y === snake.body[0].y
        );
        
        if (powerUpIndex !== -1) {
          const powerUpType = this.powerUpTypes[powerUpIndex];
          const powerUp = POWER_UPS.find(p => p.id === powerUpType);
          
          if (powerUp) {
            snake.addPowerUp(powerUp.id, powerUp.effect, powerUp.duration);
          }
          
          // Remove the power-up
          this.powerUps.splice(powerUpIndex, 1);
          this.powerUpTypes.splice(powerUpIndex, 1);
        }
      }
    });

    this.updateStats();
  }

  private updateStats() {
    const seconds = Math.floor((Date.now() - this.startTime) / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    const formattedTime = `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    
    // Update DOM elements if they exist
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
    
    // Notify parent component of stats update
    if (this.onStatsUpdate) {
      const topSnakes = [...this.snakes]
        .sort((a, b) => b.score - a.score)
        .slice(0, 5)
        .map(snake => ({
          color: snake.color,
          score: snake.score
        }));
        
      const playerScore = this.playerSnake?.score || null;
      const unlockedSkins = playerScore !== null ? getUnlockedSkins(playerScore).length : 0;
      const activePowerUps = this.playerSnake?.activePowerUps || [];
        
      this.onStatsUpdate({
        topSnakes,
        activeSnakes: this.snakes.filter(s => s.isAlive).length,
        foodItems: this.food.length,
        elapsedTime: formattedTime,
        playerScore,
        difficulty: this.difficulty,
        unlockedSkins,
        activePowerUps
      });
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
    
    // Draw power-ups
    this.powerUps.forEach((p, index) => {
      const powerUpType = this.powerUpTypes[index];
      const powerUp = POWER_UPS.find(pu => pu.id === powerUpType);
      
      if (powerUp) {
        // Draw power-up circle
        this.ctx.fillStyle = powerUp.color;
        this.ctx.beginPath();
        this.ctx.arc(
          (p.x + 0.5) * this.cellSize,
          (p.y + 0.5) * this.cellSize,
          this.cellSize / 3,
          0,
          Math.PI * 2
        );
        this.ctx.fill();
        
        // Draw power-up icon
        this.ctx.fillStyle = 'white';
        this.ctx.font = `${this.cellSize * 0.4}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(
          powerUp.icon,
          (p.x + 0.5) * this.cellSize,
          (p.y + 0.5) * this.cellSize
        );
      }
    });

    // Draw snakes with proper skins and effects
    this.snakes.forEach(snake => {
      if (!snake.isAlive) return;
      
      // Apply special rendering for invisible snakes
      const isInvisible = snake.hasPowerUp("invisible");
      const hasShield = snake.hasPowerUp("shield");
      
      snake.body.forEach((segment, index) => {
        // Rainbow pattern
        let color = snake.color;
        if (snake.activePattern === "rainbow") {
          const hue = (Date.now() / 20 + index * 10) % 360;
          color = `hsl(${hue}, 70%, 60%)`;
        }
        
        // Calculate segment opacity
        let alpha = 1;
        if (isInvisible) {
          alpha = 0.3; // Very transparent when invisible
        } else {
          alpha = index === 0 ? 1 : 1 - (index / snake.body.length) * 0.6;
        }
        
        const alphaHex = Math.floor(alpha * 255).toString(16).padStart(2, '0');
        this.ctx.fillStyle = `${color}${alphaHex}`;
        
        // Draw snake segment
        this.ctx.fillRect(
          segment.x * this.cellSize,
          segment.y * this.cellSize,
          this.cellSize,
          this.cellSize
        );
        
        // Draw patterns
        if (snake.activePattern === "gradient" && index === 0) {
          // Gradient effect on head
          const gradient = this.ctx.createRadialGradient(
            (segment.x + 0.5) * this.cellSize,
            (segment.y + 0.5) * this.cellSize,
            0,
            (segment.x + 0.5) * this.cellSize,
            (segment.y + 0.5) * this.cellSize,
            this.cellSize
          );
          gradient.addColorStop(0, 'white');
          gradient.addColorStop(1, color);
          this.ctx.fillStyle = gradient;
          this.ctx.fillRect(
            segment.x * this.cellSize,
            segment.y * this.cellSize,
            this.cellSize,
            this.cellSize
          );
        }
        
        // Pulse pattern
        if (snake.activePattern === "pulse") {
          const pulse = 0.5 + 0.5 * Math.sin(Date.now() / 200);
          this.ctx.globalAlpha = pulse;
          this.ctx.fillStyle = "white";
          this.ctx.fillRect(
            segment.x * this.cellSize + this.cellSize * 0.25,
            segment.y * this.cellSize + this.cellSize * 0.25,
            this.cellSize * 0.5,
            this.cellSize * 0.5
          );
          this.ctx.globalAlpha = 1;
        }
      });
      
      // Draw glow effect
      if (snake.glowEffect) {
        const head = snake.body[0];
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = snake.color;
        this.ctx.fillRect(
          head.x * this.cellSize,
          head.y * this.cellSize,
          this.cellSize,
          this.cellSize
        );
        this.ctx.shadowBlur = 0;
      }
      
      // Draw shield effect
      if (hasShield) {
        const head = snake.body[0];
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(
          (head.x + 0.5) * this.cellSize,
          (head.y + 0.5) * this.cellSize,
          this.cellSize * 0.8,
          0,
          Math.PI * 2
        );
        this.ctx.stroke();
      }
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
