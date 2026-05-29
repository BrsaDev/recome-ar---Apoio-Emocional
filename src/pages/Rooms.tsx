import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { View, Room, RoomGender, User as UserType } from '../types';
import { ArrowLeft, Users, Shield, Crown, User, UserCheck, Plus, Sparkles, Lock, X, Globe } from 'lucide-react';
import { cn } from '../lib/utils';
import { hasOffensiveContent } from '../lib/moderation';
import { getAvatarById } from '../data/avatars';

interface Props {
  user: UserType | null;
  navigate: (view: View, state?: any) => void;
}

const DEFAULT_ROOMS: Room[] = [
  { id: '1', name: 'Ansiedade', description: 'Espaço para compartilhar e ouvir sobre crises e calma.', onlineCount: 142, type: 'public' },
  { id: '2', name: 'Solidão', description: 'Você não está só. Vamos conversar.', onlineCount: 89, type: 'public' },
  { id: '3', name: 'Relacionamentos', description: 'Apoio mútuo para questões do coração.', onlineCount: 215, type: 'public' },
  { id: '4', name: 'Recomeço', description: 'Pessoas focadas em novos começos.', onlineCount: 56, type: 'public' },
  { id: '5', name: 'Grupo de Meditação', description: 'Para quem busca paz interior.', onlineCount: 12, type: 'vip' },
];

