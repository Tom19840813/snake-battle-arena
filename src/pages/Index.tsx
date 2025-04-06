
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { SKINS, getUnlockedSkins } from '../game/GameAssets';
import { PowerUpState } from '../game/types';
import Background3D from '../components/game/Background3D';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

// Import components
import { LeaderboardCard } from '../components/game/LeaderboardCard';
import { GameStatsCard } from '../components/game/GameStatsCard';
import { PowerUpsDisplay } from '../components/game/PowerUpsDisplay';
import { GameCanvas } from '../components/game/GameCanvas';
import { GameHeader } from '../components/game/GameHeader';

interface LeaderboardItem {
  rank: number;
  color: string;
  name: string;
  score: number;
}

const Index = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardItem[]>([]);
  const [activeSnakes, setActiveSnakes] = useState<number>(20);
  const [foodItems, setFoodItems] = useState<number>(10);
  const [elapsedTime, setElapsedTime] = useState<string>('00:00');
  const [playerMode, setPlayerMode] = useState<boolean>(false);
  const [playerScore, setPlayerScore] = useState<number | null>(null);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [difficulty, setDifficulty] = useState<number>(1);
  const [unlockedSkins, setUnlockedSkins] = useState<number>(1);
  const [activeSkin, setActiveSkin] = useState<string>("default");
  const [activePowerUps, setActivePowerUps] = useState<PowerUpState[]>([]);
  const [aiOpponentCount, setAiOpponentCount] = useState<number>(20);
  const [gameKey, setGameKey] = useState<number>(0); // To force re-render of GameCanvas

  const togglePlayerMode = () => {
    setGameOver(false);
    setPlayerScore(null);
    setActiveSkin("default");
    setPlayerMode(!playerMode);
    setGameKey(prev => prev + 1); // Force re-render
  };

  const restartGame = () => {
    setGameOver(false);
    setGameKey(prev => prev + 1); // Force re-render
  };

  const handleStatsUpdate = (stats: any) => {
    setLeaderboard(stats.topSnakes.map((snake: any, index: number) => ({
      rank: index + 1,
      color: snake.color,
      name: playerMode && index === 0 ? 'You' : `Snake ${index + 1}`,
      score: snake.score
    })));
    
    setActiveSnakes(stats.activeSnakes);
    setFoodItems(stats.foodItems);
    setElapsedTime(stats.elapsedTime);
    setDifficulty(stats.difficulty);
    setUnlockedSkins(stats.unlockedSkins);
    setActivePowerUps(stats.activePowerUps || []);
    
    if (stats.playerScore !== null) {
      setPlayerScore(stats.playerScore);
      
      if (playerMode && !gameOver && !stats.isPlayerAlive) {
        console.log("Player died! Showing death screen");
        setGameOver(true);
      }
    }
  };

  const handleOpponentsChange = (count: number, newDifficulty: number) => {
    setAiOpponentCount(count);
    setDifficulty(newDifficulty);
    setGameKey(prev => prev + 1); // Force re-render
  };

  const handleSkinChange = (skinId: string) => {
    setActiveSkin(skinId);
  };

  return (
    <>
      <Background3D />
      <div className="min-h-screen relative z-10 p-4 md:p-6">
        <div className="max-w-6xl mx-auto">
          {/* Restart button at the top */}
          <div className="flex justify-center mb-4">
            <Button 
              onClick={restartGame}
              variant="restart"
              size="lg"
              className="flex items-center gap-2 shadow-[0_0_15px_rgba(0,130,255,0.6)] animate-pulse"
            >
              <RefreshCw className="animate-spin-slow" />
              Restart Game
            </Button>
          </div>
          
          <GameHeader 
            playerMode={playerMode}
            aiOpponentCount={aiOpponentCount}
            difficulty={difficulty}
            onPlayerModeToggle={togglePlayerMode}
            onOpponentsChange={handleOpponentsChange}
            onRestartGame={restartGame}
          />

          <div className="grid lg:grid-cols-[1fr,300px] gap-6">
            <GameCanvas 
              key={gameKey} // Important: Force a complete re-render when game changes
              playerMode={playerMode}
              gameOver={gameOver}
              aiOpponentCount={aiOpponentCount}
              difficulty={difficulty}
              activeSkin={activeSkin}
              playerScore={playerScore}
              activePowerUps={activePowerUps}
              onStatsUpdate={handleStatsUpdate}
              onRestartGame={restartGame}
              onSkinChange={handleSkinChange}
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
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Index;
