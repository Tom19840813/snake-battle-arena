import { useEffect, useRef, useState } from 'react';
import { GameBoard } from '../game/GameBoard';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { SKINS, getUnlockedSkins } from '../game/GameAssets';
import { Badge } from '@/components/ui/badge';
import { PowerUpState } from '../game/Snake';
import { RefreshCw, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';

interface LeaderboardItem {
  rank: number;
  color: string;
  name: string;
  score: number;
}

const Index = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<GameBoard | null>(null);
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

    gameRef.current = new GameBoard(ctx, 20, playerMode, difficulty);
    
    gameRef.current.onStatsUpdate = (stats) => {
      setLeaderboard(stats.topSnakes.map((snake, index) => ({
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
        
        if (playerMode && stats.topSnakes.length > 0 && stats.playerScore === 0) {
          setGameOver(true);
        }
      }
    };
    
    gameRef.current.start();

    return () => {
      window.removeEventListener('resize', updateCanvasSize);
      gameRef.current?.stop();
    };
  }, []);

  const togglePlayerMode = () => {
    setGameOver(false);
    setPlayerScore(null);
    setActiveSkin("default");
    
    if (gameRef.current) {
      gameRef.current.setPlayerMode(!playerMode);
    }
    setPlayerMode(!playerMode);
  };

  const restartGame = () => {
    setGameOver(false);
    if (gameRef.current) {
      gameRef.current.setPlayerMode(playerMode);
    }
  };

  const handleDirectionButton = (direction: { x: number, y: number }) => {
    if (gameRef.current?.playerSnake && !gameOver) {
      gameRef.current.playerSnake.setDirection(direction);
    }
  };

  const changeSkin = (skinId: string) => {
    if (gameRef.current) {
      gameRef.current.setPlayerSkin(skinId);
      setActiveSkin(skinId);
      setShowSkinSelector(false);
    }
  };

  const availableSkins = playerScore !== null ? getUnlockedSkins(playerScore) : [SKINS[0]];

  const snakeColors = [
    '#FF5252',
    '#E6E633',
    '#4CAF50',
    '#26C6DA',
    '#5C6BC0'
  ];

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
    <div className="min-h-screen bg-gradient-to-b from-neutral-950 to-neutral-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8 animate-fade-in">
          <span className="px-4 py-1 bg-neutral-800/50 rounded-full text-neutral-400 text-sm mb-3 inline-block">
            Autonomous Battle Arena
          </span>
          <h1 className="text-4xl font-bold text-neutral-100 mb-2">
            Snake Battle Royale
          </h1>
          <p className="text-neutral-400">
            {playerMode 
              ? "Control your snake with arrow keys or swipe gestures" 
              : "Watch as 20 AI-powered snakes compete for survival"}
          </p>
          
          <div className="flex items-center justify-center mt-4 space-x-2">
            <Label htmlFor="player-mode" className="text-neutral-300">AI Only</Label>
            <Switch 
              id="player-mode" 
              checked={playerMode} 
              onCheckedChange={togglePlayerMode} 
            />
            <Label htmlFor="player-mode" className="text-neutral-300">Player vs AI</Label>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr,300px] gap-6">
          <Card className="p-4 bg-neutral-900/50 backdrop-blur-xl border-neutral-800 relative">
            <canvas
              ref={canvasRef}
              className="w-full aspect-square rounded-lg bg-neutral-950/50"
            />
            
            {gameOver && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 rounded-lg">
                <h2 className="text-3xl font-bold text-white mb-4">Game Over</h2>
                <p className="text-xl text-neutral-300 mb-6">Your score: {playerScore}</p>
                <button 
                  onClick={restartGame}
                  className="px-6 py-3 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  <RefreshCw size={20} />
                  Play Again
                </button>
              </div>
            )}
            
            {playerMode && !gameOver && (
              <div className="absolute top-6 left-6 px-4 py-2 bg-black/70 rounded-full flex items-center gap-2">
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
                        "animate-pulse",
                        powerUp.effect === "speed" ? "bg-yellow-500" :
                        powerUp.effect === "shield" ? "bg-blue-500" :
                        powerUp.effect === "invisible" ? "bg-gray-500" :
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
                  className="px-3 py-2 bg-black/70 rounded-lg text-sm text-white hover:bg-black/90 transition-colors"
                >
                  Change Skin
                </button>
                
                {showSkinSelector && (
                  <div className="mt-2 p-3 bg-black/90 rounded-lg w-64">
                    <h3 className="text-white text-sm mb-2">Select Skin ({availableSkins.length}/{SKINS.length} Unlocked)</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {SKINS.map(skin => {
                        const isUnlocked = !skin.unlockScore || (playerScore !== null && playerScore >= (skin.unlockScore || 0));
                        return (
                          <button
                            key={skin.id}
                            onClick={() => isUnlocked && changeSkin(skin.id)}
                            className={cn(
                              "p-2 rounded border text-left text-sm flex items-center gap-2",
                              isUnlocked 
                                ? skin.id === activeSkin 
                                  ? "bg-neutral-700 border-white" 
                                  : "bg-neutral-800 border-neutral-700 hover:bg-neutral-700"
                                : "bg-neutral-900 border-neutral-800 opacity-50 cursor-not-allowed"
                            )}
                            disabled={!isUnlocked}
                          >
                            <div 
                              className={cn(
                                "w-4 h-4 rounded-full", 
                                skin.glow && "shadow-glow"
                              )}
                              style={{ 
                                backgroundColor: skin.color === "rainbow"
                                  ? `hsl(${(Date.now() / 20) % 360}, 70%, 60%)`
                                  : skin.color 
                              }}
                            />
                            <span className="text-white">{skin.name}</span>
                            {!isUnlocked && (
                              <span className="text-xs text-neutral-400 ml-auto">
                                {skin.unlockScore} pts
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {playerMode && (
              <div className="absolute bottom-6 right-6 p-3 bg-black/70 rounded-lg hidden md:block">
                <div className="text-xs text-neutral-400 mb-1">Controls</div>
                <div className="text-neutral-300">↑ ↓ ← → Arrow Keys</div>
              </div>
            )}
            
            {playerMode && !gameOver && (
              <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 p-3 bg-black/70 rounded-lg flex flex-col items-center md:hidden">
                <button 
                  onClick={() => handleDirectionButton({ x: 0, y: -1 })}
                  className="p-3 bg-neutral-800 rounded-lg hover:bg-neutral-700 active:bg-neutral-600 transition-colors mb-2"
                >
                  <ArrowUp size={24} className="text-white" />
                </button>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleDirectionButton({ x: -1, y: 0 })}
                    className="p-3 bg-neutral-800 rounded-lg hover:bg-neutral-700 active:bg-neutral-600 transition-colors"
                  >
                    <ArrowLeft size={24} className="text-white" />
                  </button>
                  <button 
                    onClick={() => handleDirectionButton({ x: 0, y: 1 })}
                    className="p-3 bg-neutral-800 rounded-lg hover:bg-neutral-700 active:bg-neutral-600 transition-colors"
                  >
                    <ArrowDown size={24} className="text-white" />
                  </button>
                  <button 
                    onClick={() => handleDirectionButton({ x: 1, y: 0 })}
                    className="p-3 bg-neutral-800 rounded-lg hover:bg-neutral-700 active:bg-neutral-600 transition-colors"
                  >
                    <ArrowRight size={24} className="text-white" />
                  </button>
                </div>
              </div>
            )}
          </Card>

          <div className="space-y-4">
            <Card className="p-4 bg-neutral-900/50 backdrop-blur-xl border-neutral-800">
              <h2 className="text-lg font-semibold text-neutral-100 mb-3">
                Leaderboard
              </h2>
              <div id="leaderboard" className="space-y-2">
                {leaderboard.length > 0 ? (
                  leaderboard.map((item) => (
                    <div
                      key={item.rank}
                      className={cn(
                        "flex items-center justify-between p-2 rounded-lg",
                        playerMode && item.name === "You" 
                          ? "bg-neutral-700/70" 
                          : "bg-neutral-800/50"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 flex items-center justify-center rounded-full bg-neutral-700 text-sm text-neutral-300">
                          {item.rank}
                        </span>
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: item.color }}
                        />
                        <span className={cn(
                          playerMode && item.name === "You" 
                            ? "text-white font-medium" 
                            : "text-neutral-300"
                        )}>
                          {item.name}
                        </span>
                      </div>
                      <span className="text-neutral-400">{item.score}</span>
                    </div>
                  ))
                ) : (
                  Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-2 rounded-lg bg-neutral-800/50"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 flex items-center justify-center rounded-full bg-neutral-700 text-sm text-neutral-300">
                          {i + 1}
                        </span>
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: snakeColors[i] }}
                        />
                        <span className="text-neutral-300">{playerMode && i === 0 ? 'You' : `Snake ${i + 1}`}</span>
                      </div>
                      <span className="text-neutral-400">0</span>
                    </div>
                  ))
                )}
              </div>
            </Card>

            <Card className="p-4 bg-neutral-900/50 backdrop-blur-xl border-neutral-800">
              <h2 className="text-lg font-semibold text-neutral-100 mb-3">
                Stats
              </h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-neutral-400">Active Snakes</span>
                  <span id="activeSnakes" className="text-neutral-200">{activeSnakes}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Food Items</span>
                  <span id="foodItems" className="text-neutral-200">{foodItems}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Elapsed Time</span>
                  <span id="elapsedTime" className="text-neutral-200">{elapsedTime}</span>
                </div>
                {playerMode && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Difficulty</span>
                      <span className={cn(
                        "px-2 py-0.5 rounded-md text-sm font-medium",
                        difficulty === 1 ? "bg-green-600/70 text-green-100" :
                        difficulty === 2 ? "bg-yellow-600/70 text-yellow-100" :
                        "bg-red-600/70 text-red-100"
                      )}>
                        {getDifficultyLabel(difficulty)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Unlocked Skins</span>
                      <span className="text-neutral-200">{unlockedSkins}/{SKINS.length}</span>
                    </div>
                  </>
                )}
              </div>
            </Card>
            
            {playerMode && (
              <Card className="p-4 bg-neutral-900/50 backdrop-blur-xl border-neutral-800">
                <h2 className="text-lg font-semibold text-neutral-100 mb-3">
                  Power-ups
                </h2>
                <div className="space-y-3">
                  {activePowerUps.length > 0 ? (
                    activePowerUps.map((powerUp, index) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-neutral-800/50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center text-lg",
                            powerUp.effect === "speed" ? "bg-yellow-500/30" :
                            powerUp.effect === "shield" ? "bg-blue-500/30" :
                            powerUp.effect === "invisible" ? "bg-gray-500/30" :
                            powerUp.effect === "magnet" ? "bg-pink-500/30" :
                            "bg-purple-500/30"
                          )}>
                            {powerUp.effect === "speed" && "⚡"}
                            {powerUp.effect === "shield" && "🛡️"}
                            {powerUp.effect === "invisible" && "👻"}
                            {powerUp.effect === "magnet" && "🧲"}
                            {powerUp.effect === "teleport" && "🌀"}
                            {powerUp.effect === "split" && "🍴"}
                          </div>
                          <span className="text-neutral-200">{getPowerUpName(powerUp.effect)}</span>
                        </div>
                        <div className="text-xs text-neutral-400">
                          {Math.max(0, Math.ceil(powerUp.timeLeft - ((Date.now() - powerUp.startTime) / 1000)))}s
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-neutral-500 py-2">
                      No active power-ups
                    </div>
                  )}
                  
                  <div className="mt-3 text-xs text-neutral-500">
                    <p>Collect power-ups that appear on the board to gain special abilities.</p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
