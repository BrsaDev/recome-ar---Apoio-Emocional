import { useState } from 'react';
import { ForumTopic, ForumPost, View, User } from '../types';
import { MessageSquare, Eye, Plus, Search, ChevronRight, X, ThumbsUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { getAvatarById } from '../data/avatars';

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

  const filteredTopics = topics.filter(topic => {
    const matchesCategory = selectedCategory === 'Tudos' || topic.category === selectedCategory;
    const matchesSearch = topic.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCreateTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const newTopicId = (topics.length + 1).toString();
    const newTopicPost: ForumPost = {
      id: `p_${newTopicId}_1`,
      authorName: user?.name || 'Viajante',
      authorAvatarId: user?.avatarId || 'm1',
      content: newContent,
      timestamp: Date.now(),
      likes: 0
    };

    const newTopic: ForumTopic = {
      id: newTopicId,
      title: newTitle.trim(),
      category: newCategory,
      authorName: user?.name || 'Viajante',
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
  };

  return (
    <div className="flex flex-col h-full bg-brand-gray/30 relative">
      {/* Header */}
      <header className="bg-brand-white px-6 pt-12 pb-6 shrink-0 border-b border-brand-blue/5">
        <h1 className="font-display text-2xl font-bold text-brand-text mb-2">Comunidade</h1>
        <p className="text-gray-500 text-sm mb-6">Um espaço seguro para compartilhar e aprender.</p>
        
        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar tópicos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-brand-gray pl-12 pr-4 py-3 rounded-2xl text-sm border-none focus:ring-2 focus:ring-brand-blue/20 transition-all outline-none"
          />
        </div>

        {/* Categories */}
        <div className="flex space-x-2 overflow-x-auto no-scrollbar -mx-2 px-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all",
                selectedCategory === cat 
                  ? "bg-brand-blue text-white shadow-md shadow-brand-blue/20" 
                  : "bg-brand-gray text-gray-500 hover:bg-brand-gray/80"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </header>

      {/* Topics List */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4 no-scrollbar pb-24">
        {filteredTopics.length === 0 ? (
          <div className="text-center py-12 text-gray-400 space-y-2">
            <span className="text-4xl block">💬</span>
            <p className="text-sm font-medium">Nenhum tópico encontrado.</p>
            <p className="text-xs">Seja o primeiro a criar um tópico nessa categoria!</p>
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
                className="bg-brand-white p-5 rounded-[2rem] border border-brand-blue/5 shadow-sm active:scale-[0.98] transition-transform cursor-pointer hover:border-brand-blue/10 flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-blue bg-brand-blue/10 px-2.5 py-1 rounded-full">
                      {topic.category}
                    </span>
                    <span className="text-[10px] text-gray-400 font-medium">
                      {new Date(topic.lastUpdate).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <h3 className="text-brand-text font-semibold text-base mb-4 leading-tight">
                    {topic.title}
                  </h3>
                </div>
                
                <div className="flex items-center justify-between mt-auto pt-3 border-t border-brand-blue/5">
                  <div className="flex items-center space-x-3 text-gray-400">
                    <div className="flex items-center space-x-1 bg-brand-gray px-2 py-1 rounded-lg">
                      <MessageSquare size={13} className="text-brand-blue" />
                      <span className="text-xs font-bold text-gray-500">{topic.repliesCount}</span>
                    </div>
                    <div className="flex items-center space-x-1 bg-brand-gray px-2 py-1 rounded-lg">
                      <Eye size={13} className="text-orange-400" />
                      <span className="text-xs font-bold text-gray-500">{topic.viewsCount}</span>
                    </div>
                    <div className="flex items-center space-x-1 bg-brand-gray px-2 py-1 rounded-lg">
                      <ThumbsUp size={13} className="text-brand-green" />
                      <span className="text-xs font-bold text-gray-500">{totalLikes}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 bg-brand-gray px-2.5 py-1.5 rounded-full border border-brand-blue/5 shadow-xs shrink-0 max-w-[170px]">
                    <span className="text-sm leading-none shrink-0">{authorAvatar?.emoji || '👤'}</span>
                    <span className="text-[11px] font-bold text-brand-text/80 truncate">{topic.authorName}</span>
                    <ChevronRight size={12} className="text-brand-blue shrink-0" />
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Floating Action Button to write new topic */}
      <button 
        onClick={() => setIsNewTopicOpen(true)}
        className="fixed bottom-24 right-6 w-14 h-14 bg-brand-green text-white rounded-full flex items-center justify-center shadow-xl shadow-brand-green/30 active:scale-90 transition-transform z-20"
        id="btn-new-topic"
        title="Criar novo tópico"
      >
        <Plus size={28} />
      </button>

      {/* New Topic Drawer Modal */}
      <AnimatePresence>
        {isNewTopicOpen && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs">
            {/* Backdrop Click */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsNewTopicOpen(false)}
              className="absolute inset-0"
            />

            {/* Modal Panel */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="relative w-full max-w-sm bg-brand-white rounded-t-[2.5rem] shadow-2xl flex flex-col p-6 overflow-hidden z-10"
              style={{ maxHeight: '85vh' }}
            >
              <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4 shrink-0" />

              {/* Header */}
              <div className="flex items-center justify-between mb-4 shrink-0">
                <div>
                  <h3 className="font-display font-bold text-lg text-brand-text">Novo Tópico</h3>
                  <p className="text-xs text-gray-400 font-light">Publique um desabafo ou dúvida de forma anônima.</p>
                </div>
                <button
                  onClick={() => setIsNewTopicOpen(false)}
                  className="w-8 h-8 rounded-full bg-brand-gray/85 flex items-center justify-center text-gray-400 hover:text-brand-text transition-all outline-none"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleCreateTopic} className="space-y-4 overflow-y-auto no-scrollbar pb-6 flex-1 pr-1">
                {/* Visual Identity Preview */}
                <div className="bg-brand-gray p-3 rounded-2xl border border-brand-blue/5 flex items-center space-x-3">
                  <span className="text-3xl">{getAvatarById(user?.avatarId || '')?.emoji || '👤'}</span>
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider leading-none">Publicado sob</p>
                    <p className="text-sm font-bold text-brand-text mt-1 leading-none">{user?.name || 'Viajante'} <span className="text-xs text-brand-blue font-light">(Anônimo)</span></p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-brand-text/60 uppercase tracking-widest mb-1 px-1">Título</label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Ex: Como manter a calma sob pressão?"
                    className="w-full bg-brand-gray/80 px-4 py-3 rounded-2xl text-sm border-2 border-transparent focus:border-brand-blue/20 transition-all outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-brand-text/60 uppercase tracking-widest mb-1.5 px-1">Categoria</label>
                  <div className="flex flex-wrap gap-1.5">
                    {SUBMITTABLE_CATEGORIES.map(cat => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setNewCategory(cat)}
                        className={cn(
                          "px-3 py-2 rounded-xl text-xs font-semibold border-2 transition-all",
                          newCategory === cat
                            ? "bg-brand-blue/10 border-brand-blue/60 text-brand-blue font-bold"
                            : "bg-brand-gray/40 border-transparent text-gray-400 hover:border-brand-gray/80"
                        )}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-brand-text/60 uppercase tracking-widest mb-1 px-1">O que gostaria de dizer?</label>
                  <textarea
                    required
                    rows={4}
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    placeholder="Fique à vontade para desabafar, a comunidade é um ambiente de total acolhimento e cuidado mútuo."
                    className="w-full bg-brand-gray/80 px-4 py-3 rounded-2xl text-sm border-2 border-transparent focus:border-brand-blue/20 transition-all outline-none resize-none leading-relaxed"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={!newTitle.trim() || !newContent.trim()}
                    className={cn(
                      "w-full py-3.5 rounded-2xl font-bold font-display text-sm tracking-wider uppercase transition-all shadow-md flex items-center justify-center space-x-2 outline-none",
                      newTitle.trim() && newContent.trim()
                        ? "bg-brand-blue text-white shadow-brand-blue/20"
                        : "bg-gray-100 text-gray-400"
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
    </div>
  );
}
