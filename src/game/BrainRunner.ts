import { 
  GameState, 
  Character, 
  Obstacle, 
  Collectible, 
  Fact, 
  PlayerStats,
  GameAssets 
} from './types';

export class BrainRunner {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private gameState: GameState;
  private character: Character;
  private obstacles: Obstacle[];
  private collectibles: Collectible[];
  private assets: GameAssets;
  private playerStats: PlayerStats;
  private animationFrame: number | null = null;
  private lastFrameTime: number = 0;
  private groundY: number;
  private groundSpeed: number = 1.5;
  private groundPos: number = 0;
  private factDisplayed: boolean = false;
  private maxSpeed: number = 4.5;
  private isInitialized: boolean = false;
  
  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Failed to get 2D context');
    this.ctx = ctx;
    
    // Prevent canvas scaling issues
    this.ctx.imageSmoothingEnabled = false;
    
    this.groundY = this.canvas.height * 0.75;
    
    // Initialize game state
    this.gameState = {
      isRunning: false,
      score: 0,
      distance: 0,
      speed: 1.5,
      facts: [],
      currentFact: null
    };
    
    // Initialize character
    this.character = {
      x: this.canvas.width * 0.2,
      y: this.groundY - 60,
      width: 60,
      height: 60,
      velocityY: 0,
      isJumping: false,
      frame: 0
    };
    
    this.obstacles = [];
    this.collectibles = [];
    
    // Player stats from localStorage
    this.playerStats = this.loadPlayerStats();
    
    // Initialize assets (images, sounds)
    this.assets = {
      background: null,
      ground: null,
      character: null,
      obstacles: {},
      collectibles: {},
      sounds: {}
    };
    
    // Load assets
    this.loadAssets();
    
    // Load facts for today
    this.loadFacts();
    
    // Set up event listeners
    this.setupEventListeners();
    
