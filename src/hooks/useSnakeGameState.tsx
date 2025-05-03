
import { useState } from 'react';
import { PowerUpState } from '../game/types';

interface LeaderboardItem {
  rank: number;
  color: string;
  name: string;
  score: number;
}

export function useSnakeGameState() {
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
  const [aiOpponentCount, setAiOpponentCount] = useState<number>(15);
  const [gameKey, setGameKey] = useState<number>(0);
  const [showPerformanceOptions, setShowPerformanceOptions] = useState<boolean>(false);
  const [graphicsQuality, setGraphicsQuality] = useState<'low' | 'medium' | 'high'>('low');
  const [hideBackground, setHideBackground] = useState<boolean>(false);
  const [gameSpeed, setGameSpeed] = useState<number>(1);

  const togglePlayerMode = () => {
    setGameOver(false);
    setPlayerScore(null);
    setActiveSkin("default");
    setPlayerMode(!playerMode);
    setGameKey(prev => prev + 1);
  };

  const restartGame = () => {
    setGameOver(false);
    setGameKey(prev => prev + 1);
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
    setGameKey(prev => prev + 1);
  };

  const handleSkinChange = (skinId: string) => {
    setActiveSkin(skinId);
  };

  const handleQualityChange = (quality: 'low' | 'medium' | 'high') => {
    setGraphicsQuality(quality);
  };

  const handleSnakeCountChange = (count: number) => {
    setAiOpponentCount(count);
    setGameKey(prev => prev + 1);
  };

  const handleHideBackgroundChange = (hide: boolean) => {
    setHideBackground(hide);
  };

  const handleGameSpeedChange = (speed: number) => {
    setGameSpeed(speed);
    setGameKey(prev => prev + 1);
  };

  const togglePerformanceOptions = () => {
    setShowPerformanceOptions(!showPerformanceOptions);
  };
  
  return {
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
  };
}
