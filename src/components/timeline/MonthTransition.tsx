import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { terminalSound } from '@/utils/terminalSound';

interface MonthTransitionProps {
  isActive: boolean;
  onComplete: () => void;
}

export function MonthTransition({ isActive, onComplete }: MonthTransitionProps) {
  const { company } = useGameStore();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isActive) {
      setProgress(0);
      terminalSound.playEnter();

      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(onComplete, 500);
            return 100;
          }
          return prev + 5;
        });
      }, 50);

      return () => clearInterval(interval);
    }
  }, [isActive, onComplete]);

  if (!isActive || !company) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-terminal flex items-center justify-center"
      >
        <div className="max-w-2xl w-full p-8">
          {/* Header */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-center mb-8"
          >
            <div className="text-terminal-dark font-mono text-sm mb-2">PROCESSING MONTH</div>
            <div className="text-terminal-green font-mono text-4xl font-bold glow">
              {company.currentMonth + 1}
            </div>
          </motion.div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="h-2 bg-terminal-dark border border-terminal-green-dark">
              <motion.div
                className="h-full bg-terminal-green"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>
            <div className="text-terminal-dim font-mono text-xs mt-2 text-right">{progress}%</div>
          </div>

          {/* Processing Steps */}
          <div className="space-y-2 font-mono text-sm">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: progress > 20 ? 1 : 0.3, x: 0 }}
              className={progress > 20 ? 'text-terminal-green' : 'text-terminal-dark'}
            >
              {progress > 20 ? '✓' : '○'} Processing payroll...
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: progress > 40 ? 1 : 0.3, x: 0 }}
              transition={{ delay: 0.1 }}
              className={progress > 40 ? 'text-terminal-green' : 'text-terminal-dark'}
            >
              {progress > 40 ? '✓' : '○'} Updating projects...
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: progress > 60 ? 1 : 0.3, x: 0 }}
              transition={{ delay: 0.2 }}
              className={progress > 60 ? 'text-terminal-green' : 'text-terminal-dark'}
            >
              {progress > 60 ? '✓' : '○'} Checking employee morale...
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: progress > 80 ? 1 : 0.3, x: 0 }}
              transition={{ delay: 0.3 }}
              className={progress > 80 ? 'text-terminal-green' : 'text-terminal-dark'}
            >
              {progress > 80 ? '✓' : '○'} Generating events...
            </motion.div>
          </div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: progress >= 100 ? 1 : 0 }}
            className="mt-8 text-center"
          >
            <div className="text-terminal-cyan font-mono text-sm animate-pulse">
              Month {company.currentMonth + 1} ready
            </div>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export default MonthTransition;
