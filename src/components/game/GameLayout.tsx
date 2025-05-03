
import { PowerUpState } from '../../game/types';
import { GameCanvas } from './GameCanvas';
import { LeaderboardCard } from './LeaderboardCard';
import { GameStatsCard } from './GameStatsCard';
import { PowerUpsDisplay } from './PowerUpsDisplay';
import { PerformanceOptions } from './PerformanceOptions';

interface LeaderboardItem {
  rank: number;
  color: string;
  name: string;
  score: number;
}

interface GameLayoutProps {
  gameKey: number;
  playerMode: boolean;
  gameOver: boolean;
  aiOpponentCount: number;
  difficulty: number;
  activeSkin: string;
  playerScore: number | null;
  activePowerUps: PowerUpState[];
  activeSnakes: number;
  foodItems: number;
  elapsedTime: string;
  unlockedSkins: number;
  leaderboard: LeaderboardItem[];
  showPerformanceOptions: boolean;
  onStatsUpdate: (stats: any) => void;
  onRestartGame: () => void;
  onSkinChange: (skinId: string) => void;
  onQualityChange: (quality: 'low' | 'medium' | 'high') => void;
  onSnakeCountChange: (count: number) => void;
  onHideBackgroundChange: (hide: boolean) => void;
  onGameSpeedChange: (speed: number) => void;
  gameSpeed: number;
}

export function GameLayout({
  gameKey,
  playerMode,
  gameOver,
  aiOpponentCount,
  difficulty,
  activeSkin,
  playerScore,
  activePowerUps,
  activeSnakes,
  foodItems,
  elapsedTime,
  unlockedSkins,
  leaderboard,
  showPerformanceOptions,
  onStatsUpdate,
  onRestartGame,
  onSkinChange,
  onQualityChange,
  onSnakeCountChange,
  onHideBackgroundChange,
  onGameSpeedChange,
  gameSpeed
}: GameLayoutProps) {
  return (
    <div className="grid lg:grid-cols-[1fr,300px] gap-6">
      <GameCanvas 
        key={gameKey}
        playerMode={playerMode}
        gameOver={gameOver}
        aiOpponentCount={aiOpponentCount}
        difficulty={difficulty}
        activeSkin={activeSkin}
        playerScore={playerScore}
        activePowerUps={activePowerUps}
        onStatsUpdate={onStatsUpdate}
        onRestartGame={onRestartGame}
        onSkinChange={onSkinChange}
        gameSpeed={gameSpeed}
      />

      <div className="space-y-4">
        <LeaderboardCard 
          leaderboard={leaderboard} 
          playerMode={playerMode} 
        />

        <GameStatsCard 
          activeSnakes={activeSnakes}
          foodItems={foodItems}
          elapsedTime={elapsedTime}
          difficulty={difficulty}
          unlockedSkins={unlockedSkins}
          playerMode={playerMode}
        />
        
        {playerMode && activePowerUps.length > 0 && (
          <PowerUpsDisplay activePowerUps={activePowerUps} />
        )}

        {showPerformanceOptions && (
          <PerformanceOptions
            onQualityChange={onQualityChange}
            onSnakeCountChange={onSnakeCountChange}
            onHideBackgroundChange={onHideBackgroundChange}
            onGameSpeedChange={onGameSpeedChange}
          />
        )}
      </div>
    </div>
  );
}
