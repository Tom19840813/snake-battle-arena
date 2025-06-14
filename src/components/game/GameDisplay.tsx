
import { useEffect, useRef } from 'react';
import { BrainRunner } from '../../game/BrainRunner';

interface GameDisplayProps {
  playerMode: boolean;
  gameOver: boolean;
  aiOpponentCount: number;
  difficulty: number;
  activeSkin: string;
  onStatsUpdate: (stats: any) => void;
  gameSpeed?: number;
  onGameBoardReady: (gameBoard: any) => void;
}

export function GameDisplay({
  playerMode,
  gameOver,
  aiOpponentCount,
  difficulty,
  activeSkin,
  onStatsUpdate,
  gameSpeed = 0.5,
  onGameBoardReady
}: GameDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<BrainRunner | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const canvas = canvasRef.current;
    const container = containerRef.current;

    // Set fixed canvas size to prevent resizing issues
    const updateCanvasSize = () => {
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;
      const size = Math.min(containerWidth, containerHeight, 600);
      
      // Only update if size actually changed to prevent flickering
      if (canvas.width !== size || canvas.height !== size) {
        canvas.width = size;
        canvas.height = size;
        canvas.style.width = `${size}px`;
        canvas.style.height = `${size}px`;
      }
    };

    updateCanvasSize();

    // Clean up previous game instance
    if (gameRef.current) {
      gameRef.current.stop();
      gameRef.current = null;
    }

    try {
      // Initialize new game instance
      gameRef.current = new BrainRunner(canvas);
      
      // Draw initial screen immediately to prevent blank canvas
      gameRef.current.drawInitialScreen();
      
      onGameBoardReady(gameRef.current);
    } catch (error) {
      console.error('Failed to initialize BrainRunner:', error);
    }

    // Handle resize with debouncing to prevent excessive updates
    let resizeTimeout: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        updateCanvasSize();
        if (gameRef.current) {
          gameRef.current.resize();
        }
      }, 100);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimeout);
      if (gameRef.current) {
        gameRef.current.stop();
        gameRef.current = null;
      }
      onGameBoardReady(null);
    };
  }, [onGameBoardReady]);

  useEffect(() => {
    if (gameOver && gameRef.current) {
      gameRef.current.stop();
    }
  }, [gameOver]);

  return (
    <div 
      ref={containerRef}
      className="w-full aspect-square max-w-[600px] mx-auto"
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full rounded-xl bg-black/80 border-2 border-purple-400/30 shadow-[0_0_50px_rgba(168,85,247,0.4)] backdrop-blur-sm"
        style={{ imageRendering: 'pixelated' }}
      />
    </div>
  );
}
