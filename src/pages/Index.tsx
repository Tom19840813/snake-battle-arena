
import { useEffect, useRef, useState } from 'react';
import { GameBoard } from '../game/GameBoard';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { SKINS, getUnlockedSkins } from '../game/GameAssets';
import { Badge } from '@/components/ui/badge';
import { PowerUpState } from '../game/Snake';
import { RefreshCw, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Trophy, Clock, Apple, Zap, ChevronUp, ChevronDown } from 'lucide-react';
import Background3D from '../components/game/Background3D';
import { DeathAnimation } from '../components/game/DeathAnimation';
import { OpponentSelector } from '../components/game/OpponentSelector';
import { Button } from '@/components/ui/button';

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
  const [statsExpanded, setStatsExpanded] = useState<boolean>(true);
  const [aiOpponentCount, setAiOpponentCount] = useState<number>(20);

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

    gameRef.current = new GameBoard(ctx, aiOpponentCount, playerMode, difficulty);
    
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
  }, [aiOpponentCount]);

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
    if (gameRef.current && !gameOver) {
      gameRef.current.setPlayerDirection(direction);
    }
  };

  const changeSkin = (skinId: string) => {
    if (gameRef.current) {
      gameRef.current.setPlayerSkin(skinId);
      setActiveSkin(skinId);
      setShowSkinSelector(false);
    }
  };
  
  const handleOpponentsChange = (count: number, newDifficulty: number) => {
    setAiOpponentCount(count);
    setDifficulty(newDifficulty);
    
    if (gameRef.current) {
      gameRef.current.setDifficulty(newDifficulty);
      // Restart with new opponent count
      gameRef.current.stop();
      
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          gameRef.current = new GameBoard(ctx, count, playerMode, newDifficulty);
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
        }
      }
    }
  };

  const availableSkins = playerScore !== null ? getUnlockedSkins(playerScore) : [SKINS[0]];

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
    <>
      <Background3D />
      <div className="min-h-screen relative z-10 p-4 md:p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 drop-shadow-[0_0_10px_rgba(0,255,0,0.5)]">
              Snake Battle Royale
            </h1>
            <p className="text-neutral-300 mb-4">
              {playerMode 
                ? "Control your snake with arrow keys or swipe gestures" 
                : "Watch as AI-powered snakes compete for survival"}
            </p>
            
            <div className="flex flex-wrap items-center justify-center mt-4 gap-4">
              <div className="flex items-center space-x-2">
                <Label htmlFor="player-mode" className="text-neutral-300">AI Only</Label>
                <Switch 
                  id="player-mode" 
                  checked={playerMode} 
                  onCheckedChange={togglePlayerMode}
                  className="data-[state=checked]:bg-green-500"
                />
                <Label htmlFor="player-mode" className="text-neutral-300">Player vs AI</Label>
              </div>
              
              <OpponentSelector 
                onOpponentsChange={handleOpponentsChange}
                currentOpponents={aiOpponentCount}
                currentDifficulty={difficulty}
              />
            </div>
          </div>

          <div className="grid lg:grid-cols-[1fr,300px] gap-6">
            <Card className="p-4 bg-black/30 backdrop-blur-xl border-green-900/30 relative overflow-hidden shadow-[0_0_25px_rgba(0,200,0,0.2)]">
              <canvas
                ref={canvasRef}
                className="w-full aspect-square rounded-lg bg-black/50 border border-green-900/30"
              />
              
              {gameOver && (
                <DeathAnimation score={playerScore || 0} onRestart={restartGame} />
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
                  
                  {showSkinSelector && (
                    <div className="mt-2 p-3 bg-black/90 backdrop-blur-xl rounded-lg w-64 border border-green-900/50 shadow-[0_0_15px_rgba(0,255,0,0.2)] animate-fade-in">
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
                                    ? "bg-green-900/50 border-green-400/70" 
                                    : "bg-neutral-800/80 border-neutral-700/50 hover:bg-green-900/30"
                                  : "bg-neutral-900/50 border-neutral-800/30 opacity-50 cursor-not-allowed"
                              )}
                              disabled={!isUnlocked}
                            >
                              <div 
                                className={cn(
                                  "w-4 h-4 rounded-full", 
                                  skin.glow && "shadow-[0_0_5px_rgba(255,255,255,0.7)]"
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
                <div className="absolute bottom-6 right-6 p-3 bg-black/70 backdrop-blur-md rounded-lg hidden md:block border border-green-900/50">
                  <div className="text-xs text-neutral-400 mb-1">Controls</div>
                  <div className="text-neutral-300">↑ ↓ ← → Arrow Keys</div>
                </div>
              )}
              
              {playerMode && !gameOver && (
                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 p-3 bg-black/70 backdrop-blur-md rounded-lg flex flex-col items-center md:hidden border border-green-900/50 shadow-[0_0_15px_rgba(0,255,0,0.2)]">
                  <button 
                    onClick={() => handleDirectionButton({ x: 0, y: -1 })}
                    className="p-3 bg-green-900/50 rounded-lg hover:bg-green-700 active:bg-green-600 transition-colors mb-2"
                  >
                    <ArrowUp size={24} className="text-white" />
                  </button>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleDirectionButton({ x: -1, y: 0 })}
                      className="p-3 bg-green-900/50 rounded-lg hover:bg-green-700 active:bg-green-600 transition-colors"
                    >
                      <ArrowLeft size={24} className="text-white" />
                    </button>
                    <button 
                      onClick={() => handleDirectionButton({ x: 0, y: 1 })}
                      className="p-3 bg-green-900/50 rounded-lg hover:bg-green-700 active:bg-green-600 transition-colors"
                    >
                      <ArrowDown size={24} className="text-white" />
                    </button>
                    <button 
                      onClick={() => handleDirectionButton({ x: 1, y: 0 })}
                      className="p-3 bg-green-900/50 rounded-lg hover:bg-green-700 active:bg-green-600 transition-colors"
                    >
                      <ArrowRight size={24} className="text-white" />
                    </button>
                  </div>
                </div>
              )}
            </Card>

            <div className="space-y-4">
              <Card className="p-4 bg-black/30 backdrop-blur-xl border-green-900/30 shadow-[0_0_15px_rgba(0,200,0,0.1)]">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Trophy size={18} className="text-yellow-500" />
                    Leaderboard
                  </h2>
                </div>
                <div id="leaderboard" className="space-y-2">
                  {leaderboard.length > 0 ? (
                    leaderboard.map((item) => (
                      <div
                        key={item.rank}
                        className={cn(
                          "flex items-center justify-between p-2 rounded-lg transition-all",
                          playerMode && item.name === "You" 
                            ? "bg-green-900/30 border border-green-800/50" 
                            : "bg-neutral-800/30 border border-neutral-800/30"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <span className={cn(
                            "w-6 h-6 flex items-center justify-center rounded-full text-sm",
                            item.rank === 1 ? "bg-yellow-500/80 text-yellow-950" :
                            item.rank === 2 ? "bg-neutral-400/80 text-neutral-950" :
                            item.rank === 3 ? "bg-amber-600/80 text-amber-950" :
                            "bg-neutral-700/80 text-neutral-300"
                          )}>
                            {item.rank}
                          </span>
                          <div 
                            className={cn(
                              "w-3 h-3 rounded-full",
                              item.rank <= 3 && "shadow-[0_0_5px_rgba(255,255,255,0.5)]"
                            )}
                            style={{ backgroundColor: item.color }}
                          />
                          <span className={cn(
                            playerMode && item.name === "You" 
                              ? "text-green-400 font-medium" 
                              : "text-neutral-300"
                          )}>
                            {item.name}
                          </span>
                        </div>
                        <span className={cn(
                          "text-neutral-400",
                          item.rank === 1 && "text-yellow-400 font-bold",
                          playerMode && item.name === "You" && "text-green-400 font-semibold"
                        )}>
                          {item.score}
                        </span>
                      </div>
                    ))
                  ) : (
                    Array.from({ length: 5 }).map((_, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-2 rounded-lg bg-neutral-800/30 border border-neutral-800/30"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 flex items-center justify-center rounded-full bg-neutral-700/80 text-sm text-neutral-300">
                            {i + 1}
                          </span>
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: i === 0 ? "#FF5252" : 
                                                       i === 1 ? "#E6E633" : 
                                                       i === 2 ? "#4CAF50" : 
                                                       i === 3 ? "#26C6DA" : "#5C6BC0" }}
                          />
                          <span className="text-neutral-300">{playerMode && i === 0 ? 'You' : `Snake ${i + 1}`}</span>
                        </div>
                        <span className="text-neutral-400">0</span>
                      </div>
                    ))
                  )}
                </div>
              </Card>

              <Card className="bg-black/30 backdrop-blur-xl border-green-900/30 shadow-[0_0_15px_rgba(0,200,0,0.1)] overflow-hidden">
                <div 
                  className="p-4 cursor-pointer flex items-center justify-between"
                  onClick={() => setStatsExpanded(!statsExpanded)}
                >
                  <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Zap size={18} className="text-blue-400" />
                    Game Stats
                  </h2>
                  {statsExpanded ? 
                    <ChevronUp size={18} className="text-neutral-400" /> : 
                    <ChevronDown size={18} className="text-neutral-400" />
                  }
                </div>
                
                {statsExpanded && (
                  <div className="space-y-2 p-4 pt-0 animate-fade-in">
                    <div className="flex justify-between items-center p-2 rounded-lg bg-neutral-800/20">
                      <span className="text-neutral-400 flex items-center gap-2">
                        <span className="w-8 h-8 flex items-center justify-center rounded-full bg-neutral-800/50">🐍</span>
                        Active Snakes
                      </span>
                      <span id="activeSnakes" className="text-neutral-200 font-mono">{activeSnakes}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded-lg bg-neutral-800/20">
                      <span className="text-neutral-400 flex items-center gap-2">
                        <span className="w-8 h-8 flex items-center justify-center rounded-full bg-red-900/30">
                          <Apple size={14} className="text-red-400" />
                        </span>
                        Food Items
                      </span>
                      <span id="foodItems" className="text-neutral-200 font-mono">{foodItems}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded-lg bg-neutral-800/20">
                      <span className="text-neutral-400 flex items-center gap-2">
                        <span className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-900/30">
                          <Clock size={14} className="text-blue-400" />
                        </span>
                        Elapsed Time
                      </span>
                      <span id="elapsedTime" className="text-neutral-200 font-mono">{elapsedTime}</span>
                    </div>
                    {playerMode && (
                      <>
                        <div className="flex justify-between items-center p-2 rounded-lg bg-neutral-800/20">
                          <span className="text-neutral-400 flex items-center gap-2">
                            <span className={cn(
                              "w-8 h-8 flex items-center justify-center rounded-full",
                              difficulty === 1 ? "bg-green-900/30" :
                              difficulty === 2 ? "bg-yellow-900/30" :
                              "bg-red-900/30"
                            )}>
                              {difficulty === 1 ? "👶" : difficulty === 2 ? "👨" : "💀"}
                            </span>
                            Difficulty
                          </span>
                          <span className={cn(
                            "px-2 py-0.5 rounded-md text-sm font-medium",
                            difficulty === 1 ? "bg-green-600/70 text-green-100" :
                            difficulty === 2 ? "bg-yellow-600/70 text-yellow-100" :
                            "bg-red-600/70 text-red-100"
                          )}>
                            {getDifficultyLabel(difficulty)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-2 rounded-lg bg-neutral-800/20">
                          <span className="text-neutral-400 flex items-center gap-2">
                            <span className="w-8 h-8 flex items-center justify-center rounded-full bg-purple-900/30">🎨</span>
                            Unlocked Skins
                          </span>
                          <span className="text-neutral-200 font-mono">{unlockedSkins}/{SKINS.length}</span>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </Card>
              
              {playerMode && activePowerUps.length > 0 && (
                <Card className="p-4 bg-black/30 backdrop-blur-xl border-green-900/30 shadow-[0_0_15px_rgba(0,200,0,0.1)]">
                  <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <span className="text-yellow-400">⚡</span>
                    Active Power-ups
                  </h2>
                  <div className="space-y-3">
                    {activePowerUps.map((powerUp, index) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-neutral-800/30 rounded-lg border border-neutral-700/30">
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
                        <div className="text-xs px-2 py-1 bg-black/30 rounded-full text-neutral-400 font-mono">
                          {Math.max(0, Math.ceil(powerUp.timeLeft - ((Date.now() - powerUp.startTime) / 1000)))}s
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Index;
