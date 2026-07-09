import { motion } from 'motion/react';
import logoImg from '../assets/images/fapem_logo_1780580927891.png';

interface Props {
  onStart: () => void;
  onLogin: () => void;
  onViewPrivacy?: () => void;
}

export default function Welcome({ onStart, onLogin, onViewPrivacy }: Props) {
  return (
    <div className="h-full w-full flex flex-col items-center justify-between p-10 bg-[#020410] relative overflow-hidden">
      {/* Background neon blobs */}
      <div className="absolute top-[-10%] left-[-15%] w-72 h-72 rounded-full bg-purple-600/10 blur-[80px]" />
      <div className="absolute bottom-[20%] right-[-15%] w-72 h-72 rounded-full bg-cyan-600/10 blur-[80px]" />

      <div className="flex-1 flex flex-col items-center justify-center space-y-8 text-center relative z-10 w-full">
        {/* FAPEM App Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="w-32 h-32 flex items-center justify-center rounded-[2.5rem] bg-indigo-950/40 p-2 border border-purple-500/20 shadow-neon-purple shadow-lg"
        >
          <img
            src={logoImg}
            alt="FAPEM Logo"
            className="w-full h-full object-contain"
            referrerPolicy="no-referrer"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="space-y-3"
        >
          <h1 className="text-5xl font-display font-black tracking-tight text-white leading-none">
            FAPEM
          </h1>
          <p className="text-xs uppercase tracking-[0.25em] text-cyan-400 font-bold text-neon-cyan">
            Forte Apoio Emocional
          </p>
          <div className="h-[2px] w-12 bg-gradient-to-r from-purple-500 to-cyan-500 mx-auto my-4" />
          <h2 className="text-xl font-display font-semibold text-purple-200 leading-tight pt-1">
            Você não está sozinho.
          </h2>
          <p className="text-[13px] text-gray-400 font-light max-w-[260px] mx-auto leading-relaxed">
            Um refúgio seguro de silêncio, calma e diálogo para sua mente e seu coração.
          </p>
        </motion.div>
      </div>

      <div className="w-full flex flex-col items-center mt-4 z-10 shrink-0 relative">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          onClick={onStart}
          className="w-full h-15 bg-gradient-to-r from-purple-650 to-indigo-650 text-white rounded-2xl font-display font-bold text-base shadow-lg shadow-purple-500/20 transition-all border border-purple-500/30"
          id="btn-welcome-start"
        >
          Começar jornada
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3 }}
          onClick={onLogin}
          className="w-full h-12 mt-3 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-display font-semibold text-xs border border-white/10 shadow-3xs transition-all outline-none"
          id="btn-welcome-login"
        >
          Já tenho uma conta? Entrar
        </motion.button>

        {onViewPrivacy && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            transition={{ delay: 1.4 }}
            className="text-[10px] text-gray-500 mt-5 text-center leading-normal max-w-xs"
          >
            Ao continuar, você concorda de forma inequívoca com os nossos{' '}
            <button
              onClick={onViewPrivacy}
              className="text-purple-400 font-bold underline hover:text-purple-300 cursor-pointer outline-none bg-transparent border-none p-0 inline"
            >
              Termos de Uso e Política de Privacidade
            </button>.
          </motion.p>
        )}
      </div>
    </div>
  );
}
