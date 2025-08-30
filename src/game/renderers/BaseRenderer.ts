
export class BaseRenderer {
  protected ctx: CanvasRenderingContext2D;
  protected gridSize: number;
  protected cellSize: number;

  constructor(ctx: CanvasRenderingContext2D, gridSize: number) {
    this.ctx = ctx;
    this.gridSize = gridSize;
    this.cellSize = ctx.canvas.width / gridSize;
    
    // Optimized rendering settings for performance
    this.ctx.imageSmoothingEnabled = false; // Disable for pixel-perfect rendering
  }

  updateCellSize() {
    this.cellSize = this.ctx.canvas.width / this.gridSize;
  }

  protected enableAntiAliasing() {
    this.ctx.save();
    this.ctx.translate(0.5, 0.5); // Sub-pixel positioning for smoother lines
  }

  protected disableAntiAliasing() {
    this.ctx.restore();
  }

  protected clearCanvas() {
    // Optimized canvas clearing
    this.ctx.save();
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    this.ctx.restore();
  }
}
