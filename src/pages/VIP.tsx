import { motion } from 'motion/react';
import { View } from '../types';
import { ArrowLeft, Crown, CheckCircle2, Sparkles, MessageCircle, Music } from 'lucide-react';

interface Props {
  navigate: (view: View) => void;
}

export default function VIP({ navigate }: Props) {
  const benefits = [
    { icon: MessageCircle, title: 'Salas Pequenas', desc: 'Grupos mais íntimos com até 5 pessoas.' },
    { icon: Sparkles, title: 'IA Sem Limites', desc: 'Converse quantas vezes quiser com sua IA de apoio.' },
    { icon: Music, title: 'Áudios Exclusivos', desc: 'Meditações e paisagens sonoras 8D.' },
  ];

  return (
    <div className="h-full w-full bg-brand-white flex flex-col">
      <header className="p-6 flex items-center space-x-4">
        <button onClick={() => navigate('profile')} className="p-2 -ml-2 text-gray-400">
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-xl font-display font-semibold text-brand-text">Sala VIP</h2>
      </header>

      <div className="flex-1 overflow-y-auto px-6 no-scrollbar">
        <div className="relative bg-gradient-to-br from-yellow-300/20 to-orange-400/20 p-8 rounded-[3rem] text-center space-y-6 border border-yellow-200 overflow-hidden">
          <div className="relative z-10 space-y-4">
            <div className="w-16 h-16 bg-yellow-400 rounded-2xl flex items-center justify-center text-white mx-auto shadow-xl">
              <Crown size={32} fill="currentColor" />
            </div>
            <div className="space-y-1">
              <h3 className="text-2xl font-display font-bold text-orange-900 leading-tight">Invista no seu bem-estar</h3>
              <p className="text-orange-900/60 text-sm">Acesso total a todas as ferramentas de cura.</p>
            </div>
          </div>
          
          <div className="space-y-4 relative z-10">
            {benefits.map((b, i) => (
              <div key={i} className="flex items-start space-x-4 text-left">
                <div className="mt-1">
                  <CheckCircle2 size={18} className="text-orange-500" />
                </div>
                <div>
                  <h4 className="font-semibold text-orange-900 text-sm">{b.title}</h4>
                  <p className="text-orange-900/60 text-xs leading-relaxed">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <motion.div
             animate={{ opacity: [0.1, 0.2, 0.1], scale: [1, 1.2, 1] }}
             transition={{ duration: 5, repeat: Infinity }}
             className="absolute -top-10 -right-10 w-40 h-40 bg-yellow-400 rounded-full blur-3xl"
          />
        </div>

        <div className="mt-8 space-y-4">
           <button 
             onClick={() => navigate('shop')}
             className="w-full bg-brand-text text-white py-5 rounded-2xl font-display font-medium shadow-xl shadow-brand-text/20 flex flex-col items-center"
           >
              <span>Seja VIP</span>
              <span className="text-xs opacity-60 font-light">R$ 1,99 / mês</span>
           </button>
           <p className="text-[10px] text-gray-400 text-center px-8">
             Cancele quando quiser. Valor promocional para os primeiros 30 dias.
           </p>
        </div>
      </div>
    </div>
  );
}
