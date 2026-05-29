import { useState } from 'react';
import { User, View } from '../types';
import { LogOut, Settings, Shield, Award, LayoutGrid, ArrowRight, Edit3, Heart, X, Search } from 'lucide-react';
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
  const [isShowingLegalText, setIsShowingLegalText] = useState(false);

  const avatar = getAvatarById(user?.avatarId || '');

  const handleSelectAvatar = (selectedAvatar: any) => {
    if (user && onUpdateUser) {
      onUpdateUser({
        ...user,
        avatarId: selectedAvatar.id
      });
    }
  };

  const handleRemoveAngel = (angelId: string) => {
    if (user && onUpdateUser) {
      const updatedAngels = (user.supportAngels || []).filter(a => a.id !== angelId);
      onUpdateUser({
        ...user,
        supportAngels: updatedAngels
      });
    }
  };

  const [searchQuery, setSearchQuery] = useState('');

  const supportAngels = user?.supportAngels || [];

  const filteredAngels = supportAngels.filter(angel =>
    angel.name.toLowerCase().includes(searchQuery.trim().toLowerCase())
  );

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
        {/* Meus Anjos de Apoio Profile Showcase */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xs font-medium uppercase tracking-widest text-gray-400">Meus Anjos de Apoio</h3>
            <span className="text-[10px] bg-purple-50 text-purple-600 font-bold px-2 py-0.5 rounded-full border border-purple-100">
              {supportAngels.length} Ativo(s)
            </span>
          </div>

          <div className="bg-brand-white rounded-3xl p-5 shadow-sm border border-brand-blue/5 overflow-hidden">
            {/* Elegant Search Bar displayed only when user has more than 4 angels to maintain pristine UX */}
            {supportAngels.length > 4 && (
              <div className="relative mb-4 flex items-center bg-brand-gray/50 rounded-2xl px-3.5 py-2.5 border border-brand-blue/5 transition-all focus-within:border-brand-blue/20">
                <Search size={14} className="text-gray-400 shrink-0 mr-2" />
                <input
                  type="text"
                  placeholder="Buscar anjo pelo nome..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent text-xs text-brand-text placeholder-gray-400 outline-none w-full font-medium"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="p-1 rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-600 active:scale-95 transition-all ml-1 outline-none"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            )}

            {supportAngels.length === 0 ? (
              <div className="text-center py-4 space-y-2">
                <div className="w-10 h-10 rounded-full bg-pink-50 text-pink-400 flex items-center justify-center mx-auto">
                  <Heart size={20} className="fill-pink-50 animate-pulse" />
                </div>
                <p className="text-xs text-brand-text/60 font-light leading-relaxed max-w-[240px] mx-auto">
                  Toque no avatar de outros membros no fórum ou na sala para adicioná-los como seus <strong className="text-brand-blue font-semibold">Anjos de Apoio</strong>.
                </p>
              </div>
            ) : filteredAngels.length === 0 ? (
              <div className="text-center py-4 space-y-2">
                <p className="text-xs text-brand-text/60 font-medium">Nenhum anjo com "{searchQuery}" foi encontrado.</p>
                <button 
                  onClick={() => setSearchQuery('')}
                  className="text-[10px] text-purple-600 font-bold underline hover:text-purple-700 active:scale-95 transition-all outline-none"
                >
                  Limpar pesquisa
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3 overflow-x-auto pb-1 pt-1.5 no-scrollbar -mx-2 px-2 snap-x snap-mandatory">
                {filteredAngels.map((angel) => {
                  const angelAvatar = getAvatarById(angel.avatarId);
                  return (
                    <motion.div 
                      key={angel.id}
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="snap-start shrink-0 flex flex-col items-center bg-brand-gray/30 p-3 rounded-2xl border border-brand-blue/5 min-w-[80px] relative group text-center"
                    >
                      <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-2.5xl shadow-xs border border-brand-blue/5 relative">
                        {angelAvatar?.emoji || '👤'}
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border border-white animate-pulse" />
                      </div>
                      <span className="text-[10px] font-bold text-brand-text truncate w-14 mt-2 font-display leading-tight">{angel.name}</span>
                      
                      <button
                        onClick={() => handleRemoveAngel(angel.id)}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-100 hover:bg-red-500 text-red-600 hover:text-white rounded-full flex items-center justify-center shadow-xs active:scale-90 transition-all outline-none"
                        title="Remover anjo"
                      >
                        <X size={10} />
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

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

        <div className="space-y-3" id="legal-terms-section">
          <h3 className="text-xs font-medium uppercase tracking-widest text-gray-400 px-2">Segurança & Termos Legais</h3>
          <div className="bg-brand-white rounded-3xl p-5 shadow-sm border border-brand-blue/5 space-y-4">
            <div className="flex items-start space-x-3.5">
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
                <Shield size={22} className="animate-pulse" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-xs font-bold text-gray-950 block">Termo de Consentimento</span>
                <p className="text-[11px] text-gray-400 leading-tight mt-0.5 font-light">Assinado eletronicamente e irrevogável.</p>
              </div>
              <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full border border-emerald-100 flex items-center space-x-1 shrink-0">
                <span>🔒 Lock</span>
              </span>
            </div>

            {user?.termsAccepted ? (
              <div className="bg-brand-gray/50 rounded-2xl p-3.5 space-y-2 border border-brand-blue/5 text-[11px]">
                <div className="flex justify-between text-gray-500">
                  <span>Signatário:</span>
                  <strong className="text-brand-text font-bold">{user.name}</strong>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Data de Aceito:</span>
                  <strong className="text-brand-text font-bold">
                    {user.termsAcceptedAt ? new Date(user.termsAcceptedAt).toLocaleString('pt-BR') : 'Gravado'}
                  </strong>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Versão do Termo:</span>
                  <strong className="text-brand-text font-mono font-bold">{user.termsVersion || '1.0.0-PRO-SAFE'}</strong>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Status Regulatório:</span>
                  <span className="text-emerald-750 font-bold">Ativo & Auditado ✔</span>
                </div>

                <button
                  onClick={() => setIsShowingLegalText(!isShowingLegalText)}
                  className="w-full mt-2 py-2.5 bg-purple-50 hover:bg-purple-100 text-purple-700 text-[10px] font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-1 outline-none"
                  id="btn-toggle-terms"
                >
                  <span>{isShowingLegalText ? 'Esconder Termo Completo ▲' : 'Consultar Termo Completo ▼'}</span>
                </button>

                {isShowingLegalText && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-3 p-3 bg-white rounded-xl border border-brand-blue/5 max-h-48 overflow-y-auto space-y-2 text-[10px] text-gray-500 leading-normal scrollbar-thin"
                    id="full-legal-text-container"
                  >
                    <p className="font-bold text-gray-850 uppercase tracking-wide">TERMO DE RESPONSABILIDADE CIVIL E ISENÇÃO DE SUPORTE MÉDICO-CLÍNICO (V1.0.0-PRO-SAFE)</p>
                    <p>
                      <strong>1. Objeto do Recomeçar:</strong> Atua estritamente como plataforma de compartilhamento de vivências e integração espontânea. Fica expressamente vedada à plataforma a prestação de serviços psicológicos ou assistenciais em saúde mental.
                    </p>
                    <p>
                      <strong>2. Recomendação de Assistência Externa:</strong> No surgimento de intercorrências de cunho emergencial clínico ou de surto, o usuário deve buscar ajuda estatal imediata através do SAMU (192) ou CVV (188).
                    </p>
                    <p>
                      <strong>3. Isenção Extensiva e Irrevogabilidade:</strong> O aceite integral deste termo constitui renúncia expressa a ações de reparação médica ou clínica contra moderadores e desenvolvedores do aplicativo, mantendo os registros imutáveis e auditáveis.
                    </p>
                    <p className="text-[9px] italic border-t pt-1.5 mt-2 text-center text-gray-400">
                      🔒 Assinado digitalmente através de identificador local persistente. Modificação desativada.
                    </p>
                  </motion.div>
                )}
              </div>
            ) : (
              <div className="text-center py-2 text-red-500 text-[11px] font-bold">
                Aguardando assinatura dos termos regulatórios.
              </div>
            )}
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
