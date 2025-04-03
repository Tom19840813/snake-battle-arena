
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HeartCrack, SkullIcon, RefreshCw, Frown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

interface DeathAnimationProps {
  score: number;
  onRestart: () => void;
}

export function DeathAnimation({ score, onRestart }: DeathAnimationProps) {
  const [showExplosion, setShowExplosion] = useState(true);
  const isMobile = useIsMobile();
  
  useEffect(() => {
    // Only show the explosion effect briefly
    const explosionTimer = setTimeout(() => {
      setShowExplosion(false);
    }, 500); // Reduced from 1000ms to 500ms for faster feedback
    
    return () => {
      clearTimeout(explosionTimer);
    };
  }, []);
  
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/95 rounded-lg backdrop-blur-xl z-50">
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
                duration: 0.7, // Faster explosion
                ease: "easeOut"
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
      
      <motion.div
        className="flex flex-col items-center px-6 py-8 bg-black/95 rounded-xl border-4 border-red-500 shadow-[0_0_40px_rgba(255,0,0,0.7)] w-[90%] max-w-md"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ 
          duration: 0.5,
          type: "spring",
          bounce: 0.5,
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
            className="absolute inset-0 bg-red-500/30 blur-xl rounded-full"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0.8, 0.5]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          
          <HeartCrack size={84} className="text-red-500 absolute -left-4 -top-4 opacity-70 blur-sm" />
          <SkullIcon size={74} className="text-white relative z-10" />
          <Frown size={28} className="text-red-400 absolute top-10 left-6" />
        </motion.div>
        
        <motion.h2 
          className="text-4xl md:text-5xl font-bold text-white mb-3"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          Game Over
        </motion.h2>
        
        <motion.div
          className="flex items-center gap-2 mb-8 bg-black/60 px-5 py-3 rounded-full border border-red-500/50"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <span className="text-neutral-300">Final Score:</span>
          <motion.span 
            className="text-2xl text-red-400 font-mono font-bold"
            animate={{
              scale: [1, 1.2, 1],
              color: ['#f87171', '#ef4444', '#f87171']
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
              delay: 0.3
            }
          }}
          className="relative"
        >
          {/* Additional shine effects around button */}
          <motion.div 
            className="absolute -inset-6 bg-gradient-to-r from-red-500/0 via-red-500/40 to-red-500/0 rounded-full"
            animate={{ 
              opacity: [0.3, 0.8, 0.3],
              scale: [0.9, 1.1, 0.9]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut" 
            }}
          />
          
          {/* Blinking arrow pointing to button */}
          <motion.div 
            className="absolute -top-14 left-1/2 transform -translate-x-1/2"
            animate={{ 
              y: [-5, 5, -5],
              opacity: [1, 0.7, 1]
            }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <div className="w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[20px] border-t-white" />
          </motion.div>
          
          <Button 
            onClick={onRestart}
            variant="gameOver"
            size={isMobile ? "xxl" : "xl"}
            className="flex items-center gap-3 rounded-full text-2xl font-bold py-8 min-w-[230px] shadow-[0_0_40px_rgba(255,0,0,0.8)] border-2 border-white"
          >
            <RefreshCw size={isMobile ? 32 : 28} className="animate-spin-slow" />
            Play Again
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
