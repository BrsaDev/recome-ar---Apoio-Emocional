import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Message, View, RoomGender } from '../types';
import { Send, Mic, MicOff, ArrowLeft, MoreHorizontal, Users } from 'lucide-react';
import { cn } from '../lib/utils';
import ReactMarkdown from 'react-markdown';

interface Props {
  user: User | null;
  navigate: (view: View) => void;
  roomName: string;
  gender: RoomGender;
}

export default function LiveRoom({ user, navigate, roomName, gender }: Props) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: `Bem-vindo à sala ${roomName} (${gender === 'mixed' ? 'Mista' : gender === 'men' ? 'Apenas Homens' : 'Apenas Mulheres'}). Este é um ambiente seguro.`,
      sender: 'system',
      timestamp: Date.now(),
    },
    {
      id: '2',
      text: "Olá pessoal, alguém por aqui?",
      sender: 'ai', // Using 'ai' as placeholder for other users
      timestamp: Date.now() - 10000,
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

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
    
    // Simulate someone responding
    setTimeout(() => {
      const responses = [
        "Estou te ouvindo.",
        "Sinta-se à vontade para desabafar.",
        "Tudo bem, respira fundo.",
        "Estamos juntos nessa."
      ];
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: responses[Math.floor(Math.random() * responses.length)],
        sender: 'ai',
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    }, 2000);
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
        <div className="flex items-center space-x-2">
            <button 
                onClick={() => setIsAudioEnabled(!isAudioEnabled)}
                className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                    isAudioEnabled ? "bg-brand-green text-white" : "bg-gray-100 text-gray-400"
                )}
            >
                {isAudioEnabled ? <Mic size={20} /> : <MicOff size={20} />}
            </button>
            <button className="p-2 text-gray-400">
                <MoreHorizontal size={24} />
            </button>
        </div>
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
              "max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed",
              msg.sender === 'user' 
                ? "bg-brand-green text-white rounded-tr-none shadow-sm" 
                : msg.sender === 'system'
                ? "bg-brand-gray text-gray-400 text-[11px] text-center w-full rounded-none tracking-tight uppercase"
                : "bg-brand-gray text-brand-text rounded-tl-none border border-brand-blue/5"
            )}>
              <ReactMarkdown>{msg.text}</ReactMarkdown>
            </div>
          </motion.div>
        ))}
        {isAudioEnabled && (
           <div className="flex items-center justify-center py-2">
              <div className="flex items-center space-x-1.5 px-3 py-1 bg-brand-green/10 rounded-full">
                 <div className="flex space-x-0.5 items-end h-3">
                    {[1, 2, 3, 2, 1].map((h, i) => (
                       <motion.div 
                        key={i}
                        animate={{ height: ['40%', '100%', '40%'] }}
                        transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.1 }}
                        className="w-0.5 bg-brand-green"
                       />
                    ))}
                 </div>
                 <span className="text-[10px] font-bold text-brand-green uppercase">Áudio Ativo</span>
              </div>
           </div>
        )}
      </div>

      {/* Input */}
      <footer className="p-6 bg-brand-white border-t border-brand-blue/10">
        <div className="flex items-center space-x-3">
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
          <button
            onClick={() => handleSendMessage(inputText)}
            disabled={!inputText.trim()}
            className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center transition-all",
              inputText.trim() ? "bg-brand-green text-white" : "bg-gray-100 text-gray-400"
            )}
          >
            <Send size={20} />
          </button>
        </div>
      </footer>
    </div>
  );
}
