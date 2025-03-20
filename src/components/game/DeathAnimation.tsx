
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HeartCrack, SkullIcon, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DeathAnimationProps {
  score: number;
  onRestart: () => void;
}

export function DeathAnimation({ score, onRestart }: DeathAnimationProps) {
  const [showRestart, setShowRestart] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowRestart(true);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 rounded-lg backdrop-blur-md z-20">
      <AnimatePresence>
        <motion.div
          className="flex flex-col items-center"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ 
            duration: 0.5,
            type: "spring",
            bounce: 0.5
          }}
        >
          <motion.div 
            className="relative mb-4"
            animate={{ 
              rotate: [0, -10, 10, -10, 10, 0],
            }}
            transition={{ 
              duration: 1.5,
              repeat: Infinity,
              repeatType: "loop",
              ease: "easeInOut" 
            }}
          >
            <HeartCrack size={60} className="text-red-500 absolute -left-2 opacity-60 blur-sm" />
            <SkullIcon size={60} className="text-white" />
          </motion.div>
          
          <motion.h2 
            className="text-3xl md:text-4xl font-bold text-white mb-2"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            Game Over
          </motion.h2>
          
          <motion.div
            className="flex items-center gap-2 mb-6"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <span className="text-neutral-300">Final Score:</span>
            <span className="text-xl text-green-400 font-mono">{score}</span>
          </motion.div>
          
          <AnimatePresence>
            {showRestart && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 20, opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Button 
                  onClick={onRestart}
                  variant="pulse"
                  size="lg"
                  className="flex items-center gap-2 rounded-full"
                >
                  <RefreshCw size={20} />
                  Play Again
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
