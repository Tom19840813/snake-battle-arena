
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';

interface ControlsPanelProps {
  onDirectionChange: (direction: { x: number, y: number }) => void;
}

export function ControlsPanel({ onDirectionChange }: ControlsPanelProps) {
  return (
    <>
      {/* Desktop Controls */}
      <div className="absolute bottom-6 right-6 p-3 bg-black/70 backdrop-blur-md rounded-lg hidden md:block border border-green-900/50">
        <div className="text-xs text-neutral-400 mb-1">Controls</div>
        <div className="text-neutral-300">↑ ↓ ← → Arrow Keys</div>
      </div>
      
      {/* Mobile Controls */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 p-3 bg-black/70 backdrop-blur-md rounded-lg flex flex-col items-center md:hidden border border-green-900/50 shadow-[0_0_15px_rgba(0,255,0,0.2)]">
        <button 
          onClick={() => onDirectionChange({ x: 0, y: -1 })}
          className="p-3 bg-green-900/50 rounded-lg hover:bg-green-700 active:bg-green-600 transition-colors mb-2"
        >
          <ArrowUp size={24} className="text-white" />
        </button>
        <div className="flex gap-2">
          <button 
            onClick={() => onDirectionChange({ x: -1, y: 0 })}
            className="p-3 bg-green-900/50 rounded-lg hover:bg-green-700 active:bg-green-600 transition-colors"
          >
            <ArrowLeft size={24} className="text-white" />
          </button>
          <button 
            onClick={() => onDirectionChange({ x: 0, y: 1 })}
            className="p-3 bg-green-900/50 rounded-lg hover:bg-green-700 active:bg-green-600 transition-colors"
          >
            <ArrowDown size={24} className="text-white" />
          </button>
          <button 
            onClick={() => onDirectionChange({ x: 1, y: 0 })}
            className="p-3 bg-green-900/50 rounded-lg hover:bg-green-700 active:bg-green-600 transition-colors"
          >
            <ArrowRight size={24} className="text-white" />
          </button>
        </div>
      </div>
    </>
  );
}
