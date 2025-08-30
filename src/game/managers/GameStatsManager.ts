
import { Snake } from '../Snake';
import { Position } from '../types';
import { getUnlockedSkins } from '../GameAssets';

export interface GameStats {
  topSnakes: {
    color: string;
    score: number;
  }[];
  activeSnakes: number;
  foodItems: number;
  elapsedTime: string;
  playerScore: number | null;
  difficulty: number;
  unlockedSkins: number;
  activePowerUps: any[];
  isPlayerAlive: boolean;
}

export class GameStatsManager {
  private startTime: number;
  public onStatsUpdate: ((stats: GameStats) => void) | null = null;

  constructor() {
    this.startTime = Date.now();
  }

  resetStartTime() {
    this.startTime = Date.now();
  }

  updateStats(snakes: Snake[], food: Position[], difficulty: number, playerSnake: Snake | null) {
    const seconds = Math.floor((Date.now() - this.startTime) / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    const formattedTime = `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    
    // Update DOM elements if they exist
    const activeSnakesElement = document.getElementById('activeSnakes');
    const foodItemsElement = document.getElementById('foodItems');
    const elapsedTimeElement = document.getElementById('elapsedTime');

    if (activeSnakesElement) {
      activeSnakesElement.textContent = snakes.filter(s => s.isAlive).length.toString();
    }
    
    if (foodItemsElement) {
      foodItemsElement.textContent = food.length.toString();
    }
    
    if (elapsedTimeElement) {
      elapsedTimeElement.textContent = formattedTime;
    }
    
    // Notify parent component of stats update
    if (this.onStatsUpdate) {
      const topSnakes = [...snakes]
        .sort((a, b) => b.score - a.score)
        .slice(0, 5)
        .map(snake => ({
          color: snake.color,
          score: snake.score
        }));
        
      const playerScore = playerSnake?.score || null;
      const unlockedSkins = playerScore !== null ? getUnlockedSkins(playerScore).length : 0;
      const activePowerUps = playerSnake?.activePowerUps || [];
        
      this.onStatsUpdate({
        topSnakes,
        activeSnakes: snakes.filter(s => s.isAlive).length,
        foodItems: food.length,
        elapsedTime: formattedTime,
        playerScore,
        difficulty,
        unlockedSkins,
        activePowerUps,
        isPlayerAlive: playerSnake?.isAlive ?? false
      });
    }
  }
}
