import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  HelpCircle, 
  ChevronDown, 
  Send, 
  Clock, 
  MessageSquare, 
  AlertTriangle, 
  ShieldCheck, 
  LifeBuoy, 
  Mail, 
  CheckCircle2, 
  PhoneCall,
  Search,
  ExternalLink,
  Trash2
} from 'lucide-react';
import { View } from '../types';

interface Props {
  navigate: (view: View) => void;
  fromView?: View;
}

interface SupportTicket {
  id: string;
  category: string;
  description: string;
  contactEmail: string;
  createdAt: string;
  status: 'pending' | 'resolved';
  reply?: string;
}

interface FAQItem {
  question: string;
  answer: string;
  category: 'safety' | 'rooms' | 'account';
}

const FAQ_ITEMS: FAQItem[] = [
  {
    category: 'safety',
    question: 'O aplicativo substitui consultas médicas ou terapêuticas?',
    answer: 'Não, sob hipótese alguma. O Recomeçar é uma rede social de apoio mútuo entre pares baseada em acolhimento e interações empáticas. Situações clínicas de crise emocional aguda ou urgências devem ser reportadas imediatamente ao SAMU (192) ou ao CVV (188).'
  },
  {
    category: 'rooms',
    question: 'Como funcionam os Anjos de Apoio?',
    answer: 'Anjos de Apoio são membros da comunidade que você escolheu guardar no seu círculo próximo de carinho. Você pode adicioná-los clicando no perfil de qualquer pessoa no fórum ou nas salas e desfrutar de conversas acolhedoras com eles.'
  },
  {
    category: 'safety',
    question: 'Minhas conversas nas salas de conversa são privadas?',
    answer: 'Atualmente, as salas públicas atendem a todos os membros ativos que ingressem na sala em tempo real. As suas interações não são expostas aos mecanismos de busca (Google, Bing) para proteger sua privacidade, mas qualquer participante ativo na sala de chat poderá visualizá-las provisoriamente. Nunca forneça dados extremamente sensíveis (senhas, dados bancários) nas conversas.'
  },
  {
    category: 'account',
    question: 'Como faço para excluir totalmente os meus dados de acordo com a LGPD?',
    answer: 'Você tem poder total e irrestrito sobre suas informações. No seu menu de Perfil, você pode encerrar sua conta a qualquer momento. Isso apagará todos os seus dados do armazenamento local e sinalizará à nossa API opcional a exclusão instantânea das suas tabelas de banco de dados.'
  }
];