    this.isInitialized = true;
  }
  
  private loadAssets(): void {
    // Load background
    const background = new Image();
    background.src = '/images/background.png';
    background.onload = () => this.assets.background = background;
    
    // Load ground
    const ground = new Image();
    ground.src = '/images/ground.png';
    ground.onload = () => this.assets.ground = ground;
    
    // Load character
    const character = new Image();
    character.src = '/images/brain.png';
    character.onload = () => this.assets.character = character;
    
    // Load collectible
    const factBubble = new Image();
    factBubble.src = '/images/fact-bubble.png';
    factBubble.onload = () => this.assets.collectibles.factBubble = factBubble;
    
    // Load obstacle
    const obstacle = new Image();
    obstacle.src = '/images/obstacle.png';
    obstacle.onload = () => this.assets.obstacles.basic = obstacle;
    
    // Load sounds
    const jumpSound = new Audio('/sounds/jump.mp3');
    this.assets.sounds.jump = jumpSound;
    
    const collectSound = new Audio('/sounds/collect.mp3');
    this.assets.sounds.collect = collectSound;
  }
  
  private loadPlayerStats(): PlayerStats {
    const stats = localStorage.getItem('brainRunnerStats');
    if (stats) {
      return JSON.parse(stats);
    }
    return {
      streak: 0,
      totalCollected: 0,
      lastPlayed: '',
      highScore: 0
    };
  }
  
  private savePlayerStats(): void {
    localStorage.setItem('brainRunnerStats', JSON.stringify(this.playerStats));
  }
  
  private loadFacts(): void {
    // For now, use a hardcoded array of facts
    // In a real implementation, this would fetch from an API or JSON file
    const facts: Fact[] = [
      {
        id: '1',
        date: '2023-04-09', // Use today's date in production
        content: 'The human brain is 73% water. It takes only 2% dehydration to affect your attention, memory and other cognitive skills.',
        category: 'science',
        collected: false
      },
      {
        id: '2',
        date: '2023-04-10',
        content: 'Humans are the only animals that blush.',
        category: 'biology',
        collected: false
      },
      {
        id: '3',
        date: '2023-04-11',
        content: 'The average person has about 70,000 thoughts per day.',
        category: 'psychology',
        collected: false
      }
    ];
    
    this.gameState.facts = facts;
    
    // Set the current fact based on today's date
    const today = new Date().toISOString().split('T')[0];
    this.gameState.currentFact = facts.find(fact => fact.date === today) || facts[0];
  }
  
  private setupEventListeners(): void {
    // Jump on click/tap/spacebar
    const handleJump = () => {
      if (!this.gameState.isRunning) {
        this.start();
        return;
      }
      
      if (!this.character.isJumping) {
        this.character.isJumping = true;
        this.character.velocityY = -12;
        if (this.assets.sounds.jump) {
          this.assets.sounds.jump.play().catch(err => console.error('Audio playback error:', err));
        }
      }
    };
    
    this.canvas.addEventListener('click', handleJump);
    
    document.addEventListener('keydown', (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        handleJump();
      }
    });
    
    // Mobile touch controls
    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      handleJump();
    });
  }
  
  public start(): void {
    if (this.gameState.isRunning) return;
    
    this.gameState.isRunning = true;
    this.gameState.score = 0;
    this.gameState.distance = 0;
    this.gameState.speed = 1.5;
    
    // Reset character position
    this.groundY = this.canvas.height * 0.75;
    this.character.y = this.groundY - this.character.height;
    
    // Clear obstacles and collectibles
    this.obstacles = [];
    this.collectibles = [];
    
    if (this.gameState.currentFact && !this.factDisplayed) {
      this.spawnCollectible(this.gameState.currentFact);
      this.factDisplayed = true;
    }
    
    // Start the game loop with proper timing
    this.lastFrameTime = performance.now();
    this.gameLoop(this.lastFrameTime);
  }
  
  public stop(): void {
    this.gameState.isRunning = false;
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  }
  
  private gameLoop(timestamp: number): void {
    if (!this.gameState.isRunning) return;
    
    const deltaTime = Math.min(timestamp - this.lastFrameTime, 50) / 1000; // Cap at 50ms to prevent jumps
    this.lastFrameTime = timestamp;
    
    // Update game state
    this.update(deltaTime);
    
    // Render the game
    this.render();
    
    // Continue the loop
    this.animationFrame = requestAnimationFrame(this.gameLoop.bind(this));
  }
  
  private update(deltaTime: number): void {
    // Update score and distance
    this.gameState.distance += this.gameState.speed * deltaTime;
    
    // Update ground position
    this.groundPos = (this.groundPos + this.groundSpeed) % this.canvas.width;
    
    // Update character
    this.updateCharacter(deltaTime);
    
    // Update obstacles
    this.updateObstacles(deltaTime);
    
    // Update collectibles
    this.updateCollectibles(deltaTime);
    
    // Spawn obstacles less frequently
    if (Math.random() < 0.005) { // Reduced from 0.007 to 0.005
      this.spawnObstacle();
    }
    
    // Increase speed more gradually and cap it
    if (this.gameState.speed < this.maxSpeed) {
      this.gameState.speed += 0.0002; // Reduced from 0.0005 to 0.0002
    }
  }
  
  private updateCharacter(deltaTime: number): void {
    // Handle gravity with reduced acceleration
    if (this.character.isJumping) {
      this.character.velocityY += 0.25; // Reduced from 0.4 to 0.25 (37% reduction)
      this.character.y += this.character.velocityY;
      
      // Check if landed
      if (this.character.y >= this.groundY - this.character.height) {
        this.character.y = this.groundY - this.character.height;
        this.character.isJumping = false;
        this.character.velocityY = 0;
      }
    }
    
    // Animate the character at a slower rate
    if (performance.now() % 300 < 150) { // Slowed down from 200ms to 300ms
      this.character.frame = (this.character.frame + 1) % 2;
    }
    
    // Check for collisions with obstacles
    for (const obstacle of this.obstacles) {
      if (this.checkCollision(this.character, obstacle)) {
        this.gameOver();
        return;
      }
    }
  }
  
  private updateObstacles(deltaTime: number): void {
    // Move obstacles and remove those off-screen
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      this.obstacles[i].x -= this.gameState.speed;
      
      if (this.obstacles[i].x + this.obstacles[i].width < 0) {
        this.obstacles.splice(i, 1);
      }
    }
  }
  
  private updateCollectibles(deltaTime: number): void {
    for (let i = this.collectibles.length - 1; i >= 0; i--) {
      this.collectibles[i].x -= this.gameState.speed;
      
      // Check for collection
      if (!this.collectibles[i].collected && this.checkCollision(this.character, this.collectibles[i])) {
        this.collectibles[i].collected = true;
        this.gameState.score += 1;
        
        // Update fact status
        if (this.gameState.currentFact && this.gameState.currentFact.id === this.collectibles[i].fact.id) {
          this.gameState.currentFact.collected = true;
          
          // Update player stats
          this.updatePlayerStats();
        }
        
        // Play collect sound
        if (this.assets.sounds.collect) {
          this.assets.sounds.collect.play().catch(err => console.error('Audio playback error:', err));
        }
      }
      
      // Remove off-screen collectibles
      if (this.collectibles[i].x + this.collectibles[i].width < 0) {
        this.collectibles.splice(i, 1);
      }
    }
  }
  
  private updatePlayerStats(): void {
    const today = new Date().toISOString().split('T')[0];
    
    // Update streak
    if (this.playerStats.lastPlayed) {
      const lastPlayed = new Date(this.playerStats.lastPlayed);
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (yesterday.toISOString().split('T')[0] === this.playerStats.lastPlayed) {
        // Played yesterday, increment streak
        this.playerStats.streak += 1;
      } else if (this.playerStats.lastPlayed !== today) {
        // Didn't play yesterday and not already played today, reset streak
        this.playerStats.streak = 1;
      }
    } else {
      // First time playing
      this.playerStats.streak = 1;
    }
    
    this.playerStats.lastPlayed = today;
    this.playerStats.totalCollected += 1;
    
    if (this.gameState.score > this.playerStats.highScore) {
      this.playerStats.highScore = this.gameState.score;
    }
    
    // Save the updated stats
    this.savePlayerStats();
  }
  
  private spawnObstacle(): void {
    const obstacle: Obstacle = {
      x: this.canvas.width,
      y: this.groundY - 40,
      width: 30,
      height: 40,
      type: 'basic'
    };
    
    this.obstacles.push(obstacle);
  }
  
  private spawnCollectible(fact: Fact): void {
    const collectible: Collectible = {
      x: this.canvas.width,
      y: this.groundY - 100,
      width: 100,
      height: 80,
      fact: fact,
      collected: false
    };
    
    this.collectibles.push(collectible);
  }
  
  private checkCollision(a: { x: number, y: number, width: number, height: number }, 
                         b: { x: number, y: number, width: number, height: number }): boolean {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
  }
  
  private gameOver(): void {
    this.stop();
    
    // Display game over screen
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.ctx.fillStyle = 'white';
    this.ctx.font = '32px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('Game Over', this.canvas.width / 2, this.canvas.height / 2 - 50);
    
    this.ctx.font = '24px Arial';
    this.ctx.fillText(`Score: ${this.gameState.score}`, this.canvas.width / 2, this.canvas.height / 2);
    this.ctx.fillText(`Distance: ${Math.floor(this.gameState.distance)}m`, this.canvas.width / 2, this.canvas.height / 2 + 40);
    
    this.ctx.font = '18px Arial';
    this.ctx.fillText('Click to play again', this.canvas.width / 2, this.canvas.height / 2 + 90);
  }
  
  private render(): void {
    // Store current transform
    this.ctx.save();
    
    // Clear canvas with a solid background to prevent flickering
    this.ctx.fillStyle = '#87CEEB';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw sky gradient
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(0.7, '#98FB98');
    gradient.addColorStop(1, '#90EE90');
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw moving clouds (only if game is running to prevent constant movement)
    if (this.gameState.isRunning) {
      this.drawMovingClouds();
    } else {
      this.drawClouds();
    }
    
    // Draw ground
    this.ctx.fillStyle = '#8B4513';
    this.ctx.fillRect(0, this.groundY, this.canvas.width, this.canvas.height - this.groundY);
    
    // Draw grass
    this.ctx.fillStyle = '#228B22';
    this.ctx.fillRect(0, this.groundY, this.canvas.width, 10);
    
    // Draw ground pattern only if game is running
    if (this.gameState.isRunning) {
      this.ctx.fillStyle = '#654321';
      for (let i = 0; i < this.canvas.width; i += 20) {
        this.ctx.fillRect(i - this.groundPos % 20, this.groundY + 15, 3, 10);
      }
    }
    
    // Draw collectibles
    for (const collectible of this.collectibles) {
      if (collectible.collected) continue;
      
      if (this.assets.collectibles.factBubble) {
        this.ctx.drawImage(
          this.assets.collectibles.factBubble,
          collectible.x,
          collectible.y,
          collectible.width,
          collectible.height
        );
      } else {
        // Fallback collectible
        this.ctx.fillStyle = '#FFD700';
        this.ctx.fillRect(collectible.x, collectible.y, collectible.width, collectible.height);
      }
      
      // Draw fact text on collectible
      this.ctx.fillStyle = 'black';
      this.ctx.font = '12px Arial';
      this.ctx.textAlign = 'center';
      
      // Wrap text to fit in bubble
      const maxLineWidth = collectible.width - 20;
      const words = collectible.fact.content.split(' ');
      let line = '';
      let y = collectible.y + 30;
      
      for (const word of words) {
        const testLine = line + word + ' ';
        const metrics = this.ctx.measureText(testLine);
        const testWidth = metrics.width;
        
        if (testWidth > maxLineWidth && line !== '') {
          this.ctx.fillText(line, collectible.x + collectible.width/2, y);
          line = word + ' ';
          y += 15;
          
          // Limit to 3 lines
          if (y > collectible.y + 75) break;
        } else {
          line = testLine;
        }
      }
      this.ctx.fillText(line, collectible.x + collectible.width/2, y);
    }
    
    // Draw obstacles
    for (const obstacle of this.obstacles) {
      if (this.assets.obstacles.basic) {
        this.ctx.drawImage(
          this.assets.obstacles.basic,
          obstacle.x,
          obstacle.y,
          obstacle.width,
          obstacle.height
        );
      } else {
        // Fallback obstacle
        this.ctx.fillStyle = '#FF0000';
        this.ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
      }
    }
    
    // Draw character
    this.drawCharacter();
    
    // Draw UI only if game is running
    if (this.gameState.isRunning) {
      this.drawUI();
    }
    
    // Restore transform
    this.ctx.restore();
  }
  
  private drawUI(): void {
    this.ctx.fillStyle = 'white';
    this.ctx.strokeStyle = 'black';
    this.ctx.lineWidth = 1;
    this.ctx.font = 'bold 20px Arial';
    this.ctx.textAlign = 'left';
    
    const scoreText = `Score: ${this.gameState.score}`;
    this.ctx.strokeText(scoreText, 20, 30);
    this.ctx.fillText(scoreText, 20, 30);
    
    const distanceText = `Distance: ${Math.floor(this.gameState.distance)}m`;
    this.ctx.strokeText(distanceText, 20, 60);
    this.ctx.fillText(distanceText, 20, 60);
    
    if (this.playerStats.streak > 1) {
      const streakText = `Streak: ${this.playerStats.streak} days`;
      this.ctx.strokeText(streakText, 20, 90);
      this.ctx.fillText(streakText, 20, 90);
    }
  }
  
  public drawInitialScreen(): void {
    if (!this.isInitialized) return;
    
    // Store current transform
    this.ctx.save();
    
    // Clear canvas completely
    this.ctx.fillStyle = '#87CEEB';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw sky gradient
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(1, '#98FB98');
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw ground
    this.ctx.fillStyle = '#8B4513';
    this.ctx.fillRect(0, this.groundY, this.canvas.width, this.canvas.height - this.groundY);
    
    // Draw grass on ground
    this.ctx.fillStyle = '#228B22';
    this.ctx.fillRect(0, this.groundY, this.canvas.width, 10);
    
    // Draw character at starting position
    this.drawCharacter();
    
    // Draw static clouds
    this.drawClouds();
    
    // Draw welcome text
    this.ctx.fillStyle = 'white';
    this.ctx.strokeStyle = 'black';
    this.ctx.lineWidth = 2;
    this.ctx.font = 'bold 24px Arial';
    this.ctx.textAlign = 'center';
    const welcomeText = 'Click to Start Your Brain Adventure!';
    this.ctx.strokeText(welcomeText, this.canvas.width / 2, 50);
    this.ctx.fillText(welcomeText, this.canvas.width / 2, 50);
    
    // Restore transform
    this.ctx.restore();
  }
  
  private drawClouds(): void {
    this.ctx.fillStyle = 'white';
    
    // Draw several clouds
    const clouds = [
      { x: this.canvas.width * 0.1, y: 50, size: 30 },
      { x: this.canvas.width * 0.3, y: 80, size: 25 },
      { x: this.canvas.width * 0.6, y: 60, size: 35 },
      { x: this.canvas.width * 0.8, y: 90, size: 28 }
    ];
    
    clouds.forEach(cloud => {
      // Draw cloud as overlapping circles
      this.ctx.beginPath();
      this.ctx.arc(cloud.x, cloud.y, cloud.size, 0, Math.PI * 2);
      this.ctx.arc(cloud.x - cloud.size * 0.5, cloud.y, cloud.size * 0.8, 0, Math.PI * 2);
      this.ctx.arc(cloud.x + cloud.size * 0.5, cloud.y, cloud.size * 0.8, 0, Math.PI * 2);
      this.ctx.fill();
    });
  }
  
  private drawCharacter(): void {
    if (this.assets.character) {
      this.ctx.drawImage(
        this.assets.character,
        this.character.x,
        this.character.y,
        this.character.width,
        this.character.height
      );
    } else {
      // Enhanced fallback character (brain)
      const centerX = this.character.x + this.character.width / 2;
      const centerY = this.character.y + this.character.height / 2;
      
      // Draw brain body
      this.ctx.fillStyle = '#FFB6C1';
      this.ctx.strokeStyle = '#FF69B4';
      this.ctx.lineWidth = 3;
      this.ctx.beginPath();
      this.ctx.ellipse(centerX, centerY, 25, 20, 0, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.stroke();
      
      // Draw brain wrinkles
      this.ctx.strokeStyle = '#FF1493';
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.arc(centerX - 8, centerY - 5, 8, 0, Math.PI);
      this.ctx.arc(centerX + 8, centerY - 5, 8, 0, Math.PI);
      this.ctx.arc(centerX, centerY + 3, 10, 0, Math.PI);
      this.ctx.stroke();
      
      // Draw eyes
      this.ctx.fillStyle = 'white';
      this.ctx.beginPath();
      this.ctx.arc(centerX - 8, centerY - 8, 4, 0, Math.PI * 2);
      this.ctx.arc(centerX + 8, centerY - 8, 4, 0, Math.PI * 2);
      this.ctx.fill();
      
      // Draw pupils
      this.ctx.fillStyle = 'black';
      this.ctx.beginPath();
      this.ctx.arc(centerX - 8, centerY - 8, 2, 0, Math.PI * 2);
      this.ctx.arc(centerX + 8, centerY - 8, 2, 0, Math.PI * 2);
      this.ctx.fill();
      
      // Draw smile
      this.ctx.strokeStyle = '#FF1493';
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.arc(centerX, centerY + 2, 8, 0, Math.PI);
      this.ctx.stroke();
    }
  }
  
  private drawMovingClouds(): void {
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    
    // Moving clouds based on game distance
    const cloudOffset = (this.gameState.distance * 0.1) % (this.canvas.width + 200);
    
    const clouds = [
      { x: this.canvas.width * 0.1 - cloudOffset, y: 50, size: 30 },
      { x: this.canvas.width * 0.4 - cloudOffset * 0.7, y: 80, size: 25 },
      { x: this.canvas.width * 0.7 - cloudOffset * 1.2, y: 60, size: 35 },
      { x: this.canvas.width * 1.1 - cloudOffset, y: 90, size: 28 }
    ];
    
    clouds.forEach(cloud => {
      if (cloud.x > -100 && cloud.x < this.canvas.width + 100) {
        this.ctx.beginPath();
        this.ctx.arc(cloud.x, cloud.y, cloud.size, 0, Math.PI * 2);
        this.ctx.arc(cloud.x - cloud.size * 0.5, cloud.y, cloud.size * 0.8, 0, Math.PI * 2);
        this.ctx.arc(cloud.x + cloud.size * 0.5, cloud.y, cloud.size * 0.8, 0, Math.PI * 2);
        this.ctx.fill();
      }
    });
  }
  
  public resize(): void {
    // Update groundY based on new canvas height
    this.groundY = this.canvas.height * 0.75;
    
    // Reposition character if not jumping
    if (!this.character.isJumping) {
      this.character.y = this.groundY - this.character.height;
    }
    
    // Redraw the current state
    if (!this.gameState.isRunning) {
      this.drawInitialScreen();
    }
  }
  
  public getTodaysFact(): Fact | null {
    return this.gameState.currentFact;
  }
  
  public getPlayerStats(): PlayerStats {
    return this.playerStats;
  }
}
