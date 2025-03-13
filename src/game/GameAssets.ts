
export interface SnakeSkin {
  id: string;
  name: string;
  color: string;
  pattern?: string;
  glow?: boolean;
  unlockScore?: number;
  description: string;
}

export interface PowerUp {
  id: string;
  name: string;
  color: string;
  icon: string;
  duration: number; // in seconds
  effect: PowerUpEffect;
  description: string;
}

export type PowerUpEffect = 
  | "speed" 
  | "shield" 
  | "invisible" 
  | "magnet" 
  | "grow" 
  | "teleport" 
  | "split";

// Available snake skins
export const SKINS: SnakeSkin[] = [
  {
    id: "default",
    name: "Default",
    color: "#FF5252",
    description: "The classic snake skin"
  },
  {
    id: "neon",
    name: "Neon",
    color: "#39FF14",
    glow: true,
    unlockScore: 50,
    description: "A glowing neon skin that leaves light trails"
  },
  {
    id: "golden",
    name: "Golden",
    color: "#FFD700",
    pattern: "gradient",
    unlockScore: 100,
    description: "Shiny golden snake that glimmers as it moves"
  },
  {
    id: "rainbow",
    name: "Rainbow",
    color: "rainbow",
    pattern: "rainbow",
    unlockScore: 200,
    description: "Constantly shifts through rainbow colors"
  },
  {
    id: "ghost",
    name: "Ghost",
    color: "#FFFFFF80",
    glow: true,
    pattern: "pulse",
    unlockScore: 300,
    description: "Semi-transparent with a pulsing glow effect"
  }
];

// Available power-ups
export const POWER_UPS: PowerUp[] = [
  {
    id: "speed",
    name: "Speed Boost",
    color: "#FFD700",
    icon: "⚡",
    duration: 5,
    effect: "speed",
    description: "Increases snake speed for 5 seconds"
  },
  {
    id: "shield",
    name: "Shield",
    color: "#1E90FF",
    icon: "🛡️",
    duration: 7,
    effect: "shield",
    description: "Protects from collisions for 7 seconds"
  },
  {
    id: "invisible",
    name: "Invisibility",
    color: "#AAAAAA",
    icon: "👻",
    duration: 4,
    effect: "invisible",
    description: "Makes your snake partially invisible to others"
  },
  {
    id: "magnet",
    name: "Food Magnet",
    color: "#FF69B4",
    icon: "🧲",
    duration: 6,
    effect: "magnet",
    description: "Attracts nearby food to your snake"
  },
  {
    id: "teleport",
    name: "Teleport",
    color: "#9400D3",
    icon: "🌀",
    duration: 0, // instant
    effect: "teleport",
    description: "Teleports to a random safe location"
  }
];

// Function to get unlocked skins based on score
export function getUnlockedSkins(score: number): SnakeSkin[] {
  return SKINS.filter(skin => !skin.unlockScore || score >= skin.unlockScore);
}
