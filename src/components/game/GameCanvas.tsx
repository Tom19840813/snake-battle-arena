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
  onSkinChange
}: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<GameBoard | null>(null);
  const [showSkinSelector, setShowSkinSelector] = useState<boolean>(false);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const updateCanvasSize = () => {
      const size = Math.min(window.innerWidth - 40, 800);
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
    
    gameRef.current.start();

    return () => {
      window.removeEventListener('resize', updateCanvasSize);
      if (gameRef.current) {
        gameRef.current.stop();
        gameRef.current = null;
      }
    };
  }, [aiOpponentCount, playerMode, difficulty, onStatsUpdate, activeSkin]);

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
      case 1: return "Easy";
      case 2: return "Medium";
      case 3: return "Hard";
      default: return "Easy";
    }
  };

  const getPowerUpName = (effect: string) => {
    switch (effect) {
      case "speed": return "Speed Boost";
      case "shield": return "Shield";
      case "invisible": return "Invisibility";
      case "magnet": return "Food Magnet";
      case "teleport": return "Teleport";
      case "split": return "Split";
      default: return effect;
    }
  };

  return (
    <div className="p-4 bg-black/30 backdrop-blur-xl border-green-900/30 relative overflow-hidden shadow-[0_0_25px_rgba(0,200,0,0.2)]">
      <canvas
        ref={canvasRef}
        className="w-full aspect-square rounded-lg bg-black/50 border border-green-900/30"
      />
      
      {gameOver && playerMode && (
        <div className="absolute inset-0 z-50">
          <DeathAnimation score={playerScore || 0} onRestart={onRestartGame} />
        </div>
      )}
      
      {playerMode && !gameOver && (
        <div className="absolute top-6 left-6 px-4 py-2 bg-black/70 backdrop-blur-md rounded-full flex items-center gap-2 border border-green-900/50">
          <span className="text-white font-semibold">Score: {playerScore || 0}</span>
          <div className="w-1 h-6 bg-neutral-600 rounded-full mx-1"></div>
          <span className={cn(
            "text-sm px-2 py-0.5 rounded-md font-medium",
            difficulty === 1 ? "bg-green-600/70 text-green-100" :
            difficulty === 2 ? "bg-yellow-600/70 text-yellow-100" :
            "bg-red-600/70 text-red-100"
          )}>
            {getDifficultyLabel(difficulty)}
          </span>
        </div>
      )}
      
      {playerMode && !gameOver && (
        <div className="absolute top-6 right-6 flex flex-col gap-2 items-end">
          {activePowerUps.length > 0 && (
            <div className="flex gap-1 mb-2">
              {activePowerUps.map((powerUp, index) => (
                <Badge key={index} className={cn(
                  "animate-pulse shadow-[0_0_10px_rgba(255,255,255,0.3)]",
                  powerUp.effect === "speed" ? "bg-yellow-500" :
                  powerUp.effect === "shield" ? "bg-blue-500" :
                  powerUp.effect === "invisible" ? "bg-purple-500" :
                  powerUp.effect === "magnet" ? "bg-pink-500" :
                  "bg-purple-500"
                )}>
                  {getPowerUpName(powerUp.effect)}
                </Badge>
              ))}
            </div>
          )}
          <button
            onClick={() => setShowSkinSelector(!showSkinSelector)}
            className="px-3 py-2 bg-black/70 backdrop-blur-md rounded-lg text-sm text-white hover:bg-green-900/50 transition-colors border border-green-900/50"
          >
            Change Skin
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
