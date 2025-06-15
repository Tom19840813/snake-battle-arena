
import { PowerUpState } from '../types';
import { teleport, createSplitSnake } from '../powers/powerUps';

export class SnakePowerUps {
  static addPowerUp(snake: any, powerUpId: string, effect: string, duration: number) {
    // Don't stack same power-ups, just refresh the timer
    const existingPowerUpIndex = snake.activePowerUps.findIndex((p: PowerUpState) => p.effect === effect);
    
    if (existingPowerUpIndex >= 0) {
      snake.activePowerUps[existingPowerUpIndex].timeLeft = duration;
      snake.activePowerUps[existingPowerUpIndex].startTime = Date.now();
    } else {
      snake.activePowerUps.push({
        type: powerUpId,
        effect,
        timeLeft: duration,
        startTime: Date.now()
      });
    }

    // Handle instant effects
    if (effect === "teleport") {
      teleport(snake);
    } else if (effect === "split" && !snake.splitSnake && snake.body.length > 3) {
      createSplitSnake(snake);
    }
  }

  static updatePowerUps(snake: any) {
    const now = Date.now();
    snake.activePowerUps = snake.activePowerUps.filter((powerUp: PowerUpState) => {
      const elapsedSeconds = (now - powerUp.startTime) / 1000;
      return elapsedSeconds < powerUp.timeLeft;
    });
  }

  static hasPowerUp(snake: any, effect: string): boolean {
    return snake.activePowerUps.some((p: PowerUpState) => p.effect === effect);
  }
}
