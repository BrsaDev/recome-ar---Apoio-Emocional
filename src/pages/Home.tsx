import { motion } from 'motion/react';
import { User, View } from '../types';
import { Heart, MessageCircle, Users, Wind, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { getAvatarById } from '../data/avatars';
import logoImg from '../assets/images/fapem_logo_1780580927891.png';

interface Props {
  user: User | null;
  navigate: (view: View) => void;
}

export default function Home({ user, navigate }: Props) {
  const greeting = user ? `Oi, ${user.nickname || user.name}.` : 'Olá.';
  const userAvatarObj = getAvatarById(user?.avatarId || '');

  return (
    <div className="h-full w-full overflow-y-auto no-scrollbar pb-10 bg-[#020410] relative">
      {/* Background blobs */}
      <div className="absolute top-[-10%] left-[-15%] w-72 h-72 rounded-full bg-purple-600/5 blur-[80px]" />
      <div className="absolute bottom-[20%] right-[-15%] w-72 h-72 rounded-full bg-cyan-600/5 blur-[80px]" />

      <div className="px-6 pt-12 pb-7 relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2 bg-white/5 backdrop-blur-xs py-1.5 px-3 rounded-full border border-white/5 shadow-2xs">
            <div className="w-6 h-6 rounded-lg overflow-hidden border border-purple-500/10 bg-slate-950 flex items-center justify-center shrink-0">
              <img src={logoImg} alt="FAPEM" className="w-5 h-5 object-contain" referrerPolicy="no-referrer" />
            </div>
            <span className="text-[10px] font-black text-white tracking-wider uppercase font-sans">FAPEM</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#06B6D4] animate-pulse shadow-neon-cyan" />
          </div>
          {user && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('profile')}
              className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xl shadow-xs active:scale-95 transition-all outline-none"
              title="Ver Perfil"
            >
              {userAvatarObj?.emoji || '👋'}
            </motion.button>
          )}
        </div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-1.5"
        >
          <h2 className="text-3xl font-display font-semibold text-white">{greeting}</h2>
          <p className="text-gray-400 font-light text-sm">Estou aqui com você agora.</p>
        </motion.div>
      </div>

      <div className="px-6 space-y-8 relative z-10">
        {/* Main Action Buttons */}
        <div className="grid grid-cols-1 gap-4">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('emergency')}
            className="w-full glass-card border border-purple-500/20 hover:border-purple-500/40 p-6 rounded-3xl flex items-center space-x-6 text-left transition-all shadow-neon-purple/5"
            id="btn-home-calm"
          >
            <div className="w-14 h-14 bg-gradient-to-r from-purple-650 to-indigo-650 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-purple-500/20 border border-purple-500/25">
              <Wind size={28} />
            </div>
            <div>
              <h3 className="text-lg font-display font-semibold text-white">Preciso me acalmar</h3>
              <p className="text-gray-400 text-xs mt-0.5">Exercícios rápidos de respiração.</p>
            </div>
          </motion.button>
        </div>

        {/* Quick Access */}
        <div className="space-y-4">
          <h3 className="text-base font-display font-medium text-white px-1">Outras formas de apoio</h3>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => navigate('forum')}
              className="glass-card p-5 rounded-3xl border border-white/5 flex flex-col items-center text-center space-y-3 shrink-0 hover:border-white/10 transition-all outline-none shadow-3xs"
              id="btn-home-forum"
            >
              <div className="w-12 h-12 bg-violet-600/10 rounded-2xl border border-violet-500/20 flex items-center justify-center text-violet-400">
                <MessageCircle size={22} />
              </div>
              <span className="font-semibold text-xs text-gray-300">Fórum</span>
            </button>

            <button
              onClick={() => navigate('rooms')}
              className="glass-card p-5 rounded-3xl border border-white/5 flex flex-col items-center text-center space-y-3 shrink-0 hover:border-white/10 transition-all outline-none shadow-3xs"
              id="btn-home-rooms"
            >
              <div className="w-12 h-12 bg-[#06B6D4]/10 rounded-2xl border border-[#06B6D4]/20 flex items-center justify-center text-cyan-400">
                <Users size={22} />
              </div>
              <span className="font-semibold text-xs text-gray-300">Salas ao vivo</span>
            </button>
          </div>
        </div>

        {/* SOS Button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('emergency')}
          className="w-full bg-red-950/20 text-red-400 py-4 px-6 rounded-2xl flex items-center justify-center space-x-2 border border-red-500/30 mt-4 shadow-lg shadow-red-950/10 cursor-pointer hover:bg-red-950/30 transition-all duration-300"
          id="btn-home-sos"
        >
          <AlertCircle size={18} />
          <span className="font-display font-bold uppercase tracking-wider text-xs">Estou mal agora</span>
        </motion.button>
      </div>

      {/* Daily Quote/Content */}
      <div className="px-6 mt-10 relative z-10">
        <div className="glass-card border border-white/5 p-6 rounded-[2.5rem] relative overflow-hidden shadow-2xs">
          <Heart className="absolute -right-4 -bottom-4 text-purple-900/10 w-32 h-32" />
          <p className="italic text-gray-400 text-xs leading-relaxed relative z-10">
            "Não importa o quão devagar você vá, desde que não pare. Um dia de cada vez, um respiro de cada vez."
          </p>
        </div>
      </div>
    </div>
  );
}
