
import { Snake } from '../Snake';
import { Position } from '../types';
import { POWER_UPS } from '../GameAssets';

export class GameRenderer {
  private ctx: CanvasRenderingContext2D;
  private gridSize: number;
  private cellSize: number;

  constructor(ctx: CanvasRenderingContext2D, gridSize: number) {
    this.ctx = ctx;
    this.gridSize = gridSize;
    this.cellSize = ctx.canvas.width / gridSize;
    
    // Enable hardware acceleration hints
    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = 'high';
  }

  updateCellSize() {
    this.cellSize = this.ctx.canvas.width / this.gridSize;
  }

  draw(snakes: Snake[], food: Position[], powerUps: Position[], powerUpTypes: string[]) {
    this.drawWithInterpolation(snakes, food, powerUps, powerUpTypes);
  }

  drawWithInterpolation(snakes: any[], food: Position[], powerUps: Position[], powerUpTypes: string[]) {
    const { width, height } = this.ctx.canvas;
    
    // Use hardware-accelerated clearing
    this.ctx.clearRect(0, 0, width, height);
    
    // Enable anti-aliasing for smoother visuals
    this.ctx.save();
    this.ctx.translate(0.5, 0.5); // Sub-pixel positioning for smoother lines

    // Draw grid
    this.drawGrid();
    
    // Draw food
    this.drawFood(food);
    
    // Draw power-ups
    this.drawPowerUps(powerUps, powerUpTypes);
    
    // Draw snakes with interpolation support
    this.drawInterpolatedSnakes(snakes);
    
    this.ctx.restore();
  }

  private drawGrid() {
    const { width, height } = this.ctx.canvas;
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    this.ctx.lineWidth = 1;
    
    // Use beginPath for better performance
    this.ctx.beginPath();
    for (let i = 0; i <= this.gridSize; i++) {
      const pos = i * this.cellSize;
      this.ctx.moveTo(pos, 0);
      this.ctx.lineTo(pos, height);
      this.ctx.moveTo(0, pos);
      this.ctx.lineTo(width, pos);
    }
    this.ctx.stroke();
  }

  private drawFood(food: Position[]) {
    food.forEach(f => {
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
  }

  private drawPowerUps(powerUps: Position[], powerUpTypes: string[]) {
    powerUps.forEach((p, index) => {
      const powerUpType = powerUpTypes[index];
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
  }

  private drawInterpolatedSnakes(snakes: any[]) {
    snakes.forEach(snake => {
      if (!snake.isAlive) {
        // If it's the player snake and just died, draw death animation
        if (snake.isPlayer) {
          this.drawDeathAnimation(snake);
        }
        return;
      }
      
      this.drawInterpolatedSnake(snake);
    });
  }

  private drawDeathAnimation(snake: any) {
    const head = snake.body[0];
    
    // Draw explosion effect
    const radius = Math.min(20, this.cellSize * 1.5);
    const gradient = this.ctx.createRadialGradient(
      (head.x + 0.5) * this.cellSize,
      (head.y + 0.5) * this.cellSize,
      0,
      (head.x + 0.5) * this.cellSize,
      (head.y + 0.5) * this.cellSize,
      radius
    );
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
    gradient.addColorStop(0.2, 'rgba(255, 50, 50, 0.9)');
    gradient.addColorStop(0.5, 'rgba(255, 0, 0, 0.7)');
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

  private drawInterpolatedSnake(snake: any) {
    // Apply special rendering for invisible snakes
    const isInvisible = snake.hasPowerUp && snake.hasPowerUp("invisible");
    const hasShield = snake.hasPowerUp && snake.hasPowerUp("shield");
    
    snake.body.forEach((segment: any, index: number) => {
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
      
      // Draw snake segment with sub-pixel positioning for smoothness
      const x = segment.x * this.cellSize;
      const y = segment.y * this.cellSize;
      
      // Add subtle rounding for smoother appearance
      this.ctx.beginPath();
      this.ctx.roundRect(x, y, this.cellSize, this.cellSize, this.cellSize * 0.1);
      this.ctx.fill();
      
      // Draw patterns
      if (snake.activePattern === "gradient" && index === 0) {
        this.drawGradientPattern(segment, color);
      }
      
      if (snake.activePattern === "pulse") {
        this.drawPulsePattern(segment);
      }
    });
    
    // Draw glow effect
    if (snake.glowEffect) {
      this.drawGlowEffect(snake);
    }
    
    // Draw shield effect
    if (hasShield) {
      this.drawShieldEffect(snake);
    }
  }

  private drawGradientPattern(segment: Position, color: string) {
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
    this.ctx.beginPath();
    this.ctx.roundRect(
      segment.x * this.cellSize,
      segment.y * this.cellSize,
      this.cellSize,
      this.cellSize,
      this.cellSize * 0.1
    );
    this.ctx.fill();
  }

  private drawPulsePattern(segment: Position) {
    const pulse = 0.5 + 0.5 * Math.sin(Date.now() / 200);
    this.ctx.globalAlpha = pulse;
    this.ctx.fillStyle = "white";
    this.ctx.beginPath();
    this.ctx.roundRect(
      segment.x * this.cellSize + this.cellSize * 0.25,
      segment.y * this.cellSize + this.cellSize * 0.25,
      this.cellSize * 0.5,
      this.cellSize * 0.5,
      this.cellSize * 0.1
    );
    this.ctx.fill();
    this.ctx.globalAlpha = 1;
  }

  private drawGlowEffect(snake: any) {
    const head = snake.body[0];
    this.ctx.shadowBlur = 10;
    this.ctx.shadowColor = snake.color;
    this.ctx.beginPath();
    this.ctx.roundRect(
      head.x * this.cellSize,
      head.y * this.cellSize,
      this.cellSize,
      this.cellSize,
      this.cellSize * 0.1
    );
    this.ctx.fill();
    this.ctx.shadowBlur = 0;
  }

  private drawShieldEffect(snake: any) {
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
}
