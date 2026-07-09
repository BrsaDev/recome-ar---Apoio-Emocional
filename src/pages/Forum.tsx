import { useState } from 'react';
import { ForumTopic, ForumPost, View, User } from '../types';
import { MessageSquare, Eye, Plus, Search, ChevronRight, X, ThumbsUp, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { getAvatarById } from '../data/avatars';
import { analyzeContent } from '../lib/moderation';
import { apiService } from '../services/api';
import { Heart } from 'lucide-react';

const CATEGORIES = ['Tudos', 'Ansiedade', 'Solidão', 'Recomeço', 'Relacionamento'];
const SUBMITTABLE_CATEGORIES = ['Ansiedade', 'Solidão', 'Recomeço', 'Relacionamento'];

interface Props {
  user: User | null;
  navigate: (view: View, state?: any) => void;
  topics: ForumTopic[];
  onUpdateTopics: (updatedTopics: ForumTopic[]) => void;
}

export default function Forum({ user, navigate, topics, onUpdateTopics }: Props) {
  const [selectedCategory, setSelectedCategory] = useState('Tudos');
  const [searchQuery, setSearchQuery] = useState('');

  // New topic modal state
  const [isNewTopicOpen, setIsNewTopicOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Ansiedade');
  const [newContent, setNewContent] = useState('');
  const [offensiveWarning, setOffensiveWarning] = useState<string | null>(null);
  const [isCrisisWarning, setIsCrisisWarning] = useState<boolean>(false);

  const filteredTopics = topics.filter(topic => {
    const matchesCategory = selectedCategory === 'Tudos' || topic.category === selectedCategory;
    const matchesSearch = topic.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCreateTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const modTitle = analyzeContent(newTitle);
    const modContent = analyzeContent(newContent);
    const modResult = modTitle !== 'safe' ? modTitle : modContent;

    if (modResult !== 'safe') {
      setIsCrisisWarning(modResult === 'crisis');
      if (modResult === 'crisis') {
        setOffensiveWarning(
          "Detectamos palavras sensíveis no seu tópico. Sua vida é muito importante. O CVV está disponível 24h para te ouvir com carinho e sigilo."
        );
      } else {
        setOffensiveWarning("Conteúdo sinalizado pelo sistema de moderação por conter termos ofensivos.");
      }
      return;
    }

    const USE_API = (import.meta as any).env?.VITE_USE_API === 'true';

    if (USE_API) {
      apiService.forum.createTopic({
        id: '', // Backend generates ID
        title: newTitle.trim(),
        category: newCategory,
        content: newContent,
        authorName: user?.nickname || user?.name || 'Viajante',
        authorAvatarId: user?.avatarId || 'm1',
        lastUpdate: Date.now(),
        repliesCount: 0,
        viewsCount: 1,
        posts: []
      } as any).then((topic) => {
        // Refresh topics via App.tsx callback if provided
        // We'll rely on App.tsx fetching logic later
        setNewTitle('');
        setNewContent('');
        setNewCategory('Ansiedade');
        setIsNewTopicOpen(false);
      }).catch(err => {
        console.error('[Forum API] Create topic failed:', err);
      });
    } else {
      const newTopicId = (topics.length + 1).toString();
      const newTopicPost: ForumPost = {
        id: `p_${newTopicId}_1`,
        authorName: user?.nickname || user?.name || 'Viajante',
        authorAvatarId: user?.avatarId || 'm1',
        content: newContent,
        timestamp: Date.now(),
        likes: 0
      };

      const newTopic: ForumTopic = {
        id: newTopicId,
        title: newTitle.trim(),
        category: newCategory,
        authorName: user?.nickname || user?.name || 'Viajante',
        authorAvatarId: user?.avatarId || 'm1',
        lastUpdate: Date.now(),
        repliesCount: 0,
        viewsCount: 1,
        posts: [newTopicPost]
      };

      onUpdateTopics([newTopic, ...topics]);
      setNewTitle('');
      setNewContent('');
      setNewCategory('Ansiedade');
      setIsNewTopicOpen(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#020410] relative">
      {/* Header */}
      <header className="bg-[#0a0f1f]/90 backdrop-blur-sm px-6 pt-12 pb-6 shrink-0 border-b border-white/5">
        <h1 className="font-display text-2xl font-bold text-white mb-1">Comunidade</h1>
        <p className="text-gray-500 text-sm mb-6">Um espaço seguro para compartilhar e aprender.</p>

        {/* Search */}
        <div className="relative mb-5">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
          <input
            type="text"
            placeholder="Buscar tópicos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/5 pl-11 pr-4 py-3 rounded-2xl text-sm text-white placeholder-gray-600 focus:border-purple-500/30 focus:ring-1 focus:ring-purple-500/20 transition-all outline-none"
          />
        </div>

        {/* Categories */}
        <div className="flex space-x-2 overflow-x-auto no-scrollbar -mx-2 px-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all outline-none cursor-pointer",
                selectedCategory === cat
                  ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-900/30"
                  : "bg-white/5 text-gray-400 hover:text-white border border-white/5"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </header>

      {/* Topics List */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-3 no-scrollbar pb-24">
        {filteredTopics.length === 0 ? (
          <div className="text-center py-16 text-gray-500 space-y-3">
            <span className="text-4xl block">💬</span>
            <p className="text-sm font-medium text-gray-400">Nenhum tópico encontrado.</p>
            <p className="text-xs text-gray-600">Seja o primeiro a criar um tópico nessa categoria!</p>
          </div>
        ) : (
          filteredTopics.map((topic, index) => {
            const authorAvatar = getAvatarById(topic.authorAvatarId || 'm1');
            const totalLikes = topic.posts ? topic.posts.reduce((sum, post) => sum + (post.likes || 0), 0) : 0;
            return (
              <motion.div
                key={topic.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => navigate('topic-detail', { topicId: topic.id })}
                className="glass-card p-5 rounded-[1.75rem] border border-white/5 hover:border-purple-500/20 active:scale-[0.98] transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 bg-cyan-400/10 px-2.5 py-1 rounded-full border border-cyan-400/15">
                      {topic.category}
                    </span>
                    <span className="text-[10px] text-gray-500 font-medium">
                      {new Date(topic.lastUpdate).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="text-white font-semibold text-sm mb-4 leading-snug">
                    {topic.title}
                  </h3>
                </div>

                <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/5">
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1 bg-white/5 px-2 py-1 rounded-lg border border-white/5">
                      <MessageSquare size={11} className="text-purple-400" />
                      <span className="text-xs font-bold text-gray-400">{topic.repliesCount}</span>
                    </div>
                    <div className="flex items-center space-x-1 bg-white/5 px-2 py-1 rounded-lg border border-white/5">
                      <Eye size={11} className="text-orange-400" />
                      <span className="text-xs font-bold text-gray-400">{topic.viewsCount}</span>
                    </div>
                    <div className="flex items-center space-x-1 bg-white/5 px-2 py-1 rounded-lg border border-white/5">
                      <ThumbsUp size={11} className="text-cyan-400" />
                      <span className="text-xs font-bold text-gray-400">{totalLikes}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1.5 bg-white/5 px-2.5 py-1.5 rounded-full border border-white/5 shrink-0 max-w-[150px]">
                    <span className="text-sm leading-none shrink-0">{authorAvatar?.emoji || '👤'}</span>
                    <span className="text-[10px] font-bold text-gray-400 truncate">{topic.authorName}</span>
                    <ChevronRight size={10} className="text-purple-400 shrink-0" />
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Floating Action Button */}
      <button
        onClick={() => setIsNewTopicOpen(true)}
        className="fixed bottom-24 right-6 w-14 h-14 bg-gradient-to-br from-purple-600 to-indigo-600 text-white rounded-full flex items-center justify-center shadow-xl shadow-purple-900/40 active:scale-90 transition-transform z-20 border border-purple-500/25"
        id="btn-new-topic"
        title="Criar novo tópico"
      >
        <Plus size={26} />
      </button>

      {/* New Topic Drawer Modal */}
      <AnimatePresence>
        {isNewTopicOpen && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsNewTopicOpen(false)}
              className="absolute inset-0"
            />

            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="relative w-full max-w-sm bg-[#12182b]/97 rounded-t-[2.5rem] border-t border-x border-purple-500/15 shadow-2xl flex flex-col p-6 overflow-hidden z-10"
              style={{ maxHeight: '85vh' }}
            >
              <div className="w-12 h-1 bg-white/10 rounded-full mx-auto mb-5 shrink-0" />

              <div className="flex items-center justify-between mb-5 shrink-0">
                <div>
                  <h3 className="font-display font-bold text-lg text-white">Novo Tópico</h3>
                  <p className="text-xs text-gray-500 font-light mt-0.5">Publique um desabafo ou dúvida de forma anônima.</p>
                </div>
                <button
                  onClick={() => setIsNewTopicOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white transition-all outline-none cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleCreateTopic} className="space-y-4 overflow-y-auto no-scrollbar pb-6 flex-1 pr-1">
                <div className="bg-white/5 p-3 rounded-2xl border border-white/5 flex items-center space-x-3">
                  <span className="text-3xl">{getAvatarById(user?.avatarId || '')?.emoji || '👤'}</span>
                  <div>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider leading-none">Publicado sob</p>
                    <p className="text-sm font-bold text-white mt-1 leading-none">{user?.nickname || user?.name || 'Viajante'} <span className="text-xs text-purple-400 font-light">(Anônimo)</span></p>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 pl-1">Título</label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Ex: Como manter a calma sob pressão?"
                    className="w-full bg-white/5 border border-white/5 px-4 py-3 rounded-2xl text-sm text-white placeholder-gray-600 focus:border-purple-500/30 focus:ring-1 focus:ring-purple-500/20 transition-all outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 pl-1">Categoria</label>
                  <div className="flex flex-wrap gap-1.5">
                    {SUBMITTABLE_CATEGORIES.map(cat => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setNewCategory(cat)}
                        className={cn(
                          "px-3 py-2 rounded-xl text-xs font-semibold border transition-all outline-none cursor-pointer",
                          newCategory === cat
                            ? "bg-purple-950/40 border-purple-500/35 text-purple-400"
                            : "bg-white/5 border-white/5 text-gray-400 hover:text-white"
                        )}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 pl-1">O que gostaria de dizer?</label>
                  <textarea
                    required
                    rows={4}
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    placeholder="Fique à vontade para desabafar, a comunidade é um ambiente de total acolhimento e cuidado mútuo."
                    className="w-full bg-white/5 border border-white/5 px-4 py-3 rounded-2xl text-sm text-white placeholder-gray-600 focus:border-purple-500/30 transition-all outline-none resize-none leading-relaxed"
                  />
                </div>

                <div className="pt-1">
                  <button
                    type="submit"
                    disabled={!newTitle.trim() || !newContent.trim()}
                    className={cn(
                      "w-full py-3.5 rounded-2xl font-bold font-display text-sm tracking-wider uppercase transition-all shadow-md flex items-center justify-center space-x-2 outline-none cursor-pointer",
                      newTitle.trim() && newContent.trim()
                        ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white border border-purple-500/25 shadow-purple-900/20"
                        : "bg-white/5 text-gray-600 border border-white/5 cursor-not-allowed"
                    )}
                  >
                    <span>Criar Tópico</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Alerta de Bloqueio Preventivo */}
      <AnimatePresence>
        {offensiveWarning && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 backdrop-blur-sm p-6">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={cn(
                "bg-[#12182b]/97 rounded-[2.5rem] p-8 max-w-sm w-full shadow-2xl flex flex-col items-center text-center space-y-5 border",
                isCrisisWarning ? "border-purple-500/20" : "border-red-500/20"
              )}
            >
              <div className={cn(
                "w-14 h-14 rounded-full flex items-center justify-center animate-bounce",
                isCrisisWarning ? "bg-purple-900/30 text-purple-400 border border-purple-500/25" : "bg-red-900/30 text-red-400 border border-red-500/25"
              )}>
                {isCrisisWarning ? <Heart size={26} /> : <ShieldAlert size={26} />}
              </div>
              <div className="space-y-2">
                <h4 className={cn(
                  "font-display font-bold text-lg",
                  isCrisisWarning ? "text-purple-400" : "text-red-400"
                )}>
                  {isCrisisWarning ? "Você não está sozinho" : "Bloqueio Preventivo"}
                </h4>
                <p className="text-xs text-gray-400 font-light leading-relaxed">
                  {offensiveWarning}
                </p>
                {isCrisisWarning && (
                  <div className="bg-purple-950/30 p-4 rounded-2xl border border-purple-500/20 flex flex-col items-center space-y-3">
                    <p className="text-[11px] text-purple-400 font-semibold leading-tight">
                      Ligue para o CVV 188 agora. Eles podem te ajudar nesse momento.
                    </p>
                    <a
                      href="tel:188"
                      className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-2 rounded-xl text-white font-bold text-sm shadow-md active:scale-95 transition-all outline-none border border-purple-500/25"
                    >
                      <span>📞 Ligar para 188</span>
                    </a>
                  </div>
                )}
                {!isCrisisWarning && (
                  <div className="bg-red-950/20 p-3 rounded-xl border border-red-500/20 text-[10px] text-red-400 font-semibold uppercase tracking-wider">
                    Seu tópico não foi criado
                  </div>
                )}
              </div>
              <button
                onClick={() => {
                  setOffensiveWarning(null);
                  setIsCrisisWarning(false);
                }}
                className={cn(
                  "w-full py-3.5 text-white rounded-2xl text-sm font-bold transition-all outline-none active:scale-95 cursor-pointer border",
                  isCrisisWarning
                    ? "bg-gradient-to-r from-purple-600 to-indigo-600 border-purple-500/25 shadow-purple-900/20"
                    : "bg-red-600 hover:bg-red-700 border-red-500/25"
                )}
              >
                {isCrisisWarning ? "Voltar ao Fórum" : "Compreendendo as Regras"}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
