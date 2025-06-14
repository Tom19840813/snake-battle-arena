
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { PowerUpState } from '../../game/types';

interface ActivePowerUpsDisplayProps {
  activePowerUps: PowerUpState[];
}

export function ActivePowerUpsDisplay({ activePowerUps }: ActivePowerUpsDisplayProps) {
  if (activePowerUps.length === 0) return null;

  const getPowerUpName = (effect: string) => {
    switch (effect) {
      case "speed": return "SPEED BOOST";
      case "shield": return "SHIELD";
      case "invisible": return "INVISIBILITY";
      case "magnet": return "FOOD MAGNET";
      case "teleport": return "TELEPORT";
      case "split": return "SPLIT";
      default: return effect.toUpperCase();
    }
  };

  return (
    <div className="flex gap-2 mb-2">
      {activePowerUps.map((powerUp, index) => (
        <Badge key={index} className={cn(
          "px-4 py-2 text-xs font-bold tracking-wider rounded-xl border-2 animate-pulse shadow-lg",
          powerUp.effect === "speed" ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-black border-yellow-300 shadow-[0_0_20px_rgba(251,191,36,0.6)]" :
          powerUp.effect === "shield" ? "bg-gradient-to-r from-blue-400 to-cyan-500 text-white border-blue-300 shadow-[0_0_20px_rgba(59,130,246,0.6)]" :
          powerUp.effect === "invisible" ? "bg-gradient-to-r from-purple-400 to-pink-500 text-white border-purple-300 shadow-[0_0_20px_rgba(168,85,247,0.6)]" :
          powerUp.effect === "magnet" ? "bg-gradient-to-r from-pink-400 to-rose-500 text-white border-pink-300 shadow-[0_0_20px_rgba(236,72,153,0.6)]" :
          "bg-gradient-to-r from-indigo-400 to-purple-500 text-white border-indigo-300 shadow-[0_0_20px_rgba(99,102,241,0.6)]"
        )}>
          {getPowerUpName(powerUp.effect)}
        </Badge>
      ))}
    </div>
  );
}
