
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
  onGameBoardReady: (gameBoard: GameBoard | null) => void;
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
  const prevGameSpeedRef = useRef<number>(gameSpeed);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const updateCanvasSize = () => {
      const maxSize = Math.min(800, window.innerWidth - 40);
      const size = Math.min(window.innerWidth - 40, maxSize);
      canvas.width = size;
      canvas.height = size;
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    if (gameRef.current) {
      gameRef.current.stop();
      gameRef.current = null;
    }

    gameRef.current = new GameBoard(ctx, aiOpponentCount, playerMode, difficulty);
    gameRef.current.onStatsUpdate = onStatsUpdate;
    
    if (activeSkin && gameRef.current) {
      gameRef.current.setPlayerSkin(activeSkin);
    }
    
    if (gameRef.current && gameSpeed !== prevGameSpeedRef.current) {
      gameRef.current.setGameSpeed(gameSpeed);
      prevGameSpeedRef.current = gameSpeed;
    }
    
    gameRef.current.start();
    onGameBoardReady(gameRef.current);

    return () => {
      window.removeEventListener('resize', updateCanvasSize);
      if (gameRef.current) {
        gameRef.current.stop();
        gameRef.current = null;
      }
      onGameBoardReady(null);
    };
  }, [aiOpponentCount, playerMode, difficulty, onStatsUpdate, activeSkin, onGameBoardReady]);

  useEffect(() => {
    if (gameRef.current && gameSpeed !== prevGameSpeedRef.current) {
      gameRef.current.setGameSpeed(gameSpeed);
      prevGameSpeedRef.current = gameSpeed;
    }
  }, [gameSpeed]);

  useEffect(() => {
    if (gameOver && gameRef.current) {
      gameRef.current.stop();
    }
  }, [gameOver]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full aspect-square rounded-xl bg-black/80 border-2 border-purple-400/30 shadow-[0_0_50px_rgba(168,85,247,0.4)] backdrop-blur-sm"
    />
  );
}
