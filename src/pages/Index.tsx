
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { SKINS, getUnlockedSkins } from '../game/GameAssets';
import Background3D from '../components/game/Background3D';

// Import our new components
import { GameActionButtons } from '../components/game/GameActionButtons';
import { GameLayout } from '../components/game/GameLayout';
import { GameHeader } from '../components/game/GameHeader';
import { useSnakeGameState } from '../hooks/useSnakeGameState';

const Index = () => {
  const {
    leaderboard,
    activeSnakes,
    foodItems,
    elapsedTime,
    playerMode,
    playerScore,
    gameOver,
    difficulty,
    unlockedSkins,
    activeSkin,
    activePowerUps,
    aiOpponentCount,
    gameKey,
    showPerformanceOptions,
    graphicsQuality,
    hideBackground,
    gameSpeed,
    togglePlayerMode,
    restartGame,
    handleStatsUpdate,
    handleOpponentsChange,
    handleSkinChange,
    handleQualityChange,
    handleSnakeCountChange,
    handleHideBackgroundChange,
    handleGameSpeedChange,
    togglePerformanceOptions
  } = useSnakeGameState();

  return (
    <>
      {!hideBackground && <Background3D quality={graphicsQuality} />}
      <div className="min-h-screen relative z-10 p-4 md:p-6">
        <div className="max-w-6xl mx-auto">
          <GameActionButtons 
            onRestartGame={restartGame} 
            onTogglePerformanceOptions={togglePerformanceOptions} 
          />
          
          <GameHeader 
            playerMode={playerMode}
            aiOpponentCount={aiOpponentCount}
            difficulty={difficulty}
            onPlayerModeToggle={togglePlayerMode}
            onOpponentsChange={handleOpponentsChange}
            onRestartGame={restartGame}
          />

          <GameLayout 
            gameKey={gameKey}
            playerMode={playerMode}
            gameOver={gameOver}
            aiOpponentCount={aiOpponentCount}
            difficulty={difficulty}
            activeSkin={activeSkin}
            playerScore={playerScore}
            activePowerUps={activePowerUps}
            activeSnakes={activeSnakes}
            foodItems={foodItems}
            elapsedTime={elapsedTime}
            unlockedSkins={unlockedSkins}
            leaderboard={leaderboard}
            showPerformanceOptions={showPerformanceOptions}
            onStatsUpdate={handleStatsUpdate}
            onRestartGame={restartGame}
            onSkinChange={handleSkinChange}
            onQualityChange={handleQualityChange}
            onSnakeCountChange={handleSnakeCountChange}
            onHideBackgroundChange={handleHideBackgroundChange}
            onGameSpeedChange={handleGameSpeedChange}
            gameSpeed={gameSpeed}
          />
        </div>
      </div>
    </>
  );
};

export default Index;
