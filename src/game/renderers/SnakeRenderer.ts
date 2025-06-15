
import { BaseRenderer } from './BaseRenderer';
import { Position } from '../types';

export class SnakeRenderer extends BaseRenderer {
  drawSnakes(snakes: any[]) {
    snakes.forEach(snake => {
      if (!snake.isAlive) {
        // If it's the player snake and just died, draw death animation
        if (snake.isPlayer) {
          this.drawDeathAnimation(snake);
        }
        return;
      }
      
      this.drawSnakeImproved(snake);
    });
  }

  private drawSnakeImproved(snake: any) {
    // Apply special rendering for invisible snakes
    const isInvisible = snake.hasPowerUp && snake.hasPowerUp("invisible");
    const hasShield = snake.hasPowerUp && snake.hasPowerUp("shield");
    
    // Draw snake body with improved segment rendering
    snake.body.forEach((segment: any, index: number) => {
      // Rainbow pattern
      let color = snake.color;
      if (snake.activePattern === "rainbow") {
        const hue = (Date.now() / 20 + index * 10) % 360;
        color = `hsl(${hue}, 70%, 60%)`;
      }
      
      // Calculate segment opacity with better falloff
      let alpha = 1;
      if (isInvisible) {
        alpha = 0.3; // Very transparent when invisible
      } else {
        // Smooth opacity gradient from head to tail
        alpha = index === 0 ? 1 : Math.max(0.3, 1 - (index / snake.body.length) * 0.7);
      }
      
      // Improved segment rendering with proper positioning and smoother corners
      const x = segment.x * this.cellSize;
      const y = segment.y * this.cellSize;
      const size = this.cellSize * 0.9; // Smaller to prevent overlap
      const offset = this.cellSize * 0.05; // Center the segments
      const cornerRadius = size * 0.2; // More rounded corners
      
      this.ctx.fillStyle = color;
      this.ctx.globalAlpha = alpha;
      
      // Draw segment with rounded corners for smoother appearance
      this.ctx.beginPath();
      this.ctx.roundRect(x + offset, y + offset, size, size, cornerRadius);
      this.ctx.fill();
      
      // Draw patterns
      if (snake.activePattern === "gradient" && index === 0) {
        this.drawGradientPattern(segment, color);
      }
      
      if (snake.activePattern === "pulse") {
        this.drawPulsePattern(segment);
      }
      
      // Reset alpha for next segment
      this.ctx.globalAlpha = 1;
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
