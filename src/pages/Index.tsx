
import { useEffect, useRef, useState } from 'react';
import { Snake } from '../game/Snake';
import { GameBoard } from '../game/GameBoard';
import { Card } from '@/components/ui/card';
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
    gameRef.current = new GameBoard(ctx, 20);
    
    // Set up event listeners for game stats updates
    gameRef.current.onStatsUpdate = (stats) => {
      setLeaderboard(stats.topSnakes.map((snake, index) => ({
        rank: index + 1,
        color: snake.color,
        name: `Snake ${index + 1}`,
        score: snake.score
      })));
      
      setActiveSnakes(stats.activeSnakes);
      setFoodItems(stats.foodItems);
      setElapsedTime(stats.elapsedTime);
    };
    
    gameRef.current.start();

    return () => {
      window.removeEventListener('resize', updateCanvasSize);
      gameRef.current?.stop();
    };
  }, []);

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
            Watch as 20 AI-powered snakes compete for survival
          </p>
        </div>

        <div className="grid lg:grid-cols-[1fr,300px] gap-6">
          <Card className="p-4 bg-neutral-900/50 backdrop-blur-xl border-neutral-800">
            <canvas
              ref={canvasRef}
              className="w-full aspect-square rounded-lg bg-neutral-950/50"
            />
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
                      className="flex items-center justify-between p-2 rounded-lg bg-neutral-800/50"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 flex items-center justify-center rounded-full bg-neutral-700 text-sm text-neutral-300">
                          {item.rank}
                        </span>
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-neutral-300">{item.name}</span>
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
                        <span className="text-neutral-300">Snake {i + 1}</span>
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