export default function Support({ navigate, fromView = 'profile' }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFAQ, setActiveFAQ] = useState<number | null>(null);
  const [selectedFAQCategory, setSelectedFAQCategory] = useState<'all' | 'safety' | 'rooms' | 'account'>('all');
  
  // Ticket form states
  const [ticketCategory, setTicketCategory] = useState('Dúvida Geral');
  const [ticketDescription, setTicketDescription] = useState('');
  const [ticketEmail, setTicketEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [ticketList, setTicketList] = useState<SupportTicket[]>([]);

  // Load existing tickets
  useEffect(() => {
    const saved = localStorage.getItem('recomecar_support_tickets');
    if (saved) {
      try {
        setTicketList(JSON.parse(saved));
      } catch (e) {
        console.error('Falha ao ler chamados anteriores', e);
      }
    }
  }, []);

  // Filter FAQs
  const filteredFAQs = FAQ_ITEMS.filter(item => {
    const matchesCategory = selectedFAQCategory === 'all' || item.category === selectedFAQCategory;
    const matchesSearch = item.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Handle support ticket submission
  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketDescription.trim()) return;

    setIsSubmitting(true);

    setTimeout(() => {
      const newTicket: SupportTicket = {
        id: `REC-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 100)}`,
        category: ticketCategory,
        description: ticketDescription,
        contactEmail: ticketEmail || 'anonimo@recomecar.com',
        createdAt: new Date().toISOString(),
        status: 'pending',
        reply: ticketCategory === 'Exclusão de Dados LGPD' 
          ? 'Sua solicitação LGPD de apagamento definitivo foi recebida e está pré-identificada em nosso pipeline off-line. Seus identificadores locais do WebView podem ser excluídos agora mesmo saindo do perfil.'
          : undefined
      };

      const updatedList = [newTicket, ...ticketList];
      setTicketList(updatedList);
      localStorage.setItem('recomecar_support_tickets', JSON.stringify(updatedList));

      // Reset form
      setTicketDescription('');
      setTicketEmail('');
      setIsSubmitting(false);
      setShowSuccessToast(true);

      // Hide success toast after 4s
      setTimeout(() => setShowSuccessToast(false), 4000);
    }, 1000);
  };

  const handleDeleteTicket = (ticketId: string) => {
    const updated = ticketList.filter(t => t.id !== ticketId);
    setTicketList(updated);
    localStorage.setItem('recomecar_support_tickets', JSON.stringify(updated));
  };

  return (
    <div className="h-full w-full bg-brand-gray flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 bg-white border-b border-brand-blue/5 flex items-center space-x-3 shrink-0">
        <button
          onClick={() => navigate(fromView)}
          className="p-2 -ml-2 rounded-xl hover:bg-brand-gray/50 active:scale-95 transition-all text-gray-600 cursor-pointer outline-none"
          title="Voltar"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-display font-bold text-gray-950 truncate leading-none">
            Central de Ajuda & Suporte
          </h1>
          <p className="text-[10px] text-gray-400 font-light mt-1 uppercase tracking-wider font-mono">
            Canal de Ouvidoria Integrado
          </p>
        </div>
        <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
          <LifeBuoy size={16} className="animate-spin-slow" />
        </div>
      </div>

      {/* Main Scroll Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6 no-scrollbar">
        
        {/* Urgent Crisis Redirect */}
        <div className="bg-red-50/70 border border-red-100 rounded-2xl p-4 flex items-start space-x-3">
          <AlertTriangle className="text-red-600 shrink-0 mt-0.5" size={18} />
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-red-950 block">Urgência com Auto-mutilação ou Ideações?</span>
            <p className="text-[10px] text-red-900/80 leading-relaxed font-light">
              Nossa equipe de suporte técnico e de moderação voluntária **não realiza** atendimento psicoterapêutico de emergência. Por favor, contate imediatamente o atendimento humanitário gratuito.
            </p>
            <div className="flex space-x-2 pt-1">
              <a 
                href="tel:188" 
                className="inline-flex items-center space-x-1 py-1 px-2.5 bg-red-600 hover:bg-red-700 text-white text-[9.5px] font-bold rounded-lg transition-colors cursor-pointer"
              >
                <PhoneCall size={10} />
                <span>Ligar CVV 188</span>
              </a>
              <a 
                href="tel:192" 
                className="inline-flex items-center space-x-1 py-1 px-2.5 bg-white hover:bg-red-50 text-red-600 border border-red-100 text-[9.5px] font-bold rounded-lg transition-colors cursor-pointer"
              >
                <span>Chamar SAMU 192</span>
              </a>
            </div>
          </div>
        </div>

        {/* Dynamic FAQ Search Area */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-mono">Dúvidas Frequentes (FAQ)</h3>
            <span className="text-[9.5px] text-purple-600 font-bold bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100">
              {filteredFAQs.length} Artigo(s)
            </span>
          </div>

          <div className="relative flex items-center bg-white rounded-2xl px-3.5 py-2.5 border border-brand-blue/5 shadow-xs focus-within:border-brand-blue/20">
            <Search size={14} className="text-gray-400 shrink-0 mr-2" />
            <input
              type="text"
              placeholder="Pesquisar soluções no FAQ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-xs text-brand-text placeholder-gray-400 outline-none w-full font-light"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="text-gray-400 hover:text-gray-600 text-xs font-bold font-mono px-1.5"
              >
                Limpar
              </button>
            )}
          </div>

          {/* FAQ Category Toggles */}
          <div className="flex space-x-1 bg-white p-1 rounded-xl border border-brand-blue/5 overflow-x-auto no-scrollbar shrink-0">
            {(['all', 'safety', 'rooms', 'account'] as const).map(cat => (
              <button
                key={cat}
                onClick={() => {
                  setSelectedFAQCategory(cat);
                  setActiveFAQ(null);
                }}
                className={`px-3 py-1.5 rounded-lg text-[9.5px] font-bold uppercase transition-all whitespace-nowrap outline-none cursor-pointer ${
                  selectedFAQCategory === cat
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-400 hover:text-gray-700'
                }`}
              >
                {cat === 'all' && 'Todos'}
                {cat === 'safety' && 'Segurança'}
                {cat === 'rooms' && 'Salas'}
                {cat === 'account' && 'Privacidade'}
              </button>
            ))}
          </div>

          {/* Accordion List */}
          <div className="bg-white rounded-3xl border border-brand-blue/5 divide-y divide-gray-50 overflow-hidden shadow-xs">
            {filteredFAQs.length === 0 ? (
              <div className="p-6 text-center text-gray-400 text-[11px] font-light">
                Nenhum artigo encontrado para o termo pesquisado.
              </div>
            ) : (
              filteredFAQs.map((item, index) => {
                const globalIndex = FAQ_ITEMS.findIndex(f => f.question === item.question);
                const isOpen = activeFAQ === globalIndex;
                return (
                  <div key={index} className="transition-all">
                    <button
                      onClick={() => setActiveFAQ(isOpen ? null : globalIndex)}
                      className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-gray-50 active:bg-gray-50 transition-all outline-none"
                    >
                      <span className="text-[11px] font-semibold text-gray-800 leading-snug pr-4">{item.question}</span>
                      <ChevronDown 
                        size={14} 
                        className={`text-gray-400 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180 text-purple-600' : ''}`} 
                      />
                    </button>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden bg-purple-50/20"
                        >
                          <div className="px-5 pb-4 pt-1.5 text-[10.5px] text-gray-500 leading-relaxed font-light border-t border-purple-50/30">
                            {item.answer}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Contact form (Open support ticket) */}
        <div className="bg-white rounded-3xl border border-brand-blue/5 p-5 space-y-4 shadow-sm">
          <div className="flex items-center space-x-2.5 px-1">
            <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
              <MessageSquare size={16} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-gray-900leading-none">Abrir Chamado Presencial</h3>
              <p className="text-[10px] text-gray-400 font-light mt-0.5 uppercase tracking-wide">Suporte técnico de moderação do aplicativo</p>
            </div>
          </div>

          <form onSubmit={handleSubmitTicket} className="space-y-3.5">
            <div>
              <label className="text-[10px] font-bold text-gray-450 uppercase pl-1 block mb-1">Categoria do Problema</label>
              <select
                value={ticketCategory}
                onChange={(e) => setTicketCategory(e.target.value)}
                className="w-full px-4 py-3 bg-brand-gray/50 border border-brand-blue/5 rounded-2xl text-[11px] font-bold text-gray-800 outline-none focus:border-brand-blue/15 cursor-pointer appearance-none relative"
                style={{ backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='purple' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'></polyline></svg>")`, backgroundPosition: 'calc(100% - 15px) center', backgroundSize: '12px', backgroundRepeat: 'no-repeat' }}
              >
                <option value="Dúvida Geral">Dúvida Geral</option>
                <option value="Denúncia de Abuso">Denúncia de Abuso / Assédio em Sala</option>
                <option value="Estabilidade / Bug">Estabilidade / Bug no Aplicativo</option>
                <option value="Exclusão de Dados LGPD">Exclusão Integral de Dados (LGPD)</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-450 uppercase pl-1 block mb-1">E-mail para Retorno (Opcional)</label>
              <input
                type="email"
                placeholder="Exemplo: seu-email@gmail.com"
                value={ticketEmail}
                onChange={(e) => setTicketEmail(e.target.value)}
                className="w-full px-4 py-3 bg-brand-gray/50 border border-brand-blue/5 rounded-2xl text-[11px] font-light placeholder-gray-400 text-gray-800 outline-none focus:border-brand-blue/15"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-450 uppercase pl-1 block mb-1">Relatar Ocorrência</label>
              <textarea
                placeholder="Por favor, descreva em detalhes seu relato ou dúvida para que possamos entender e ajudar da melhor forma..."
                rows={4}
                value={ticketDescription}
                onChange={(e) => setTicketDescription(e.target.value)}
                required
                className="w-full px-4 py-3 bg-brand-gray/50 border border-brand-blue/5 rounded-2xl text-[11px] font-light placeholder-gray-400 text-gray-800 outline-none focus:border-brand-blue/15 resize-none leading-relaxed"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !ticketDescription.trim()}
              className="w-full h-12 bg-purple-600 disabled:bg-purple-300 text-white font-bold rounded-2xl text-xs flex items-center justify-center space-x-2 transition-all active:scale-98 shadow-sm cursor-pointer outline-none"
            >
              <Send size={14} />
              <span>{isSubmitting ? 'Transmitindo Chamado...' : 'Enviar Solicitação'}</span>
            </button>
          </form>
        </div>

        {/* Existing User Chamados List */}
        {ticketList.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-mono px-1">Seus Chamados Cadastrados ({ticketList.length})</h3>
            <div className="space-y-2.5">
              {ticketList.map((ticket) => (
                <motion.div 
                  key={ticket.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl border border-brand-blue/5 p-4 space-y-3 shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-purple-600 bg-purple-50 px-2 py-0.5 rounded-lg border border-purple-100 font-bold">{ticket.id}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] text-gray-400">{new Date(ticket.createdAt).toLocaleDateString('pt-BR')}</span>
                      <button 
                        onClick={() => handleDeleteTicket(ticket.id)}
                        className="p-1 rounded-md text-gray-300 hover:text-red-500 hover:bg-red-50 active:scale-95 transition-all outline-none"
                        title="Limpar registro"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10.5px] font-bold text-gray-900 leading-tight block">
                      [{ticket.category}]
                    </span>
                    <p className="text-[10px] text-gray-500 font-light leading-relaxed">
                      {ticket.description}
                    </p>
                  </div>

                  <div className="pt-2 bg-brand-gray/30 rounded-xl p-2.5 space-y-1 border border-brand-blue/5">
                    <div className="flex items-center space-x-1">
                      <Clock size={11} className={ticket.reply ? 'text-emerald-500' : 'text-amber-500'} />
                      <span className={`text-[9.5px] font-mono uppercase font-bold ${ticket.reply ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {ticket.reply ? 'Respondido' : 'Sob Análise Técnica'}
                      </span>
                    </div>
                    {ticket.reply ? (
                      <p className="text-[9.5px] text-emerald-800 font-light leading-normal">{ticket.reply}</p>
                    ) : (
                      <p className="text-[9.5px] text-gray-400 font-light leading-normal">Seu chamado está em nossa fila de triagem. Responderemos para <strong>{ticket.contactEmail}</strong> no prazo padrão de até 48 horas.</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Direct Channel Footer Details */}
        <div className="bg-white rounded-3xl border border-brand-blue/5 p-4.5 space-y-3 text-center">
          <span className="text-[10px] uppercase font-mono tracking-wider text-gray-450 block font-light">E-mail Corporativo de Plantão</span>
          <p className="text-xs font-bold text-gray-800 select-all font-mono">contato-ouvidoria@recomecar.app.br</p>
          <div className="flex items-center justify-center space-x-1.5 pt-1 text-[9px] text-gray-400 font-light">
            <ShieldCheck size={12} className="text-emerald-500" />
            <span>Prazo máximo de resposta legal: 72 horas úteis</span>
          </div>
        </div>

      </div>

      {/* Toast Success Feedback */}
      <AnimatePresence>
        {showSuccessToast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="absolute bottom-5 left-5 right-5 bg-emerald-600 text-white p-4.5 rounded-2xl shadow-xl z-50 flex items-center space-x-3"
          >
            <CheckCircle2 size={18} className="shrink-0" />
            <div className="flex-1 min-w-0">
              <span className="text-[11px] font-bold block">Registrado com Sucesso</span>
              <p className="text-[10px] font-light leading-tight text-white/90 mt-0.5">Seu chamado administrativo foi protocolado e salvo!</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
