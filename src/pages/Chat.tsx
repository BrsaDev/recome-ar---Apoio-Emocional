import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Message, View } from '../types';
import { Send, Mic, ArrowLeft, MoreHorizontal, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';
import { chatWithAI } from '../services/gemini';
import ReactMarkdown from 'react-markdown';

interface Props {
  user: User | null;
  navigate: (view: View) => void;
}

export default function Chat({ user, navigate }: Props) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: `Olá ${user?.name || ''}, eu sou sua IA de apoio. Como você está se sentindo agora? Pode desabafar, estou aqui para te ouvir.`,
      sender: 'ai',
      timestamp: Date.now(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const quickReplies = [
    "Quero desabafar",
    "Estou com ansiedade",
    "Só preciso de alguém",
    "Obrigado pelo apoio"
  ];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text,
      sender: 'user',
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    try {
      const history = messages.map(m => ({
        role: m.sender === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }]
      }));

      const aiResponse = await chatWithAI(text, history);
      
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        sender: 'ai',
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (error) {
      console.error(error);
      const errorMsg: Message = {
        id: 'error',
        text: "Desculpe, tive um probleminha. Pode tentar de novo?",
        sender: 'system',
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="h-full w-full flex flex-col bg-brand-white">
      {/* Header */}
      <header className="h-20 bg-brand-white border-b border-brand-blue/20 px-6 flex items-center justify-between z-10">
        <div className="flex items-center space-x-4">
          <button onClick={() => navigate('home')} className="p-2 -ml-2 text-gray-400">
            <ArrowLeft size={24} />
          </button>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-brand-green/20 rounded-full flex items-center justify-center text-brand-green">
              <Sparkles size={20} />
            </div>
            <div>
              <h3 className="font-display font-semibold text-brand-text">Apoio IA</h3>
              <p className="text-[10px] text-brand-green font-medium uppercase tracking-widest">Online</p>
            </div>
          </div>
        </div>
        <button className="p-2 text-gray-400">
          <MoreHorizontal size={24} />
        </button>
      </header>

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-6 py-6 space-y-6 no-scrollbar"
      >
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={cn(
                "flex w-full mb-2",
                msg.sender === 'user' ? "justify-end" : "justify-start"
              )}
            >
              <div className={cn(
                "max-w-[85%] px-5 py-3 rounded-[2rem] text-sm leading-relaxed shadow-sm",
                msg.sender === 'user' 
                  ? "bg-brand-green text-white rounded-tr-none" 
                  : msg.sender === 'system'
                  ? "bg-red-50 text-red-500 rounded-none italic text-center w-full"
                  : "bg-brand-gray text-brand-text rounded-tl-none border border-brand-blue/10"
              )}>
                <ReactMarkdown>{msg.text}</ReactMarkdown>
              </div>
            </motion.div>
          ))}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="bg-brand-gray px-5 py-3 rounded-[2rem] rounded-tl-none border border-brand-blue/10">
                <div className="flex space-x-1">
                  <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                  <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                  <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer / Input Area */}
      <footer className="p-6 bg-brand-white border-t border-brand-blue/10 space-y-4">
        {/* Quick Replies */}
        <div className="flex overflow-x-auto no-scrollbar space-x-2 -mx-2 px-2">
          {quickReplies.map((text) => (
            <button
              key={text}
              onClick={() => handleSendMessage(text)}
              className="whitespace-nowrap px-4 py-2 bg-brand-blue/10 text-blue-600 rounded-full text-xs font-medium border border-brand-blue/20"
            >
              {text}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex-1 bg-brand-gray rounded-[2rem] flex items-center px-5 py-1 min-h-[56px] border border-brand-blue/5">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(inputText)}
              placeholder="Escreva o que está sentindo..."
              className="flex-1 bg-transparent border-none outline-none text-brand-text py-3"
              id="input-chat"
            />
            <button className="text-gray-400 ml-2">
              <Mic size={22} />
            </button>
          </div>
          <button
            onClick={() => handleSendMessage(inputText)}
            disabled={!inputText.trim()}
            className={cn(
              "w-14 h-14 rounded-full flex items-center justify-center transition-all",
              inputText.trim() ? "bg-brand-green text-white shadow-lg shadow-brand-green/20" : "bg-gray-100 text-gray-400"
            )}
            id="btn-chat-send"
          >
            <Send size={24} />
          </button>
        </div>
      </footer>
    </div>
  );
}
