
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { GameBoard } from '../../game/GameBoard';
import { DeathAnimation } from './DeathAnimation';
import { SkinSelector } from './SkinSelector';
import { ControlsPanel } from './ControlsPanel';
import { Badge } from '@/components/ui/badge';
import { PowerUpState } from '../../game/types';

interface GameCanvasProps {
  playerMode: boolean;
  gameOver: boolean;
  aiOpponentCount: number;
  difficulty: number;
  activeSkin: string;
  playerScore: number | null;
  activePowerUps: PowerUpState[];
  onStatsUpdate: (stats: any) => void;
  onRestartGame: () => void;
  onSkinChange: (skinId: string) => void;
  gameSpeed?: number;
}

export function GameCanvas({
  playerMode,
  gameOver,
  aiOpponentCount,
  difficulty,
  activeSkin,
  playerScore,
  activePowerUps,
  onStatsUpdate,
  onRestartGame,
  onSkinChange,
  gameSpeed = 0.5
}: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<GameBoard | null>(null);
  const [showSkinSelector, setShowSkinSelector] = useState<boolean>(false);
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
    
    // Only set game speed if it has changed
    if (gameRef.current && gameSpeed !== prevGameSpeedRef.current) {
      gameRef.current.setGameSpeed(gameSpeed);
      prevGameSpeedRef.current = gameSpeed;
    }
    
    gameRef.current.start();

    return () => {
      window.removeEventListener('resize', updateCanvasSize);
      if (gameRef.current) {
        gameRef.current.stop();
        gameRef.current = null;
      }
    };
  }, [aiOpponentCount, playerMode, difficulty, onStatsUpdate, activeSkin]);

  // Handle game speed changes separately to avoid recreating the entire game
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

  const handleDirectionButton = (direction: { x: number, y: number }) => {
    if (gameRef.current && !gameOver) {
      gameRef.current.setPlayerDirection(direction);
    }
  };

  const changeSkin = (skinId: string) => {
    if (gameRef.current) {
      gameRef.current.setPlayerSkin(skinId);
      onSkinChange(skinId);
      setShowSkinSelector(false);
    }
  };

  const getDifficultyLabel = (level: number) => {
    switch (level) {
      case 1: return "EASY";
      case 2: return "MEDIUM";
      case 3: return "HARD";
      default: return "EASY";
    }
  };

  const getPowerUpName = (effect: string) => {
    switch (effect) {
      case "speed": return "SPEED BOOST";
      case "shield": return "SHIELD";
      case "invisible": return "INVISIBILITY";
      case "magnet": return "FOOD MAGNET";
      case "teleport": return "TELEPORT";
      case "split": return "SPLIT";
      default: return effect.toUpperCase();
    }
  };

  const getSpeedLabel = (speed: number) => {
    if (speed <= 0.25) return "ULTRA SLOW";
    if (speed <= 0.5) return "SLOW";
    if (speed <= 0.75) return "MEDIUM";
    return "FAST";
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6 shadow-2xl border border-purple-500/20">
      {/* Modern gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-transparent to-purple-500/10 pointer-events-none" />
      
      <canvas
        ref={canvasRef}
        className="w-full aspect-square rounded-xl bg-black/80 border-2 border-purple-400/30 shadow-[0_0_50px_rgba(168,85,247,0.4)] backdrop-blur-sm"
      />
      
      {gameOver && playerMode && (
        <div className="absolute inset-0 z-50">
          <DeathAnimation score={playerScore || 0} onRestart={onRestartGame} />
        </div>
      )}
      
      {playerMode && !gameOver && (
        <div className="absolute top-8 left-8 px-6 py-3 bg-gradient-to-r from-purple-600/90 to-cyan-600/90 backdrop-blur-xl rounded-2xl flex items-center gap-4 border border-white/20 shadow-lg">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
            <span className="text-white font-bold text-lg tracking-wide">SCORE: {playerScore || 0}</span>
          </div>
          
          <div className="w-px h-8 bg-white/30" />
          
          <span className={cn(
            "text-sm px-3 py-1.5 rounded-xl font-bold tracking-wider",
            difficulty === 1 ? "bg-emerald-500/80 text-white shadow-[0_0_20px_rgba(16,185,129,0.5)]" :
            difficulty === 2 ? "bg-amber-500/80 text-white shadow-[0_0_20px_rgba(245,158,11,0.5)]" :
            "bg-red-500/80 text-white shadow-[0_0_20px_rgba(239,68,68,0.5)]"
          )}>
            {getDifficultyLabel(difficulty)}
          </span>
          
          {gameSpeed !== 0.5 && (
            <>
              <div className="w-px h-8 bg-white/30" />
              <span className={cn(
                "text-sm px-3 py-1.5 rounded-xl font-bold tracking-wider",
                gameSpeed === 0.25 ? "bg-blue-500/80 text-white shadow-[0_0_20px_rgba(59,130,246,0.5)]" :
                gameSpeed === 0.75 ? "bg-orange-500/80 text-white shadow-[0_0_20px_rgba(249,115,22,0.5)]" :
                gameSpeed === 1 ? "bg-red-500/80 text-white shadow-[0_0_20px_rgba(239,68,68,0.5)]" :
                "bg-purple-500/80 text-white shadow-[0_0_20px_rgba(168,85,247,0.5)]"
              )}>
                {getSpeedLabel(gameSpeed)}
              </span>
            </>
          )}
        </div>
      )}
      
      {playerMode && !gameOver && (
        <div className="absolute top-8 right-8 flex flex-col gap-3 items-end">
          {activePowerUps.length > 0 && (
            <div className="flex gap-2 mb-2">
              {activePowerUps.map((powerUp, index) => (
                <Badge key={index} className={cn(
                  "px-4 py-2 text-xs font-bold tracking-wider rounded-xl border-2 animate-pulse shadow-lg",
                  powerUp.effect === "speed" ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-black border-yellow-300 shadow-[0_0_20px_rgba(251,191,36,0.6)]" :
                  powerUp.effect === "shield" ? "bg-gradient-to-r from-blue-400 to-cyan-500 text-white border-blue-300 shadow-[0_0_20px_rgba(59,130,246,0.6)]" :
                  powerUp.effect === "invisible" ? "bg-gradient-to-r from-purple-400 to-pink-500 text-white border-purple-300 shadow-[0_0_20px_rgba(168,85,247,0.6)]" :
                  powerUp.effect === "magnet" ? "bg-gradient-to-r from-pink-400 to-rose-500 text-white border-pink-300 shadow-[0_0_20px_rgba(236,72,153,0.6)]" :
                  "bg-gradient-to-r from-indigo-400 to-purple-500 text-white border-indigo-300 shadow-[0_0_20px_rgba(99,102,241,0.6)]"
                )}>
                  {getPowerUpName(powerUp.effect)}
                </Badge>
              ))}
            </div>
          )}
          
          <button
            onClick={() => setShowSkinSelector(!showSkinSelector)}
            className="px-6 py-3 bg-gradient-to-r from-purple-600/90 to-pink-600/90 backdrop-blur-xl rounded-xl text-sm text-white font-bold tracking-wide hover:from-purple-500/90 hover:to-pink-500/90 transition-all duration-300 border border-white/20 shadow-lg hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] hover:scale-105"
          >
            CHANGE SKIN
          </button>
          
          <SkinSelector 
            isOpen={showSkinSelector}
            activeSkin={activeSkin}
            playerScore={playerScore}
            onSkinSelect={changeSkin}
            onClose={() => setShowSkinSelector(false)}
          />
        </div>
      )}
      
      {playerMode && !gameOver && (
        <ControlsPanel onDirectionChange={handleDirectionButton} />
      )}
    </div>
  );
}
