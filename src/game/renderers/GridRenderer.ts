
import { BaseRenderer } from './BaseRenderer';

export class GridRenderer extends BaseRenderer {
  drawGrid() {
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
}
