
import { cn } from '@/lib/utils';
import { SKINS } from '../../game/GameAssets';

interface SkinSelectorProps {
  isOpen: boolean;
  activeSkin: string;
  playerScore: number | null;
  onSkinSelect: (skinId: string) => void;
  onClose: () => void;
}

export function SkinSelector({ 
  isOpen, 
  activeSkin, 
  playerScore, 
  onSkinSelect, 
  onClose 
}: SkinSelectorProps) {
  if (!isOpen) return null;
  
  const availableSkins = playerScore !== null ? SKINS.filter(skin => !skin.unlockScore || playerScore >= skin.unlockScore) : [SKINS[0]];

  return (
    <div className="mt-2 p-3 bg-black/90 backdrop-blur-xl rounded-lg w-64 border border-green-900/50 shadow-[0_0_15px_rgba(0,255,0,0.2)] animate-fade-in">
      <h3 className="text-white text-sm mb-2">Select Skin ({availableSkins.length}/{SKINS.length} Unlocked)</h3>
      <div className="grid grid-cols-2 gap-2">
        {SKINS.map(skin => {
          const isUnlocked = !skin.unlockScore || (playerScore !== null && playerScore >= (skin.unlockScore || 0));
          return (
            <button
              key={skin.id}
              onClick={() => isUnlocked && onSkinSelect(skin.id)}
              className={cn(
                "p-2 rounded border text-left text-sm flex items-center gap-2",
                isUnlocked 
                  ? skin.id === activeSkin 
                    ? "bg-green-900/50 border-green-400/70" 
                    : "bg-neutral-800/80 border-neutral-700/50 hover:bg-green-900/30"
                  : "bg-neutral-900/50 border-neutral-800/30 opacity-50 cursor-not-allowed"
              )}
              disabled={!isUnlocked}
            >
              <div 
                className={cn(
                  "w-4 h-4 rounded-full", 
                  skin.glow && "shadow-[0_0_5px_rgba(255,255,255,0.7)]"
                )}
                style={{ 
                  backgroundColor: skin.color === "rainbow"
                    ? `hsl(${(Date.now() / 20) % 360}, 70%, 60%)`
                    : skin.color 
                }}
              />
              <span className="text-white">{skin.name}</span>
              {!isUnlocked && (
                <span className="text-xs text-neutral-400 ml-auto">
                  {skin.unlockScore} pts
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
