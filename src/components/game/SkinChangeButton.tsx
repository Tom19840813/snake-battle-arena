
import { useState } from 'react';
import { SkinSelector } from './SkinSelector';

interface SkinChangeButtonProps {
  activeSkin: string;
  playerScore: number | null;
  onSkinChange: (skinId: string) => void;
}

export function SkinChangeButton({ activeSkin, playerScore, onSkinChange }: SkinChangeButtonProps) {
  const [showSkinSelector, setShowSkinSelector] = useState<boolean>(false);

  const changeSkin = (skinId: string) => {
    onSkinChange(skinId);
    setShowSkinSelector(false);
  };

  return (
    <>
      <button
        onClick={() => setShowSkinSelector(!showSkinSelector)}
        className="px-6 py-3 bg-gradient-to-r from-purple-600/90 to-pink-600/90 backdrop-blur-xl rounded-xl text-sm text-white font-bold tracking-wide hover:from-purple-500/90 hover:to-pink-500/90 transition-all duration-300 border border-white/20 shadow-lg hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] hover:scale-105"
      >
        CHANGE SKIN
      </button>
      
      <SkinSelector 
        isOpen={showSkinSelector}
        activeSkin={activeSkin}
        playerScore={playerScore}
        onSkinSelect={changeSkin}
        onClose={() => setShowSkinSelector(false)}
      />
    </>
  );
}
