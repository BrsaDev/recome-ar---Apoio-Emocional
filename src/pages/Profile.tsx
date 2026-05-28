import { useState } from 'react';
import { User, View } from '../types';
import { LogOut, Settings, Shield, Award, LayoutGrid, ArrowRight, Edit3 } from 'lucide-react';
import { motion } from 'motion/react';
import { getAvatarById } from '../data/avatars';
import AvatarModal from '../components/AvatarModal';

interface Props {
  user: User | null;
  navigate: (view: View) => void;
  onLogout: () => void;
  onUpdateUser?: (updated: User) => void;
}

export default function Profile({ user, navigate, onLogout, onUpdateUser }: Props) {
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);

  const avatar = getAvatarById(user?.avatarId || '');

  const handleSelectAvatar = (selectedAvatar: any) => {
    if (user && onUpdateUser) {
      onUpdateUser({
        ...user,
        avatarId: selectedAvatar.id
      });
    }
  };

  return (
    <div className="h-full w-full flex flex-col bg-brand-gray overflow-y-auto no-scrollbar">
      <div className="bg-brand-white px-6 pt-16 pb-10 rounded-b-[3rem] shadow-sm">
        <div className="flex flex-col items-center space-y-4">
          <button 
            onClick={() => setIsAvatarModalOpen(true)}
            className="w-24 h-24 rounded-full bg-brand-blue/10 flex items-center justify-center border-4 border-white shadow-xl overflow-hidden relative group active:scale-95 transition-all outline-none"
            title="Escolher avatar"
          >
             <span className="text-4xl">{avatar?.emoji || '👋'}</span>
             <div className="absolute inset-0 bg-brand-blue/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
               <Edit3 size={18} className="text-white" />
             </div>
          </button>
          <div className="text-center">
            <h2 className="text-2xl font-display font-semibold text-brand-text">{user?.name || 'Viajante'}</h2>
            <p className="text-gray-400 text-sm italic">Cuidando de si mesmo um dia de cada vez.</p>
            <button 
              onClick={() => setIsAvatarModalOpen(true)}
              className="mt-2 text-xs text-brand-blue font-bold tracking-tight hover:underline focus:outline-none"
            >
              Alterar avatar
            </button>
          </div>
        </div>
      </div>


      <div className="p-6 space-y-6">
        <div className="space-y-3">
          <h3 className="text-xs font-medium uppercase tracking-widest text-gray-400 px-2">Bem-estar</h3>
          <div className="bg-brand-white rounded-3xl overflow-hidden shadow-sm border border-brand-blue/5">
             <button onClick={() => navigate('vip')} className="w-full px-6 py-5 flex items-center justify-between border-b border-gray-50 active:bg-gray-50 transition-all">
                <div className="flex items-center space-x-4">
                   <div className="w-10 h-10 rounded-xl bg-yellow-50 flex items-center justify-center text-yellow-500">
                      <Award size={22} />
                   </div>
                   <span className="font-medium text-brand-text">Meu Plano</span>
                </div>
                <ArrowRight size={18} className="text-gray-300" />
             </button>
             <button className="w-full px-6 py-5 flex items-center justify-between border-b border-gray-50 active:bg-gray-50 transition-all">
                <div className="flex items-center space-x-4">
                   <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500">
                      <LayoutGrid size={22} />
                   </div>
                   <span className="font-medium text-brand-text">Histórico Emocional</span>
                </div>
                <ArrowRight size={18} className="text-gray-300" />
             </button>
             <button className="w-full px-6 py-5 flex items-center justify-between active:bg-gray-50 transition-all">
                <div className="flex items-center space-x-4">
                   <div className="w-10 h-10 rounded-xl bg-brand-green/10 flex items-center justify-center text-brand-green">
                      <Shield size={22} />
                   </div>
                   <span className="font-medium text-brand-text">Configurações de Privacidade</span>
                </div>
                <ArrowRight size={18} className="text-gray-300" />
             </button>
          </div>
        </div>

        <button 
          onClick={onLogout}
          className="w-full h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center space-x-3 font-medium active:bg-red-100 transition-all"
          id="btn-logout"
        >
          <LogOut size={20} />
          <span>Sair da conta</span>
        </button>
      </div>

      <div className="px-6 pb-6 text-center">
        <p className="text-[10px] text-gray-400 font-light uppercase tracking-[0.2em]">Recomeçar App v1.0.0</p>
      </div>

      <AvatarModal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        selectedId={user?.avatarId}
        onSelect={handleSelectAvatar}
      />
    </div>
  );
}
