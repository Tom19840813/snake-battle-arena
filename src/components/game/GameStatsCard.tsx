
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Zap, Apple, Clock, ChevronUp, ChevronDown } from 'lucide-react';

interface GameStatsCardProps {
  activeSnakes: number;
  foodItems: number;
  elapsedTime: string;
  difficulty: number;
  unlockedSkins: number;
  playerMode: boolean;
}

export function GameStatsCard({ 
  activeSnakes, 
  foodItems, 
  elapsedTime, 
  difficulty, 
  unlockedSkins, 
  playerMode 
}: GameStatsCardProps) {
  const [statsExpanded, setStatsExpanded] = useState<boolean>(true);

  const getDifficultyLabel = (level: number) => {
    switch (level) {
      case 1: return "Easy";
      case 2: return "Medium";
      case 3: return "Hard";
      default: return "Easy";
    }
  };

  return (
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
                <span className="text-neutral-200 font-mono">{unlockedSkins}/5</span>
              </div>
            </>
          )}
        </div>
      )}
    </Card>
  );
}
