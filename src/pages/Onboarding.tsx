import { useState } from 'react';
import { motion } from 'motion/react';
import { User, Mood } from '../types';
import { cn } from '../lib/utils';
import { ArrowRight } from 'lucide-react';
import { AVATARS } from '../data/avatars';

interface Props {
  onComplete: (user: User) => void;
  initialName?: string;
}

export default function Onboarding({ onComplete, initialName = '' }: Props) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState(initialName);
  const [mood, setMood] = useState<Mood | null>(null);

  const moods: { id: Mood; label: string; emoji: string }[] = [
    { id: 'ansioso', label: 'Ansioso', emoji: '😰' },
    { id: 'triste', label: 'Triste', emoji: '😔' },
    { id: 'confuso', label: 'Confuso', emoji: '😶' },
    { id: 'sozinho', label: 'Sozinho', emoji: '😞' },
  ];

  const handleNext = () => {
    if (step === 1 && name.trim()) {
      setStep(2);
    } else if (step === 2 && mood) {
      // Escolher avatar aleatório por padrão
      const randomAvatar = AVATARS[Math.floor(Math.random() * AVATARS.length)];
      onComplete({ name, initialMood: mood, avatarId: randomAvatar.id, plan: 'free' });
    }
  };

  return (
    <div className="h-full w-full flex flex-col bg-brand-white">
      <div className="flex-1 mt-12 px-8 overflow-y-auto no-scrollbar">
        {step === 1 ? (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="space-y-2">
              <h2 className="text-3xl font-display font-semibold text-brand-text">Como podemos te chamar?</h2>
              <p className="text-gray-500 font-light">Pode ser seu nome ou um apelido que você goste.</p>
            </div>
            
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Digite seu nome..."
              className="w-full bg-brand-gray border-none rounded-2xl p-5 text-xl outline-none focus:ring-2 focus:ring-brand-green/30 transition-all font-sans"
              autoFocus
              id="input-onboarding-name"
            />
          </motion.div>
        ) : (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            <div className="space-y-2">
              <h2 className="text-3xl font-display font-semibold text-brand-text">Como você está hoje?</h2>
              <p className="text-gray-500 font-light">Isso nos ajuda a preparar um ambiente melhor para você.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {moods.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMood(m.id)}
                  className={cn(
                    "flex flex-col items-center justify-center p-6 rounded-3xl transition-all duration-300 border-2",
                    mood === m.id 
                      ? "bg-brand-green/10 border-brand-green text-brand-green" 
                      : "bg-brand-gray border-transparent text-gray-500"
                  )}
                  id={`btn-mood-${m.id}`}
                >
                  <span className="text-4xl mb-2">{m.emoji}</span>
                  <span className="font-medium">{m.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      <div className="p-8 pt-0">
        <motion.button
          disabled={step === 1 ? !name.trim() : !mood}
          onClick={handleNext}
          className={cn(
            "w-full h-16 rounded-2xl font-display font-medium text-lg flex items-center justify-center space-x-2 transition-all duration-300 shadow-lg",
            (step === 1 ? name.trim() : mood)
              ? "bg-brand-green text-white shadow-brand-green/20"
              : "bg-gray-200 text-gray-400 shadow-none cursor-not-allowed"
          )}
          id="btn-onboarding-next"
        >
          <span>Continuar</span>
          <ArrowRight size={20} />
        </motion.button>
      </div>
    </div>
  );
}
