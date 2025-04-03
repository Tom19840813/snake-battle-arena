
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { OpponentSelector } from './OpponentSelector';

interface GameHeaderProps {
  playerMode: boolean;
  aiOpponentCount: number;
  difficulty: number;
  onPlayerModeToggle: () => void;
  onOpponentsChange: (count: number, difficulty: number) => void;
  onRestartGame: () => void;
}

export function GameHeader({
  playerMode,
  aiOpponentCount,
  difficulty,
  onPlayerModeToggle,
  onOpponentsChange,
  onRestartGame
}: GameHeaderProps) {
  return (
    <div className="text-center mb-8 animate-fade-in">
      <span
        className="inline-block bg-neutral-800/50 px-4 py-1 rounded-full text-neutral-400 text-sm mb-3"
      >
        Autonomous Battle Arena
      </span>
      <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 drop-shadow-[0_0_10px_rgba(0,255,0,0.5)]">
        Snake Wars
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
            onCheckedChange={onPlayerModeToggle}
            className="data-[state=checked]:bg-green-500"
          />
          <Label htmlFor="player-mode" className="text-neutral-300">Player vs AI</Label>
        </div>
        
        <OpponentSelector 
          onOpponentsChange={onOpponentsChange}
          currentOpponents={aiOpponentCount}
          currentDifficulty={difficulty}
        />
        
        <Button 
          onClick={onRestartGame}
          variant="restart"
          size="lg"
          className="flex items-center gap-2 shadow-[0_0_15px_rgba(0,130,255,0.6)] animate-pulse"
        >
          <RefreshCw className="animate-spin-slow" />
          Restart Game
        </Button>
      </div>
    </div>
  );
}
