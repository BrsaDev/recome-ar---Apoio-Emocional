import { useState, useRef, useEffect } from 'react';
import { ForumTopic, ForumPost, View, User } from '../types';
import { ArrowLeft, Send, MoreVertical, Share2, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import ReactMarkdown from 'react-markdown';
import { getAvatarById } from '../data/avatars';
import { analyzeContent } from '../lib/moderation';
import { apiService } from '../services/api';
import { Heart } from 'lucide-react';

const REACTION_OPTIONS = [
  { type: 'like', emoji: '👍', label: 'Joinha' },
  { type: 'heart', emoji: '❤️', label: 'Coração' },
  { type: 'smile', emoji: '😊', label: 'Sorriso' },
  { type: 'sad', emoji: '😢', label: 'Triste' },
  { type: 'support', emoji: '🤗', label: 'Apoio' },
] as const;

interface Props {
  user: User | null;
  navigate: (view: View, state?: any) => void;
  topicId: string;
  postId?: string | null;
  topics: ForumTopic[];
  onUpdateTopics: (updatedTopics: ForumTopic[]) => void;
  onUpdateUser?: (updatedUser: User) => void;
}

export default function TopicDetail({ user, navigate, topicId, postId, topics, onUpdateTopics, onUpdateUser }: Props) {
  const [replyText, setReplyText] = useState('');
  const [openPickerPostId, setOpenPickerPostId] = useState<string | null>(null);
  const [offensiveWarning, setOffensiveWarning] = useState<string | null>(null);
  const [selectedMember, setSelectedMember] = useState<{ id: string; name: string; avatarId: string } | null>(null);
  const [isCrisisWarning, setIsCrisisWarning] = useState<boolean>(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const topic = topics.find(t => t.id === topicId) || topics[0];

  // Scroll exactly to comment if a postId is passed (e.g. from Profile dashboard comments page)
  useEffect(() => {
    if (postId && topic) {
      const timer = setTimeout(() => {
        const element = document.getElementById(`post-${postId}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });

          // Apply a gentle pulse background highlight to guide user attention
          element.classList.add('bg-purple-500/10', 'ring-2', 'ring-purple-500/20', 'scale-[1.01]', 'shadow-xs');

          const removeTimer = setTimeout(() => {
            element.classList.remove('bg-purple-500/10', 'ring-2', 'ring-purple-500/20', 'scale-[1.01]', 'shadow-xs');
          }, 2500);

          return () => clearTimeout(removeTimer);
        }
      }, 400); // 400ms provides enough space for page transition and rendering to complete smoothly
      return () => clearTimeout(timer);
    }
  }, [postId, topicId, topic]);

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
      <div className="flex flex-col h-full bg-[#020410] items-center justify-center p-6 text-center space-y-4">
        <span className="text-4xl">⚠️</span>
        <h4 className="font-display font-semibold text-white">Tópico não encontrado</h4>
        <button onClick={() => navigate('forum')} className="text-purple-400 font-bold flex items-center space-x-1 cursor-pointer">
          <ArrowLeft size={16} />
          <span>Voltar para fórum</span>
        </button>
      </div>
    );
  }

  const handleSendReply = () => {
    if (!replyText.trim()) return;

    const modResult = analyzeContent(replyText);
    if (modResult !== 'safe') {
      setIsCrisisWarning(modResult === 'crisis');
      if (modResult === 'crisis') {
        setOffensiveWarning(
          "Detectamos palavras sensíveis no seu comentário. Sua presença é fundamental aqui. O CVV está à disposição 24h para te apoiar."
        );
      } else {
        setOffensiveWarning("Seu comentário foi sinalizado pelo sistema de moderação por conter termos ofensivos.");
      }
      setReplyText('');
      return;
    }

    const USE_API = (import.meta as any).env?.VITE_USE_API === 'true';

    if (USE_API) {
      apiService.forum.reply(topic.id, {
        id: '',
        authorName: user?.nickname || user?.name || 'Viajante',
        authorAvatarId: user?.avatarId || 'm1',
        content: replyText.trim(),
        timestamp: Date.now(),
        likes: 0
      }).then(() => {
        // After reply, we might want to refresh the whole topic
        // For now, we'll wait for App.tsx state sync
        setReplyText('');
      }).catch(err => {
        console.error('[Forum API] Reply failed:', err);
      });
    } else {
      const newPost: ForumPost = {
        id: Date.now().toString(),
        authorName: user?.nickname || user?.name || 'Viajante',
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
    }

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
    const USE_API = (import.meta as any).env?.VITE_USE_API === 'true';

    if (USE_API) {
      apiService.forum.react(topic.id, postId, reactionType).catch(err => {
        console.error('[Forum API] React failed:', err);
      });
      // OPTIONAL: Optimistic update local state if needed
    }

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
    <div className="flex flex-col h-full bg-[#020410] relative text-white">
      {/* Header */}
      <header className="h-20 bg-[#020410]/95 backdrop-blur-md border-b border-white/5 px-6 flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center space-x-4 min-w-0 flex-1">
          <button onClick={() => navigate('forum')} className="p-2 -ml-2 text-gray-400 hover:text-white active:scale-90 transition-all cursor-pointer">
            <ArrowLeft size={24} />
          </button>
          <div className="min-w-0 flex-1">
            <h3 className="font-display font-semibold text-white leading-tight truncate">
              {topic.title}
            </h3>
            <p className="text-[10px] text-purple-400 font-bold uppercase tracking-widest leading-none mt-1">
              {topic.category}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-1 shrink-0 ml-2">
          <button className="p-2 text-gray-500 hover:text-white transition-colors cursor-pointer">
            <Share2 size={20} />
          </button>
          <button className="p-2 text-gray-500 hover:text-white transition-colors cursor-pointer">
            <MoreVertical size={20} />
          </button>
        </div>
      </header>

      {topic.scheduledDeletionTime && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-6 py-3 flex items-start space-x-2.5 shrink-0 z-10 animate-in fade-in slide-in-from-top-1" id="topic-scheduled-deletion-banner">
          <span className="text-amber-400 shrink-0 text-base">⚠️</span>
          <div className="flex-1">
            <span className="text-xs font-bold text-amber-300 block leading-tight">Exclusão Agendada pelo Autor</span>
            <p className="text-[10px] text-amber-400 leading-normal mt-0.5 font-light">
              Este tópico e todas as suas respostas estão agendados para expiração permanente em 24 horas a pedido do autor. O envio de novos comentários foi suspenso.
            </p>
          </div>
        </div>
      )}

      {/* Content */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-6 py-6 space-y-8 no-scrollbar pb-24"
      >
        {topic.posts.map((post, index) => {
          const avatar = getAvatarById(post.authorAvatarId || '');
          const isCurrentUser = post.authorName === (user?.nickname || user?.name) || post.authorName === 'Você';
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
              id={`post-${post.id}`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={cn(
                "flex flex-col space-y-3 transition-all duration-500 rounded-2xl p-3.5 -m-3.5",
                index !== 0 && "pt-6 border-t border-white/5"
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
                      ? "bg-emerald-500/10 border-emerald-500/20"
                      : "bg-[#12182b] border-white/10 group-hover:border-purple-500/40"
                  )}>
                    {avatar?.emoji || post.authorName[0]}
                  </div>
                  <div>
                    <h5 className={cn(
                      "text-sm font-bold text-white leading-none flex items-center gap-1.5 transition-colors",
                      !isCurrentUser && "group-hover:text-purple-400"
                    )}>
                      {isCurrentUser ? `${post.authorName} (Você)` : post.authorName}
                      {!isCurrentUser && user?.supportAngels?.some(a => a.name === post.authorName) && (
                        <span className="text-[10px]" title="Anjo de Apoio">👼</span>
                      )}
                    </h5>
                    <p className="text-[10px] text-gray-550 font-medium mt-1">
                      {new Date(post.timestamp).toLocaleString([], { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}
                    </p>
                  </div>
                </button>
              </div>

              <div className="prose prose-sm prose-invert max-w-none text-gray-100 leading-relaxed pl-1 text-[13.5px]">
                {post.isDeleted ? (
                  <span className="text-gray-500 italic text-[11.5px] leading-normal bg-[#12182b] px-3.5 py-2.5 rounded-2xl border border-white/5 block w-full">
                    🚫 Este comentário foi removido pelo autor.
                  </span>
                ) : (
                  <ReactMarkdown>{post.content}</ReactMarkdown>
                )}
              </div>

              {/* Reactions Bar at the bottom of the content */}
              {!post.isDeleted && (
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
                          className="inline-flex items-center bg-[#12182b] hover:bg-[#1a2235] border border-white/10 px-2 py-0.5 rounded-full text-xs transition-transform active:scale-95 text-gray-300 font-medium shadow-xs cursor-pointer"
                          title={option.label}
                        >
                          <span className="text-xs leading-none">{option.emoji}</span>
                          <span className="text-[10px] text-gray-400 font-bold ml-1">{count}</span>
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
                          "w-6 h-6 rounded-full bg-[#12182b] hover:bg-[#1a2235] flex items-center justify-center text-[10px] text-gray-500 border border-white/10 active:scale-95 transition-all outline-none cursor-pointer",
                          openPickerPostId === post.id && "bg-purple-500/10 border-purple-500/30 text-purple-400 font-semibold scale-105"
                        )}
                        title="Adicionar reação"
                      >
                        <span>+☺</span>
                      </button>

                      {/* Popover Bubble of Choices */}
                      {openPickerPostId === post.id && (
                        <div className="absolute left-0 bottom-full mb-2 bg-[#0a0f1f]/95 backdrop-blur-sm border border-white/10 rounded-2xl shadow-xl p-1 flex items-center space-x-1 z-30 animate-in fade-in slide-in-from-bottom-1 duration-100">
                          {REACTION_OPTIONS.map((option) => (
                            <button
                              key={option.type}
                              onClick={() => {
                                handleReactToPost(post.id, option.type);
                                setOpenPickerPostId(null);
                              }}
                              className="w-7 h-7 rounded-lg hover:bg-white/10 active:scale-90 transition-transform flex items-center justify-center text-sm outline-none cursor-pointer"
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
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Input */}
      {topic.scheduledDeletionTime ? (
        <footer className="p-6 bg-amber-500/5 border-t border-amber-500/15 shrink-0 text-center space-y-1">
          <p className="text-xs text-amber-400 font-bold flex items-center justify-center gap-1.5">
            🔒 Novos comentários suspensos
          </p>
          <p className="text-[10px] text-amber-500 font-light">
            Este tópico foi agendado para exclusão pelo autor e está em modo de apenas leitura.
          </p>
        </footer>
      ) : (
        <footer className="p-4 px-6 bg-[#020410]/95 backdrop-blur-md border-t border-white/5 shrink-0">
          <div className="flex items-end space-x-3">
            <div className="flex-1 bg-[#12182b] border border-white/10 rounded-2xl flex flex-col px-4 py-2 min-h-[48px] justify-center focus-within:border-purple-500/40 transition-colors">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Adicionar um comentário..."
                className="w-full bg-transparent border-none outline-none text-white placeholder-gray-550 text-sm py-1 resize-none max-h-32 min-h-[24px]"
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
                "w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-all outline-none shrink-0 cursor-pointer",
                replyText.trim()
                  ? "bg-gradient-to-br from-purple-600 to-indigo-600 text-white shadow-neon-purple"
                  : "bg-white/5 text-gray-600 border border-white/5"
              )}
            >
              <Send size={18} />
            </button>
          </div>
        </footer>
      )}

      {/* Alerta de Bloqueio Preventivo */}
      <AnimatePresence>
        {offensiveWarning && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-6">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={cn(
                "bg-[#0a0f1f]/95 rounded-[2.5rem] p-8 max-w-sm w-full shadow-xl flex flex-col items-center text-center space-y-5 border",
                isCrisisWarning ? "border-purple-500/25 shadow-neon-purple" : "border-red-500/25"
              )}
            >
              <div className={cn(
                "w-14 h-14 rounded-full flex items-center justify-center shadow-sm animate-bounce",
                isCrisisWarning ? "bg-purple-500/10 border border-purple-500/25 text-purple-400" : "bg-red-500/10 border border-red-500/25 text-[#ff4a5a]"
              )}>
                {isCrisisWarning ? <Heart size={28} /> : <ShieldAlert size={28} />}
              </div>
              <div className="space-y-2">
                <h4 className={cn(
                  "font-display font-bold text-lg",
                  isCrisisWarning ? "text-purple-300" : "text-[#ff4a5a]"
                )}>
                  {isCrisisWarning ? "Você não está sozinho" : "Bloqueio Preventivo"}
                </h4>
                <p className="text-xs text-gray-300 font-light leading-relaxed">
                  {offensiveWarning}
                </p>
                {isCrisisWarning && (
                  <div className="bg-purple-500/10 p-4 rounded-2xl border border-purple-500/20 flex flex-col items-center space-y-3">
                    <p className="text-[11px] text-purple-200 font-semibold leading-tight">
                      Ligue para o CVV 188 agora. É gratuito, seguro e eles estão lá por você.
                    </p>
                    <a
                      href="tel:188"
                      className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-2 rounded-xl text-white font-bold text-sm shadow-neon-purple active:scale-95 transition-all outline-none"
                    >
                      <span>📞 Ligar para 188</span>
                    </a>
                  </div>
                )}
                {!isCrisisWarning && (
                  <div className="bg-red-500/10 p-3 rounded-xl border border-red-500/20 text-[10px] text-[#ff4a5a] font-semibold uppercase tracking-wider">
                    Seu comentário não foi enviado
                  </div>
                )}
              </div>
              <button
                onClick={() => {
                  setOffensiveWarning(null);
                  setIsCrisisWarning(false);
                }}
                className={cn(
                  "w-full py-3.5 text-white rounded-2xl text-sm font-bold shadow-lg transition-all outline-none active:scale-95 cursor-pointer",
                  isCrisisWarning ? "bg-gradient-to-r from-purple-600 to-indigo-600 shadow-neon-purple" : "bg-[#ff4a5a] hover:bg-[#ff5c6c]"
                )}
              >
                {isCrisisWarning ? "Voltar ao Tópico" : "Compreendendo as Regras"}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Drawer de Perfil no Fórum */}
      <AnimatePresence>
        {selectedMember && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 backdrop-blur-sm p-4 overflow-hidden">
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
              className="relative bg-[#0a0f1f]/95 backdrop-blur-sm w-full max-w-sm rounded-[2.5rem] p-6 shadow-neon-purple shadow-xl flex flex-col items-center space-y-5 z-10 border border-white/5"
            >
              <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-2" />

              <div className="text-center space-y-2 mt-2 w-full">
                <div className="w-20 h-20 rounded-full bg-[#12182b] flex items-center justify-center text-5xl mx-auto border-2 border-purple-500/20 shadow-inner animate-pulse">
                  {getAvatarById(selectedMember.avatarId)?.emoji || '👤'}
                </div>
                <h4 className="font-display font-bold text-white text-xl">{selectedMember.name}</h4>
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">
                  Membro Acolhedor
                </p>
              </div>

              <div className="w-full pt-2 border-t border-white/5 space-y-3.5">
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
                    "w-full py-4 rounded-2xl text-xs font-bold shadow-xs active:scale-95 transition-all outline-none flex items-center justify-center space-x-2 border cursor-pointer",
                    user?.supportAngels?.some(a => a.name === selectedMember.name)
                      ? "bg-purple-500/10 text-purple-400 border-purple-500/25"
                      : "bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-transparent shadow-neon-purple"
                  )}
                >
                  <span>👼 {user?.supportAngels?.some(a => a.name === selectedMember.name) ? 'Remover dos Anjos de Apoio' : 'Tornar Anjo de Apoio'}</span>
                </button>

                <button
                  onClick={() => setSelectedMember(null)}
                  className="w-full py-3 bg-white/5 border border-white/5 text-white rounded-2xl text-xs font-bold hover:bg-white/10 active:scale-95 transition-all outline-none cursor-pointer"
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
