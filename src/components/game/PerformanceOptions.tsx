
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

interface PerformanceOptionsProps {
  onQualityChange: (quality: 'low' | 'medium' | 'high') => void;
  onSnakeCountChange: (count: number) => void;
  onHideBackgroundChange: (hide: boolean) => void;
  onGameSpeedChange: (speed: number) => void;
}

export function PerformanceOptions({
  onQualityChange,
  onSnakeCountChange,
  onHideBackgroundChange,
  onGameSpeedChange
}: PerformanceOptionsProps) {
  const [quality, setQuality] = useState<'low' | 'medium' | 'high'>('medium');
  const [snakeCount, setSnakeCount] = useState(15);
  const [hideBackground, setHideBackground] = useState(false);
  const [gameSpeed, setGameSpeed] = useState(0.5); // Changed default to 0.5 (slower)

  const handleQualityChange = (newQuality: 'low' | 'medium' | 'high') => {
    setQuality(newQuality);
    onQualityChange(newQuality);
  };

  const handleSnakeCountChange = (value: number[]) => {
    const count = value[0];
    setSnakeCount(count);
    onSnakeCountChange(count);
  };

  const handleHideBackgroundChange = (checked: boolean) => {
    setHideBackground(checked);
    onHideBackgroundChange(checked);
  };

  const handleGameSpeedChange = (value: number[]) => {
    const speed = value[0];
    setGameSpeed(speed);
    onGameSpeedChange(speed);
  };

  // Helper function to get speed label
  const getSpeedLabel = (speed: number) => {
    if (speed <= 0.25) return 'Very Slow';
    if (speed <= 0.5) return 'Slow';
    if (speed <= 0.75) return 'Medium';
    return 'Normal';
  };

  return (
    <Card className="p-4 bg-black/30 backdrop-blur-xl border-green-900/30 shadow-[0_0_15px_rgba(0,200,0,0.1)]">
      <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
        <span className="text-green-400">⚙️</span>
        Performance Settings
      </h2>
      <div className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm text-neutral-400">Graphics Quality</p>
          <div className="flex items-center justify-between">
            <button
              onClick={() => handleQualityChange('low')}
              className={`px-3 py-1 text-xs rounded-md ${
                quality === 'low' 
                  ? 'bg-green-700 text-white' 
                  : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
              }`}
            >
              Low
            </button>
            <button
              onClick={() => handleQualityChange('medium')}
              className={`px-3 py-1 text-xs rounded-md ${
                quality === 'medium' 
                  ? 'bg-green-700 text-white' 
                  : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
              }`}
            >
              Medium
            </button>
            <button
              onClick={() => handleQualityChange('high')}
              className={`px-3 py-1 text-xs rounded-md ${
                quality === 'high' 
                  ? 'bg-green-700 text-white' 
                  : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
              }`}
            >
              High
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <p className="text-sm text-neutral-400">Number of Snakes</p>
            <span className="text-sm text-white">{snakeCount}</span>
          </div>
          <Slider
            defaultValue={[15]}
            max={30}
            min={5}
            step={5}
            value={[snakeCount]}
            onValueChange={handleSnakeCountChange}
            className="w-full"
          />
        </div>

        <div className="flex items-center space-x-2 py-2">
          <Switch
            id="hide-background"
            checked={hideBackground}
            onCheckedChange={handleHideBackgroundChange}
          />
          <Label htmlFor="hide-background" className="text-neutral-300 text-sm">
            Hide 3D Background for Better Performance
          </Label>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <p className="text-sm text-neutral-400">Game Speed</p>
            <span className="text-sm text-white">
              {getSpeedLabel(gameSpeed)}
            </span>
          </div>
          <Slider
            defaultValue={[0.5]} // Changed default to 0.5
            max={1}              // Reduced max from 2 to 1
            min={0.25}           // Reduced min from 0.5 to 0.25
            step={0.25}          // Changed step to 0.25 for more granular control
            value={[gameSpeed]}
            onValueChange={handleGameSpeedChange}
            className="w-full"
          />
        </div>
      </div>
    </Card>
  );
}
