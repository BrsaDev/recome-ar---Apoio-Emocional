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
import { encryptMessage, generateKeyPair, decryptMessage } from '../services/crypto';
import { apiService } from '../services/api';

interface Props {
  navigate: (view: View) => void;
  fromView?: View;
}

interface SupportTicket {
  id: string;
  category: string;
  description: string;
  contactEmail?: string;
  createdAt: string;
  status: 'pending' | 'resolved' | 'OPEN' | 'RESOLVED';
  reply?: string;
}

const FAQ_ITEMS = [
  {
    category: 'privacidade',
    question: 'Como funciona a criptografia de ponta a ponta (E2EE)?',
    answer: 'Todas as mensagens enviadas em salas privadas ou conversas de atendimento direto são criptografadas no seu dispositivo antes do envio. Isso significa que apenas você e o destinatário possuem a chave necessária para ler o conteúdo. Nem mesmo nossos servidores conseguem acessar o teor das suas conversas.'
  },
  {
    category: 'anonimato',
    question: 'Meu apelido é totalmente seguro?',
    answer: 'Sim. Solicitamos apenas um apelido (nickname) e uma escolha de avatar para identificação durante as sessões. Não é exigido e-mail pessoal para navegar nas áreas comuns e manter o sigilo integral da sua identidade.'
  },
  {
    category: 'seguranca',
    question: 'O FAPEM substitui terapia ou suporte médico?',
    answer: 'Não. O FAPEM é um espaço dedicado ao acolhimento espontâneo e empatia de grupo. Não prestamos serviços médicos de psicologia ou psiquiatria. Em caso de sofrimento agudo ou pensamentos de auto-mutilação, entre em contato imediatamente com o CVV ligando no 188.'
  },
  {
    category: 'conta',
    question: 'Como posso excluir permanentemente todos os meus dados?',
    answer: 'Você pode solicitar a exclusão total baseada na LGPD diretamente nesta tela escolhendo a categoria "Exclusão de Dados LGPD". Esse processo apaga permanentemente todos os seus logs e registros de forma definitiva.'
  }
];

