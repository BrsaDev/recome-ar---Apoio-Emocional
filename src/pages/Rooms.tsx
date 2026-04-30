import { motion } from 'motion/react';
import { View, Room } from '../types';
import { ArrowLeft, Users, Shield, Crown } from 'lucide-react';
import { cn } from '../lib/utils';

interface Props {
  navigate: (view: View) => void;
}

export default function Rooms({ navigate }: Props) {
  const rooms: Room[] = [
    { id: '1', name: 'Ansiedade', description: 'Espaço para compartilhar e ouvir sobre crises e calma.', onlineCount: 142, type: 'public' },
    { id: '2', name: 'Solidão', description: 'Você não está só. Vamos conversar.', onlineCount: 89, type: 'public' },
    { id: '3', name: 'Relacionamentos', description: 'Apoio mútuo para questões do coração.', onlineCount: 215, type: 'public' },
    { id: '4', name: 'Recomeço', description: 'Pessoas focadas em novos começos.', onlineCount: 56, type: 'public' },
    { id: '5', name: 'Grupo de Meditação', description: 'Para quem busca paz interior.', onlineCount: 12, type: 'vip' },
  ];

  return (
    <div className="h-full w-full flex flex-col bg-brand-gray overflow-y-auto no-scrollbar pb-10">
      <header className="px-6 pt-16 pb-6 bg-brand-white">
        <h2 className="text-3xl font-display font-semibold text-brand-text">Salas de Apoio</h2>
        <p className="text-gray-500 font-light mt-1">Conecte-se com pessoas que te entendem.</p>
      </header>

      <div className="p-6 space-y-4">
        {rooms.map((room) => (
          <motion.button
            key={room.id}
            whileTap={{ scale: 0.98 }}
            onClick={() => room.type === 'vip' ? navigate('vip') : null}
            className="w-full bg-brand-white p-6 rounded-[2rem] text-left shadow-sm border border-brand-blue/5 flex items-center justify-between group"
            id={`btn-room-${room.id}`}
          >
            <div className="space-y-2 flex-1">
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-display font-semibold text-brand-text">{room.name}</h3>
                {room.type === 'vip' && <Crown size={14} className="text-yellow-500 fill-yellow-500" />}
              </div>
              <p className="text-sm text-gray-400 font-light leading-snug max-w-[200px]">{room.description}</p>
              <div className="flex items-center space-x-1.5 pt-1">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-green animate-pulse" />
                <span className="text-[10px] font-medium text-brand-green uppercase tracking-wide">{room.onlineCount} Online</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-brand-gray rounded-[1.25rem] flex items-center justify-center text-gray-400 group-hover:bg-brand-green/10 group-hover:text-brand-green transition-all">
              {room.type === 'vip' ? <Crown size={20} /> : <Users size={20} />}
            </div>
          </motion.button>
        ))}

        <div className="bg-brand-blue/10 p-6 rounded-[2rem] border border-brand-blue/20 flex items-center space-x-4 mt-6">
          <Shield className="text-brand-blue min-w-[24px]" />
          <p className="text-xs text-brand-blue leading-relaxed">
            Ambiente seguro: nossas salas são moderadas por IA e voluntários treinados.
          </p>
        </div>
      </div>
    </div>
  );
}
