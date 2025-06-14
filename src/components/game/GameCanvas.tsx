
import { useRef } from 'react';
import { GameBoard } from '../../game/GameBoard';
import { PowerUpState } from '../../game/types';
import { DeathAnimation } from './DeathAnimation';
import { ControlsPanel } from './ControlsPanel';
import { GameDisplay } from './GameDisplay';
import { GameOverlay } from './GameOverlay';
import { ActivePowerUpsDisplay } from './ActivePowerUpsDisplay';
import { SkinChangeButton } from './SkinChangeButton';

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
  const gameRef = useRef<GameBoard | null>(null);

  const handleDirectionButton = (direction: { x: number, y: number }) => {
    if (gameRef.current && !gameOver) {
      gameRef.current.setPlayerDirection(direction);
    }
  };

  const handleGameBoardReady = (gameBoard: GameBoard | null) => {
    gameRef.current = gameBoard;
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6 shadow-2xl border border-purple-500/20">
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-transparent to-purple-500/10 pointer-events-none" />
      
      <GameDisplay
        playerMode={playerMode}
        gameOver={gameOver}
        aiOpponentCount={aiOpponentCount}
        difficulty={difficulty}
        activeSkin={activeSkin}
        onStatsUpdate={onStatsUpdate}
        gameSpeed={gameSpeed}
        onGameBoardReady={handleGameBoardReady}
      />
      
      {gameOver && playerMode && (
        <div className="absolute inset-0 z-50">
          <DeathAnimation score={playerScore || 0} onRestart={onRestartGame} />
        </div>
      )}
      
      <GameOverlay
        playerMode={playerMode}
        gameOver={gameOver}
        playerScore={playerScore}
        difficulty={difficulty}
        gameSpeed={gameSpeed}
      />
      
      {playerMode && !gameOver && (
        <div className="absolute top-8 right-8 flex flex-col gap-3 items-end">
          <ActivePowerUpsDisplay activePowerUps={activePowerUps} />
          <SkinChangeButton
            activeSkin={activeSkin}
            playerScore={playerScore}
            onSkinChange={onSkinChange}
          />
        </div>
      )}
      
      {playerMode && !gameOver && (
        <ControlsPanel onDirectionChange={handleDirectionButton} />
      )}
    </div>
  );
}
