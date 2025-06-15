
import { Button } from '@/components/ui/button';
import { RefreshCw, Settings } from 'lucide-react';

interface GameActionButtonsProps {
  onRestartGame: () => void;
  onTogglePerformanceOptions: () => void;
}

export function GameActionButtons({ 
  onRestartGame, 
  onTogglePerformanceOptions 
}: GameActionButtonsProps) {
  return (
    <div className="flex justify-center mb-8 gap-6">
      <Button 
        onClick={onRestartGame}
        variant="restart"
        size="xl"
        className="flex items-center gap-3 font-bold tracking-wide text-lg px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-[0_0_30px_rgba(59,130,246,0.6)] border-2 border-blue-400/50 hover:scale-105 transition-all duration-300"
      >
        <RefreshCw className="animate-spin-slow w-6 h-6" />
        RESTART GAME
      </Button>

      <Button
        onClick={onTogglePerformanceOptions}
        variant="outline"
        size="xl"
        className="flex items-center gap-3 font-bold tracking-wide text-lg px-8 py-4 bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white border-2 border-slate-500/50 shadow-lg hover:scale-105 transition-all duration-300"
      >
        <Settings className="w-6 h-6" />
        PERFORMANCE
      </Button>
    </div>
  );
}
