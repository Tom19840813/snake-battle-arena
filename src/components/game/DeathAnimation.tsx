
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HeartCrack, SkullIcon, RefreshCw, Frown } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DeathAnimationProps {
  score: number;
  onRestart: () => void;
}

export function DeathAnimation({ score, onRestart }: DeathAnimationProps) {
  const [showExplosion, setShowExplosion] = useState(true);
  
  useEffect(() => {
    // Only show the explosion effect briefly
    const explosionTimer = setTimeout(() => {
      setShowExplosion(false);
    }, 1000);
    
    return () => {
      clearTimeout(explosionTimer);
    };
  }, []);
  
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 rounded-lg backdrop-blur-md z-20">
      {/* Initial explosion effect */}
      <AnimatePresence>
        {showExplosion && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="w-40 h-40 rounded-full bg-red-500/80"
              initial={{ scale: 0 }}
              animate={{ 
                scale: [0, 4, 0],
                opacity: [0, 0.8, 0] 
              }}
              transition={{ 
                duration: 1,
                ease: "easeOut"
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        <motion.div
          className="flex flex-col items-center"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ 
            duration: 0.5,
            type: "spring",
            bounce: 0.5,
            delay: 0.5
          }}
        >
          <motion.div 
            className="relative mb-6"
            animate={{ 
              rotate: [0, -8, 8, -8, 8, 0],
              y: [0, -5, 0, -5, 0]
            }}
            transition={{ 
              duration: 2.5,
              repeat: Infinity,
              repeatType: "loop",
              ease: "easeInOut" 
            }}
          >
            {/* Shock waves */}
            <motion.div
              className="absolute inset-0 rounded-full border-4 border-red-500/30"
              initial={{ scale: 1 }}
              animate={{ 
                scale: [1, 2],
                opacity: [1, 0]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "linear"
              }}
            />
            
            {/* Glow effect under the skull */}
            <motion.div
              className="absolute inset-0 bg-red-500/20 blur-xl rounded-full"
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.5, 0.8, 0.5]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            
            <HeartCrack size={64} className="text-red-500 absolute -left-3 -top-3 opacity-70 blur-sm" />
            <SkullIcon size={64} className="text-white relative z-10" />
            <Frown size={24} className="text-red-400 absolute top-9 left-5" />
          </motion.div>
          
          <motion.h2 
            className="text-3xl md:text-4xl font-bold text-white mb-3"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
          >
            Game Over
          </motion.h2>
          
          <motion.div
            className="flex items-center gap-2 mb-8 bg-black/50 px-4 py-2 rounded-full"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.5 }}
          >
            <span className="text-neutral-300">Final Score:</span>
            <motion.span 
              className="text-xl text-green-400 font-mono"
              animate={{
                scale: [1, 1.2, 1],
                color: ['#4ade80', '#22c55e', '#4ade80']
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              {score}
            </motion.span>
          </motion.div>
          
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ 
              y: 0, 
              opacity: 1,
              transition: {
                type: "spring",
                stiffness: 300,
                damping: 15,
                delay: 1.0
              }
            }}
          >
            <Button 
              onClick={onRestart}
              variant="glow"
              size="lg"
              className="flex items-center gap-2 rounded-full shadow-[0_0_25px_rgba(0,255,0,0.7)] text-xl font-bold py-6 animate-pulse"
            >
              <RefreshCw size={24} className="animate-spin-slow" />
              Play Again
            </Button>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
