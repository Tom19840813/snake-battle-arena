
import { cn } from '@/lib/utils';

interface GameOverlayProps {
  playerMode: boolean;
  gameOver: boolean;
  playerScore: number | null;
  difficulty: number;
  gameSpeed: number;
}

export function GameOverlay({
  playerMode,
  gameOver,
  playerScore,
  difficulty,
  gameSpeed
}: GameOverlayProps) {
  if (!playerMode || gameOver) return null;

  const getDifficultyLabel = (level: number) => {
    switch (level) {
      case 1: return "EASY";
      case 2: return "MEDIUM";
      case 3: return "HARD";
      default: return "EASY";
    }
  };

  const getSpeedLabel = (speed: number) => {
    if (speed <= 0.25) return "ULTRA SLOW";
    if (speed <= 0.5) return "SLOW";
    if (speed <= 0.75) return "MEDIUM";
    return "FAST";
  };

  return (
    <div className="absolute top-8 left-8 px-6 py-3 bg-gradient-to-r from-purple-600/90 to-cyan-600/90 backdrop-blur-xl rounded-2xl flex items-center gap-4 border border-white/20 shadow-lg">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
        <span className="text-white font-bold text-lg tracking-wide">SCORE: {playerScore || 0}</span>
      </div>
      
      <div className="w-px h-8 bg-white/30" />
      
      <span className={cn(
        "text-sm px-3 py-1.5 rounded-xl font-bold tracking-wider",
        difficulty === 1 ? "bg-emerald-500/80 text-white shadow-[0_0_20px_rgba(16,185,129,0.5)]" :
        difficulty === 2 ? "bg-amber-500/80 text-white shadow-[0_0_20px_rgba(245,158,11,0.5)]" :
        "bg-red-500/80 text-white shadow-[0_0_20px_rgba(239,68,68,0.5)]"
      )}>
        {getDifficultyLabel(difficulty)}
      </span>
      
      {gameSpeed !== 0.5 && (
        <>
          <div className="w-px h-8 bg-white/30" />
          <span className={cn(
            "text-sm px-3 py-1.5 rounded-xl font-bold tracking-wider",
            gameSpeed === 0.25 ? "bg-blue-500/80 text-white shadow-[0_0_20px_rgba(59,130,246,0.5)]" :
            gameSpeed === 0.75 ? "bg-orange-500/80 text-white shadow-[0_0_20px_rgba(249,115,22,0.5)]" :
            gameSpeed === 1 ? "bg-red-500/80 text-white shadow-[0_0_20px_rgba(239,68,68,0.5)]" :
            "bg-purple-500/80 text-white shadow-[0_0_20px_rgba(168,85,247,0.5)]"
          )}>
            {getSpeedLabel(gameSpeed)}
          </span>
        </>
      )}
    </div>
  );
}
