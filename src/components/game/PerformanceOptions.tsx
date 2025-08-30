
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
  onPerformanceModeChange?: (enabled: boolean) => void;
}

export function PerformanceOptions({ 
  onQualityChange, 
  onSnakeCountChange, 
  onHideBackgroundChange,
  onGameSpeedChange,
  onPerformanceModeChange 
}: PerformanceOptionsProps) {
  const [quality, setQuality] = useState<'low' | 'medium' | 'high'>('medium');
  const [snakeCount, setSnakeCount] = useState(15);
  const [hideBackground, setHideBackground] = useState(false);
  const [gameSpeed, setGameSpeed] = useState(1.5);
  const [performanceMode, setPerformanceMode] = useState(false);

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

  const handlePerformanceModeChange = (checked: boolean) => {
    setPerformanceMode(checked);
    onPerformanceModeChange?.(checked);
  };

  const getSpeedLabel = (speed: number) => {
    if (speed <= 0.5) return 'SLOW';
    if (speed <= 1) return 'NORMAL';
    if (speed <= 2) return 'FAST';
    return 'ULTRA FAST';
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-slate-900/95 via-purple-900/95 to-slate-900/95 backdrop-blur-xl border-2 border-purple-500/30 shadow-2xl rounded-2xl">
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-transparent to-purple-500/5 pointer-events-none rounded-2xl" />
      
      <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3 tracking-wide">
        <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-lg flex items-center justify-center">
          <span className="text-white text-lg">⚡</span>
        </div>
        PERFORMANCE SETTINGS
      </h2>
      
      <div className="space-y-6">
        <div className="space-y-3">
          <p className="text-sm font-semibold text-purple-200 tracking-wider uppercase">Graphics Quality</p>
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={() => handleQualityChange('low')}
              className={`flex-1 px-4 py-2.5 text-sm font-bold rounded-xl transition-all duration-300 tracking-wide ${
                quality === 'low' 
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.5)] scale-105' 
                  : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50 hover:text-white border border-slate-600/30'
              }`}
            >
              LOW
            </button>
            <button
              onClick={() => handleQualityChange('medium')}
              className={`flex-1 px-4 py-2.5 text-sm font-bold rounded-xl transition-all duration-300 tracking-wide ${
                quality === 'medium' 
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-[0_0_20px_rgba(245,158,11,0.5)] scale-105' 
                  : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50 hover:text-white border border-slate-600/30'
              }`}
            >
              MEDIUM
            </button>
            <button
              onClick={() => handleQualityChange('high')}
              className={`flex-1 px-4 py-2.5 text-sm font-bold rounded-xl transition-all duration-300 tracking-wide ${
                quality === 'high' 
                  ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.5)] scale-105' 
                  : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50 hover:text-white border border-slate-600/30'
              }`}
            >
              HIGH
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <p className="text-sm font-semibold text-purple-200 tracking-wider uppercase">Snake Count</p>
            <span className="text-lg font-bold text-white bg-purple-600/30 px-3 py-1 rounded-lg border border-purple-400/30">
              {snakeCount}
            </span>
          </div>
          <Slider
            defaultValue={[15]}
            max={30}
            min={5}
            step={5}
            value={[snakeCount]}
            onValueChange={handleSnakeCountChange}
            className="w-full [&_[role=slider]]:bg-gradient-to-r [&_[role=slider]]:from-purple-500 [&_[role=slider]]:to-cyan-500 [&_[role=slider]]:border-0 [&_[role=slider]]:shadow-[0_0_10px_rgba(168,85,247,0.5)]"
          />
        </div>

        <div className="flex items-center space-x-4 py-3 px-4 bg-slate-800/30 rounded-xl border border-slate-600/30">
          <Switch
            id="hide-background"
            checked={hideBackground}
            onCheckedChange={handleHideBackgroundChange}
            className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-purple-500 data-[state=checked]:to-cyan-500"
          />
          <Label htmlFor="hide-background" className="text-white font-medium tracking-wide">
            Hide 3D Background for Better Performance
          </Label>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <p className="text-sm font-semibold text-purple-200 tracking-wider uppercase">Game Speed</p>
            <span className="text-sm font-bold text-white bg-gradient-to-r from-purple-600/50 to-cyan-600/50 px-3 py-1.5 rounded-lg border border-purple-400/30 tracking-wide">
              {getSpeedLabel(gameSpeed)}
            </span>
          </div>
          <Slider
            defaultValue={[1.5]}
            max={3}
            min={0.5}
            step={0.5}
            value={[gameSpeed]}
            onValueChange={handleGameSpeedChange}
            className="w-full [&_[role=slider]]:bg-gradient-to-r [&_[role=slider]]:from-purple-500 [&_[role=slider]]:to-cyan-500 [&_[role=slider]]:border-0 [&_[role=slider]]:shadow-[0_0_10px_rgba(168,85,247,0.5)]"
          />
        </div>

        <div className="flex items-center space-x-4 py-3 px-4 bg-slate-800/30 rounded-xl border border-slate-600/30">
          <Switch
            id="performance-mode"
            checked={performanceMode}
            onCheckedChange={handlePerformanceModeChange}
            className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-green-500 data-[state=checked]:to-emerald-500"
          />
          <Label htmlFor="performance-mode" className="text-white font-medium tracking-wide">
            High Performance Mode (Disable Interpolation)
          </Label>
        </div>
      </div>
    </Card>
  );
}
