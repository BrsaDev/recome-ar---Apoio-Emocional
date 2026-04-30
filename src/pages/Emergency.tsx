import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Wind } from 'lucide-react';

interface Props {
  onClose: () => void;
}

export default function Emergency({ onClose }: Props) {
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale' | 'hold-empty'>('inhale');
  const [counter, setCounter] = useState(4);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let timer: number | undefined;
    if (isActive) {
      timer = window.setInterval(() => {
        setCounter((prev) => {
          if (prev === 1) {
            setPhase((currentPhase) => {
              if (currentPhase === 'inhale') {
                setCounter(4);
                return 'hold';
              }
              if (currentPhase === 'hold') {
                setCounter(4);
                return 'exhale';
              }
              if (currentPhase === 'exhale') {
                setCounter(4);
                return 'hold-empty';
              }
              setCounter(4);
              return 'inhale';
            });
            return 4;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isActive]);

  const getPhaseText = () => {
    switch (phase) {
      case 'inhale': return 'Inspire pelo nariz...';
      case 'hold': return 'Segure o ar...';
      case 'exhale': return 'Solte pela boca bem devagar...';
      case 'hold-empty': return 'Aguarde...';
    }
  };

  const getCircleScale = () => {
    switch (phase) {
      case 'inhale': return 1.5;
      case 'hold': return 1.5;
      case 'exhale': return 1;
      case 'hold-empty': return 1;
    }
  };

  return (
    <div className="h-full w-full bg-black flex flex-col items-center justify-between p-8 text-white">
      <div className="w-full flex justify-end">
        <button 
          onClick={onClose}
          className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center"
          id="btn-emergency-close"
        >
          <X size={24} />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center space-y-12">
        {!isActive ? (
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl font-display font-semibold">Respire comigo.</h2>
              <p className="text-gray-400">Vamos acalmar sua mente em alguns segundos.</p>
            </div>
            
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsActive(true)}
              className="w-20 h-20 rounded-full bg-brand-green flex items-center justify-center shadow-2xl shadow-brand-green/30"
              id="btn-emergency-start"
            >
              <Wind size={32} />
            </motion.button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-16">
            <div className="relative">
              <motion.div
                animate={{
                  scale: getCircleScale(),
                  opacity: phase === 'inhale' || phase === 'hold' ? 1 : 0.6,
                }}
                transition={{
                  duration: 4,
                  ease: "easeInOut",
                }}
                className="w-48 h-48 rounded-full bg-brand-green flex items-center justify-center"
              >
                <div className="w-40 h-40 rounded-full border-4 border-white/20 flex items-center justify-center">
                  <span className="text-5xl font-display font-light">{counter}</span>
                </div>
              </motion.div>
              
              {/* Pulse ring */}
              <motion.div
                animate={{ scale: [1, 1.8], opacity: [0.3, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 border-2 border-brand-green rounded-full"
              />
            </div>

            <div className="text-center space-y-4">
              <AnimatePresence mode="wait">
                <motion.h3
                  key={phase}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-2xl font-display font-medium h-8"
                >
                  {getPhaseText()}
                </motion.h3>
              </AnimatePresence>
              <p className="text-gray-500 italic">"Você está em segurança."</p>
            </div>
          </div>
        )}
      </div>

      <div className="invisible">Space</div>
    </div>
  );
}
