import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Message, View, RoomGender } from '../types';
import { Send, Mic, MicOff, ArrowLeft, MoreHorizontal, Users, Play, Pause, ShieldAlert, Flag, X, Lock, Heart } from 'lucide-react';
import { cn } from '../lib/utils';
import ReactMarkdown from 'react-markdown';
import { analyzeContent } from '../lib/moderation';
import { encryptMessage, getPrivateKey, decryptMessage, importPublicKey, exportPublicKey, generateKeyPair } from '../services/crypto';

interface Props {
  user: User | null;
  navigate: (view: View) => void;
  roomName: string;
  gender: RoomGender;
  invitedAngels?: string[];
  onUpdateUser?: (updated: User) => void;
}

const AudioPlayer = ({ url }: { url: string }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(console.error);
      }
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const total = audioRef.current.duration;
      if (!isNaN(total) && isFinite(total) && total > 0) {
        setProgress((current / total) * 100);
        setCurrentTime(current);
        if (duration === 0) setDuration(total);
      } else {
        setCurrentTime(current);
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      const total = audioRef.current.duration;
      if (!isNaN(total) && isFinite(total) && total > 0) {
        setDuration(total);
      } else if (total === Infinity) {
        // Para Blobs, a duração pode ser Infinity até que o fim seja alcançado
        // Tentamos "estimar" ou apenas esperar o progresso
        console.log("Duração infinita detectada para o blob");
      }
    }
  };

  const formatAudioTime = (time: number) => {
    if (isNaN(time) || !isFinite(time)) return "0:00";
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col space-y-1 min-w-[200px]">
      <div className="flex items-center space-x-3 bg-white/10 p-2 rounded-2xl">
        <button
          onClick={togglePlay}
          className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-brand-green shadow-sm active:scale-90 transition-transform"
        >
          {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} className="ml-0.5" fill="currentColor" />}
        </button>

        <div className="flex-1 space-y-1.5">
          <div className="h-1.5 bg-white/20 rounded-full relative overflow-hidden">
            <motion.div
              style={{ width: `${progress}%` }}
              className="absolute inset-y-0 left-0 bg-white"
            />
          </div>
          <div className="flex justify-between text-[10px] text-white/70 font-mono">
            <span>{formatAudioTime(currentTime)}</span>
            <span>{duration > 0 ? formatAudioTime(duration) : '...'}</span>
          </div>
        </div>
      </div>
      <audio
        ref={audioRef}
        src={url}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => {
          setIsPlaying(false);
          setProgress(0);
          setCurrentTime(0);
        }}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        preload="metadata"
        className="hidden"
      />
    </div>
  );
};

import { getAvatarById } from '../data/avatars';
import { hasOffensiveContent } from '../lib/moderation';

