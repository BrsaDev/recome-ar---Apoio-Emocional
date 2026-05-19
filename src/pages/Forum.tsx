import { useState } from 'react';
import { ForumTopic, View } from '../types';
import { MessageSquare, ThumbsUp, Eye, Plus, Search, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

const MOCK_TOPICS: ForumTopic[] = [
  {
    id: '1',
    title: 'Como lidar com crises de ansiedade repentinas?',
    category: 'Ansiedade',
    authorName: 'Ana Clara',
    lastUpdate: Date.now() - 1000 * 60 * 30,
    repliesCount: 12,
    viewsCount: 156,
    posts: []
  },
  {
    id: '2',
    title: 'Dicas de livros que ajudam no autoconhecimento',
    category: 'Recomeço',
    authorName: 'Pedro Silva',
    lastUpdate: Date.now() - 1000 * 60 * 60 * 2,
    repliesCount: 8,
    viewsCount: 89,
    posts: []
  },
  {
    id: '3',
    title: 'Me sinto muito sozinho no final de semana, o que fazer?',
    category: 'Solidão',
    authorName: 'Mariana Santos',
    lastUpdate: Date.now() - 1000 * 60 * 60 * 5,
    repliesCount: 24,
    viewsCount: 312,
    posts: []
  },
  {
    id: '4',
    title: 'Exercícios de respiração que realmente funcionam',
    category: 'Relacionamento',
    authorName: 'Carlos Lima',
    lastUpdate: Date.now() - 1000 * 60 * 60 * 24,
    repliesCount: 5,
    viewsCount: 45,
    posts: []
  }
];

const CATEGORIES = ['Tudos', 'Ansiedade', 'Solidão', 'Recomeço', 'Relacionamento'];

interface Props {
  navigate: (view: View, state?: any) => void;
}

export default function Forum({ navigate }: Props) {
  const [selectedCategory, setSelectedCategory] = useState('Tudos');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTopics = MOCK_TOPICS.filter(topic => {
    const matchesCategory = selectedCategory === 'Tudos' || topic.category === selectedCategory;
    const matchesSearch = topic.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex flex-col h-full bg-brand-gray/30">
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
                "px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all",
                selectedCategory === cat 
                  ? "bg-brand-blue text-white shadow-md shadow-brand-blue/20" 
                  : "bg-white text-gray-500 hover:bg-white/80"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </header>

      {/* Topics List */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4 no-scrollbar">
        {filteredTopics.map((topic, index) => (
          <motion.div
            key={topic.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => navigate('topic-detail', { topicId: topic.id })}
            className="bg-brand-white p-4 rounded-3xl border border-brand-blue/5 shadow-sm active:scale-[0.98] transition-transform cursor-pointer"
          >
            <div className="flex justify-between items-start mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-blue bg-brand-blue/10 px-2.5 py-1 rounded-full">
                {topic.category}
              </span>
              <span className="text-[10px] text-gray-400 font-medium">
                {new Date(topic.lastUpdate).toLocaleDateString()}
              </span>
            </div>
            
            <h3 className="text-brand-text font-semibold text-base mb-3 leading-tight">
              {topic.title}
            </h3>
            
            <div className="flex items-center justify-between mt-auto">
              <div className="flex items-center space-x-3 text-gray-400">
                <div className="flex items-center space-x-1">
                  <MessageSquare size={14} />
                  <span className="text-xs font-medium">{topic.repliesCount}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Eye size={14} />
                  <span className="text-xs font-medium">{topic.viewsCount}</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="text-[10px] text-gray-400">Iniciado por</span>
                <span className="text-xs font-bold text-brand-text/80">{topic.authorName}</span>
                <ChevronRight size={16} className="text-brand-blue" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Floating Action Button */}
      <button 
        className="fixed bottom-24 right-6 w-14 h-14 bg-brand-green text-white rounded-full flex items-center justify-center shadow-xl shadow-brand-green/30 active:scale-90 transition-transform z-20"
        id="btn-new-topic"
      >
        <Plus size={28} />
      </button>
    </div>
  );
}
