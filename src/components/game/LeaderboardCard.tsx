
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface LeaderboardItem {
  rank: number;
  color: string;
  name: string;
  score: number;
}

interface LeaderboardCardProps {
  leaderboard: LeaderboardItem[];
  playerMode: boolean;
}

export function LeaderboardCard({ leaderboard, playerMode }: LeaderboardCardProps) {
  return (
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
  );
}

import { Trophy } from 'lucide-react';
