import { Snake } from './Snake';
import { Position } from './types';
import { SKINS } from './GameAssets';
import { GameStatsManager } from './managers/GameStatsManager';
import { GameRenderer } from './managers/GameRenderer';
import { InputHandler } from './managers/InputHandler';
import { GameUpdater } from './managers/GameUpdater';

export class GameBoard {
  private ctx: CanvasRenderingContext2D;
  private snakes: Snake[];
  private food: Position[];
  private powerUps: Position[] = [];
  private powerUpTypes: string[] = [];
  private gridSize: number;
  private animationFrame: number | null = null;
  private lastFrameTime: number = 0;
  private targetFPS: number = 60;
  private frameInterval: number = 1000 / 60;
  private gameUpdateInterval: number = 100;
  private timeSinceLastUpdate: number = 0;
  private playerSnake: Snake | null = null;
  private isPlayerMode: boolean = false;
  private difficulty: number = 1;
  private playerSkin: string = "default";
  private totalOpponents: number = 20;
  private isRunning: boolean = false;
  
  // Manager instances
  private statsManager: GameStatsManager;
  private renderer: GameRenderer;
  private inputHandler: InputHandler;
  private updater: GameUpdater;
  
  public onStatsUpdate: ((stats: any) => void) | null = null;

  constructor(ctx: CanvasRenderingContext2D, numSnakes: number = 20, isPlayerMode: boolean = false, difficulty: number = 1) {
    this.ctx = ctx;
    this.gridSize = 40;
    this.snakes = [];
    this.food = [];
    this.lastFrameTime = 0;
    this.isPlayerMode = isPlayerMode;
    this.difficulty = difficulty;
    this.totalOpponents = numSnakes;

    // Initialize managers
    this.statsManager = new GameStatsManager();
    this.renderer = new GameRenderer(ctx, this.gridSize);
    this.inputHandler = new InputHandler(ctx.canvas);
    this.updater = new GameUpdater(this.gridSize);

    // Set up stats callback
    this.statsManager.onStatsUpdate = (stats) => {
      if (this.onStatsUpdate) {
        this.onStatsUpdate(stats);
      }
    };

    this.initializeSnakes();
    this.initializeFood();
  }

  private initializeSnakes() {
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
      
      this.inputHandler.setPlayerSnake(this.playerSnake);
      this.inputHandler.setupControls();
      
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

    const aiCount = this.isPlayerMode ? this.totalOpponents - 1 : this.totalOpponents;
    for (let i = 0; i < aiCount; i++) {
      const pos = this.getRandomPosition();
      
      const colorIndex = this.isPlayerMode ? i + 1 : i;
      const color = colorIndex < 5 ? predefinedColors[colorIndex] : `hsl(${(colorIndex * 360) / this.totalOpponents}, 70%, 60%)`;
      
      const snakeDifficulty = i < 3 ? this.difficulty : Math.max(1, this.difficulty - 1);
      this.snakes.push(new Snake(pos, color, this.gridSize, false, snakeDifficulty));
    }
  }

  private initializeFood() {
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
    
    // Clean up input handler
    this.inputHandler.cleanup();
    
    // Re-initialize everything
    this.initializeSnakes();
    
    // Reset food and time
    this.food = [];
    this.initializeFood();
    this.statsManager.resetStartTime();
    
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

  private update(deltaTime: number)  {
    // Accumulate time since last game update
    this.timeSinceLastUpdate += deltaTime;
    
    // Only update game state at fixed intervals
    if (this.timeSinceLastUpdate >= this.gameUpdateInterval) {
      this.updater.update(
        this.snakes,
        this.food,
        this.powerUps,
        this.powerUpTypes,
        this.isPlayerMode,
        this.difficulty,
        () => this.spawnFood()
      );

      this.statsManager.updateStats(this.snakes, this.food, this.difficulty, this.playerSnake);
      
      // Reset the timer
      this.timeSinceLastUpdate = 0;
    }
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
      this.renderer.draw(this.snakes, this.food, this.powerUps, this.powerUpTypes);
      
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
    
    // Clean up input handlers
    this.inputHandler.cleanup();
  }

  setGameSpeed(speed: number) {
    // Change base interval from 300ms to 200ms for better speed scaling with 60 FPS
    this.gameUpdateInterval = Math.floor(200 / speed); // Adjust update interval based on speed
    console.log(`Game speed set to ${speed}, update interval: ${this.gameUpdateInterval}ms`);
  }
}
