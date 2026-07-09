import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Mood } from '../types';
import { cn } from '../lib/utils';
import { ArrowRight, User as UserIcon, Users, RefreshCw } from 'lucide-react';
import { AVATARS } from '../data/avatars';

interface Props {
  onComplete: (user: User) => void;
  initialName?: string;
}

export default function Onboarding({ onComplete, initialName = '' }: Props) {
  const [step, setStep] = useState(1);
  const [selectedProfile, setSelectedProfile] = useState<'masculino' | 'feminino' | 'misto' | null>(null);
  const [name, setName] = useState(initialName || `Anônimo ${Math.floor(100 + Math.random() * 900)}`);
  const [mood, setMood] = useState<Mood | null>(null);

  const moods: { id: Mood; label: string; emoji: string }[] = [
    { id: 'ansioso', label: 'Ansioso', emoji: '😰' },
    { id: 'triste', label: 'Triste', emoji: '😔' },
    { id: 'confuso', label: 'Confuso', emoji: '😶' },
    { id: 'sozinho', label: 'Sozinho', emoji: '😞' },
  ];

  const handleNext = () => {
    if (step === 1 && selectedProfile) {
      setStep(2);
    } else if (step === 2 && name.trim()) {
      setStep(3);
    } else if (step === 3 && mood) {
      const randomAvatar = AVATARS[Math.floor(Math.random() * AVATARS.length)];
      onComplete({
        nickname: name,
        initialMood: mood,
        avatarId: randomAvatar.id,
        plan: 'FREE',
        gender: selectedProfile === 'masculino' ? 'men' : selectedProfile === 'feminino' ? 'women' : 'mixed'
      } as any);
    }
  };

  const handleRefreshName = () => {
    setName(`Anônimo ${Math.floor(100 + Math.random() * 900)}`);
  };

  return (
    <div className="h-full w-full flex flex-col bg-[#020410] relative overflow-hidden">
      {/* Background Neon Glows */}
      <div className="absolute top-[-10%] right-[-10%] w-72 h-72 rounded-full bg-cyan-605/5 blur-[80px] z-0" />
      <div className="absolute bottom-[-10%] left-[-10%] w-72 h-72 rounded-full bg-purple-605/5 blur-[80px] z-0" />

      <div className="flex-1 mt-12 px-8 overflow-y-auto no-scrollbar z-10">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="space-y-2 mt-4">
                <h2 className="text-2xl font-display font-medium text-white text-center">Como você deseja participar?</h2>
                <p className="text-gray-400 font-light text-xs text-center">Você pode alterar depois nas configurações.</p>
              </div>

              <div className="flex flex-col space-y-4">
                <button
                  onClick={() => setSelectedProfile('masculino')}
                  className={cn(
                    "w-full glass-card p-5 rounded-3xl flex items-center space-x-4 text-left border transition-all duration-300",
                    selectedProfile === 'masculino' ? "border-[#2E9CCA] bg-[#2E9CCA]/10 outline-none" : "border-white/5"
                  )}
                >
                  <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center text-blue-400 shrink-0">
                    <UserIcon size={24} />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-white text-sm">Masculino</h3>
                    <p className="text-xs text-gray-400">Salas masculinas e mistas.</p>
                  </div>
                </button>

                <button
                  onClick={() => setSelectedProfile('feminino')}
                  className={cn(
                    "w-full glass-card p-5 rounded-3xl flex items-center space-x-4 text-left border transition-all duration-300",
                    selectedProfile === 'feminino' ? "border-pink-500 bg-pink-500/10 outline-none" : "border-white/5"
                  )}
                >
                  <div className="w-12 h-12 bg-pink-500/20 rounded-2xl flex items-center justify-center text-pink-400 shrink-0">
                    <UserIcon size={24} />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-white text-sm">Feminino</h3>
                    <p className="text-xs text-gray-400">Salas femininas e mistas.</p>
                  </div>
                </button>

                <button
                  onClick={() => setSelectedProfile('misto')}
                  className={cn(
                    "w-full glass-card p-5 rounded-3xl flex items-center space-x-4 text-left border transition-all duration-300",
                    selectedProfile === 'misto' ? "border-purple-500 bg-purple-500/10 outline-none" : "border-white/5"
                  )}
                >
                  <div className="w-12 h-12 bg-purple-500/20 rounded-2xl flex items-center justify-center text-purple-400 shrink-0">
                    <Users size={24} />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-white text-sm">Misto</h3>
                    <p className="text-xs text-gray-400">Salas mistas (feminino e masculino).</p>
                  </div>
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="space-y-2 mt-4 text-center">
                <h2 className="text-2xl font-display font-medium text-white">Bem-vindo ao FAPEM!</h2>
                <p className="text-gray-400 font-light text-xs">Para manter seu anonimato, escolhemos um nome para você.</p>
              </div>

              <div className="flex flex-col items-center justify-center py-4">
                <div className="w-20 h-20 rounded-full bg-purple-900/35 border border-purple-500/30 flex items-center justify-center text-3xl shadow-lg relative">
                  🎭
                </div>
              </div>

              <div className="relative glass-card rounded-[2rem] p-4 flex items-center justify-between border border-white/10 shadow-neon-purple/5">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nome anônimo..."
                  className="flex-1 bg-transparent border-none text-white text-lg font-display text-center outline-none leading-none"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={handleRefreshName}
                  className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-gray-400 hover:text-white transition-all outline-none"
                >
                  <RefreshCw size={16} />
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="space-y-2 mt-4 text-center">
                <h2 className="text-2xl font-display font-medium text-white">Como você está hoje?</h2>
                <p className="text-gray-400 font-light text-xs">Isso nos ajuda a preparar um ambiente melhor para você.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {moods.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setMood(m.id)}
                    className={cn(
                      "flex flex-col items-center justify-center p-6 rounded-3xl transition-all duration-300 border glass-card",
                      mood === m.id
                        ? "border-[#2E9CCA] bg-[#2E9CCA]/10 text-[#2E9CCA]"
                        : "border-white/5 text-gray-400 hover:border-white/10"
                    )}
                  >
                    <span className="text-4xl mb-2">{m.emoji}</span>
                    <span className="font-medium text-xs">{m.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="p-8 pt-0 z-10">
        <motion.button
          disabled={step === 1 ? !selectedProfile : step === 2 ? !name.trim() : !mood}
          onClick={handleNext}
          className={cn(
            "w-full h-15 rounded-2xl font-display font-bold text-base flex items-center justify-center space-x-2 transition-all duration-300 border shadow-lg",
            ((step === 1 && selectedProfile) || (step === 2 && name.trim()) || (step === 3 && mood))
              ? "bg-gradient-to-r from-purple-650 to-indigo-650 text-white border-purple-500/25 shadow-purple-500/10 cursor-pointer"
              : "bg-white/5 text-gray-500 border-white/5 cursor-not-allowed shadow-none"
          )}
          id="btn-onboarding-next"
        >
          <span>Continuar</span>
          <ArrowRight size={18} />
        </motion.button>
      </div>
    </div>
  );
}
