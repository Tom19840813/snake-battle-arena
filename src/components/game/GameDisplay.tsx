
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
  performanceMode?: boolean;
  onGameBoardReady: (gameBoard: any) => void;
}

export function GameDisplay({
  playerMode,
  gameOver,
  aiOpponentCount,
  difficulty,
  activeSkin,
  onStatsUpdate,
  gameSpeed = 1.5,
  performanceMode = false,
  onGameBoardReady
}: GameDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<GameBoard | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);

  // Initialize game only once
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current || initializedRef.current) return;

    const canvas = canvasRef.current;
    const container = containerRef.current;

    // Set canvas size FIRST
    const updateCanvasSize = () => {
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;
      const size = Math.min(containerWidth, containerHeight, 600);
      
      canvas.width = size;
      canvas.height = size;
      canvas.style.width = `${size}px`;
      canvas.style.height = `${size}px`;
      
      console.log(`Canvas sized to: ${size}x${size}`);
    };

    // Size the canvas first
    updateCanvasSize();

    try {
      // Initialize new game instance AFTER canvas is sized
      const ctx = canvas.getContext('2d');
      if (ctx && canvas.width > 0 && canvas.height > 0) {
        console.log('Creating GameBoard with canvas dimensions:', canvas.width, canvas.height);
        gameRef.current = new GameBoard(ctx, aiOpponentCount, playerMode, difficulty);
        gameRef.current.onStatsUpdate = onStatsUpdate;
        
        // Set player skin if in player mode
        if (playerMode && activeSkin) {
          gameRef.current.setPlayerSkin(activeSkin);
        }
        
        // Set game speed and performance mode
        gameRef.current.setGameSpeed(gameSpeed);
        gameRef.current.setPerformanceMode(performanceMode);
        
        // Start the game
        gameRef.current.start();
        
        console.log('GameBoard created and started successfully');
        initializedRef.current = true;
      } else {
        console.error('Canvas context not available or canvas not sized properly');
      }
      
      onGameBoardReady(gameRef.current);
    } catch (error) {
      console.error('Failed to initialize GameBoard:', error);
    }

    // Handle resize
    const handleResize = () => {
      updateCanvasSize();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (gameRef.current) {
        gameRef.current.stop();
        gameRef.current = null;
      }
      initializedRef.current = false;
      onGameBoardReady(null);
    };
  }, []); // Empty dependency array to run only once

  // Handle game over separately
  useEffect(() => {
    if (gameOver && gameRef.current) {
      gameRef.current.stop();
    }
  }, [gameOver]);

  // Handle skin changes
  useEffect(() => {
    if (gameRef.current && playerMode && activeSkin) {
      gameRef.current.setPlayerSkin(activeSkin);
    }
  }, [activeSkin, playerMode]);

  // Handle game speed changes
  useEffect(() => {
    if (gameRef.current) {
      gameRef.current.setGameSpeed(gameSpeed);
    }
  }, [gameSpeed]);

  // Handle performance mode changes
  useEffect(() => {
    if (gameRef.current) {
      gameRef.current.setPerformanceMode(performanceMode);
    }
  }, [performanceMode]);

  return (
    <div 
      ref={containerRef}
      className="w-full aspect-square max-w-[600px] mx-auto"
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full rounded-xl bg-black/80 border-2 border-purple-400/30 shadow-[0_0_50px_rgba(168,85,247,0.4)] backdrop-blur-sm"
        style={{ 
          imageRendering: 'pixelated',
          willChange: 'transform',
          transform: 'translate3d(0, 0, 0)' // Enable hardware acceleration
        }}
      />
    </div>
  );
}
