import { Snake } from './Snake';
import { Position, PowerUpState } from './types';
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
  private animationFrame: number | null = null;
  private lastFrameTime: number = 0;
  private targetFPS: number = 30; // Changed from 60 to 30 for smoother performance
  private frameInterval: number = 1000 / 30; // Changed from 1000/60 to 1000/30 (33.33ms per frame)
  private gameUpdateInterval: number = 150; // Increased from 100ms to 150ms for better performance
  private timeSinceLastUpdate: number = 0;
  private startTime: number;
  private playerSnake: Snake | null = null;
  private isPlayerMode: boolean = false;
  private keyboardListener: ((e: KeyboardEvent) => void) | null = null;
  private difficulty: number = 1;
  private powerUpSpawnInterval: number = 10000; // 10 seconds
  private lastPowerUpSpawn: number = 0;
  private playerSkin: string = "default";
  private totalOpponents: number = 20;
  private playerDeathDetected: boolean = false;
  private isRunning: boolean = false;
  
  public onStatsUpdate: ((stats: any) => void) | null = null;

  constructor(ctx: CanvasRenderingContext2D, numSnakes: number = 20, isPlayerMode: boolean = false, difficulty: number = 1) {
    this.ctx = ctx;
    this.gridSize = 40;
    this.cellSize = ctx.canvas.width / this.gridSize;
    this.snakes = [];
    this.food = [];
    this.lastFrameTime = 0;
    this.startTime = Date.now();
    this.isPlayerMode = isPlayerMode;
    this.difficulty = difficulty;
    this.totalOpponents = numSnakes;

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
        this.difficulty = newDifficulty;
      }
    }
  }

  setDifficulty(level: number) {
    this.difficulty = level;
    
    // Update existing snake difficulties
    this.snakes.forEach((snake, index) => {
      if (!snake.isPlayer) {
        const snakeDifficulty = index < 3 ? this.difficulty : Math.max(1, this.difficulty - 1);
        snake.setDifficulty(snakeDifficulty);
      }
    });
  }

  setPlayerMode(isPlayerMode: boolean) {
    // Stop the current game
    this.stop();
    
    // Clear existing snakes
    this.snakes = [];
    this.isPlayerMode = isPlayerMode;
    
    const predefinedColors = [
      '#FF5252', // Red (Snake 1)
      '#E6E633', // Yellow (Snake 2)
      '#4CAF50', // Green (Snake 3)
      '#26C6DA', // Cyan (Snake 4)
      '#5C6BC0'  // Blue (Snake 5)
    ];

    // Remove existing keyboard listener if it exists
    if (this.keyboardListener) {
      window.removeEventListener('keydown', this.keyboardListener);
      this.keyboardListener = null;
    }

    // Create player snake if in player mode
    if (isPlayerMode) {
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
    } else {
      this.playerSnake = null;
    }

    // Add AI snakes
    const aiCount = isPlayerMode ? this.totalOpponents - 1 : this.totalOpponents;
    for (let i = 0; i < aiCount; i++) {
      const pos = this.getRandomPosition();
      
      const colorIndex = isPlayerMode ? i + 1 : i;
      const color = colorIndex < 5 ? predefinedColors[colorIndex] : `hsl(${(colorIndex * 360) / this.totalOpponents}, 70%, 60%)`;
      
      const snakeDifficulty = i < 3 ? this.difficulty : Math.max(1, this.difficulty - 1);
      this.snakes.push(new Snake(pos, color, this.gridSize, false, snakeDifficulty));
    }

    // Reset food and time
    this.food = [];
    for (let i = 0; i < 10; i++) {
      this.spawnFood();
    }
    this.startTime = Date.now();
    
    // Restart the game
    this.start();
  }

  setPlayerDirection(direction: { x: number, y: number }) {
    if (this.playerSnake && this.playerSnake.isAlive) {
      this.playerSnake.setDirection(direction);
    }
  }

  isPlayerAlive(): boolean {
    return this.playerSnake !== null && this.playerSnake.isAlive;
  }

  private update(deltaTime: number) {
    // Accumulate time since last game update
    this.timeSinceLastUpdate += deltaTime;
    
    // Only update game state at fixed intervals
    if (this.timeSinceLastUpdate >= this.gameUpdateInterval) {
      // Spawn power-ups periodically
      const now = Date.now();
      if (now - this.lastPowerUpSpawn > this.powerUpSpawnInterval) {
        this.spawnPowerUp();
        this.lastPowerUpSpawn = now;
      }

      if (this.isPlayerMode) {
        this.updateDifficultyBasedOnScore();
      }

      // Update all snakes AI first
      this.snakes.forEach(snake => {
        if (!snake.isPlayer) { // Only call AI think for non-player snakes
          snake.think(this.food, this.snakes.filter(s => s !== snake));
        }
      });

      // Store which snakes ate food this frame for collision detection
      const snakesAtFood = new Map<Snake, boolean>();

      // Move snakes and check for food/power-up consumption FIRST
      this.snakes.forEach(snake => {
        if (!snake.isAlive) return;
        
        const ate = snake.move(this.food);
        snakesAtFood.set(snake, ate);
        
        if (ate) {
          const foodIndex = this.food.findIndex(
            f => f.x === snake.body[0].x && f.y === snake.body[0].y
          );
          if (foodIndex !== -1) {
            this.food.splice(foodIndex, 1);
            this.spawnFood();
          }
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

      // THEN check for collisions AFTER movement and food consumption
      this.snakes.forEach(snake => {
        if (!snake.isAlive) return;
        
        const head = snake.body[0];
        const ateFood = snakesAtFood.get(snake) || false;
        
        console.log(`Collision check for snake - head: ${head.x},${head.y}, ate food: ${ateFood}, body length: ${snake.body.length}`);
        
        // Skip collision check if snake has shield
        if (snake.isPlayer && snake.hasPowerUp && snake.hasPowerUp("shield")) {
          return;
        }
        
        // Check wall collision
        if (head.x < 0 || head.x >= this.gridSize || head.y < 0 || head.y >= this.gridSize) {
          console.log("Snake died from wall collision");
          snake.isAlive = false;
          if (snake.isPlayer) {
            console.log("Player collision with wall detected!");
            this.playerDeathDetected = true;
          }
          return;
        }
        
        // Check self collision (skip head, start from index 1)
        // If snake just ate food, we need to be more careful with self-collision
        const startIndex = ateFood ? 2 : 1; // Skip more segments if just ate food
        for (let i = startIndex; i < snake.body.length; i++) {
          if (head.x === snake.body[i].x && head.y === snake.body[i].y) {
            console.log(`Snake died from self-collision at segment ${i}`);
            snake.isAlive = false;
            if (snake.isPlayer) {
              console.log("Player self-collision detected!");
              this.playerDeathDetected = true;
            }
            return;
          }
        }
        
        // Check collision with other snakes
        for (const otherSnake of this.snakes) {
          if (otherSnake === snake || !otherSnake.isAlive) continue;
          
          for (const segment of otherSnake.body) {
            if (head.x === segment.x && head.y === segment.y) {
              console.log("Snake died from collision with another snake");
              snake.isAlive = false;
              if (snake.isPlayer) {
                console.log("Player collision with other snake detected!");
                this.playerDeathDetected = true;
              }
              return;
            }
          }
        }
        
        console.log("Snake survived collision checks");
      });

      this.updateStats();
      
      // Reset the timer
      this.timeSinceLastUpdate = 0;
    }
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
      if (!snake.isAlive) {
        // If it's the player snake and just died, draw death animation
        if (snake.isPlayer) {
          const head = snake.body[0];
          
          // Draw explosion effect
          const radius = Math.min(20, this.cellSize * 1.5); // Increased size
          const gradient = this.ctx.createRadialGradient(
            (head.x + 0.5) * this.cellSize,
            (head.y + 0.5) * this.cellSize,
            0,
            (head.x + 0.5) * this.cellSize,
            (head.y + 0.5) * this.cellSize,
            radius
          );
          gradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
          gradient.addColorStop(0.2, 'rgba(255, 50, 50, 0.9)');  // More vibrant red
          gradient.addColorStop(0.5, 'rgba(255, 0, 0, 0.7)');  // More vibrant red
          gradient.addColorStop(1, 'rgba(100, 0, 0, 0)');
          
          this.ctx.fillStyle = gradient;
          this.ctx.beginPath();
          this.ctx.arc(
            (head.x + 0.5) * this.cellSize,
            (head.y + 0.5) * this.cellSize,
            radius,
            0,
            Math.PI * 2
          );
          this.ctx.fill();
        }
        return;
      }
      
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

  private gameLoop = (timestamp: number) => {
    if (!this.isRunning) return;
    
    // Calculate the time since the last frame
    if (this.lastFrameTime === 0) {
      this.lastFrameTime = timestamp;
    }
    const deltaTime = timestamp - this.lastFrameTime;
    
    // Limit to target frame rate
    if (deltaTime >= this.frameInterval) {
      // Update the game state based on the time passed
      this.update(deltaTime);
      
      // Draw the current game state
      this.draw();
      
      // Save the time of this frame
      this.lastFrameTime = timestamp;
    }
    
    // Request the next frame only if the game is still running
    if (this.isRunning) {
      this.animationFrame = requestAnimationFrame(this.gameLoop);
    }
  };

  start() {
    // Prevent multiple game loops
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.lastFrameTime = 0;
    this.timeSinceLastUpdate = 0;
    this.animationFrame = requestAnimationFrame(this.gameLoop);
  }

  stop() {
    this.isRunning = false;
    
    if (this.animationFrame !== null) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
    
    // Clean up event listeners
    if (this.keyboardListener) {
      window.removeEventListener('keydown', this.keyboardListener);
      this.keyboardListener = null;
    }
  }

  setGameSpeed(speed: number) {
    // Change base interval from 100ms to 300ms for more manageable speed
    this.gameUpdateInterval = Math.floor(300 / speed); // Adjust update interval based on speed
    console.log(`Game speed set to ${speed}, update interval: ${this.gameUpdateInterval}ms`);
  }
}
