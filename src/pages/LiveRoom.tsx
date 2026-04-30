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
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const isRecordingRef = useRef(false);

  const startRecording = async () => {
    if (isRecordingRef.current) return;
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') 
        ? 'audio/webm;codecs=opus' 
        : MediaRecorder.isTypeSupported('audio/webm')
          ? 'audio/webm'
          : 'audio/mp4';

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        if (audioChunksRef.current.length === 0) return;

        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        if (audioBlob.size < 500) return; // Diminuído o limite mínimo

        const audioUrl = URL.createObjectURL(audioBlob);
        
        const audioMsg: Message = {
          id: Date.now().toString(),
          text: '',
          audioUrl,
          sender: 'user',
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, audioMsg]);
        
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start(200); // Coletar dados a cada 200ms
      setIsRecording(true);
      isRecordingRef.current = true;
      setRecordingTime(0);
      
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (err) {
      console.error("Erro ao acessar microfone:", err);
      isRecordingRef.current = false;
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecordingRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      isRecordingRef.current = false;
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const handleSendMessage = (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text,
      sender: 'user',
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-full w-full flex flex-col bg-brand-white">
      {/* Header */}
      <header className="h-20 bg-brand-white border-b border-brand-blue/20 px-6 flex items-center justify-between z-10">
        <div className="flex items-center space-x-4">
          <button onClick={() => navigate('rooms')} className="p-2 -ml-2 text-gray-400">
            <ArrowLeft size={24} />
          </button>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-brand-blue/20 rounded-full flex items-center justify-center text-brand-blue">
              <Users size={20} />
            </div>
            <div>
              <h3 className="font-display font-semibold text-brand-text leading-tight">{roomName}</h3>
              <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">
                {gender === 'mixed' ? 'Mista' : gender === 'men' ? 'Homens' : 'Mulheres'}
              </p>
            </div>
          </div>
        </div>
        <button className="p-2 text-gray-400">
          <MoreHorizontal size={24} />
        </button>
      </header>

      {/* Chat Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-6 py-6 space-y-4 no-scrollbar"
      >
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "flex w-full",
              msg.sender === 'user' ? "justify-end" : "justify-start"
            )}
          >
            <div className={cn(
              "px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm transition-all overflow-hidden",
              msg.audioUrl ? "max-w-[85%] sm:max-w-[80%]" : "max-w-[75%]",
              msg.sender === 'user' 
                ? "bg-brand-green text-white rounded-tr-none" 
                : msg.sender === 'system'
                ? "bg-brand-gray text-gray-400 text-[11px] text-center w-full rounded-none tracking-tight uppercase"
                : "bg-brand-gray text-brand-text rounded-tl-none border border-brand-blue/5"
            )}>
              {msg.audioUrl ? (
                <AudioPlayer url={msg.audioUrl} />
              ) : (
                <ReactMarkdown>{msg.text}</ReactMarkdown>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Footer / Input */}
      <footer className="p-6 bg-brand-white border-t border-brand-blue/10">
        <div className="flex items-center space-x-3">
          {isRecording ? (
            <div className="flex-1 h-12 bg-red-50 rounded-2xl flex items-center justify-between px-4 animate-pulse">
              <div className="flex items-center space-x-2 text-red-500">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
                <span className="font-mono text-sm font-bold">{formatTime(recordingTime)}</span>
              </div>
              <span className="text-xs text-red-400 font-medium uppercase tracking-wider">Gravando...</span>
            </div>
          ) : (
            <div className="flex-1 bg-brand-gray rounded-2xl flex items-center px-4 py-1 min-h-[48px]">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(inputText)}
                placeholder="Falar na sala..."
                className="flex-1 bg-transparent border-none outline-none text-brand-text text-sm"
              />
            </div>
          )}
          
          <div className="flex items-center space-x-2">
            {!inputText.trim() || isRecording ? (
              <motion.button
                whileTap={{ scale: 0.9 }}
                onPointerDown={(e) => {
                  e.preventDefault();
                  startRecording();
                }}
                onPointerUp={(e) => {
                  e.preventDefault();
                  stopRecording();
                }}
                onPointerLeave={(e) => {
                  e.preventDefault();
                  stopRecording();
                }}
                className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-lg touch-none",
                  isRecording ? "bg-red-500 text-white scale-125" : "bg-brand-blue text-white"
                )}
                id="btn-record-audio"
              >
                <Mic size={20} />
              </motion.button>
            ) : (
              <button
                onClick={() => handleSendMessage(inputText)}
                className="w-12 h-12 rounded-full bg-brand-green text-white flex items-center justify-center shadow-lg"
                id="btn-send-room"
              >
                <Send size={20} />
              </button>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
