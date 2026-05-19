import { motion } from 'motion/react';
import { User, View } from '../types';
import { Heart, MessageCircle, Users, Wind, AlertCircle, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';

interface Props {
  user: User | null;
  navigate: (view: View) => void;
}

export default function Home({ user, navigate }: Props) {
  const greeting = user ? `Oi, ${user.name}.` : 'Olá.';

  return (
    <div className="h-full w-full overflow-y-auto no-scrollbar pb-10">
      <div className="bg-gradient-to-b from-brand-blue/30 to-brand-gray px-6 pt-16 pb-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-1"
        >
          <h2 className="text-3xl font-display font-semibold text-brand-text">{greeting}</h2>
          <p className="text-gray-500 font-light text-lg">Estou aqui com você agora.</p>
        </motion.div>
      </div>

      <div className="px-6 space-y-8">
        {/* Main Action Buttons */}
        <div className="grid grid-cols-1 gap-4">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('emergency')}
            className="w-full bg-brand-green/20 border-2 border-brand-green/30 p-6 rounded-3xl flex items-center space-x-6 text-left transition-all"
            id="btn-home-calm"
          >
            <div className="w-14 h-14 bg-brand-green rounded-2xl flex items-center justify-center text-white shadow-lg shadow-brand-green/20">
              <Wind size={32} />
            </div>
            <div>
              <h3 className="text-xl font-display font-semibold text-brand-text">Preciso me acalmar</h3>
              <p className="text-brand-text/60 text-sm">Exercícios rápidos de respiração.</p>
            </div>
          </motion.button>
        </div>

        {/* Quick Access */}
        <div className="space-y-4">
          <h3 className="text-lg font-display font-medium text-brand-text px-1">Outras formas de apoio</h3>
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => navigate('forum')}
              className="bg-brand-white p-5 rounded-3xl shadow-sm border border-brand-blue/10 flex flex-col items-center text-center space-y-3"
              id="btn-home-forum"
            >
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-400">
                <MessageCircle size={24} />
              </div>
              <span className="font-medium text-sm text-brand-text">Fórum</span>
            </button>

            <button 
              onClick={() => navigate('rooms')}
              className="bg-brand-white p-5 rounded-3xl shadow-sm border border-brand-blue/10 flex flex-col items-center text-center space-y-3"
              id="btn-home-rooms"
            >
              <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-400">
                <Users size={24} />
              </div>
              <span className="font-medium text-sm text-brand-text">Salas ao vivo</span>
            </button>
          </div>
        </div>

        {/* Audio Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-display font-medium text-brand-text px-1">Áudios calmantes</h3>
          <div className="flex space-x-4 overflow-x-auto no-scrollbar -mx-2 px-2">
            {[
              { time: '1 min', label: 'Alívio Rápido', color: 'bg-green-100 text-green-700' },
              { time: '3 min', label: 'Paz Interior', color: 'bg-blue-100 text-blue-700' },
              { time: '5 min', label: 'Sono Profundo', color: 'bg-purple-100 text-purple-700' },
            ].map((audio, idx) => (
              <button
                key={idx}
                className={cn("min-w-[140px] p-5 rounded-3xl flex flex-col items-start space-y-2 border border-transparent active:scale-95 transition-all shadow-sm bg-brand-white")}
              >
                <div className={cn("px-2 py-1 rounded-lg text-[10px] font-bold uppercase", audio.color)}>
                  {audio.time}
                </div>
                <span className="font-medium text-brand-text">{audio.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* SOS Button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('emergency')}
          className="w-full bg-red-50 text-red-500 py-4 px-6 rounded-2xl flex items-center justify-center space-x-2 border border-red-100 mt-4"
          id="btn-home-sos"
        >
          <AlertCircle size={20} />
          <span className="font-display font-medium uppercase tracking-wider text-sm">Estou mal agora</span>
        </motion.button>
      </div>

      {/* Daily Quote/Content */}
      <div className="px-6 mt-10">
        <div className="bg-brand-green/10 p-6 rounded-[2.5rem] relative overflow-hidden">
          <Heart className="absolute -right-4 -bottom-4 text-brand-green/20 w-32 h-32" />
          <p className="italic text-brand-text leading-relaxed relative z-10">
            "Não importa o quão devagar você vá, desde que não pare. Um dia de cada vez, um respiro de cada vez."
          </p>
        </div>
      </div>
    </div>
  );
}
