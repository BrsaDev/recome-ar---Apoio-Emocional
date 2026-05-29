import { useState, useRef, useEffect } from 'react';
import { ForumTopic, ForumPost, View, User } from '../types';
import { ArrowLeft, Send, MoreVertical, Share2, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import ReactMarkdown from 'react-markdown';
import { getAvatarById } from '../data/avatars';
import { hasOffensiveContent } from '../lib/moderation';

const REACTION_OPTIONS = [
  { type: 'like', emoji: '👍', label: 'Joinha' },
  { type: 'heart', emoji: '❤️', label: 'Coração' },
  { type: 'smile', emoji: '😊', label: 'Sorriso' },
  { type: 'sad', emoji: '😢', label: 'Triste' },
  { type: 'support', emoji: '🤗', label: 'Apoio' },
] as const;

interface Props {
  user: User | null;
  navigate: (view: View) => void;
  topicId: string;
  topics: ForumTopic[];
  onUpdateTopics: (updatedTopics: ForumTopic[]) => void;
  onUpdateUser?: (updatedUser: User) => void;
}

export default function TopicDetail({ user, navigate, topicId, topics, onUpdateTopics, onUpdateUser }: Props) {
  const [replyText, setReplyText] = useState('');
  const [openPickerPostId, setOpenPickerPostId] = useState<string | null>(null);
  const [offensiveWarning, setOffensiveWarning] = useState<string | null>(null);
  const [selectedMember, setSelectedMember] = useState<{ id: string; name: string; avatarId: string } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const topic = topics.find(t => t.id === topicId) || topics[0];

  // Increment views count on load
  useEffect(() => {
    if (topic) {
      const updatedTopics = topics.map(t => {
        if (t.id === topic.id) {
          return {
            ...t,
            viewsCount: t.viewsCount + 1
          };
        }
        return t;
      });
      // Silent update for view counts
      // To prevent component endless re-renders, update on mount
      localStorage.setItem('recomecar_forum_topics', JSON.stringify(updatedTopics));
    }
  }, [topicId]);

  if (!topic) {
    return (
      <div className="flex flex-col h-full bg-brand-white items-center justify-center p-6 text-center space-y-4">
        <span className="text-4xl">⚠️</span>
        <h4 className="font-display font-semibold text-brand-text">Tópico não encontrado</h4>
        <button onClick={() => navigate('forum')} className="text-brand-blue font-bold flex items-center space-x-1">
          <ArrowLeft size={16} />
          <span>Voltar para fórum</span>
        </button>
      </div>
    );
  }

  const handleSendReply = () => {
    if (!replyText.trim()) return;
    
    if (hasOffensiveContent(replyText)) {
      setOffensiveWarning("Mensagem sinalizada pelo sistema de moderação.");
      setReplyText('');
      return;
    }
    
    const newPost: ForumPost = {
      id: Date.now().toString(),
      authorName: user?.name || 'Viajante',
      authorAvatarId: user?.avatarId || 'm1',
      content: replyText.trim(),
      timestamp: Date.now(),
      likes: 0
    };

    const updatedTopics = topics.map(t => {
      if (t.id === topic.id) {
        return {
          ...t,
          repliesCount: t.repliesCount + 1,
          lastUpdate: Date.now(),
          posts: [...t.posts, newPost]
        };
      }
      return t;
    });

    onUpdateTopics(updatedTopics);
    setReplyText('');
    
    setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTo({
          top: scrollRef.current.scrollHeight,
          behavior: 'smooth'
        });
      }
    }, 120);
  };

  const handleReactToPost = (postId: string, reactionType: 'like' | 'heart' | 'smile' | 'sad' | 'support') => {
    const updatedTopics = topics.map(t => {
      if (t.id === topic.id) {
        return {
          ...t,
          posts: t.posts.map(p => {
            if (p.id === postId) {
              const currentReactions = p.reactions || {
                like: p.likes || 0,
                heart: 0,
                smile: 0,
                sad: 0,
                support: 0
              };
              
              const updatedReactions = {
                ...currentReactions,
                [reactionType]: (currentReactions[reactionType] ?? 0) + 1
              };

              // Sum all reactions for total count
              const newTotalLikes = Object.values(updatedReactions).reduce((sum, count) => sum + (count || 0), 0);

              return {
                ...p,
                reactions: updatedReactions,
                likes: newTotalLikes
              };
            }
            return p;
          })
        };
      }
      return t;
    });
    onUpdateTopics(updatedTopics);
  };

  return (
    <div className="flex flex-col h-full bg-brand-white relative">
      {/* Header */}
      <header className="h-20 bg-brand-white border-b border-brand-blue/10 px-6 flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center space-x-4 min-w-0 flex-1">
          <button onClick={() => navigate('forum')} className="p-2 -ml-2 text-gray-400 active:scale-90 transition-transform">
            <ArrowLeft size={24} />
          </button>
          <div className="min-w-0 flex-1">
            <h3 className="font-display font-semibold text-brand-text leading-tight truncate">
              {topic.title}
            </h3>
            <p className="text-[10px] text-brand-blue font-bold uppercase tracking-widest leading-none mt-1">
              {topic.category}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-1 shrink-0 ml-2">
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
        className="flex-1 overflow-y-auto px-6 py-6 space-y-8 no-scrollbar pb-24"
      >
        {topic.posts.map((post, index) => {
          const avatar = getAvatarById(post.authorAvatarId || '');
          const isCurrentUser = post.authorName === user?.name || post.authorName === 'Você';
          const postReactions = post.reactions || {
            like: post.likes || 0,
            heart: 0,
            smile: 0,
            sad: 0,
            support: 0
          };
          
          return (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={cn(
                "flex flex-col space-y-3",
                index !== 0 && "pt-6 border-t border-brand-blue/5"
              )}
            >
              <div className="flex items-center justify-between">
                <button
                  onClick={() => {
                    if (!isCurrentUser) {
                      setSelectedMember({
                        id: post.id,
                        name: post.authorName,
                        avatarId: post.authorAvatarId || 'm1'
                      });
                    }
                  }}
                  disabled={isCurrentUser}
                  className={cn(
                    "flex items-center space-x-3 text-left outline-none transition-transform",
                    !isCurrentUser && "cursor-pointer active:scale-98 group"
                  )}
                >
                  <div className={cn(
                    "w-9 h-9 rounded-full flex items-center justify-center text-sm shadow-xs border transition-colors",
                    isCurrentUser 
                      ? "bg-brand-green/10 border-brand-green/20" 
                      : "bg-brand-gray border-brand-blue/5 group-hover:border-purple-300"
                  )}>
                    {avatar?.emoji || post.authorName[0]}
                  </div>
                  <div>
                    <h5 className={cn(
                      "text-sm font-bold text-brand-text leading-none flex items-center gap-1.5 transition-colors",
                      !isCurrentUser && "group-hover:text-purple-600"
                    )}>
                      {isCurrentUser ? `${post.authorName} (Você)` : post.authorName}
                      {!isCurrentUser && user?.supportAngels?.some(a => a.name === post.authorName) && (
                        <span className="text-[10px]" title="Anjo de Apoio">👼</span>
                      )}
                    </h5>
                    <p className="text-[10px] text-gray-400 font-medium mt-1">
                      {new Date(post.timestamp).toLocaleString([], { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}
                    </p>
                  </div>
                </button>
              </div>

              <div className="prose prose-sm max-w-none text-brand-text leading-relaxed pl-1 text-[13.5px]">
                <ReactMarkdown>{post.content}</ReactMarkdown>
              </div>

              {/* Reactions Bar at the bottom of the content */}
              <div className="flex items-center justify-start pl-1 pt-1">
                <div className="flex items-center space-x-1.5 relative flex-wrap gap-y-1">
                  {/* List active ones first */}
                  {(Object.keys(postReactions) as Array<keyof typeof postReactions>).map((type) => {
                    const option = REACTION_OPTIONS.find((o) => o.type === type);
                    const count = postReactions[type] ?? 0;
                    if (count === 0 || !option) return null;
                    return (
                      <button
                        key={type}
                        onClick={() => handleReactToPost(post.id, type)}
                        className="inline-flex items-center bg-brand-gray/80 hover:bg-brand-gray border border-brand-blue/5 px-2 py-0.5 rounded-full text-xs transition-transform active:scale-95 text-gray-600 font-medium shadow-xs"
                        title={option.label}
                      >
                        <span className="text-xs leading-none">{option.emoji}</span>
                        <span className="text-[10px] text-gray-500 font-bold ml-1">{count}</span>
                      </button>
                    );
                  })}

                  {/* Add Picker Button */}
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenPickerPostId(openPickerPostId === post.id ? null : post.id);
                      }}
                      className={cn(
                        "w-6 h-6 rounded-full bg-brand-gray hover:bg-brand-gray/80 flex items-center justify-center text-[10px] text-gray-500 border border-brand-blue/5 active:scale-95 transition-all outline-none",
                        openPickerPostId === post.id && "bg-brand-blue/10 border-brand-blue/20 text-brand-blue font-semibold scale-105"
                      )}
                      title="Adicionar reação"
                    >
                      <span>+☺</span>
                    </button>

                    {/* Popover Bubble of Choices */}
                    {openPickerPostId === post.id && (
                      <div className="absolute left-0 bottom-full mb-2 bg-brand-white border border-brand-blue/10 rounded-2xl shadow-xl p-1 flex items-center space-x-1 z-30 animate-in fade-in slide-in-from-bottom-1 duration-100">
                        {REACTION_OPTIONS.map((option) => (
                          <button
                            key={option.type}
                            onClick={() => {
                              handleReactToPost(post.id, option.type);
                              setOpenPickerPostId(null);
                            }}
                            className="w-7 h-7 rounded-lg hover:bg-brand-gray active:scale-90 transition-transform flex items-center justify-center text-sm outline-none"
                            title={option.label}
                          >
                            {option.emoji}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Input */}
      <footer className="p-6 bg-brand-white border-t border-brand-blue/10 shrink-0">
        <div className="flex items-end space-x-3">
          <div className="flex-1 bg-brand-gray rounded-2xl flex flex-col px-4 py-2 min-h-[48px] justify-center">
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
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendReply();
                }
              }}
            />
          </div>
          <button
            onClick={handleSendReply}
            disabled={!replyText.trim()}
            className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-all outline-none shrink-0",
              replyText.trim() 
                ? "bg-brand-blue text-white shadow-brand-blue/20" 
                : "bg-gray-100 text-gray-400"
            )}
          >
            <Send size={18} />
          </button>
        </div>
      </footer>

      {/* Alerta de Bloqueio Preventivo */}
      <AnimatePresence>
        {offensiveWarning && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-6">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-brand-white rounded-[2.5rem] p-8 max-w-sm w-full border border-red-100 shadow-2xl flex flex-col items-center text-center space-y-5"
            >
              <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center text-red-500 shadow-sm animate-bounce">
                <ShieldAlert size={28} />
              </div>
              <div className="space-y-2">
                <h4 className="font-display font-bold text-red-600 text-lg">Bloqueio Preventivo</h4>
                <p className="text-xs text-brand-text/70 font-light leading-relaxed">
                  Para manter a comunidade um ambiente acolhedor, seguro e livre de agressões, comentários contendo palavras ofensivas e de baixo calão foram desativados de forma preventiva.
                </p>
                <div className="bg-red-50/50 p-3 rounded-xl border border-red-100/50 text-[10px] text-red-700 font-semibold uppercase tracking-wider">
                  Seu comentário não foi enviado
                </div>
              </div>
              <button
                onClick={() => setOffensiveWarning(null)}
                className="w-full py-3.5 bg-red-500 hover:bg-red-600 active:scale-95 text-white rounded-2xl text-sm font-bold shadow-lg shadow-red-200 transition-all outline-none"
              >
                Compreendendo as Regras
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Drawer de Perfil no Fórum */}
      <AnimatePresence>
        {selectedMember && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs p-4 overflow-hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedMember(null)}
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
                <div className="w-20 h-20 rounded-full bg-brand-gray/55 flex items-center justify-center text-5xl mx-auto border-2 border-brand-blue/5 shadow-inner animate-pulse">
                  {getAvatarById(selectedMember.avatarId)?.emoji || '👤'}
                </div>
                <h4 className="font-display font-bold text-brand-text text-xl">{selectedMember.name}</h4>
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
                  Membro Acolhedor
                </p>
              </div>

              <div className="w-full pt-2 border-t border-brand-blue/5 space-y-3.5">
                <button
                  onClick={() => {
                    if (!user || !onUpdateUser) return;
                    const currentAngels = user.supportAngels || [];
                    const exists = currentAngels.some(a => a.name === selectedMember.name);
                    
                    let updatedAngels;
                    if (exists) {
                      updatedAngels = currentAngels.filter(a => a.name !== selectedMember.name);
                    } else {
                      updatedAngels = [
                        ...currentAngels,
                        {
                          id: Date.now().toString(),
                          name: selectedMember.name,
                          avatarId: selectedMember.avatarId
                        }
                      ];
                    }
                    
                    onUpdateUser({
                      ...user,
                      supportAngels: updatedAngels
                    });
                    setSelectedMember(null);
                  }}
                  className={cn(
                    "w-full py-4 rounded-2xl text-xs font-bold shadow-xs active:scale-95 transition-all outline-none flex items-center justify-center space-x-2 border",
                    user?.supportAngels?.some(a => a.name === selectedMember.name)
                      ? "bg-purple-50 text-purple-600 border-purple-200"
                      : "bg-purple-600 text-white border-transparent hover:bg-purple-700 shadow-md shadow-purple-100"
                  )}
                >
                  <span>👼 {user?.supportAngels?.some(a => a.name === selectedMember.name) ? 'Remover dos Anjos de Apoio' : 'Tornar Anjo de Apoio'}</span>
                </button>

                <button
                  onClick={() => setSelectedMember(null)}
                  className="w-full py-3 bg-brand-gray text-gray-500 rounded-2xl text-xs font-bold hover:bg-gray-200 active:scale-95 transition-all outline-none"
                >
                  Voltar para o fórum
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
