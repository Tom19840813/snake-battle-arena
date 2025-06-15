
export class BaseRenderer {
  protected ctx: CanvasRenderingContext2D;
  protected gridSize: number;
  protected cellSize: number;

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

  protected enableAntiAliasing() {
    this.ctx.save();
    this.ctx.translate(0.5, 0.5); // Sub-pixel positioning for smoother lines
  }

  protected disableAntiAliasing() {
    this.ctx.restore();
  }

  protected clearCanvas() {
    const { width, height } = this.ctx.canvas;
    this.ctx.clearRect(0, 0, width, height);
  }
}