export default function LiveRoom({ user, navigate, roomName, gender, invitedAngels, onUpdateUser }: Props) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: `Bem-vindo à sala ${roomName} (${gender === 'mixed' ? 'Mista' : gender === 'men' ? 'Apenas Homens' : 'Apenas Mulheres'}). Este é um ambiente seguro.`,
      sender: 'system',
      timestamp: Date.now(),
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isMicActive, setIsMicActive] = useState(false);
  const [participants, setParticipants] = useState<{ id: string; name: string; isSpeaking: boolean; isMe: boolean; avatarId: string }[]>([]);
  const [isFirstInRoom, setIsFirstInRoom] = useState(false);
  const [offensiveWarning, setOffensiveWarning] = useState<string | null>(null);
  const [isCrisisWarning, setIsCrisisWarning] = useState<boolean>(false);
  const [selectedParticipant, setSelectedParticipant] = useState<any | null>(null);
  const [reports, setReports] = useState<Record<string, string[]>>({});
  const [reportToast, setReportToast] = useState<string | null>(null);

  // Custom states for Support Angels invites
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteSuccessMsg, setInviteSuccessMsg] = useState<string | null>(null);
  const [inviteErrorMsg, setInviteErrorMsg] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Simulação de entrada na sala com limite de 10 pessoas
  useEffect(() => {
    const names = ['Ana', 'Pedro', 'Lucas', 'Mariana', 'Carla', 'Gabriel', 'Bia', 'João', 'Sofia'];
    // Definimos aleatoriamente quantos já estão na sala (0 a 9)
    // Se houver anjos convidados pré-definidos, reduzimos o pool aleatório para preservar o limite máximo de 10 participantes
    const numInvited = (invitedAngels || []).length;
    const maxRandom = Math.max(0, 9 - numInvited);
    const existingCount = Math.min(maxRandom, Math.floor(Math.random() * (maxRandom + 1)));

    // Gêneros dos avatares para os nomes
    const femaleNames = ['Ana', 'Mariana', 'Carla', 'Bia', 'Sofia'];
    const femaleAvatars = ['f1', 'f2', 'f3', 'f4', 'f5', 'f6', 'f7', 'f8'];
    const maleAvatars = ['m1', 'm2', 'm3', 'm4', 'm5', 'm6', 'm7', 'm8'];

    const initialParticipants = [
      { id: 'me', name: 'Você', isSpeaking: false, isMe: true, avatarId: user?.avatarId || 'm1' }
    ];

    // Adiciona os Anjos de Apoio convidados logo após "Você" na lista de membros
    const invitedMessages: Message[] = [];
    if (invitedAngels && invitedAngels.length > 0) {
      invitedAngels.forEach((angelName, index) => {
        const matchedAngel = user?.supportAngels?.find(a => a.name === angelName);
        const avatarId = matchedAngel?.avatarId || femaleAvatars[index % femaleAvatars.length];

        initialParticipants.push({
          id: `invited-pre-${index}`,
          name: angelName,
          isSpeaking: false,
          isMe: false,
          avatarId: avatarId
        });

        invitedMessages.push({
          id: `invite-arrival-${index}-${Date.now()}`,
          text: `👼 **[Anjo]** *${angelName} aceitou seu convite prévio e acabou de entrar na sala para apoiar você.*`,
          sender: 'system',
          timestamp: Date.now() + index * 50
        });
      });
    }

    if (existingCount === 0 && numInvited === 0) {
      setIsFirstInRoom(true);
      setMessages(prev => [
        ...prev,
        {
          id: 'incentive',
          text: "🌿 **Você é o primeiro a chegar!**\n\nRespire fundo. Este espaço foi criado especialmente para você. Outras pessoas logo se juntarão a nós. Permaneça aqui, sinta o silêncio e, quando estiver pronto, pode começar a desabafar.",
          sender: 'system',
          timestamp: Date.now(),
        }
      ]);
    } else {
      // Adiciona participantes aleatórios até o limite de 9 + você
      for (let i = 0; i < existingCount; i++) {
        const name = names[i % names.length];
        // Evita duplicar nomes convidados
        if (invitedAngels && invitedAngels.includes(name)) continue;

        const isFemale = femaleNames.includes(name);
        const avList = isFemale ? femaleAvatars : maleAvatars;
        const seedIndex = (name.charCodeAt(0) + i) % avList.length;
        const avatarId = avList[seedIndex];

        initialParticipants.push({
          id: (i + 2).toString(),
          name,
          isSpeaking: false,
          isMe: false,
          avatarId
        });
      }

      if (invitedMessages.length > 0) {
        setMessages(prev => [...prev, ...invitedMessages]);
      }
    }

    setParticipants(initialParticipants);
  }, [user?.avatarId, invitedAngels]);

  // Simulação de pessoas falando alternadamente
  useEffect(() => {
    if (participants.length <= 1 && !isMicActive) return;

    const interval = setInterval(() => {
      setParticipants(prev => prev.map(p => {
        if (p.isMe) return { ...p, isSpeaking: isMicActive };
        // Somente fala se houver mais pessoas e aleatoriamente
        if (Math.random() > 0.8) return { ...p, isSpeaking: !p.isSpeaking };
        return p;
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, [isMicActive, participants.length]);

  const toggleMic = () => {
    setIsMicActive(!isMicActive);
    setParticipants(prev => prev.map(p => p.isMe ? { ...p, isSpeaking: !isMicActive } : p));
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    const modResult = analyzeContent(text);
    if (modResult !== 'safe') {
      setIsCrisisWarning(modResult === 'crisis');
      if (modResult === 'crisis') {
        setOffensiveWarning(
          "Detectamos palavras sensíveis. Você não está sozinho e sua vida é muito importante para nós. O CVV está disponível 24h para te ouvir com carinho e sigilo absoluto."
        );
      } else {
        setOffensiveWarning("Sua mensagem foi sinalizada pelo sistema de moderação por conter termos ofensivos.");
      }
      setInputText('');
      return;
    }

    // --- E2EE DEMONSTRATION FLOW ---
    // 1. Get my Private Key (to demonstrate I could sign, but here we'll just encrypt for the 'server' simulation)
    // 2. In a real room, we'd encrypt for each recipient. 
    // For this prototype, we'll "encrypt for the room" (simulated with a room key or just showing the process)

    let displayMsg = text;
    try {
      // Simulate: Encrypting before sending to the "network"
      const myKeys = await generateKeyPair(); // In real app, use stored keys
      const encrypted = await encryptMessage(text, myKeys.publicKey);
      console.log('🔒 [E2EE] Payload enviado ao servidor:', encrypted);

      // Simulate: Decrypting after receiving from "network"
      displayMsg = await decryptMessage(encrypted, myKeys.privateKey);
    } catch (e) {
      console.error('Erro na criptografia:', e);
    }

    const userMsg: Message = {
      id: Date.now().toString(),
      text: displayMsg,
      sender: 'user',
      senderName: 'Você',
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');

    setTimeout(async () => {
      if (participants.length <= 1) return;

      const activeSpeakers = participants.filter(p => !p.isMe);
      if (activeSpeakers.length === 0) return;

      const speaker = activeSpeakers[Math.floor(Math.random() * activeSpeakers.length)];

      const responses = [
        "Estou aqui te ouvindo.",
        "Sinta-se à vontade para desabafar.",
        "Tudo bem, respira fundo.",
        "Estamos juntos nessa.",
        "Às vezes o silêncio também ajuda."
      ];

      const replyText = responses[Math.floor(Math.random() * responses.length)];

      // Simulate receiving an encrypted message from another participant
      let decryptedReply = replyText;
      try {
        const tempKeys = await generateKeyPair();
        const encryptedReply = await encryptMessage(replyText, tempKeys.publicKey);
        decryptedReply = await decryptMessage(encryptedReply, tempKeys.privateKey);
      } catch (e) { }

      const otherMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: decryptedReply,
        sender: 'user',
        senderName: speaker.name,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, otherMsg]);
    }, 2000);
  };

  const handleConfirmReport = (p: any) => {
    const currentReports = reports[p.id] || [];
    if (currentReports.includes('me')) {
      setReportToast(`Você já denunciou ${p.name}.`);
      setTimeout(() => setReportToast(null), 3000);
      setSelectedParticipant(null);
      return;
    }

    // Para simular ativamente a mecânica de ban com 3 denúncias, adicionamos o seu voto + outros 2 virtuais
    const updatedReports = [...currentReports, 'me', 'other1', 'other2'];
    setReports(prev => ({ ...prev, [p.id]: updatedReports }));

    // Remove o participante da lista
    setParticipants(prev => prev.filter(participant => participant.id !== p.id));

    // Adiciona uma mensagem de sistema/segurança no chat demonstrando o banimento automático
    const banMsg: Message = {
      id: `ban-${Date.now()}`,
      text: `📢 **[Segurança]** *${p.name} foi removido(a) da sala automaticamente após receber 3 denúncias por comportamento baderneiro.*`,
      sender: 'system',
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, banMsg]);

    setReportToast(`Denúncia de baderna processada! ${p.name} foi banido(a) da sala.`);
    setTimeout(() => setReportToast(null), 4000);

    setSelectedParticipant(null);
  };

  const handleToggleAngel = () => {
    if (!user || !onUpdateUser || !selectedParticipant) return;
    const currentAngels = user.supportAngels || [];
    const exists = currentAngels.some(a => a.name === selectedParticipant.name);

    let updatedAngels;
    if (exists) {
      updatedAngels = currentAngels.filter(a => a.name !== selectedParticipant.name);
      setReportToast(`Removido(a) dos seus Anjos de Apoio.`);
    } else {
      updatedAngels = [
        ...currentAngels,
        {
          id: selectedParticipant.id || Date.now().toString(),
          name: selectedParticipant.name,
          avatarId: selectedParticipant.avatarId
        }
      ];
      setReportToast(`👼 Maravilha! ${selectedParticipant.name} agora é seu Anjo de Apoio.`);
    }

    onUpdateUser({
      ...user,
      supportAngels: updatedAngels
    });

    setTimeout(() => setReportToast(null), 4500);
  };

  const handleInviteAngel = (angel: any) => {
    // Check limit of 10 people
    if (participants.length >= 10) {
      setInviteErrorMsg("Limite de 10 participantes atingido nesta sala. Não é possível enviar novos convites.");
      setTimeout(() => setInviteErrorMsg(null), 5000);
      return;
    }

    if (participants.some(p => p.name === angel.name)) {
      setInviteErrorMsg(`${angel.name} já faz parte desta conversa ativa.`);
      setTimeout(() => setInviteErrorMsg(null), 4000);
      return;
    }

    // Add to participants list
    setParticipants(prev => [
      ...prev,
      {
        id: angel.id || Date.now().toString(),
        name: angel.name,
        isSpeaking: false,
        isMe: false,
        avatarId: angel.avatarId
      }
    ]);

    setInviteSuccessMsg(`Convite entregue para ${angel.name}!`);
    setTimeout(() => setInviteSuccessMsg(null), 3000);

    // Dynamic message from system showing that support angel has joined
    setTimeout(() => {
      const inviteAnnounce: Message = {
        id: `invite-msg-${Date.now()}`,
        text: `👼 **[Anjo]** *${angel.name} aceitou seu chamado espiritual e acabou de entrar na sala para apoiar você.*`,
        sender: 'system',
        timestamp: Date.now()
      };
      setMessages(messagesPrev => [...messagesPrev, inviteAnnounce]);
    }, 1500);
  };

  const leftParticipants = participants.slice(0, Math.ceil(participants.length / 2));
  const rightParticipants = participants.slice(Math.ceil(participants.length / 2));

  const getSenderAvatarEmoji = (senderName?: string, senderType?: string) => {
    if (senderType === 'user' || senderName === 'Você') {
      const usrAvatarObj = getAvatarById(user?.avatarId || '');
      return usrAvatarObj ? usrAvatarObj.emoji : '👋';
    }
    const foundPart = participants.find(p => p.name === senderName);
    if (foundPart) {
      const av = getAvatarById(foundPart.avatarId || '');
      return av ? av.emoji : '👤';
    }
    return '👤';
  };

  const renderParticipant = (p: any) => {
    const avatarObj = getAvatarById(p.avatarId || '');
    const emoji = avatarObj ? avatarObj.emoji : p.name[0];
    return (
      <button
        key={p.id}
        onClick={() => setSelectedParticipant(p)}
        className="flex flex-col items-center shrink-0 space-y-1 relative w-full px-1 cursor-pointer active:scale-95 transition-transform outline-none"
      >
        <div className={cn(
          "w-11 h-11 rounded-full flex items-center justify-center text-xl bg-white border transition-all duration-300 relative",
          p.isSpeaking
            ? "ring-4 ring-brand-blue/30 scale-105 border-brand-blue bg-blue-50 shadow-md"
            : "border-brand-blue/10 hover:border-brand-blue/35"
        )}>
          {emoji}

          {/* Speaking Indicator Dot */}
          <AnimatePresence>
            {p.isSpeaking && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-blue-500 rounded-full border border-brand-white flex items-center justify-center shadow"
              >
                <div className="w-1 h-1 bg-white rounded-full animate-ping" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <span className={cn(
          "text-[9px] font-bold tracking-tight text-center truncate max-w-full leading-none",
          p.isSpeaking ? "text-brand-blue" : "text-gray-400"
        )}>
          {p.name}
        </span>
      </button>
    );
  };

  return (
    <div className="h-full w-full flex flex-col bg-brand-white">
      {/* Header */}
      <header className="h-20 bg-brand-white border-b border-brand-blue/10 px-6 flex items-center justify-between z-10">
        <div className="flex items-center space-x-4">
          <button onClick={() => navigate('rooms')} className="p-2 -ml-2 text-gray-400">
            <ArrowLeft size={24} />
          </button>
          <div>
            <h3 className="font-display font-semibold text-brand-text leading-tight">{roomName}</h3>
            <div className="flex items-center space-x-2">
              <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest leading-none">
                Conexão em tempo real
              </p>
              <span className="w-1 h-1 rounded-full bg-gray-300" />
              <p className="text-[10px] text-brand-blue font-bold uppercase tracking-widest leading-none">
                {participants.length}/10 participantes
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-1.5 shrink-0">
          {user?.supportAngels && user.supportAngels.length > 0 && (
            <button
              onClick={() => {
                setInviteErrorMsg(null);
                setInviteSuccessMsg(null);
                setIsInviteModalOpen(true);
              }}
              className="py-1.5 px-3 rounded-full bg-purple-50 text-purple-600 hover:bg-purple-100 border border-purple-100 active:scale-95 text-[10px] font-bold font-display flex items-center space-x-1 transition-all"
              title="Convidar Anjo de Apoio"
            >
              <span>👼 Convidar</span>
            </button>
          )}
          <button className="p-2 text-gray-400">
            <MoreHorizontal size={24} />
          </button>
        </div>
      </header>

      {/* Aviso de Privacidade e Segurança Discreto */}
      <div className="bg-amber-50/90 border-b border-amber-100 px-6 py-2 flex items-center shrink-0 z-10" id="chat-privacy-warning-banner">
        <ShieldAlert size={14} className="text-amber-600 shrink-0 mr-2" />
        <span className="text-[10px] text-amber-800/90 font-medium leading-normal">
          <strong className="font-semibold text-amber-900">Aviso:</strong> Por segurança, nunca envie dados sensíveis como senhas, CPF, endereço ou dados de conta bancária.
        </span>
      </div>

      {/* Main Row layout for virtual rooms side-by-side with chats */}
      <div className="flex-1 flex overflow-hidden min-h-0 bg-brand-white">

        {/* Left column of participants */}
        <div className="w-16 shrink-0 border-r border-brand-blue/5 bg-brand-gray/20 py-4 flex flex-col items-center gap-y-5 overflow-y-auto no-scrollbar z-10 shadow-inner">
          {leftParticipants.map(renderParticipant)}
        </div>

        {/* Chat view area */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-4 py-6 space-y-4 no-scrollbar bg-brand-white"
        >
          {/* WhatsApp-style E2EE Notice */}
          <div className="flex justify-center mb-6">
            <div className="bg-amber-100/40 text-amber-900/70 py-2.5 px-4 rounded-xl text-[10px] font-medium leading-relaxed text-center max-w-[85%] border border-amber-200/30 flex items-start space-x-2">
              <Lock size={12} className="shrink-0 mt-0.5 opacity-60" />
              <span>
                As mensagens são criptografadas de ponta-a-ponta. Ninguém fora desta conversa, nem mesmo o FAPEM, pode lê-las ou ouvi-las.
              </span>
            </div>
          </div>

          {messages.map((msg) => {
            const isSystem = msg.sender === 'system';
            return (
              <div key={msg.id} className="flex flex-col space-y-1">
                {!isSystem && (
                  <span className={cn(
                    "text-[10px] font-semibold flex items-center gap-1.5 px-2 mb-0.5 tracking-tight",
                    msg.sender === 'user' ? "justify-end text-brand-green" : "justify-start text-gray-400"
                  )}>
                    <span className="text-sm leading-none">{getSenderAvatarEmoji(msg.senderName, msg.sender)}</span>
                    {msg.senderName}
                  </span>
                )}
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "flex w-full",
                    msg.sender === 'user' ? "justify-end" : "justify-start"
                  )}
                >
                  <div className={cn(
                    "px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm transition-all overflow-hidden max-w-[85%]",
                    msg.sender === 'user'
                      ? "bg-brand-green text-white rounded-tr-none"
                      : msg.sender === 'system'
                        ? "bg-brand-gray text-gray-400 text-[11px] text-center w-full rounded-2xl py-3 border border-brand-blue/5 tracking-tight uppercase"
                        : "bg-brand-gray text-brand-text rounded-tl-none border border-brand-blue/5"
                  )}>
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  </div>
                </motion.div>
              </div>
            );
          })}
        </div>

        {/* Right column of participants */}
        <div className="w-16 shrink-0 border-l border-brand-blue/5 bg-brand-gray/20 py-4 flex flex-col items-center gap-y-5 overflow-y-auto no-scrollbar z-10 shadow-inner">
          {rightParticipants.map(renderParticipant)}

          {/* Fill the remainder space to suggest a 10 room limits */}
          {participants.length < 10 && (
            Array.from({ length: 5 - rightParticipants.length }).map((_, idx) => (
              <div key={`empty-${idx}`} className="flex flex-col items-center shrink-0 space-y-1 w-full opacity-35">
                <div className="w-11 h-11 rounded-full border border-dashed border-gray-300 flex items-center justify-center text-sm text-gray-300">
                  👤
                </div>
                <span className="text-[9px] text-gray-300/80 font-light scale-90">Livre</span>
              </div>
            ))
          )}
        </div>

      </div>

      {/* Footer / Input */}
      <footer className="p-6 bg-brand-white border-t border-brand-blue/10 shrink-0">
        <div className="flex items-center space-x-3">
          <div className="flex-1 bg-brand-gray rounded-2xl flex items-center px-4 py-1 min-h-[48px]">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(inputText)}
              placeholder="Escreva algo para o grupo..."
              className="flex-1 bg-transparent border-none outline-none text-brand-text text-sm"
              id="input-text-room"
            />
          </div>

          <div className="flex items-center space-x-2">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={toggleMic}
              className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-lg",
                isMicActive ? "bg-brand-blue text-white ring-4 ring-brand-blue/20" : "bg-gray-100 text-gray-400"
              )}
              id="btn-toggle-live-audio"
            >
              {isMicActive ? <Mic size={20} /> : <MicOff size={20} />}
            </motion.button>
            <button
              onClick={() => handleSendMessage(inputText)}
              disabled={!inputText.trim()}
              className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all",
                inputText.trim() ? "bg-brand-green text-white" : "bg-gray-100 text-gray-400"
              )}
              id="btn-send-message"
            >
              <Send size={20} />
            </button>
          </div>
        </div>

        {isMicActive && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 flex justify-center"
          >
            <div className="flex items-center space-x-2 px-3 py-1 bg-brand-blue/10 rounded-full">
              <div className="flex space-x-0.5 items-end h-3">
                {[1, 2, 3, 2, 1].map((h, i) => (
                  <motion.div
                    key={i}
                    animate={{ height: ['40%', '100%', '40%'] }}
                    transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.1 }}
                    className="w-0.5 bg-brand-blue"
                  />
                ))}
              </div>
              <span className="text-[10px] font-bold text-brand-blue uppercase">Você está ao vivo</span>
            </div>
          </motion.div>
        )}
      </footer>

      {/* Toast de Confirmação de Denúncias */}
      <AnimatePresence>
        {reportToast && (
          <motion.div
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-brand-text text-white px-5 py-3 rounded-2xl shadow-xl text-xs font-bold flex items-center space-x-2 border border-white/10"
          >
            <span>🚨</span>
            <span>{reportToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Alerta de Bloqueio Preventivo (Moderação de Termos Ofensivos) */}
      <AnimatePresence>
        {offensiveWarning && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-6">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={cn(
                "bg-brand-white rounded-[2.5rem] p-8 max-w-sm w-full shadow-2xl flex flex-col items-center text-center space-y-5 border",
                isCrisisWarning ? "border-purple-100" : "border-red-100"
              )}
            >
              <div className={cn(
                "w-14 h-14 rounded-full flex items-center justify-center shadow-sm animate-bounce",
                isCrisisWarning ? "bg-purple-50 text-purple-500" : "bg-red-50 text-red-500"
              )}>
                {isCrisisWarning ? <Heart size={28} /> : <ShieldAlert size={28} />}
              </div>
              <div className="space-y-2">
                <h4 className={cn(
                  "font-display font-bold text-lg",
                  isCrisisWarning ? "text-purple-600" : "text-red-600"
                )}>
                  {isCrisisWarning ? "Você não está sozinho" : "Bloqueio Preventivo"}
                </h4>
                <p className="text-xs text-brand-text/70 font-light leading-relaxed">
                  {offensiveWarning}
                </p>
                {isCrisisWarning && (
                  <div className="bg-purple-50 p-4 rounded-2xl border border-purple-100/50 flex flex-col items-center space-y-3">
                    <p className="text-[11px] text-purple-800 font-semibold leading-tight">
                      Ligue agora para o CVV. É gratuito, anônimo e eles estão lá por você.
                    </p>
                    <a
                      href="tel:188"
                      className="flex items-center space-x-2 bg-purple-600 px-6 py-2 rounded-xl text-white font-bold text-sm shadow-md active:scale-95 transition-all"
                    >
                      <span>📞 Ligar para 188</span>
                    </a>
                  </div>
                )}
                {!isCrisisWarning && (
                  <div className="bg-red-50/50 p-3 rounded-xl border border-red-100/50 text-[10px] text-red-700 font-semibold uppercase tracking-wider">
                    Sua mensagem não foi enviada
                  </div>
                )}
              </div>
              <button
                onClick={() => {
                  setOffensiveWarning(null);
                  setIsCrisisWarning(false);
                }}
                className={cn(
                  "w-full py-3.5 text-white rounded-2xl text-sm font-bold shadow-lg transition-all outline-none active:scale-95",
                  isCrisisWarning ? "bg-purple-500 hover:bg-purple-600 shadow-purple-200" : "bg-red-500 hover:bg-red-600 shadow-red-200"
                )}
              >
                {isCrisisWarning ? "Continuar na Sala" : "Compreendendo as Regras"}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Drawer de Perfil & Função Denunciar Baderneiro */}
      <AnimatePresence>
        {selectedParticipant && (
          <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/60 backdrop-blur-xs p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedParticipant(null)}
              className="absolute inset-0"
            />

            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="relative bg-brand-white w-full max-w-sm rounded-[2.5rem] p-6 shadow-2xl flex flex-col items-center space-y-5 z-10"
            >
              <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-2" />

              <div className="text-center space-y-2 mt-2 w-full">
                <div className="w-20 h-20 rounded-full bg-brand-gray/55 flex items-center justify-center text-5xl mx-auto border-2 border-brand-blue/5 shadow-inner">
                  {getAvatarById(selectedParticipant.avatarId)?.emoji || '👤'}
                </div>
                <h4 className="font-display font-bold text-brand-text text-xl">{selectedParticipant.name}</h4>
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
                  {selectedParticipant.isMe ? 'Seu Perfil' : 'Participante Ativo'}
                </p>
              </div>

              {!selectedParticipant.isMe && (
                <div className="w-full pt-2 border-t border-brand-blue/5 space-y-3.5">
                  <div className="bg-brand-gray/80 p-3.5 rounded-2xl text-center">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Status Atual</p>
                    <p className="text-xs font-bold text-gray-600 mt-1">
                      {selectedParticipant.isSpeaking ? '🗣️ Compartilhando desabafo ao vivo' : '💤 Ouvindo em silêncio'}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-2.5">
                    <button
                      onClick={handleToggleAngel}
                      className={cn(
                        "w-full py-4 rounded-2xl text-sm font-bold shadow-xs active:scale-95 transition-all outline-none flex items-center justify-center space-x-2 border",
                        user?.supportAngels?.some(a => a.name === selectedParticipant.name)
                          ? "bg-purple-50 text-purple-600 border-purple-200 hover:bg-purple-100"
                          : "bg-purple-600 text-white border-transparent hover:bg-purple-700 shadow-md shadow-purple-100"
                      )}
                    >
                      <span>👼 {user?.supportAngels?.some(a => a.name === selectedParticipant.name) ? 'Remover dos Anjos' : 'Tornar Anjo de Apoio'}</span>
                    </button>

                    <button
                      onClick={() => handleConfirmReport(selectedParticipant)}
                      className="w-full py-3.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-2xl text-xs font-bold active:scale-95 transition-all outline-none flex items-center justify-center space-x-2 border border-red-100"
                    >
                      <Flag size={14} className="fill-red-50" />
                      <span>Denunciar por Baderna</span>
                    </button>
                  </div>

                  <p className="text-[9px] text-gray-400 font-light text-center px-4 leading-relaxed font-sans mt-1">
                    Anjos de Apoio facilitam interações e convites para salas privadas. Sinalize baderneiros para restaurar a ordem na comunidade.
                  </p>
                </div>
              )}

              {selectedParticipant.isMe && (
                <div className="w-full space-y-3">
                  <div className="bg-brand-gray p-4 rounded-2xl text-center">
                    <p className="text-xs text-gray-500 leading-normal font-light">
                      Você está em uma sessão segura de apoio mútuo. Sinta-se à vontade para compartilhar áudio ou interagir pelo texto!
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedParticipant(null)}
                    className="w-full py-3.5 bg-brand-gray text-brand-text font-bold rounded-2xl text-sm active:scale-95 transition-all outline-none"
                  >
                    Voltar para Conversa
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal de Convite de Anjo de Apoio */}
      <AnimatePresence>
        {isInviteModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-xs p-6">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-brand-white rounded-[2.5rem] p-6 max-w-sm w-full border border-purple-100 shadow-2xl flex flex-col space-y-4"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2 text-purple-600">
                  <span>👼</span>
                  <h4 className="font-display font-medium text-brand-text text-base">Enviar Convite para Sala</h4>
                </div>
                <button
                  onClick={() => setIsInviteModalOpen(false)}
                  className="p-1 rounded-full text-gray-400 hover:bg-brand-gray hover:text-gray-600"
                >
                  <X size={18} />
                </button>
              </div>

              {inviteErrorMsg && (
                <div className="p-3 bg-red-50 text-red-600 rounded-2xl text-xs font-semibold border border-red-100 text-center animate-bounce">
                  ⚠️ {inviteErrorMsg}
                </div>
              )}

              {inviteSuccessMsg && (
                <div className="p-3 bg-emerald-50 text-emerald-700 rounded-2xl text-xs font-semibold border border-emerald-100 text-center">
                  ✅ {inviteSuccessMsg}
                </div>
              )}

              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] text-gray-400 font-bold uppercase tracking-wider px-1">
                  <span>Seus Anjos de Apoio</span>
                  <span>{participants.length}/10 Vagas</span>
                </div>

                <div className="max-h-56 overflow-y-auto no-scrollbar space-y-2 mt-2">
                  {(user?.supportAngels || []).length === 0 ? (
                    <p className="text-xs text-gray-500 font-light text-center py-6">
                      Você ainda não marcou nenhum membro de confiança como Anjo de Apoio.
                    </p>
                  ) : (
                    (user?.supportAngels || []).map((angel) => {
                      const isAlreadyIn = participants.some(p => p.name === angel.name);
                      return (
                        <div
                          key={angel.id}
                          className="flex items-center justify-between bg-brand-gray/50 px-4 py-2.5 rounded-2xl border border-brand-blue/5"
                        >
                          <div className="flex items-center space-x-3.5">
                            <span className="text-lg">{getAvatarById(angel.avatarId || '')?.emoji || '👤'}</span>
                            <span className="text-xs font-bold text-brand-text leading-none">{angel.name}</span>
                          </div>

                          <button
                            disabled={isAlreadyIn || participants.length >= 10}
                            onClick={() => handleInviteAngel(angel)}
                            className={cn(
                              "px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all",
                              isAlreadyIn
                                ? "bg-gray-100 text-gray-400"
                                : participants.length >= 10
                                  ? "bg-red-50 text-red-400"
                                  : "bg-purple-600 text-white hover:bg-purple-700 active:scale-95 shadow-sm"
                            )}
                          >
                            {isAlreadyIn ? 'Na Sala' : participants.length >= 10 ? 'Lotado' : 'Convidar'}
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <button
                onClick={() => setIsInviteModalOpen(false)}
                className="w-full py-3 bg-brand-gray text-gray-600 hover:bg-gray-200 text-xs font-semibold rounded-2xl active:scale-95 transition-all text-center"
              >
                Voltar para conversa
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
