
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
  const { toast } = useToast();

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    
    // Initialize the game
    const game = new BrainRunner(canvas);
    gameRef.current = game;
    
    // Get today's fact and player stats
    setTodaysFact(game.getTodaysFact());
    setPlayerStats(game.getPlayerStats());
    
    // Handle window resize
    const handleResize = () => {
      if (gameRef.current) {
        gameRef.current.resize();
      }
    };
    
    window.addEventListener('resize', handleResize);
    handleResize(); // Initial resize
    
    return () => {
      window.removeEventListener('resize', handleResize);
      if (gameRef.current) {
        gameRef.current.stop();
      }
    };
  }, []);
  
  const startGame = () => {
    if (gameRef.current) {
      gameRef.current.start();
      
      // Show toast
      toast({
        title: "Game Started!",
        description: "Collect today's fact by jumping through it.",
      });
    }
  };
  
  const toggleFactDisplay = () => {
    setShowFact(!showFact);
  };

  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full max-w-4xl mx-auto mb-4">
        <div className="relative aspect-[16/9] w-full bg-slate-800 rounded-lg overflow-hidden">
          <canvas 
            ref={canvasRef} 
            className="absolute inset-0 w-full h-full" 
            onClick={startGame}
          />
          
          {/* Initial screen overlay */}
          {!gameRef.current && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 p-4 text-center">
              <h2 className="text-2xl md:text-4xl font-bold text-white mb-4">Brain Runner</h2>
              <p className="text-lg md:text-xl text-white/80 mb-6">Jump to collect today's fun fact!</p>
              <Button size="lg" variant="glow" onClick={startGame}>
                Start Running
              </Button>
            </div>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl">
        {/* Today's Fact Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Today's Fact
              <Button variant="ghost" size="sm" onClick={toggleFactDisplay}>
                {showFact ? 'Hide' : 'Show'}
              </Button>
            </CardTitle>
            <CardDescription>A new fact is available every day!</CardDescription>
          </CardHeader>
          <CardContent>
            {showFact && todaysFact ? (
              <div className="p-4 bg-yellow-100 rounded-lg">
                <p className="text-gray-800">{todaysFact.content}</p>
              </div>
            ) : (
              <div className="p-4 bg-gray-100 rounded-lg text-center">
                {todaysFact?.collected ? 
                  <p>You've collected today's fact! Click "Show" to view it again.</p> :
                  <p>Play the game to collect today's fact!</p>
                }
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Player Stats Card */}
        <Card>
          <CardHeader>
            <CardTitle>Your Stats</CardTitle>
            <CardDescription>Track your daily fact collection</CardDescription>
          </CardHeader>
          <CardContent>
            {playerStats ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-100 p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold text-green-800">{playerStats.streak}</p>
                  <p className="text-sm text-green-600">Day Streak</p>
                </div>
                <div className="bg-blue-100 p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold text-blue-800">{playerStats.totalCollected}</p>
                  <p className="text-sm text-blue-600">Facts Collected</p>
                </div>
                <div className="bg-purple-100 p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold text-purple-800">{playerStats.highScore}</p>
                  <p className="text-sm text-purple-600">High Score</p>
                </div>
                <div className="bg-orange-100 p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold text-orange-800">
                    {playerStats.lastPlayed ? new Date(playerStats.lastPlayed).toLocaleDateString() : 'Never'}
                  </p>
                  <p className="text-sm text-orange-600">Last Played</p>
                </div>
              </div>
            ) : (
              <p className="text-center">Loading stats...</p>
            )}
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" onClick={startGame}>
              Play Again
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
