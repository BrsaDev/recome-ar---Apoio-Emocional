import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { View, Room, RoomGender, User as UserType } from '../types';
import { ArrowLeft, Users, Shield, Crown, User, UserCheck, Plus, Sparkles, Lock, X, Globe } from 'lucide-react';
import { cn } from '../lib/utils';
import { hasOffensiveContent } from '../lib/moderation';
import { getAvatarById } from '../data/avatars';
import { apiService } from '../services/api';

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
  const [rooms, setRooms] = useState<Room[]>(DEFAULT_ROOMS);

  useEffect(() => {
    apiService.rooms.fetchAll()
      .then(setRooms)
      .catch(err => {
        console.warn('[API Rooms] Fetch failed, falling back to default:', err);
      });
  }, []);

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
      // Log join activity via API for security tracking
      apiService.rooms.logJoin(selectedRoom.id, user?.nickname || user?.name || 'Anon').catch(err => {
        console.warn('[API Rooms] Log join stats failed:', err);
      });

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
    if (user?.plan === 'PREMIUM') {
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

    apiService.rooms.create(newRoom)
      .then((savedRoom) => {
        setRooms(prev => [...prev, savedRoom]);
        // Reset fields
        setNewRoomName('');
        setNewRoomDesc('');
        setNewRoomType('public');
        setInvitedAngels([]);
        setIsCreateOpen(false);
      })
      .catch(err => {
        setErrorMsg('Erro de rede ao salvar a sala. Tente novamente mais tarde.');
        console.error(err);
      });
  };

  return (
    <div className="h-full w-full flex flex-col bg-[#020410] overflow-hidden relative">
      {/* Background blobs */}
      <div className="absolute top-[-10%] right-[-10%] w-72 h-72 rounded-full bg-cyan-600/5 blur-[80px] z-0" />
      <div className="absolute bottom-[-10%] left-[-10%] w-72 h-72 rounded-full bg-purple-600/5 blur-[80px] z-0" />

      <AnimatePresence mode="wait">
        {!selectedRoom ? (
          <motion.div
            key="list"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="h-full w-full flex flex-col overflow-y-auto no-scrollbar pb-10 z-10"
          >
            <header className="px-6 pt-16 pb-6 bg-transparent shrink-0">
              <h2 className="text-3xl font-display font-medium text-white">Salas de Apoio</h2>
              <p className="text-gray-400 font-light mt-1 text-xs">Conecte-se com pessoas que te entendem.</p>
            </header>

            <div className="p-6 space-y-4">
              {/* Premium Room Creation Action */}
              <button
                onClick={handleTriggerCreateRoom}
                className="w-full bg-gradient-to-r from-purple-650 to-indigo-650 hover:from-purple-600 hover:to-indigo-600 active:scale-98 text-white p-5 rounded-[2rem] text-left shadow-lg shadow-purple-500/10 flex items-center justify-between group transition-all duration-300 border border-purple-500/30"
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
                <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center text-white group-hover:bg-white/20 transition-all border border-white/5">
                  <Plus size={20} />
                </div>
              </button>

              {rooms.map((room) => (
                <motion.button
                  key={room.id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSelectRoom(room)}
                  className="w-full glass-card p-6 rounded-[2rem] text-left border border-white/5 hover:border-white/10 flex items-center justify-between group transition-all shadow-3xs"
                  id={`btn-room-${room.id}`}
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-lg font-display font-semibold text-white">{room.name}</h3>
                      {room.type === 'vip' && <Crown size={14} className="text-yellow-500 fill-yellow-500/30" />}
                      {room.isPremiumRoom && <Sparkles size={14} className="text-purple-400 fill-purple-400/20 animate-pulse" />}
                    </div>
                    {room.isPremiumRoom && (
                      <div className="flex items-center space-x-1 text-[9px] text-purple-400 bg-purple-950/40 px-2 py-0.5 rounded-lg border border-purple-500/20 w-fit font-bold uppercase tracking-wider font-mono">
                        <span>🔒 Requer Convite ou Permissão</span>
                      </div>
                    )}
                    <p className="text-xs text-gray-400 font-light leading-snug max-w-[200px]">{room.description}</p>
                    <div className="flex items-center space-x-1.5 pt-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-neon-cyan animate-pulse" />
                      <span className="text-[10px] font-medium text-cyan-400 uppercase tracking-wide">{room.onlineCount} Online</span>
                      {room.isPremiumRoom && (
                        <>
                          <span className="text-gray-600 font-light">|</span>
                          <span className="text-[9px] font-bold text-purple-400 uppercase font-mono">Por: {room.invitedBy}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-white/5 rounded-[1.25rem] border border-white/5 flex items-center justify-center text-gray-400 group-hover:bg-cyan-500/10 group-hover:text-cyan-400 transition-all shrink-0 ml-2 shadow-2xs">
                    {room.type === 'vip' ? <Crown size={20} className="text-yellow-500" /> : room.isPremiumRoom ? <Lock size={18} className="text-purple-400" /> : <Users size={20} />}
                  </div>
                </motion.button>
              ))}

              <div className="glass-card bg-[#06B6D4]/5 p-6 rounded-[2rem] border border-[#06B6D4]/20 flex items-center space-x-4 mt-6">
                <Shield className="text-cyan-400 min-w-[24px]" />
                <p className="text-xs text-cyan-400/90 leading-relaxed font-light">
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
            className="h-full w-full flex flex-col bg-[#020410] p-6 pt-16 overflow-y-auto no-scrollbar pb-12 z-10"
          >
            <button
              onClick={() => setSelectedRoom(null)}
              className="mb-8 p-2 -ml-2 text-gray-400 hover:text-white flex items-center space-x-2 shrink-0 outline-none transition-all cursor-pointer"
            >
              <ArrowLeft size={20} />
              <span className="text-xs font-semibold">Voltar para salas</span>
            </button>

            <div className="space-y-2 mb-8 shrink-0">
              <h2 className="text-2xl font-display font-medium text-white">Como prefere conversar?</h2>
              <p className="text-gray-400 font-light text-xs">Escolha em qual tipo de sala você se sente mais confortável em desabafar sobre <span className="font-semibold text-white underline decoration-cyan-400 underline-offset-4">{selectedRoom.name}</span>.</p>
            </div>

            <div className="grid grid-cols-1 gap-4 shrink-0 pb-6">
              <button
                onClick={() => handleEnterRoom('mixed')}
                className="w-full glass-card p-6 rounded-3xl flex items-center space-x-5 text-left border border-white/5 hover:border-purple-500/40 active:bg-purple-500/5 transition-all outline-none cursor-pointer"
              >
                <div className="w-14 h-14 bg-purple-500/10 border border-purple-500/20 rounded-2xl flex items-center justify-center text-purple-400 shrink-0">
                  <Users size={24} />
                </div>
                <div>
                  <h3 className="font-display font-bold text-white text-sm">Sala Mista</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Pessoas de todos os gêneros.</p>
                </div>
              </button>

              <button
                onClick={() => handleEnterRoom('men')}
                className="w-full glass-card p-6 rounded-3xl flex items-center space-x-5 text-left border border-white/5 hover:border-[#2E9CCA]/40 active:bg-[#2E9CCA]/5 transition-all outline-none cursor-pointer"
              >
                <div className="w-14 h-14 bg-[#2E9CCA]/10 border border-[#2E9CCA]/20 rounded-2xl flex items-center justify-center text-[#2E9CCA] shrink-0">
                  <User size={24} />
                </div>
                <div>
                  <h3 className="font-display font-bold text-white text-sm">Apenas Homens</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Espaço reservado para o público masculino.</p>
                </div>
              </button>

              <button
                onClick={() => handleEnterRoom('women')}
                className="w-full glass-card p-6 rounded-3xl flex items-center space-x-5 text-left border border-white/5 hover:border-pink-500/40 active:bg-pink-500/5 transition-all outline-none cursor-pointer"
              >
                <div className="w-14 h-14 bg-pink-500/10 border border-pink-500/20 rounded-2xl flex items-center justify-center text-pink-400 shrink-0">
                  <UserCheck size={24} />
                </div>
                <div>
                  <h3 className="font-display font-bold text-white text-sm">Apenas Mulheres</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Espaço reservado para o público feminino.</p>
                </div>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Upgrade para Premium */}
      <AnimatePresence>
        {isUpgradePromptOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-6">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#12182b]/95 rounded-[2.5rem] p-8 max-w-sm w-full border border-purple-500/20 shadow-neon-purple shadow-xl flex flex-col items-center text-center space-y-5"
            >
              <div className="w-16 h-16 rounded-full bg-purple-900/30 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-inner">
                <Crown size={28} className="fill-purple-400/10" />
              </div>
              <div className="space-y-2">
                <h4 className="font-display font-bold text-white text-lg">Recurso Exclusivo PREMIUM</h4>
                <p className="text-xs text-gray-400 font-light leading-relaxed">
                  Apenas assinantes do plano <strong className="text-purple-400 font-semibold text-neon-purple">PREMIUM</strong> têm permissão para criar e gerenciar salas de desabafo personalizadas na plataforma.
                </p>
                <div className="bg-purple-950/40 p-2.5 rounded-xl border border-purple-500/20 text-[10px] text-purple-400 font-bold uppercase tracking-wider font-mono">
                  Seu plano atual: {user?.plan === 'VIP' ? 'VIP' : user?.plan === 'PREMIUM' ? 'Premium' : 'Grátis'}
                </div>
              </div>
              <div className="w-full space-y-2.5">
                <button
                  onClick={() => {
                    setIsUpgradePromptOpen(false);
                    navigate('vip');
                  }}
                  className="w-full py-4 bg-gradient-to-r from-purple-650 to-indigo-650 hover:from-purple-650 hover:to-indigo-650 active:scale-95 text-white border border-purple-500/25 rounded-2xl text-xs font-bold shadow-lg shadow-purple-500/15 transition-all outline-none"
                >
                  Conhecer Planos & Upgrade
                </button>
                <button
                  onClick={() => setIsUpgradePromptOpen(false)}
                  className="w-full py-3 bg-white/5 text-gray-450 rounded-2xl text-xs font-semibold hover:bg-white/10 active:scale-95 border border-white/5 transition-all outline-none"
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
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 backdrop-blur-sm p-4">
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
              className="relative bg-[#12182b]/95 w-full max-w-sm rounded-[2.5rem] p-6 shadow-neon-purple/5 border border-purple-500/20 flex flex-col space-y-4 z-10 max-h-[90dvh] overflow-y-auto no-scrollbar"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <Sparkles size={16} className="text-purple-400 animate-pulse" />
                  <h4 className="font-display font-medium text-white text-lg">Nova Sala de Apoio</h4>
                </div>
                <button
                  onClick={() => setIsCreateOpen(false)}
                  className="p-1.5 rounded-full hover:bg-white/5 text-gray-400 hover:text-white transition-all outline-none cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveRoom} className="space-y-4 text-left">
                {errorMsg && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-red-950/20 border border-red-500/30 rounded-xl text-[11px] text-red-400 flex items-center space-x-2"
                  >
                    <span>⚠️</span>
                    <span>{errorMsg}</span>
                  </motion.div>
                )}

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider pl-1">Nome da sala</label>
                  <input
                    type="text"
                    value={newRoomName}
                    onChange={(e) => setNewRoomName(e.target.value)}
                    placeholder="Ex: Superando Ansiedade do Trabalho..."
                    className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 text-xs font-sans text-white outline-none focus:border-purple-500/30 focus:ring-1 focus:ring-purple-500/30 transition-all placeholder-gray-650 text-white"
                    maxLength={40}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider pl-1">Descrição curta</label>
                  <textarea
                    value={newRoomDesc}
                    onChange={(e) => setNewRoomDesc(e.target.value)}
                    placeholder="Explique o espírito ou intenção da sala em poucas palavras..."
                    className="w-full h-24 bg-white/5 border border-white/5 rounded-2xl p-4 text-xs font-sans text-white outline-none focus:border-purple-500/30 focus:ring-1 focus:ring-purple-500/30 transition-all resize-none placeholder-gray-650 text-white"
                    maxLength={100}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider pl-1">Tipo de Acesso</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setNewRoomType('public')}
                      className={cn(
                        "p-4 rounded-2xl border text-xs font-bold transition-all flex flex-col items-center justify-center space-y-1.5 cursor-pointer outline-none",
                        newRoomType === 'public'
                          ? "bg-purple-950/40 border-purple-500/30 text-purple-400"
                          : "bg-white/5 border-transparent text-gray-400 hover:text-white"
                      )}
                    >
                      <Globe size={16} />
                      <span>Sala Pública</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewRoomType('vip')}
                      className={cn(
                        "p-4 rounded-2xl border text-xs font-bold transition-all flex flex-col items-center justify-center space-y-1.5 cursor-pointer outline-none",
                        newRoomType === 'vip'
                          ? "bg-purple-950/40 border-purple-500/30 text-purple-400"
                          : "bg-white/5 border-transparent text-gray-400 hover:text-white"
                      )}
                    >
                      <Lock size={16} />
                      <span>Sala VIP</span>
                    </button>
                  </div>
                </div>

                {/* Seleção de Anjos de Apoio para convidar na criação (Recurso Premium) */}
                {user?.plan === 'PREMIUM' && (user.supportAngels || []).length > 0 && (
                  <div className="space-y-2.5 border-t border-white/5 pt-3.5">
                    <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider block pl-1">
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
                              "w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left border text-xs font-bold transition-all outline-none cursor-pointer",
                              isSelected
                                ? "bg-purple-955/40 border-purple-500/35 text-purple-400"
                                : "bg-white/5 border-transparent text-gray-400 hover:bg-white/10"
                            )}
                          >
                            <span className="flex items-center space-x-2.5">
                              <span className="text-base">{getAvatarById(angel.avatarId || 'f1')?.emoji}</span>
                              <span className="text-white">{angel.name}</span>
                            </span>
                            <span className="text-[9px] uppercase tracking-wider font-extrabold text-purple-400">
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
                  className="w-full py-4 mt-2 bg-gradient-to-r from-purple-650 to-indigo-650 hover:from-purple-655 hover:to-indigo-655 text-white rounded-2xl text-xs font-bold transition-all outline-none shadow-md shadow-purple-500/10 border border-purple-500/25 cursor-pointer"
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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-6" id="modal-premium-permission">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#12182b]/95 rounded-[2.5rem] p-8 max-w-sm w-full border border-purple-500/20 shadow-neon-purple shadow-xl flex flex-col items-center text-center space-y-5"
            >
              <div className="w-16 h-16 rounded-full bg-purple-900/30 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-inner">
                <Lock size={26} className="text-purple-400" />
              </div>

              <div className="space-y-2">
                <h4 className="font-display font-medium text-white text-lg">Sala Privada</h4>
                <p className="text-xs text-gray-400 font-light leading-relaxed">
                  Esta sala pertence a <strong className="text-purple-400 font-bold">{targetPremiumRoom.invitedBy}</strong>. Por ser uma sala premium, as diretrizes de privacidade exigem autorização expressa ou convite do criador para poder entrar.
                </p>
                {permissionStatus === 'idle' && (
                  <p className="text-[11px] text-gray-500 font-medium leading-relaxed">
                    Você pode solicitar autorização de forma rápida clicando no botão abaixo.
                  </p>
                )}
              </div>

              {permissionStatus === 'sending' && (
                <div className="w-full py-4 px-3 bg-purple-900/20 rounded-2xl border border-purple-500/20 flex flex-col items-center space-y-2">
                  <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-[11px] font-bold text-purple-400 animate-pulse">Solicitando autorização em tempo real...</span>
                </div>
              )}

              {permissionStatus === 'pending' && (
                <div className="w-full py-4 px-3 bg-indigo-950/20 rounded-2xl border border-indigo-500/20 flex flex-col items-center space-y-2 animate-pulse">
                  <span className="text-xs text-indigo-400 font-medium text-center leading-normal">
                    Aguardando permissão direta de {targetPremiumRoom.invitedBy}...
                  </span>
                </div>
              )}

              {permissionStatus === 'success' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-full py-4 px-3 bg-purple-950/30 rounded-2xl border border-purple-500/30 flex flex-col items-center space-y-2"
                >
                  <span className="text-[20px]">✅</span>
                  <span className="text-xs font-bold text-purple-400 text-center uppercase tracking-wide">
                    Permissão Concedida!
                  </span>
                  <p className="text-[10px] text-purple-400/90 font-light text-center leading-normal">
                    O criador da sala liberou sua entrada com sucesso.
                  </p>
                </motion.div>
              )}

              <div className="w-full space-y-2.5">
                {permissionStatus === 'idle' && (
                  <button
                    onClick={startPermissionRequest}
                    className="w-full py-4 bg-gradient-to-r from-purple-650 to-indigo-650 hover:from-purple-650 hover:to-indigo-650 active:scale-95 text-white border border-purple-500/25 rounded-2xl text-xs font-bold shadow-lg shadow-purple-500/10 transition-all outline-none cursor-pointer"
                    id="btn-request-premium-enter"
                  >
                    Pedir permissão para entrar
                  </button>
                )}

                {permissionStatus === 'success' && (
                  <button
                    onClick={handleEnterApprovedRoom}
                    className="w-full py-4 bg-gradient-to-r from-purple-650 to-indigo-650 hover:from-purple-650 hover:to-indigo-650 active:scale-95 text-white border border-purple-500/25 rounded-2xl text-xs font-bold shadow-lg shadow-purple-500/10 transition-all outline-none cursor-pointer"
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
                  className="w-full py-3 bg-white/5 text-gray-400 rounded-2xl text-xs font-semibold hover:bg-white/10 active:scale-95 border border-white/5 transition-all outline-none cursor-pointer"
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

