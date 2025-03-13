
import { useEffect, useRef, useState } from 'react';
import { GameBoard } from '../game/GameBoard';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

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

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const updateCanvasSize = () => {
      const size = Math.min(window.innerWidth - 40, 800);
      canvas.width = size;
      canvas.height = size;
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    // Initialize game
    gameRef.current = new GameBoard(ctx, 20, playerMode);
    
    // Set up event listeners for game stats updates
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
      
      if (stats.playerScore !== null) {
        setPlayerScore(stats.playerScore);
        
        // Check if player is dead
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
  }, [playerMode]);

  const togglePlayerMode = () => {
    setGameOver(false);
    setPlayerScore(null);
    
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

  // Predefined colors for the snake indicators
  const snakeColors = [
    '#FF5252', // Red (Snake 1)
    '#E6E633', // Yellow (Snake 2)
    '#4CAF50', // Green (Snake 3)
    '#26C6DA', // Cyan (Snake 4)
    '#5C6BC0'  // Blue (Snake 5)
  ];

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
                  className="px-6 py-3 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors"
                >
                  Play Again
                </button>
              </div>
            )}
            
            {playerMode && !gameOver && (
              <div className="absolute top-6 left-6 px-4 py-2 bg-black/70 rounded-full">
                <span className="text-white font-semibold">Score: {playerScore || 0}</span>
              </div>
            )}
            
            {playerMode && (
              <div className="absolute bottom-6 right-6 p-3 bg-black/70 rounded-lg hidden md:block">
                <div className="text-xs text-neutral-400 mb-1">Controls</div>
                <div className="text-neutral-300">↑ ↓ ← → Arrow Keys</div>
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
                  // Placeholders while loading
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
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
