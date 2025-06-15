
export class SnakeVisuals {
  static applySkin(snake: any, skinId: string, skinColor: string, pattern: string | undefined, glow: boolean | undefined) {
    snake.skinId = skinId;
    snake.color = skinColor;
    snake.activePattern = pattern || null;
    snake.glowEffect = glow || false;
  }

  static setDifficulty(snake: any, newDifficulty: number): void {
    snake.difficulty = newDifficulty;
  }
}
