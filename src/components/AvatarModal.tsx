import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Avatar, AVATARS } from '../data/avatars';
import { X, Check } from 'lucide-react';
import { cn } from '../lib/utils';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  selectedId?: string;
  onSelect: (avatar: Avatar) => void;
}

const CATEGORIES = [
  { id: 'male', label: 'Masculino' },
  { id: 'female', label: 'Feminino' },
  { id: 'nature', label: 'Neutro/Natureza' }
] as const;

export default function AvatarModal({ isOpen, onClose, selectedId, onSelect }: Props) {
  const [activeCategory, setActiveCategory] = useState<'male' | 'female' | 'nature'>('male');

  const filteredAvatars = AVATARS.filter(a => a.category === activeCategory);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 backdrop-blur-sm">
          {/* Backdrop Click */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0"
          />

          {/* Modal Panel */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="relative w-full max-w-md bg-[#0a0f1f]/95 backdrop-blur-md border border-white/5 rounded-t-[2.5rem] shadow-2xl flex flex-col p-6 overflow-hidden z-10"
            style={{ maxHeight: '80vh' }}
          >
            {/* Grab Handle */}
            <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-4 shrink-0" />

            {/* Header */}
            <div className="flex items-center justify-between mb-4 shrink-0">
              <div>
                <h3 className="font-display font-bold text-lg text-white">Escolha seu Avatar</h3>
                <p className="text-xs text-gray-500 font-light font-sans">Selecione uma identidade anônima para interagir.</p>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white transition-all cursor-pointer border border-white/5"
              >
                <X size={18} />
              </button>
            </div>

            {/* Category Tabs */}
            <div className="flex space-x-1.5 bg-[#12182b] p-1 rounded-2xl mb-6 shrink-0 border border-white/5">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={cn(
                    "flex-1 py-2.5 rounded-xl text-xs font-bold transition-all text-center cursor-pointer select-none",
                    activeCategory === cat.id
                      ? "bg-purple-600 text-white shadow-md shadow-purple-950/20 border border-purple-500/20"
                      : "text-gray-400 hover:text-white"
                  )}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Grid Area */}
            <div className="flex-1 overflow-y-auto no-scrollbar pb-6">
              <div className="grid grid-cols-4 gap-4 px-1">
                {filteredAvatars.map((av) => {
                  const isSelected = av.id === selectedId;
                  return (
                    <motion.button
                      key={av.id}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        onSelect(av);
                        onClose();
                      }}
                      className={cn(
                        "aspect-square rounded-3xl flex flex-col items-center justify-center relative transition-all border-2 cursor-pointer outline-none",
                        isSelected
                          ? "bg-purple-500/10 border-purple-500 shadow-neon-purple shadow-sm scale-105"
                          : "bg-[#12182b] border-transparent hover:border-white/10"
                      )}
                    >
                      <span className="text-4xl mb-1">{av.emoji}</span>
                      <span className="text-[10px] text-gray-400 font-medium tracking-tight truncate max-w-full px-1">{av.name}</span>

                      {/* Selected Badge */}
                      <AnimatePresence>
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            className="absolute -top-1 -right-1 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center text-white border-2 border-[#0a0f1f] shadow"
                          >
                            <Check size={10} strokeWidth={3} />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
