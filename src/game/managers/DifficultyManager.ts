
import { Snake } from '../Snake';

export class DifficultyManager {
  updateDifficultyBasedOnScore(snakes: Snake[], difficulty: number) {
    const playerSnake = snakes.find(s => s.isPlayer);
    if (playerSnake && playerSnake.isAlive) {
      const score = playerSnake.score;
      let newDifficulty = 1;
      
      if (score >= 100) {
        newDifficulty = 3;  // Advanced
      } else if (score >= 50) {
        newDifficulty = 2;  // Intermediate
      }
      
      if (newDifficulty !== difficulty) {
        // Update existing snake difficulties
        snakes.forEach((snake, index) => {
          if (!snake.isPlayer) {
            const snakeDifficulty = index < 3 ? newDifficulty : Math.max(1, newDifficulty - 1);
            snake.setDifficulty(snakeDifficulty);
          }
        });
      }
    }
  }
}
