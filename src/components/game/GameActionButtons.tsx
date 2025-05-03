
import { Button } from '@/components/ui/button';
import { RefreshCw, Brain, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

interface GameActionButtonsProps {
  onRestartGame: () => void;
  onTogglePerformanceOptions: () => void;
}

export function GameActionButtons({ 
  onRestartGame, 
  onTogglePerformanceOptions 
}: GameActionButtonsProps) {
  return (
    <div className="flex justify-center mb-8 gap-4">
      <Link to="/brain-runner">
        <Button 
          variant="highlight"
          size="lg"
          className="flex items-center gap-2 animate-pulse"
        >
          <Brain className="animate-bounce" />
          Play Brain Runner
        </Button>
      </Link>
      
      <Button 
        onClick={onRestartGame}
        variant="restart"
        size="lg"
        className="flex items-center gap-2 shadow-[0_0_15px_rgba(0,130,255,0.6)]"
      >
        <RefreshCw className="animate-spin-slow" />
        Restart Snake Game
      </Button>

      <Button
        onClick={onTogglePerformanceOptions}
        variant="outline"
        size="lg"
        className="flex items-center gap-2"
      >
        <Settings className="h-4 w-4" />
        Performance
      </Button>
    </div>
  );
}
