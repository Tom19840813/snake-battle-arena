
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { PowerUpState } from '../../game/Snake';

interface PowerUpsDisplayProps {
  activePowerUps: PowerUpState[];
}

export function PowerUpsDisplay({ activePowerUps }: PowerUpsDisplayProps) {
  if (activePowerUps.length === 0) return null;

  const getPowerUpName = (effect: string) => {
    switch (effect) {
      case "speed": return "Speed Boost";
      case "shield": return "Shield";
      case "invisible": return "Invisibility";
      case "magnet": return "Food Magnet";
      case "teleport": return "Teleport";
      case "split": return "Split";
      default: return effect;
    }
  };

  return (
    <Card className="p-4 bg-black/30 backdrop-blur-xl border-green-900/30 shadow-[0_0_15px_rgba(0,200,0,0.1)]">
      <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
        <span className="text-yellow-400">⚡</span>
        Active Power-ups
      </h2>
      <div className="space-y-3">
        {activePowerUps.map((powerUp, index) => (
          <div key={index} className="flex justify-between items-center p-2 bg-neutral-800/30 rounded-lg border border-neutral-700/30">
            <div className="flex items-center gap-2">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-lg",
                powerUp.effect === "speed" ? "bg-yellow-500/30" :
                powerUp.effect === "shield" ? "bg-blue-500/30" :
                powerUp.effect === "invisible" ? "bg-gray-500/30" :
                powerUp.effect === "magnet" ? "bg-pink-500/30" :
                "bg-purple-500/30"
              )}>
                {powerUp.effect === "speed" && "⚡"}
                {powerUp.effect === "shield" && "🛡️"}
                {powerUp.effect === "invisible" && "👻"}
                {powerUp.effect === "magnet" && "🧲"}
                {powerUp.effect === "teleport" && "🌀"}
                {powerUp.effect === "split" && "🍴"}
              </div>
              <span className="text-neutral-200">{getPowerUpName(powerUp.effect)}</span>
            </div>
            <div className="text-xs px-2 py-1 bg-black/30 rounded-full text-neutral-400 font-mono">
              {Math.max(0, Math.ceil(powerUp.timeLeft - ((Date.now() - powerUp.startTime) / 1000)))}s
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
