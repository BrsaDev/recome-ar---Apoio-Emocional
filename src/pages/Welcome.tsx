import { motion } from 'motion/react';
import logoImg from '../assets/images/fapem_logo_1780580927891.png';

interface Props {
  onStart: () => void;
  onViewPrivacy?: () => void;
}

export default function Welcome({ onStart, onViewPrivacy }: Props) {
  return (
    <div className="h-full w-full flex flex-col items-center justify-between p-10 bg-gradient-to-b from-brand-green/20 via-brand-blue/20 to-brand-white">
      <div className="flex-1 flex flex-col items-center justify-center space-y-6 text-center">
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.6, 0.4, 0.6],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="w-48 h-48 rounded-full bg-brand-green/30 blur-3xl absolute"
        />
        
        {/* FAPEM App Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="relative z-20 w-40 h-40 flex items-center justify-center rounded-[2rem] overflow-hidden shadow-2xl border border-indigo-500/10"
        >
          <img
            src={logoImg}
            alt="FAPEM Logo"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="relative z-10 space-y-2 animate-pulse-slow"
        >
          <h1 className="text-4.5xl font-display font-black tracking-tight text-brand-text leading-none">
            FAPEM
          </h1>
          <p className="text-xs uppercase tracking-[0.25em] text-[#2E9CCA] font-bold">
            Forte Apoio Emocional
          </p>
          <div className="h-px w-10 bg-brand-blue/20 mx-auto my-3" />
          <h2 className="text-2xl font-display font-semibold text-brand-text leading-tight pt-1">
            Você não está sozinho.
          </h2>
          <p className="text-[13px] text-gray-500 font-light max-w-[260px] mx-auto">
            Um refúgio seguro de silêncio, calma e diálogo para sua mente e seu coração.
          </p>
        </motion.div>
      </div>

      <div className="w-full flex flex-col items-center mt-4 z-10 shrink-0">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          onClick={onStart}
          className="w-full h-16 bg-brand-green text-white rounded-2xl font-display font-medium text-lg shadow-lg shadow-brand-green/20 transition-all"
          id="btn-welcome-start"
        >
          Começar jornada
        </motion.button>

        {onViewPrivacy && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            transition={{ delay: 1.4 }}
            className="text-[10px] text-gray-400 mt-4 text-center leading-normal max-w-xs"
          >
            Ao continuar, você concorda de forma inequívoca com os nossos{' '}
            <button
              onClick={onViewPrivacy}
              className="text-purple-650 font-bold underline hover:text-purple-750 cursor-pointer outline-none bg-transparent border-none p-0 inline"
            >
              Termos de Uso e Política de Privacidade
            </button>.
          </motion.p>
        )}
      </div>
    </div>
  );
}
