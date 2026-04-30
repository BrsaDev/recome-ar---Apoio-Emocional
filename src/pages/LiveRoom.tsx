import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Message, View, RoomGender } from '../types';
import { Send, Mic, MicOff, ArrowLeft, MoreHorizontal, Users, Play, Pause } from 'lucide-react';
import { cn } from '../lib/utils';
import ReactMarkdown from 'react-markdown';

interface Props {
  user: User | null;
  navigate: (view: View) => void;
  roomName: string;
  gender: RoomGender;
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

export default function LiveRoom({ user, navigate, roomName, gender }: Props) {
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
  const [participants, setParticipants] = useState([
    { id: '1', name: 'Você', isSpeaking: false, isMe: true },
    { id: '2', name: 'Ana', isSpeaking: true, isMe: false },
    { id: '3', name: 'Lucas', isSpeaking: false, isMe: false },
    { id: '4', name: 'Mari', isSpeaking: false, isMe: false },
    { id: '5', name: 'Pedro', isSpeaking: false, isMe: false },
    { id: '6', name: 'Carla', isSpeaking: false, isMe: false },
  ]);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Simulação de pessoas falando alternadamente
  useEffect(() => {
    const interval = setInterval(() => {
      setParticipants(prev => prev.map(p => {
        if (p.isMe) return { ...p, isSpeaking: isMicActive };
        // Randomly make someone else speak
        if (Math.random() > 0.8) return { ...p, isSpeaking: !p.isSpeaking };
        return p;
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, [isMicActive]);

  const toggleMic = () => {
    setIsMicActive(!isMicActive);
    setParticipants(prev => prev.map(p => p.isMe ? { ...p, isSpeaking: !isMicActive } : p));
  };

  const handleSendMessage = (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text,
      sender: 'user',
      senderName: 'Você',
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');

    setTimeout(() => {
      const activeSpeakers = participants.filter(p => !p.isMe);
      const speaker = activeSpeakers[Math.floor(Math.random() * activeSpeakers.length)];
      
      const responses = [
        "Estou aqui te ouvindo.",
        "Sinta-se à vontade para desabafar.",
        "Tudo bem, respira fundo.",
        "Estamos juntos nessa.",
        "Às vezes o silêncio também ajuda."
      ];

      const otherMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: responses[Math.floor(Math.random() * responses.length)],
        sender: 'ai',
        senderName: speaker.name,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, otherMsg]);
    }, 2000);
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
            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">
              Conexão em tempo real
            </p>
          </div>
        </div>
        <button className="p-2 text-gray-400">
          <MoreHorizontal size={24} />
        </button>
      </header>

      {/* Participants List */}
      <div className="bg-brand-gray/30 border-b border-brand-blue/5 py-4 shrink-0">
        <div className="flex space-x-4 px-6 overflow-x-auto no-scrollbar">
          {participants.map((p) => (
            <div key={p.id} className="flex flex-col items-center shrink-0 space-y-1 relative">
              <div className={cn(
                "w-14 h-14 rounded-full flex items-center justify-center text-lg font-display font-bold transition-all duration-500 relative",
                p.isSpeaking 
                  ? "ring-4 ring-brand-blue/30 scale-105 bg-brand-blue text-white shadow-lg" 
                  : "bg-white text-brand-blue border border-brand-blue/10"
              )}>
                {p.name[0]}
                
                {/* Speaking Indicator Dot */}
                <AnimatePresence>
                  {p.isSpeaking && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full border-2 border-brand-white flex items-center justify-center"
                    >
                      <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <span className={cn(
                "text-[10px] font-medium tracking-tight",
                p.isSpeaking ? "text-brand-blue font-bold" : "text-gray-400"
              )}>
                {p.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-6 py-6 space-y-4 no-scrollbar bg-brand-white"
      >
        {messages.map((msg) => (
          <div key={msg.id} className="flex flex-col space-y-1">
            {msg.sender !== 'system' && (
              <span className={cn(
                "text-[10px] font-medium px-2 mb-0.5",
                msg.sender === 'user' ? "text-right text-brand-green" : "text-left text-gray-400"
              )}>
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
                "px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm transition-all overflow-hidden max-w-[75%]",
                msg.sender === 'user' 
                  ? "bg-brand-green text-white rounded-tr-none" 
                  : msg.sender === 'system'
                  ? "bg-brand-gray text-gray-400 text-[11px] text-center w-full rounded-none tracking-tight uppercase"
                  : "bg-brand-gray text-brand-text rounded-tl-none border border-brand-blue/5"
              )}>
                <ReactMarkdown>{msg.text}</ReactMarkdown>
              </div>
            </motion.div>
          </div>
        ))}
      </div>

      {/* Footer / Input */}
      <footer className="p-6 bg-brand-white border-t border-brand-blue/10">
        <div className="flex items-center space-x-3">
          <div className="flex-1 bg-brand-gray rounded-2xl flex items-center px-4 py-1 min-h-[48px]">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(inputText)}
              placeholder="Escreva algo para o grupo..."
              className="flex-1 bg-transparent border-none outline-none text-brand-text text-sm"
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
    </div>
  );
}
