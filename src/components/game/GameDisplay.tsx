
import { useEffect, useRef } from 'react';
import { GameBoard } from '../../game/GameBoard';

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
  const gameRef = useRef<GameBoard | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const canvas = canvasRef.current;
    const container = containerRef.current;

    // Set canvas size
    const updateCanvasSize = () => {
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;
      const size = Math.min(containerWidth, containerHeight, 600);
      
      canvas.width = size;
      canvas.height = size;
      canvas.style.width = `${size}px`;
      canvas.style.height = `${size}px`;
    };

    updateCanvasSize();

    // Clean up previous game instance
    if (gameRef.current) {
      gameRef.current.stop();
      gameRef.current = null;
    }

    try {
      // Initialize new game instance with correct constructor signature
      const ctx = canvas.getContext('2d');
      if (ctx) {
        gameRef.current = new GameBoard(ctx, aiOpponentCount, playerMode, difficulty);
        gameRef.current.onStatsUpdate = onStatsUpdate;
        
        // Set player skin if in player mode
        if (playerMode && activeSkin) {
          gameRef.current.setPlayerSkin(activeSkin);
        }
        
        // Set game speed
        gameRef.current.setGameSpeed(gameSpeed);
        
        // Start the game
        gameRef.current.start();
      }
      
      onGameBoardReady(gameRef.current);
    } catch (error) {
      console.error('Failed to initialize GameBoard:', error);
    }

    // Handle resize
    const handleResize = () => {
      updateCanvasSize();
      // GameBoard doesn't have a resize method, so we don't call it
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (gameRef.current) {
        gameRef.current.stop();
        gameRef.current = null;
      }
      onGameBoardReady(null);
    };
  }, [playerMode, aiOpponentCount, difficulty, activeSkin, gameSpeed, onStatsUpdate, onGameBoardReady]);

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
