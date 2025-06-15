
import { BaseRenderer } from './BaseRenderer';
import { Position } from '../types';
import { POWER_UPS } from '../GameAssets';

export class ItemRenderer extends BaseRenderer {
  drawFood(food: Position[]) {
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

  drawPowerUps(powerUps: Position[], powerUpTypes: string[]) {
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
}
