
import { useState } from "react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Users, Bot, Shield, Zap, SkullIcon } from "lucide-react";

interface OpponentSelectorProps {
  onOpponentsChange: (count: number, difficulty: number) => void;
  currentOpponents: number;
  currentDifficulty: number;
}

export function OpponentSelector({ 
  onOpponentsChange, 
  currentOpponents, 
  currentDifficulty 
}: OpponentSelectorProps) {
  const [opponentCount, setOpponentCount] = useState(currentOpponents);
  const [difficulty, setDifficulty] = useState(currentDifficulty);
  
  const handleApply = () => {
    onOpponentsChange(opponentCount, difficulty);
  };
  
  const getDifficultyLabel = (level: number) => {
    switch (level) {
      case 1: return "Easy";
      case 2: return "Medium";
      case 3: return "Hard";
      default: return "Easy";
    }
  };

  const getDifficultyIcon = (level: number) => {
    switch (level) {
      case 1: return <Shield className="h-5 w-5 text-green-500" />;
      case 2: return <Zap className="h-5 w-5 text-yellow-500" />;
      case 3: return <SkullIcon className="h-5 w-5 text-red-500" />;
      default: return <Shield className="h-5 w-5 text-green-500" />;
    }
  };
  
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-green-700/50 bg-black/50 backdrop-blur-md">
          <Bot className="mr-2 h-4 w-4" />
          {opponentCount} AI Opponents ({getDifficultyLabel(difficulty)})
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-black/90 backdrop-blur-xl border-green-900/50 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-green-500" />
            AI Opponents Configuration
          </DialogTitle>
          <DialogDescription className="text-neutral-400">
            Adjust the number and difficulty of AI snakes in the game.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="snake-count" className="text-neutral-300">Number of AI Snakes</Label>
              <span className="font-mono text-green-400">{opponentCount}</span>
            </div>
            <Slider 
              id="snake-count"
              min={5} 
              max={30} 
              step={1} 
              value={[opponentCount]} 
              onValueChange={(value) => setOpponentCount(value[0])}
              className="[&_[role=slider]]:bg-green-500"
            />
            <div className="flex justify-between text-xs text-neutral-500">
              <span>Few (5)</span>
              <span>Many (30)</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="difficulty" className="text-neutral-300">AI Difficulty</Label>
              <div className="flex items-center gap-1 font-mono">
                {getDifficultyIcon(difficulty)}
                <span className={
                  difficulty === 1 ? "text-green-400" : 
                  difficulty === 2 ? "text-yellow-400" : 
                  "text-red-400"
                }>
                  {getDifficultyLabel(difficulty)}
                </span>
              </div>
            </div>
            <Slider 
              id="difficulty"
              min={1} 
              max={3} 
              step={1} 
              value={[difficulty]} 
              onValueChange={(value) => setDifficulty(value[0])} 
              className={`[&_[role=slider]]:${
                difficulty === 1 ? "bg-green-500" : 
                difficulty === 2 ? "bg-yellow-500" : 
                "bg-red-500"
              }`}
            />
            <div className="flex justify-between text-xs">
              <span className="text-green-500">Easy</span>
              <span className="text-yellow-500">Medium</span>
              <span className="text-red-500">Hard</span>
            </div>
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={handleApply} variant="glow">Apply Changes</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