export default function Rooms({ user, navigate }: Props) {
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [rooms, setRooms] = useState<Room[]>(() => {
    const saved = localStorage.getItem('recomecar_custom_rooms');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return DEFAULT_ROOMS;
  });

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isUpgradePromptOpen, setIsUpgradePromptOpen] = useState(false);

  // Permission request states for premium created rooms
  const [targetPremiumRoom, setTargetPremiumRoom] = useState<Room | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<'idle' | 'sending' | 'pending' | 'success' | 'denied'>('idle');

  // Form states
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomDesc, setNewRoomDesc] = useState('');
  const [newRoomType, setNewRoomType] = useState<'public' | 'vip'>('public');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [invitedAngels, setInvitedAngels] = useState<string[]>([]);

  const handleSelectRoom = (room: Room) => {
    if (room.type === 'vip') {
        navigate('vip');
    } else if (room.isPremiumRoom && room.invitedBy !== user?.name) {
        // If it's a premium room and we are not the creator
        // Check if the current user name is listed in invitedAngels
        const isUserInvited = room.invitedAngels?.includes(user?.name || '');
        if (isUserInvited) {
            setSelectedRoom(room);
        } else {
            setTargetPremiumRoom(room);
            setPermissionStatus('idle');
        }
    } else {
        setSelectedRoom(room);
    }
  };

  const startPermissionRequest = () => {
    if (!targetPremiumRoom) return;
    setPermissionStatus('sending');
    
    setTimeout(() => {
      setPermissionStatus('pending');
      
      setTimeout(() => {
        setPermissionStatus('success');
      }, 1800);
    }, 1000);
  };

  const handleEnterApprovedRoom = () => {
    if (targetPremiumRoom) {
      setSelectedRoom(targetPremiumRoom);
      setTargetPremiumRoom(null);
      setPermissionStatus('idle');
    }
  };

  const handleEnterRoom = (gender: RoomGender) => {
    if (selectedRoom) {
        navigate('live-room', { 
          activeRoom: { 
            name: selectedRoom.name, 
            gender,
            invitedAngels: selectedRoom.invitedAngels
          } 
        });
    }
  };

  const handleTriggerCreateRoom = () => {
    if (user?.plan === 'premium') {
      setIsCreateOpen(true);
    } else {
      setIsUpgradePromptOpen(true);
    }
  };

  const handleSaveRoom = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const nameTrimmed = newRoomName.trim();
    const descTrimmed = newRoomDesc.trim();

    if (!nameTrimmed || !descTrimmed) {
      setErrorMsg('Por favor, preencha o nome e a descrição.');
      return;
    }

    if (hasOffensiveContent(nameTrimmed) || hasOffensiveContent(descTrimmed)) {
      setErrorMsg('Conteúdo impróprio ou ofensivo detectado. Mantenha as regras da comunidade.');
      return;
    }

    const newRoom: Room = {
      id: Date.now().toString(),
      name: nameTrimmed,
      description: descTrimmed,
      onlineCount: 1 + invitedAngels.length,
      type: newRoomType,
      capacity: 10,
      invitedBy: user?.name,
      invitedAngels: invitedAngels,
      isPremiumRoom: true
    };

    const updated = [...rooms, newRoom];
    setRooms(updated);
    localStorage.setItem('recomecar_custom_rooms', JSON.stringify(updated));

    // Reset fields
    setNewRoomName('');
    setNewRoomDesc('');
    setNewRoomType('public');
    setInvitedAngels([]);
    setIsCreateOpen(false);
  };

  return (
    <div className="h-full w-full flex flex-col bg-brand-gray overflow-hidden">
      <AnimatePresence mode="wait">
        {!selectedRoom ? (
          <motion.div
            key="list"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="h-full w-full flex flex-col overflow-y-auto no-scrollbar pb-10"
          >
            <header className="px-6 pt-16 pb-6 bg-brand-white shrink-0">
              <h2 className="text-3xl font-display font-semibold text-brand-text">Salas de Apoio</h2>
              <p className="text-gray-500 font-light mt-1">Conecte-se com pessoas que te entendem.</p>
            </header>

            <div className="p-6 space-y-4">
              {/* Premium Room Creation Action */}
              <button
                onClick={handleTriggerCreateRoom}
                className="w-full bg-linear-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 active:scale-98 text-white p-5 rounded-[2rem] text-left shadow-lg shadow-purple-100/50 flex items-center justify-between group transition-all duration-300"
                id="btn-trigger-create-room"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <Sparkles size={16} className="text-yellow-300 animate-pulse fill-yellow-300" />
                    <h3 className="font-display font-bold text-white text-[15px]">Criar Sala Personalizada</h3>
                  </div>
                  <p className="text-xs text-white/80 font-light leading-snug">
                    Monte um espaço com seu tema e ajude outros membros.
                  </p>
                </div>
                <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center text-white group-hover:bg-white/20 transition-all">
                  <Plus size={20} />
                </div>
              </button>

              {rooms.map((room) => (
                <motion.button
                  key={room.id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSelectRoom(room)}
                  className="w-full bg-brand-white p-6 rounded-[2rem] text-left shadow-sm border border-brand-blue/5 flex items-center justify-between group"
                  id={`btn-room-${room.id}`}
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-lg font-display font-semibold text-brand-text">{room.name}</h3>
                      {room.type === 'vip' && <Crown size={14} className="text-yellow-500 fill-yellow-500" />}
                      {room.isPremiumRoom && <Sparkles size={14} className="text-purple-500 fill-purple-100 animate-pulse" />}
                    </div>
                    {room.isPremiumRoom && (
                      <div className="flex items-center space-x-1 text-[9px] text-purple-600 bg-purple-50 px-2 py-0.5 rounded-lg border border-purple-100/50 w-fit font-bold uppercase tracking-wider font-mono">
                        <span>🔒 Requer Convite ou Permissão</span>
                      </div>
                    )}
                    <p className="text-sm text-gray-400 font-light leading-snug max-w-[200px]">{room.description}</p>
                    <div className="flex items-center space-x-1.5 pt-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-brand-green animate-pulse" />
                      <span className="text-[10px] font-medium text-brand-green uppercase tracking-wide">{room.onlineCount} Online</span>
                      {room.isPremiumRoom && (
                        <>
                          <span className="text-gray-300 font-light">|</span>
                          <span className="text-[9px] font-bold text-purple-600 uppercase font-mono">Por: {room.invitedBy}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-brand-gray rounded-[1.25rem] flex items-center justify-center text-gray-400 group-hover:bg-brand-green/10 group-hover:text-brand-green transition-all shrink-0 ml-2">
                    {room.type === 'vip' ? <Crown size={20} /> : room.isPremiumRoom ? <Lock size={18} className="text-purple-500" /> : <Users size={20} />}
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
          </motion.div>
        ) : (
          <motion.div
            key="filter"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="h-full w-full flex flex-col bg-brand-white p-6 pt-16 overflow-y-auto no-scrollbar pb-12"
          >
            <button 
                onClick={() => setSelectedRoom(null)}
                className="mb-6 p-2 -ml-2 text-gray-400 flex items-center space-x-2 shrink-0 outline-none"
            >
                <ArrowLeft size={24} />
                <span className="text-sm font-medium">Voltar para categorias</span>
            </button>

            <div className="space-y-2 mb-8 shrink-0">
                <h2 className="text-2xl font-display font-semibold text-brand-text">Como prefere conversar?</h2>
                <p className="text-gray-500 font-light text-xs">Escolha em qual tipo de sala você se sente mais confortável em desabafar sobre <span className="font-medium text-brand-text underline decoration-brand-green underline-offset-4">{selectedRoom.name}</span>.</p>
            </div>

            <div className="grid grid-cols-1 gap-4 shrink-0 pb-6">
                <button
                    onClick={() => handleEnterRoom('mixed')}
                    className="w-full bg-brand-gray p-6 rounded-3xl flex items-center space-x-5 text-left border border-transparent hover:border-brand-green active:bg-brand-green/5 transition-all outline-none cursor-pointer"
                >
                    <div className="w-14 h-14 bg-brand-green/20 rounded-2xl flex items-center justify-center text-brand-green shrink-0">
                        <Users size={28} />
                    </div>
                    <div>
                        <h3 className="font-display font-semibold text-brand-text">Sala Mista</h3>
                        <p className="text-xs text-gray-400">Pessoas de todos os gêneros.</p>
                    </div>
                </button>

                <button
                    onClick={() => handleEnterRoom('men')}
                    className="w-full bg-brand-gray p-6 rounded-3xl flex items-center space-x-5 text-left border border-transparent hover:border-blue-400 active:bg-blue-50 transition-all outline-none cursor-pointer"
                >
                    <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-500 shrink-0">
                        <User size={28} />
                    </div>
                    <div>
                        <h3 className="font-display font-semibold text-brand-text">Apenas Homens</h3>
                        <p className="text-xs text-gray-400">Espaço reservado para o público masculino.</p>
                    </div>
                </button>

                <button
                    onClick={() => handleEnterRoom('women')}
                    className="w-full bg-brand-gray p-6 rounded-3xl flex items-center space-x-5 text-left border border-transparent hover:border-pink-400 active:bg-pink-50 transition-all outline-none cursor-pointer"
                >
                    <div className="w-14 h-14 bg-pink-100 rounded-2xl flex items-center justify-center text-pink-500 shrink-0">
                        <UserCheck size={28} />
                    </div>
                    <div>
                        <h3 className="font-display font-semibold text-brand-text">Apenas Mulheres</h3>
                        <p className="text-xs text-gray-400">Espaço reservado para o público feminino.</p>
                    </div>
                </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Upgrade para Premium */}
      <AnimatePresence>
        {isUpgradePromptOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-6">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-brand-white rounded-[2.5rem] p-8 max-w-sm w-full border border-purple-100 shadow-2xl flex flex-col items-center text-center space-y-5"
            >
              <div className="w-16 h-16 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 shadow-inner">
                <Crown size={32} className="fill-purple-50" />
              </div>
              <div className="space-y-2">
                <h4 className="font-display font-semibold text-brand-text text-lg">Recurso Exclusivo PREMIUM</h4>
                <p className="text-xs text-brand-text/70 font-light leading-relaxed">
                  Apenas assinantes do plano <strong className="text-purple-600 font-semibold">PREMIUM</strong> têm permissão para criar e gerenciar salas de desabafo personalizadas na plataforma.
                </p>
                <div className="bg-purple-50/50 p-2.5 rounded-xl border border-purple-100/50 text-[10px] text-purple-700 font-bold uppercase tracking-wider">
                  Seu plano atual: {user?.plan === 'vip' ? 'VIP' : user?.plan === 'basic' ? 'Básico' : 'Grátis'}
                </div>
              </div>
              <div className="w-full space-y-2.5">
                <button
                  onClick={() => {
                    setIsUpgradePromptOpen(false);
                    navigate('vip');
                  }}
                  className="w-full py-4 bg-purple-600 hover:bg-purple-700 active:scale-95 text-white rounded-2xl text-xs font-bold shadow-lg shadow-purple-100 transition-all outline-none"
                >
                  Conhecer Planos & Upgrade
                </button>
                <button
                  onClick={() => setIsUpgradePromptOpen(false)}
                  className="w-full py-3 bg-brand-gray text-gray-500 rounded-2xl text-xs font-bold hover:bg-gray-200 active:scale-95 transition-all outline-none"
                >
                  Voltar para as Salas
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal de Criação de Sala Personalizada */}
      <AnimatePresence>
        {isCreateOpen && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCreateOpen(false)}
              className="absolute inset-0"
            />
            
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="relative bg-brand-white w-full max-w-sm rounded-[2.5rem] p-6 shadow-2xl flex flex-col space-y-4 z-10 max-h-[90dvh] overflow-y-auto no-scrollbar"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <Sparkles size={16} className="text-purple-500 fill-purple-100 animate-pulse" />
                  <h4 className="font-display font-medium text-brand-text text-lg">Nova Sala de Apoio</h4>
                </div>
                <button 
                  onClick={() => setIsCreateOpen(false)}
                  className="p-1.5 rounded-full hover:bg-brand-gray text-gray-400 hover:text-gray-600 transition"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveRoom} className="space-y-4 text-left">
                {errorMsg && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-red-50 text-red-600 rounded-xl text-[11px] font-medium border border-red-100 flex items-center space-x-2"
                  >
                    <span>⚠️</span>
                    <span>{errorMsg}</span>
                  </motion.div>
                )}

                <div className="space-y-1">
                  <label className="text-[11px] uppercase font-bold text-gray-400 tracking-wider">Nome da sala</label>
                  <input
                    type="text"
                    value={newRoomName}
                    onChange={(e) => setNewRoomName(e.target.value)}
                    placeholder="Ex: Superando Ansiedade do Trabalho..."
                    className="w-full bg-brand-gray border border-brand-blue/5 rounded-2xl p-4 text-xs font-sans text-brand-text outline-none focus:ring-2 focus:ring-purple-500/30 transition-all"
                    maxLength={40}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] uppercase font-bold text-gray-400 tracking-wider">Descrição curta</label>
                  <textarea
                    value={newRoomDesc}
                    onChange={(e) => setNewRoomDesc(e.target.value)}
                    placeholder="Explique o espírito ou intenção da sala em poucas palavras..."
                    className="w-full h-24 bg-brand-gray border border-brand-blue/5 rounded-2xl p-4 text-xs font-sans text-brand-text outline-none focus:ring-2 focus:ring-purple-500/30 transition-all resize-none"
                    maxLength={100}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] uppercase font-bold text-gray-400 tracking-wider">Tipo de Acesso</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setNewRoomType('public')}
                      className={cn(
                        "p-4 rounded-2xl border text-xs font-bold transition-all flex flex-col items-center justify-center space-y-1",
                        newRoomType === 'public' 
                          ? "bg-purple-50 border-purple-300 text-purple-700" 
                          : "bg-brand-gray border-transparent text-gray-400 hover:text-gray-600"
                      )}
                    >
                      <Globe size={16} />
                      <span>Sala Pública</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewRoomType('vip')}
                      className={cn(
                        "p-4 rounded-2xl border text-xs font-bold transition-all flex flex-col items-center justify-center space-y-1",
                        newRoomType === 'vip' 
                          ? "bg-purple-50 border-purple-300 text-purple-700" 
                          : "bg-brand-gray border-transparent text-gray-400 hover:text-gray-600"
                      )}
                    >
                      <Lock size={16} />
                      <span>Sala VIP</span>
                    </button>
                  </div>
                </div>

                {/* Seleção de Anjos de Apoio para convidar na criação (Recurso Premium) */}
                {user?.plan === 'premium' && (user.supportAngels || []).length > 0 && (
                  <div className="space-y-2 border-t border-brand-blue/5 pt-3.5">
                    <label className="text-[11px] uppercase font-bold text-gray-400 tracking-wider block">
                      Convidar Anjos da sua Lista (Opcional)
                    </label>
                    <p className="text-[10px] text-gray-400 font-light leading-normal">
                      Eles entrarão automaticamente na sala para te amparar quando você entrar.
                    </p>
                    <div className="max-h-36 overflow-y-auto space-y-1.5 mt-2 pr-1 no-scrollbar">
                      {(user.supportAngels || []).map((angel) => {
                        const isSelected = invitedAngels.includes(angel.name);
                        return (
                          <button
                            key={angel.id}
                            type="button"
                            onClick={() => {
                              if (isSelected) {
                                setInvitedAngels(prev => prev.filter(name => name !== angel.name));
                              } else {
                                if (invitedAngels.length >= 9) {
                                  setErrorMsg("Limite máximo de 9 convites adicionais atingido para respeitar a capacidade de 10 pessoas na sala.");
                                  setTimeout(() => setErrorMsg(null), 5000);
                                  return;
                                }
                                setInvitedAngels(prev => [...prev, angel.name]);
                              }
                            }}
                            className={cn(
                              "w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left border text-xs font-bold transition-all",
                              isSelected 
                                ? "bg-purple-50 border-purple-200 text-purple-700" 
                                : "bg-brand-gray border-transparent text-gray-600 hover:bg-brand-gray-dark/25"
                            )}
                          >
                            <span className="flex items-center space-x-2.5">
                              <span className="text-base">{getAvatarById(angel.avatarId || 'f1')?.emoji}</span>
                              <span>{angel.name}</span>
                            </span>
                            <span className="text-[9px] uppercase tracking-wider font-extrabold text-purple-600">
                              {isSelected ? '✓ Selecionado' : '+ Adicionar'}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-4 mt-2 bg-purple-600 hover:bg-purple-700 active:scale-95 text-white rounded-2xl text-xs font-bold transition-all outline-none shadow-md shadow-purple-100"
                >
                  Criar e Publicar Sala
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal de Solicitação de Permissão para Sala Premium */}
      <AnimatePresence>
        {targetPremiumRoom && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-6" id="modal-premium-permission">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-brand-white rounded-[2.5rem] p-8 max-w-sm w-full border border-purple-100 shadow-2xl flex flex-col items-center text-center space-y-5"
            >
              <div className="w-16 h-16 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 shadow-inner">
                <Lock size={30} className="text-purple-600" />
              </div>

              <div className="space-y-2">
                <h4 className="font-display font-semibold text-brand-text text-lg">Sala Privada</h4>
                <p className="text-xs text-brand-text/60 font-light leading-relaxed">
                  Esta sala pertence a <strong className="text-purple-600 font-bold">{targetPremiumRoom.invitedBy}</strong>. Por ser uma sala premium, as diretrizes de privacidade exigem autorização expressa ou convite do criador para poder entrar.
                </p>
                {permissionStatus === 'idle' && (
                  <p className="text-[11px] text-gray-400 font-medium leading-relaxed">
                    Você pode solicitar autorização de forma rápida clicando no botão abaixo.
                  </p>
                )}
              </div>

              {permissionStatus === 'sending' && (
                <div className="w-full py-4 px-3 bg-purple-50/50 rounded-2xl border border-purple-100 flex flex-col items-center space-y-2">
                  <div className="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                  <span className="text-[11px] font-bold text-purple-700 animate-pulse">Solicitando autorização em tempo real...</span>
                </div>
              )}

              {permissionStatus === 'pending' && (
                <div className="w-full py-4 px-3 bg-indigo-50/50 rounded-2xl border border-indigo-100 flex flex-col items-center space-y-2 animate-pulse">
                  <span className="text-xs text-indigo-700 font-medium text-center leading-normal">
                    Aguardando permissão direta de {targetPremiumRoom.invitedBy}...
                  </span>
                </div>
              )}

              {permissionStatus === 'success' && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-full py-4 px-3 bg-emerald-50 rounded-2xl border border-emerald-100 flex flex-col items-center space-y-2"
                >
                  <span className="text-[20px]">✅</span>
                  <span className="text-xs font-bold text-emerald-800 text-center uppercase tracking-wide">
                    Permissão Concedida!
                  </span>
                  <p className="text-[10px] text-emerald-600/90 font-light text-center leading-normal">
                    O criador da sala liberou sua entrada com sucesso.
                  </p>
                </motion.div>
              )}

              <div className="w-full space-y-2.5">
                {permissionStatus === 'idle' && (
                  <button
                    onClick={startPermissionRequest}
                    className="w-full py-4 bg-purple-600 hover:bg-purple-700 active:scale-95 text-white rounded-2xl text-xs font-bold shadow-lg shadow-purple-100 transition-all outline-none"
                    id="btn-request-premium-enter"
                  >
                    Pedir permissão para entrar
                  </button>
                )}

                {permissionStatus === 'success' && (
                  <button
                    onClick={handleEnterApprovedRoom}
                    className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-2xl text-xs font-bold shadow-lg shadow-emerald-100 transition-all outline-none"
                    id="btn-confirm-premium-enter"
                  >
                    Entrar na Sala agora
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setTargetPremiumRoom(null);
                    setPermissionStatus('idle');
                  }}
                  className="w-full py-3 bg-brand-gray text-gray-500 rounded-2xl text-xs font-bold hover:bg-gray-200 active:scale-95 transition-all outline-none"
                  id="btn-cancel-premium-request"
                >
                  {permissionStatus === 'success' ? 'Fechar' : 'Voltar para Salas'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
