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
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs">
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
            className="relative w-full max-w-md bg-brand-white rounded-t-[2.5rem] shadow-2xl flex flex-col p-6 overflow-hidden z-10"
            style={{ maxHeight: '80vh' }}
          >
            {/* Grab Handle */}
            <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4 shrink-0" />

            {/* Header */}
            <div className="flex items-center justify-between mb-4 shrink-0">
              <div>
                <h3 className="font-display font-bold text-lg text-brand-text">Escolha seu Avatar</h3>
                <p className="text-xs text-gray-500 font-light">Selecione uma identidade anônima para interagir.</p>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-brand-gray/80 flex items-center justify-center text-gray-400 hover:text-brand-text transition-all"
              >
                <X size={18} />
              </button>
            </div>

            {/* Category Tabs */}
            <div className="flex space-x-1.5 bg-brand-gray p-1 rounded-2xl mb-6 shrink-0 border border-brand-blue/5">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={cn(
                    "flex-1 py-2.5 rounded-xl text-xs font-bold transition-all text-center",
                    activeCategory === cat.id
                      ? "bg-brand-white text-brand-blue shadow-sm"
                      : "text-gray-400 hover:text-brand-text"
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
                        "aspect-square rounded-3xl flex flex-col items-center justify-center relative transition-all border-2",
                        isSelected
                          ? "bg-brand-blue/10 border-brand-blue/80 shadow-md scale-105"
                          : "bg-brand-gray/40 border-transparent hover:border-brand-gray/80"
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
                            className="absolute -top-1 -right-1 w-5 h-5 bg-brand-blue rounded-full flex items-center justify-center text-white border-2 border-brand-white shadow"
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
