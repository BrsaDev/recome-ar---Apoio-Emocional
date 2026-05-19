import { useState, useRef, useEffect } from 'react';
import { ForumTopic, ForumPost, View } from '../types';
import { ArrowLeft, Send, ThumbsUp, MoreVertical, Share2 } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import ReactMarkdown from 'react-markdown';

const MOCK_TOPIC_DETAIL: ForumTopic = {
  id: '1',
  title: 'Como lidar com crises de ansiedade repentinas?',
  category: 'Ansiedade',
  authorName: 'Ana Clara',
  lastUpdate: Date.now(),
  repliesCount: 2,
  viewsCount: 156,
  posts: [
    {
      id: 'p1',
      authorName: 'Ana Clara',
      content: 'Ontem tive uma crise no meio do mercado e fiquei muito assustada. Alguém tem dicas de como se acalmar nessas horas? O que vocês fazem quando sentem que vão perder o controle?',
      timestamp: Date.now() - 1000 * 60 * 60,
      likes: 5
    },
    {
      id: 'p2',
      authorName: 'Dr. Ricardo',
      content: 'Olá Ana! Sinto muito que tenha passado por isso. Uma técnica excelente é o **5-4-3-2-1**: identifique 5 coisas que vê, 4 que pode tocar, 3 que ouve, 2 que sente o cheiro e 1 que pode sentir o gosto. Isso ajuda o cérebro a voltar para o presente.',
      timestamp: Date.now() - 1000 * 60 * 30,
      likes: 12
    },
    {
      id: 'p3',
      authorName: 'Maria Helena',
      content: 'Pra mim o que ajuda muito é levar sempre uma garrafinha de água gelada. O choque térmico me ajuda a "acordar" da crise.',
      timestamp: Date.now() - 1000 * 60 * 10,
      likes: 3
    }
  ]
};

interface Props {
  navigate: (view: View) => void;
  topicId: string;
}

export default function TopicDetail({ navigate, topicId }: Props) {
  const [topic, setTopic] = useState<ForumTopic>(MOCK_TOPIC_DETAIL);
  const [replyText, setReplyText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleSendReply = () => {
    if (!replyText.trim()) return;
    
    const newPost: ForumPost = {
      id: Date.now().toString(),
      authorName: 'Você',
      content: replyText,
      timestamp: Date.now(),
      likes: 0
    };

    setTopic(prev => ({
      ...prev,
      posts: [...prev.posts, newPost],
      repliesCount: prev.repliesCount + 1
    }));
    setReplyText('');
    
    setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTo({
          top: scrollRef.current.scrollHeight,
          behavior: 'smooth'
        });
      }
    }, 100);
  };

  return (
    <div className="flex flex-col h-full bg-brand-white">
      {/* Header */}
      <header className="h-20 bg-brand-white border-b border-brand-blue/10 px-6 flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center space-x-4">
          <button onClick={() => navigate('forum')} className="p-2 -ml-2 text-gray-400 active:scale-90 transition-transform">
            <ArrowLeft size={24} />
          </button>
          <div>
            <h3 className="font-display font-semibold text-brand-text leading-tight truncate max-w-[200px]">
              {topic.title}
            </h3>
            <p className="text-[10px] text-brand-blue font-bold uppercase tracking-widest leading-none mt-1">
              {topic.category}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <button className="p-2 text-gray-400">
            <Share2 size={20} />
          </button>
          <button className="p-2 text-gray-400">
            <MoreVertical size={20} />
          </button>
        </div>
      </header>

      {/* Content */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-6 py-6 space-y-8 no-scrollbar"
      >
        {topic.posts.map((post, index) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={cn(
              "flex flex-col space-y-3",
              index !== 0 && "pt-6 border-t border-brand-blue/5"
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue font-bold text-xs uppercase">
                  {post.authorName[0]}
                </div>
                <div>
                  <p className="text-sm font-bold text-brand-text leading-none">{post.authorName}</p>
                  <p className="text-[10px] text-gray-400 font-medium mt-1">
                    {new Date(post.timestamp).toLocaleString([], { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}
                  </p>
                </div>
              </div>
              <button className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-brand-gray text-gray-500 active:scale-95 transition-all">
                <ThumbsUp size={14} className={post.likes > 10 ? "text-brand-green fill-brand-green" : ""} />
                <span className="text-xs font-bold">{post.likes}</span>
              </button>
            </div>

            <div className="prose prose-sm max-w-none text-brand-text leading-relaxed pl-1">
              <ReactMarkdown>{post.content}</ReactMarkdown>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Input */}
      <footer className="p-6 bg-brand-white border-t border-brand-blue/10">
        <div className="flex items-end space-x-3">
          <div className="flex-1 bg-brand-gray rounded-2xl flex flex-col px-4 py-2 min-h-[48px]">
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Adicionar um comentário..."
              className="w-full bg-transparent border-none outline-none text-brand-text text-sm py-1 resize-none max-h-32 min-h-[24px]"
              rows={1}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = target.scrollHeight + 'px';
              }}
            />
          </div>
          <button
            onClick={handleSendReply}
            disabled={!replyText.trim()}
            className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-all",
              replyText.trim() ? "bg-brand-blue text-white" : "bg-gray-100 text-gray-400 outline-none"
            )}
          >
            <Send size={20} />
          </button>
        </div>
      </footer>
    </div>
  );
}