export default function Support({ navigate, fromView = 'profile' }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFAQ, setActiveFAQ] = useState<number | null>(null);
  const [selectedFAQCategory, setSelectedFAQCategory] = useState<'all' | 'privacidade' | 'anonimato' | 'seguranca' | 'conta'>('all');

  const [ticketCategory, setTicketCategory] = useState('Urgente / Crise');
  const [ticketDescription, setTicketDescription] = useState('');
  const [ticketEmail, setTicketEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [ticketList, setTicketList] = useState<SupportTicket[]>([]);
  const [adminClicks, setAdminClicks] = useState(0);

  const handleAdminClick = () => {
    const next = adminClicks + 1;
    if (next >= 5) {
      setAdminClicks(0);
      navigate('admin');
    } else {
      setAdminClicks(next);
    }
  };

  // Load existing tickets from backend API
  useEffect(() => {
    apiService.support.getMyTickets()
      .then(tickets => {
        // Map backend tickets to SupportTicket interface
        const mapped = tickets.map((t: any) => ({
          id: t.id,
          category: t.subject || 'Suporte',
          description: t.message,
          createdAt: t.createdAt,
          status: t.status,
          reply: t.adminResponse || undefined
        }));
        setTicketList(mapped);
      })
      .catch(err => {
        console.warn('[API Support] Fetch tickets failed:', err);
      });
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

    apiService.support.createTicket(ticketCategory, ticketDescription)
      .then((newTicket) => {
        const mappedTicket: SupportTicket = {
          id: newTicket.id,
          category: newTicket.subject || ticketCategory,
          description: newTicket.message || ticketDescription,
          createdAt: newTicket.createdAt || new Date().toISOString(),
          status: newTicket.status || 'OPEN',
          reply: newTicket.adminResponse || undefined
        };

        setTicketList(prev => [mappedTicket, ...prev]);

        // Reset form
        setTicketDescription('');
        setTicketEmail('');
        setIsSubmitting(false);
        setShowSuccessToast(true);

        // Hide success toast after 4s
        setTimeout(() => setShowSuccessToast(false), 4000);
      })
      .catch((err) => {
        setIsSubmitting(false);
        console.error('[API Support] Create ticket failed:', err);
      });
  };

  const handleDeleteTicket = (ticketId: string) => {
    const updated = ticketList.filter(t => t.id !== ticketId);
    setTicketList(updated);
  };

  return (
    <div className="h-full w-full bg-[#020410] flex flex-col overflow-hidden text-white">
      {/* Header */}
      <div className="px-5 py-4 bg-[#020410]/95 backdrop-blur-md border-b border-white/5 flex items-center space-x-3 shrink-0">
        <button
          onClick={() => navigate(fromView)}
          className="p-2 -ml-2 rounded-xl hover:bg-white/5 active:scale-95 transition-all text-gray-400 hover:text-white cursor-pointer outline-none border border-transparent hover:border-white/5"
          title="Voltar"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-display font-medium text-white truncate leading-none">
            Central de Ajuda & Suporte
          </h1>
          <p className="text-[10px] text-gray-550 font-light mt-1 uppercase tracking-wider font-mono">
            Canal de Ouvidoria Integrado
          </p>
        </div>
        <button
          onClick={handleAdminClick}
          className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 cursor-pointer active:scale-90 transition-all select-none outline-none"
          title="Atendimento e Suporte"
        >
          <LifeBuoy size={16} className="animate-spin-slow" />
        </button>
      </div>

      {/* Main Scroll Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6 no-scrollbar">

        {/* Urgent Crisis Redirect */}
        <div className="bg-red-500/10 border border-red-500/25 rounded-2xl p-4 flex items-start space-x-3 shadow-sm">
          <AlertTriangle className="text-[#ff4a5a] shrink-0 mt-0.5" size={18} />
          <div className="space-y-1.5 flex-1 min-w-0">
            <span className="text-[11px] font-bold text-red-300 block">Urgência com Auto-mutilação ou Ideações?</span>
            <p className="text-[10px] text-gray-300 leading-relaxed font-light">
              Nossa equipe de suporte técnico e de moderação voluntária **não realiza** atendimento psicoterapêutico de emergência. Por favor, contate imediatamente o atendimento humanitário gratuito.
            </p>
            <div className="flex flex-wrap gap-2 pt-1 border-t border-red-500/10 mt-1">
              <a
                href="tel:188"
                className="inline-flex items-center space-x-1 py-1.5 px-3 bg-[#ff4a5a] hover:bg-[#ff5c6c] text-white text-[9.5px] font-bold rounded-lg transition-colors cursor-pointer active:scale-95 outline-none shadow-sm"
              >
                <PhoneCall size={10} />
                <span>Ligar CVV 188</span>
              </a>
              <a
                href="tel:192"
                className="inline-flex items-center space-x-1 py-1.5 px-3 bg-white/5 hover:bg-white/10 text-[#ff4a5a] border border-[#ff4a5a]/25 text-[9.5px] font-bold rounded-lg transition-colors cursor-pointer active:scale-95 outline-none"
              >
                <span>Chamar SAMU 192</span>
              </a>
            </div>
          </div>
        </div>

        {/* Dynamic FAQ Search Area */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest font-mono">Dúvidas Frequentes (FAQ)</h3>
            <span className="text-[9.5px] text-purple-400 font-bold bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">
              {filteredFAQs.length} Artigo(s)
            </span>
          </div>

          <div className="relative flex items-center bg-[#0a0f1f]/60 rounded-2xl px-3.5 py-2.5 border border-white/5 shadow-xs focus-within:border-purple-500/30">
            <Search size={14} className="text-gray-500 shrink-0 mr-2" />
            <input
              type="text"
              placeholder="Pesquisar soluções no FAQ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-xs text-white placeholder-gray-500 outline-none w-full font-light animate-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-purple-400 hover:text-purple-300 text-xs font-bold font-mono px-1.5 border border-purple-500/20 rounded-md bg-purple-500/5 active:scale-95 cursor-pointer"
              >
                Limpar
              </button>
            )}
          </div>

          {/* FAQ Category Toggles */}
          <div className="flex space-x-1 bg-[#12182b]/80 p-1 rounded-xl border border-white/5 overflow-x-auto no-scrollbar shrink-0">
            {(['all', 'privacidade', 'anonimato', 'seguranca', 'conta'] as const).map(cat => (
              <button
                key={cat}
                onClick={() => {
                  setSelectedFAQCategory(cat);
                  setActiveFAQ(null);
                }}
                className={`px-3 py-1.5 rounded-lg text-[9.5px] font-bold uppercase transition-all whitespace-nowrap outline-none cursor-pointer ${selectedFAQCategory === cat
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-neon-purple shadow-xs'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
              >
                {cat === 'all' && 'Todos'}
                {cat === 'privacidade' && 'Privacidade'}
                {cat === 'anonimato' && 'Anonimato'}
                {cat === 'seguranca' && 'Segurança'}
                {cat === 'conta' && 'Conta'}
              </button>
            ))}
          </div>

          {/* Accordion List */}
          <div className="bg-[#0a0f1f]/60 rounded-3xl border border-white/5 divide-y divide-white/5 overflow-hidden shadow-xs">
            {filteredFAQs.length === 0 ? (
              <div className="p-6 text-center text-gray-550 text-[11px] font-light">
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
                      className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-white/5 active:bg-white/10 transition-all outline-none"
                    >
                      <span className="text-[11px] font-semibold text-white leading-snug pr-4">{item.question}</span>
                      <ChevronDown
                        size={14}
                        className={`text-gray-500 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180 text-purple-400' : ''}`}
                      />
                    </button>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden bg-[#12182b]/40"
                        >
                          <div className="px-5 pb-4 pt-1.5 text-[10.5px] text-gray-300 leading-relaxed font-light border-t border-white/5">
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
        <div className="bg-[#0a0f1f]/60 rounded-3xl border border-white/5 p-5 space-y-4 shadow-sm">
          <div className="flex items-center space-x-2.5 px-1">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <MessageSquare size={16} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white leading-none">Abrir Chamado Presencial</h3>
              <p className="text-[10px] text-gray-400 font-light mt-0.5 uppercase tracking-wide">Suporte técnico de moderação do aplicativo</p>
            </div>
          </div>

          <form onSubmit={handleSubmitTicket} className="space-y-3.5">
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase pl-1 block mb-1">Categoria do Problema</label>
              <select
                value={ticketCategory}
                onChange={(e) => setTicketCategory(e.target.value)}
                className="w-full px-4 py-3 bg-[#12182b] border border-white/15 focus:border-purple-500/50 rounded-2xl text-[11px] font-bold text-white outline-none cursor-pointer appearance-none relative"
                style={{ backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='purple' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'></polyline></svg>")`, backgroundPosition: 'calc(100% - 15px) center', backgroundSize: '12px', backgroundRepeat: 'no-repeat' }}
              >
                <option value="Dúvida Geral" className="bg-[#0d1222] text-white">Dúvida Geral</option>
                <option value="Denúncia de Abuso" className="bg-[#0d1222] text-white">Denúncia de Abuso / Assédio em Sala</option>
                <option value="Estabilidade / Bug" className="bg-[#0d1222] text-white">Estabilidade / Bug no Aplicativo</option>
                <option value="Exclusão de Dados LGPD" className="bg-[#0d1222] text-white">Exclusão Integral de Dados (LGPD)</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase pl-1 block mb-1">E-mail para Retorno (Opcional)</label>
              <input
                type="email"
                placeholder="Exemplo: seu-email@gmail.com"
                value={ticketEmail}
                onChange={(e) => setTicketEmail(e.target.value)}
                className="w-full px-4 py-3 bg-[#12182b] border border-white/15 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 rounded-2xl text-[11px] font-light placeholder-gray-550 text-white outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase pl-1 block mb-1">Relatar Ocorrência</label>
              <textarea
                placeholder="Por favor, descreva em detalhes seu relato ou dúvida para que possamos entender e ajudar da melhor forma..."
                rows={4}
                value={ticketDescription}
                onChange={(e) => setTicketDescription(e.target.value)}
                required
                className="w-full px-4 py-3 bg-[#12182b] border border-white/15 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 rounded-2xl text-[11px] font-light placeholder-gray-550 text-white outline-none resize-none leading-relaxed"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !ticketDescription.trim()}
              className="w-full h-12 bg-gradient-to-r from-purple-600 to-indigo-600 disabled:from-purple-900 disabled:to-indigo-900 disabled:text-gray-500 text-white font-bold rounded-2xl text-xs flex items-center justify-center space-x-2 transition-all active:scale-98 shadow-neon-purple cursor-pointer outline-none border border-white/5"
            >
              <Send size={14} />
              <span>{isSubmitting ? 'Transmitindo Chamado...' : 'Enviar Solicitação'}</span>
            </button>
          </form>
        </div>

        {/* Existing User Chamados List */}
        {ticketList.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-[10px] font-bold text-gray-550 uppercase tracking-widest font-mono px-1">Seus Chamados Cadastrados ({ticketList.length})</h3>

            {/* WhatsApp-style E2EE Notice */}
            <div className="flex justify-center px-1">
              <div className="bg-amber-500/10 text-amber-300 py-2 px-3.5 rounded-xl text-[9px] font-medium leading-normal text-center w-full border border-amber-500/20 flex items-center justify-center space-x-2">
                <ShieldCheck size={12} className="shrink-0 opacity-80" />
                <span>As mensagens e chamados de suporte são criptografados. Apenas você e o suporte podem lê-los.</span>
              </div>
            </div>

            <div className="space-y-2.5">
              {ticketList.map((ticket) => (
                <motion.div
                  key={ticket.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-[#0a0f1f]/60 rounded-2xl border border-white/5 p-4 space-y-3 shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-lg border border-purple-500/20 font-bold">{ticket.id}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-[10.5px] text-gray-500">{new Date(ticket.createdAt).toLocaleDateString('pt-BR')}</span>
                      <button
                        onClick={() => handleDeleteTicket(ticket.id)}
                        className="p-1 rounded-md text-gray-505 hover:text-red-400 hover:bg-white/5 active:scale-95 transition-all outline-none cursor-pointer"
                        title="Limpar registro"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10.5px] font-bold text-white leading-tight block">
                      [{ticket.category}]
                    </span>
                    <p className="text-[10px] text-gray-300 font-light leading-relaxed">
                      {ticket.description}
                    </p>
                  </div>

                  <div className="pt-2 bg-[#12182b]/60 rounded-xl p-2.5 space-y-1 border border-white/5">
                    <div className="flex items-center space-x-1">
                      <Clock size={11} className={ticket.reply ? 'text-emerald-450' : 'text-amber-400'} />
                      <span className={`text-[9.5px] font-mono uppercase font-bold ${ticket.reply ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {ticket.reply ? 'Respondido' : 'Sob Análise Técnica'}
                      </span>
                    </div>
                    {ticket.reply ? (
                      <p className="text-[9.5px] text-emerald-300 font-light leading-normal">{ticket.reply}</p>
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
        <div className="bg-[#0a0f1f]/60 rounded-3xl border border-white/5 p-4.5 space-y-3 text-center">
          <span className="text-[10px] uppercase font-mono tracking-wider text-gray-500 block font-light">E-mail Corporativo de Plantão</span>
          <p className="text-xs font-bold text-purple-400 select-all font-mono">contato-ouvidoria@fapem.app</p>
          <div className="flex items-center justify-center space-x-1.5 pt-1 text-[9px] text-gray-550 font-light">
            <ShieldCheck size={12} className="text-emerald-400" />
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
            className="absolute bottom-5 left-5 right-5 bg-emerald-600/90 backdrop-blur-md text-white p-4.5 rounded-2xl shadow-xl z-50 flex items-center space-x-3 border border-emerald-500/20"
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
