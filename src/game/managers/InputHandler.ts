
import { Snake } from '../Snake';

export class InputHandler {
  private playerSnake: Snake | null = null;
  private keyboardListener: ((e: KeyboardEvent) => void) | null = null;
  private canvas: HTMLCanvasElement;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
  }

  setPlayerSnake(snake: Snake | null) {
    this.playerSnake = snake;
  }

  setupControls() {
    this.setupKeyboardControls();
    this.setupTouchControls();
  }

  cleanup() {
    if (this.keyboardListener) {
      window.removeEventListener('keydown', this.keyboardListener);
      this.keyboardListener = null;
    }
  }

  private setupKeyboardControls() {
    this.keyboardListener = this.handleKeyDown.bind(this);
    window.addEventListener('keydown', this.keyboardListener);
  }

  private setupTouchControls() {
    let startX = 0;
    let startY = 0;
    
    this.canvas.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      e.preventDefault();
    }, { passive: false });
    
    this.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
    }, { passive: false });
    
    this.canvas.addEventListener('touchend', (e) => {
      if (!this.playerSnake || !this.playerSnake.isAlive) return;
      
      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      
      const deltaX = endX - startX;
      const deltaY = endY - startY;
      
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX > 0) {
          this.playerSnake.setDirection({ x: 1, y: 0 });
        } else {
          this.playerSnake.setDirection({ x: -1, y: 0 });
        }
      } else {
        if (deltaY > 0) {
          this.playerSnake.setDirection({ x: 0, y: 1 });
        } else {
          this.playerSnake.setDirection({ x: 0, y: -1 });
        }
      }
      
      e.preventDefault();
    }, { passive: false });
  }

  private handleKeyDown(e: KeyboardEvent) {
    if (!this.playerSnake || !this.playerSnake.isAlive) return;
    
    switch (e.key) {
      case 'ArrowUp':
        this.playerSnake.setDirection({ x: 0, y: -1 });
        e.preventDefault();
        break;
      case 'ArrowDown':
        this.playerSnake.setDirection({ x: 0, y: 1 });
        e.preventDefault();
        break;
      case 'ArrowLeft':
        this.playerSnake.setDirection({ x: -1, y: 0 });
        e.preventDefault();
        break;
      case 'ArrowRight':
        this.playerSnake.setDirection({ x: 1, y: 0 });
        e.preventDefault();
        break;
    }
  }
}
