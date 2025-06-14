
import { useEffect, useRef, useState } from 'react';
import { BrainRunner } from '../../game/BrainRunner';
import { Fact, PlayerStats } from '../../game/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

export function BrainRunnerGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<BrainRunner | null>(null);
  const [todaysFact, setTodaysFact] = useState<Fact | null>(null);
  const [playerStats, setPlayerStats] = useState<PlayerStats | null>(null);
  const [showFact, setShowFact] = useState(false);
  const [gameInitialized, setGameInitialized] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    
    // Set canvas size
    const updateCanvasSize = () => {
      const container = canvas.parentElement;
      if (container) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
      }
    };
    
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    
    try {
      // Initialize the game
      const game = new BrainRunner(canvas);
      gameRef.current = game;
      
      // Get today's fact and player stats
      setTodaysFact(game.getTodaysFact());
      setPlayerStats(game.getPlayerStats());
      setGameInitialized(true);
      
      // Draw initial screen
      game.drawInitialScreen();
      
    } catch (error) {
      console.error('Failed to initialize Brain Runner:', error);
    }
    
    return () => {
      window.removeEventListener('resize', updateCanvasSize);
      if (gameRef.current) {
        gameRef.current.stop();
      }
    };
  }, []);
  
  const startGame = () => {
    if (gameRef.current && gameInitialized) {
      gameRef.current.start();
      setGameStarted(true);
      
      // Show toast
      toast({
        title: "Game Started!",
        description: "Jump to collect today's fact!",
      });
    }
  };
  
  const toggleFactDisplay = () => {
    setShowFact(!showFact);
  };

  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full max-w-4xl mx-auto mb-4">
        <div className="relative aspect-[16/9] w-full bg-gradient-to-b from-sky-400 to-green-400 rounded-lg overflow-hidden border-4 border-purple-500/30 shadow-2xl">
          <canvas 
            ref={canvasRef} 
            className="absolute inset-0 w-full h-full cursor-pointer" 
            onClick={startGame}
          />
          
          {/* Initial screen overlay - only show if game not started */}
          {gameInitialized && !gameStarted && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 p-4 text-center">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border-4 border-purple-500/30">
                <h2 className="text-3xl md:text-5xl font-bold text-purple-800 mb-4">🧠 Brain Runner</h2>
                <p className="text-lg md:text-xl text-gray-700 mb-6">Jump to collect today's amazing fact!</p>
                <Button 
                  size="lg" 
                  onClick={startGame}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-4 px-8 rounded-xl text-xl shadow-lg transform hover:scale-105 transition-all"
                >
                  🚀 Start Running!
                </Button>
              </div>
            </div>
          )}
          
          {/* Loading overlay */}
          {!gameInitialized && (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-sky-400 to-green-400">
              <div className="text-white text-2xl font-bold animate-pulse">Loading Brain Runner...</div>
            </div>
          )}
        </div>
      </div>
      
      {/* Game stats and fact cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl">
        {/* Today's Fact Card */}
        <Card className="border-2 border-purple-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50">
            <CardTitle className="flex items-center justify-between text-purple-800">
              🧠 Today's Fact
              <Button variant="ghost" size="sm" onClick={toggleFactDisplay}>
                {showFact ? 'Hide' : 'Show'}
              </Button>
            </CardTitle>
            <CardDescription>A new fascinating fact awaits you every day!</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            {showFact && todaysFact ? (
              <div className="p-4 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-lg border-2 border-yellow-300">
                <p className="text-gray-800 font-medium">{todaysFact.content}</p>
              </div>
            ) : (
              <div className="p-4 bg-gray-100 rounded-lg text-center border-2 border-gray-200">
                {todaysFact?.collected ? 
                  <p className="text-green-700 font-medium">✅ You've collected today's fact! Click "Show" to view it again.</p> :
                  <p className="text-blue-700 font-medium">🎮 Play the game to collect today's fact!</p>
                }
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Player Stats Card */}
        <Card className="border-2 border-blue-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50">
            <CardTitle className="text-blue-800">📊 Your Stats</CardTitle>
            <CardDescription>Track your daily fact collection journey</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            {playerStats ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-r from-green-100 to-emerald-100 p-4 rounded-lg text-center border-2 border-green-300">
                  <p className="text-3xl font-bold text-green-800">{playerStats.streak}</p>
                  <p className="text-sm text-green-600 font-medium">Day Streak</p>
                </div>
                <div className="bg-gradient-to-r from-blue-100 to-sky-100 p-4 rounded-lg text-center border-2 border-blue-300">
                  <p className="text-3xl font-bold text-blue-800">{playerStats.totalCollected}</p>
                  <p className="text-sm text-blue-600 font-medium">Facts Collected</p>
                </div>
                <div className="bg-gradient-to-r from-purple-100 to-violet-100 p-4 rounded-lg text-center border-2 border-purple-300">
                  <p className="text-3xl font-bold text-purple-800">{playerStats.highScore}</p>
                  <p className="text-sm text-purple-600 font-medium">High Score</p>
                </div>
                <div className="bg-gradient-to-r from-orange-100 to-amber-100 p-4 rounded-lg text-center border-2 border-orange-300">
                  <p className="text-2xl font-bold text-orange-800">
                    {playerStats.lastPlayed ? new Date(playerStats.lastPlayed).toLocaleDateString() : 'Never'}
                  </p>
                  <p className="text-sm text-orange-600 font-medium">Last Played</p>
                </div>
              </div>
            ) : (
              <div className="text-center p-4">
                <div className="animate-pulse text-gray-500">Loading your stats...</div>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button 
              variant="outline" 
              className="w-full border-2 border-blue-300 hover:bg-blue-50 font-bold" 
              onClick={startGame}
              disabled={!gameInitialized}
            >
              🎮 Play Again
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
