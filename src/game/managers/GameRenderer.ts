
import { Snake } from '../Snake';
import { Position } from '../types';
import { BaseRenderer } from '../renderers/BaseRenderer';
import { GridRenderer } from '../renderers/GridRenderer';
import { ItemRenderer } from '../renderers/ItemRenderer';
import { SnakeRenderer } from '../renderers/SnakeRenderer';

export class GameRenderer extends BaseRenderer {
  private gridRenderer: GridRenderer;
  private itemRenderer: ItemRenderer;
  private snakeRenderer: SnakeRenderer;

  constructor(ctx: CanvasRenderingContext2D, gridSize: number) {
    super(ctx, gridSize);
    
    this.gridRenderer = new GridRenderer(ctx, gridSize);
    this.itemRenderer = new ItemRenderer(ctx, gridSize);
    this.snakeRenderer = new SnakeRenderer(ctx, gridSize);
  }

  updateCellSize() {
    super.updateCellSize();
    this.gridRenderer.updateCellSize();
    this.itemRenderer.updateCellSize();
    this.snakeRenderer.updateCellSize();
  }

  draw(snakes: Snake[], food: Position[], powerUps: Position[], powerUpTypes: string[]) {
    this.drawWithInterpolation(snakes, food, powerUps, powerUpTypes);
  }

  drawWithInterpolation(snakes: any[], food: Position[], powerUps: Position[], powerUpTypes: string[]) {
    // Optimized clearing with minimal operations
    this.clearCanvas();

    // Draw all game elements using specialized renderers
    this.gridRenderer.drawGrid();
    this.itemRenderer.drawFood(food);
    this.itemRenderer.drawPowerUps(powerUps, powerUpTypes);
    this.snakeRenderer.drawSnakes(snakes);
  }
}
