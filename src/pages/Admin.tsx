import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  ShieldAlert,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  Database,
  MessageSquare,
  Users,
  Trash2,
  MessageCircle,
  Check,
  Send,
  CloudLightning,
  Activity,
  AlertCircle,
  TrendingUp,
  Award,
  Shield,
  UserCheck,
  Ban,
  Terminal,
  FileCode,
  Heart,
  Settings,
  Flame,
  Layers
} from 'lucide-react';
import { View, ForumTopic, User } from '../types';
import { apiService } from '../services/api';

interface Props {
  user: User | null;
  navigate: (view: View) => void;
  forumTopics: ForumTopic[];
  onUpdateForumTopics: (topics: ForumTopic[]) => void;
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

interface CustomRoom {
  id: string;
  name: string;
  description: string;
  onlineCount: number;
  type: 'public' | 'vip';
  invitedBy?: string;
}

interface SimulatedUser {
  id: string;
  nickname: string;
  email: string;
  mood?: string;
  plan: 'FREE' | 'VIP' | 'PREMIUM';
  isBanned: boolean;
  role: 'USER' | 'MODERATOR' | 'ADMIN';
  createdAt: string;
}

export default function Admin({ user: currentUser, navigate, forumTopics, onUpdateForumTopics }: Props) {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // If the logged in user is already an admin, bypass local PIN
    return currentUser?.role === 'ADMIN';
  });
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Tab Navigation State
  const [activeTab, setActiveTab] = useState<'metrics' | 'users' | 'tickets' | 'rooms' | 'forum' | 'supabase'>('metrics');

  // Data States
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [rooms, setRooms] = useState<CustomRoom[]>([]);
  const [simulatedUsers, setSimulatedUsers] = useState<SimulatedUser[]>([]);
  const [totalVisitorCount, setTotalVisitorCount] = useState<number>(0);
  const [estimatedMRR, setEstimatedMRR] = useState<number>(0);
  const [stats, setStats] = useState<any>(null);

  // Custom Controls State
  const [systemSafetyMode, setSystemSafetyMode] = useState<boolean>(true);
  const [aiResponseDelay, setAiResponseDelay] = useState<string>('normal');
  const [selectedSqlDialect, setSelectedSqlDialect] = useState<'postgres' | 'api-js'>('postgres');

  // Reply formulation
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);

  // Supabase migration connection status
  const [supabaseStatus, setSupabaseStatus] = useState<'idle' | 'testing' | 'ready' | 'error'>('idle');
  const [apiLogs, setApiLogs] = useState<string[]>([
    'Iniciando verificação de integridade da API FAPEM...',
    'Aguardando gatilho de conexão com banco de dados remoto (Supabase).'
  ]);

  // Load Admin Data on demand
  useEffect(() => {
    if (isAuthenticated) {
      const USE_API = (import.meta as any).env?.VITE_USE_API === 'true';
      if (USE_API) {
        loadApiData();
      } else {
        loadLocalData();
      }
    }
  }, [isAuthenticated, activeTab]);

  const loadApiData = async () => {
    try {
      if (activeTab === 'metrics') {
        const data = await apiService.admin.getStats();
        setStats(data);
        setTotalVisitorCount(data.totalUsers || 0);
        setEstimatedMRR(data.revenue || 0);
      } else if (activeTab === 'users') {
        const users = await apiService.admin.getUsers();
        setSimulatedUsers(users.map(u => ({
          id: u.id,
          nickname: u.nickname || 'Anônimo',
          email: u.email,
          mood: '',
          plan: u.plan as any,
          isBanned: u.isBanned,
          role: u.role as any,
          createdAt: u.createdAt || ''
        })));
      } else if (activeTab === 'tickets') {
        const tks = await apiService.admin.getTickets();
        setTickets(tks);
      }
    } catch (err) {
      console.error('[Admin API] Load data failed:', err);
      setApiLogs(prev => [...prev, `[Erro API] Falha ao carregar dados de ${activeTab}`]);
    }
  };

  const loadLocalData = () => {
    // 1. Support tickets
    const savedTickets = localStorage.getItem('recomecar_support_tickets');
    if (savedTickets) {
      try {
        setTickets(JSON.parse(savedTickets));
      } catch (e) {
        setApiLogs(prev => [...prev, '[Erro] Falha ao recuperar tickets de suporte do localStorage.']);
      }
    }

    // 2. Custom rooms
    const savedRooms = localStorage.getItem('recomecar_custom_rooms');
    if (savedRooms) {
      try {
        setRooms(JSON.parse(savedRooms));
      } catch (e) {
        setApiLogs(prev => [...prev, '[Erro] Falha ao recuperar salas customizadas.']);
      }
    }

    // 3. Simulated Registered System Users (Creates default set if not populated)
    const savedUsers = localStorage.getItem('recomecar_simulated_users');
    if (savedUsers) {
      try {
        setSimulatedUsers(JSON.parse(savedUsers));
      } catch (e) {
        setApiLogs(prev => [...prev, '[Erro] Falha ao parsear banco de dados de usuários simulados.']);
      }
    } else {
      const defaultUsers: SimulatedUser[] = [
        { id: 'USR-8902', nickname: 'Carol S. Azevedo', email: 'carol.silva@gmail.com', mood: '😔 Triste', plan: 'PREMIUM', isBanned: false, role: 'USER', createdAt: '2026-05-18' },
        { id: 'USR-3419', nickname: 'Lucas Menezes', email: 'lucas.mnez@outlook.com', mood: '😰 Ansioso', plan: 'VIP', isBanned: false, role: 'USER', createdAt: '2026-05-22' },
        { id: 'USR-7621', nickname: 'Renata Kunz', email: 'renata_k@hotmail.com', mood: '😶 Confuso', plan: 'FREE', isBanned: false, role: 'USER', createdAt: '2026-06-01' },
        { id: 'USR-1250', nickname: 'Amanda Vieira', email: 'amanda.v@gmail.com', mood: '😞 Sozinho', plan: 'FREE', isBanned: false, role: 'USER', createdAt: '2026-06-03' },
        { id: 'USR-5582', nickname: 'Mateus Ferraz', email: 'mateus.ferr12@gmail.com', mood: '😰 Ansioso', plan: 'FREE', isBanned: true, role: 'USER', createdAt: '2026-06-04' }
      ];
      setSimulatedUsers(defaultUsers);
      localStorage.setItem('recomecar_simulated_users', JSON.stringify(defaultUsers));
    }

    // 4. Global visitor counter
    const savedCount = localStorage.getItem('recomecar_user_count');
    if (savedCount) {
      const parsed = parseInt(savedCount, 10);
      if (!isNaN(parsed)) setTotalVisitorCount(parsed);
    }
  };

  // Safe Authentication Handler
  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    // Safety PIN designated code (accepts "2026" or "admin123")
    const ADMIN_PASSWORD = '2026';

    if (password === ADMIN_PASSWORD || password === 'admin123') {
      setIsAuthenticated(true);
      setApiLogs(prev => [...prev, `[Sessão] Administrador autenticado com PIN em ${new Date().toLocaleTimeString()}`]);
    } else {
      setAuthError('PIN ou Senha de segurança inválida. Tente novamente.');
      setPassword('');
    }
  };

  // -------------------------------------------------------------
  // USER MODERATION ACTIONS
  // -------------------------------------------------------------
  const handleToggleUserStatus = async (userId: string) => {
    const USE_API = (import.meta as any).env?.VITE_USE_API === 'true';
    if (USE_API) {
      try {
        await apiService.admin.banUser(userId);
        loadApiData();
      } catch (err) {
        console.error('[Admin API] Ban failed:', err);
      }
    } else {
      const updated = simulatedUsers.map(user => {
        if (user.id === userId) {
          const nextStatus = !user.isBanned;
          setApiLogs(prev => [...prev, `[Moderação] Usuário ${user.nickname} (${userId}) teve status alterado.`]);
          return { ...user, isBanned: nextStatus };
        }
        return user;
      });
      setSimulatedUsers(updated);
      localStorage.setItem('recomecar_simulated_users', JSON.stringify(updated));
    }
  };

  const handleChangeUserPlan = async (userId: string, newPlan: 'FREE' | 'VIP' | 'PREMIUM') => {
    const USE_API = (import.meta as any).env?.VITE_USE_API === 'true';
    if (USE_API) {
      try {
        await apiService.admin.updateUserPlan(userId, newPlan);
        loadApiData();
      } catch (err) {
        console.error('[Admin API] Plan update failed:', err);
      }
    } else {
      const updated = simulatedUsers.map(user => {
        if (user.id === userId) {
          setApiLogs(prev => [...prev, `[Faturamento] Plano do usuário ${user.nickname} alterado.`]);
          return { ...user, plan: newPlan };
        }
        return user;
      });
      setSimulatedUsers(updated);
      localStorage.setItem('recomecar_simulated_users', JSON.stringify(updated));
    }
  };

  const handleDeleteUser = (userId: string, name: string) => {
    const updated = simulatedUsers.filter(user => user.id !== userId);
    setSimulatedUsers(updated);
    localStorage.setItem('recomecar_simulated_users', JSON.stringify(updated));
    setApiLogs(prev => [...prev, `[Moderação] Registro do usuário ${name} (${userId}) foi deletado permanentemente.`]);
  };

  // SUPPORT TICKET ACTIONS
  const handleSendTicketReply = async (ticketId: string) => {
    if (!replyText.trim()) return;
    setSubmittingReply(true);

    const USE_API = (import.meta as any).env?.VITE_USE_API === 'true';
    if (USE_API) {
      try {
        await apiService.admin.replyTicket(ticketId, replyText.trim());
        setReplyText('');
        setSelectedTicketId(null);
        setSubmittingReply(false);
        loadApiData();
      } catch (err) {
        console.error('[Admin API] Ticket reply failed:', err);
        setSubmittingReply(false);
      }
    } else {
      setTimeout(() => {
        const updatedTickets = tickets.map(ticket => {
          if (ticket.id === ticketId) {
            return {
              ...ticket,
              status: 'resolved' as const,
              reply: replyText.trim()
            };
          }
          return ticket;
        });

        setTickets(updatedTickets);
        localStorage.setItem('recomecar_support_tickets', JSON.stringify(updatedTickets));

        setReplyText('');
        setSelectedTicketId(null);
        setSubmittingReply(false);
        setApiLogs(prev => [...prev, `[Suporte] Ticket ${ticketId} respondido com sucesso.`]);
      }, 1000);
    }
  };

  const handleDeleteTicket = (ticketId: string) => {
    const updated = tickets.filter(t => t.id !== ticketId);
    setTickets(updated);
    localStorage.setItem('recomecar_support_tickets', JSON.stringify(updated));
    setApiLogs(prev => [...prev, `[Suporte] Ticket ${ticketId} removido permanentemente.`]);
  };

  // ROOMS ACTIONS
  const handleDeleteRoom = (roomId: string) => {
    const updated = rooms.filter(r => r.id !== roomId);
    setRooms(updated);
    localStorage.setItem('recomecar_custom_rooms', JSON.stringify(updated));
    setApiLogs(prev => [...prev, `[Salas] Sala ${roomId} excluída por moderação administrativa.`]);
  };

  // FORUM ACTIONS
  const handleDeleteForumTopic = (topicId: string) => {
    const updated = forumTopics.filter(t => t.id !== topicId);
    onUpdateForumTopics(updated);
    setApiLogs(prev => [...prev, `[Fórum] Tópico ${topicId} removido permanentemente.`]);
  };

  // SUPABASE SIMULATOR HANDLER
  const handleTestSupabaseConnection = () => {
    setSupabaseStatus('testing');
    setApiLogs(prev => [...prev, '[Supabase] Testando latência e tabelas remotas...']);

    setTimeout(() => {
      setSupabaseStatus('ready');
      setApiLogs(prev => [
        ...prev,
        '[Supabase] Estabelecido aperto de mão via HTTPS TLS v1.3',
        '[Supabase] Modelos e views prontos no Schema "public"',
        '[API Middleware] Conexão remota bem-sucedida com banco de dados de produção.'
      ]);
    }, 1500);
  };

  // Mock billing values
  const countPremium = simulatedUsers.filter(u => u.plan === 'PREMIUM').length;
  const countVip = simulatedUsers.filter(u => u.plan === 'VIP').length;
  const countBasic = simulatedUsers.filter(u => u.plan === 'FREE').length;
  // Use let if we are calculating local fallback MRR
  let localMRR = (countPremium * 14.99) + (countVip * 5.99) + (countBasic * 0.99);

  // Use estimatedMRR from state if API is active, otherwise localMRR
  const displayMRR = (import.meta as any).env?.VITE_USE_API === 'true' ? estimatedMRR : localMRR;

  return (
    <div className="h-full w-full bg-brand-gray flex flex-col overflow-hidden">
      {/* Header Bar */}
      <div className="px-5 py-4 bg-white border-b border-brand-blue/5 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('profile')}
            className="p-2 -ml-2 rounded-xl hover:bg-brand-gray/50 active:scale-95 transition-all text-gray-650 cursor-pointer outline-none"
            title="Voltar ao Perfil"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-sm font-display font-black text-gray-950 leading-none">
              Painel do Administrador
            </h1>
            <p className="text-[10px] text-brand-green font-bold uppercase tracking-widest font-mono mt-1">
              FAPEM Admin Control • v1.50
            </p>
          </div>
        </div>
        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
          <ShieldAlert size={16} />
        </div>
      </div>

      {/* Primary Authentication Form (if not logged in) */}
      {!isAuthenticated ? (
        <div className="flex-1 overflow-y-auto px-6 flex flex-col justify-center max-w-sm mx-auto w-full space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mx-auto border border-indigo-200/20 shadow-xs mb-1">
              <Lock size={22} className="animate-pulse" />
            </div>
            <h2 className="text-lg font-display font-black text-brand-text leading-tight w-full">Segurança do Painel</h2>
            <p className="text-[11px] text-gray-500 font-light leading-relaxed">
              Este painel contém informações de privacidade dos usuários, chamados de suporte e controle de salas. Por favor, forneça o PIN seguro para validar o acesso administrativo.
            </p>
          </div>

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest pl-1" htmlFor="admin-pin-secure">
                PIN de Segurança
              </label>
              <div className="relative">
                <input
                  id="admin-pin-secure"
                  type={showPassword ? 'text' : 'password'}
                  maxLength={12}
                  placeholder="Insira o seu PIN..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white border border-brand-blue/10 focus:border-brand-blue/30 rounded-2xl py-3.5 pl-4 pr-11 text-xs text-brand-text outline-none transition-all placeholder-gray-400 font-mono text-center tracking-widest"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-650 cursor-pointer outline-none"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {authError && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-red-50 border border-red-100 rounded-xl text-[10px] text-red-600 flex items-start space-x-2 animate-shake"
              >
                <AlertCircle size={13} className="shrink-0 mt-0.5" />
                <span>{authError}</span>
              </motion.div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-display font-bold text-xs rounded-2xl shadow-md transition-all active:scale-98 cursor-pointer outline-none"
            >
              Liberar Painel
            </button>
          </form>

          <p className="text-[9.5px] text-center text-gray-400 font-light">
            Dica do Refúgio: O PIN seguro inicial padrão configurado pelo desenvolvedor é <strong className="font-mono text-brand-green font-bold">2026</strong>
          </p>
        </div>
      ) : (
        /* Main Logged In Administrative Console Interface */
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* Section Selector Tab Row (Expanded to incorporate Metrics, Users, and Moderation channels) */}
          <div className="bg-white border-b border-brand-blue/5 px-2.5 py-2 flex items-center space-x-1 shrink-0 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab('metrics')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-[10.5px] font-bold font-display uppercase tracking-wider transition-all cursor-pointer outline-none whitespace-nowrap ${activeTab === 'metrics' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-400 hover:text-gray-750'
                }`}
            >
              <TrendingUp size={13} />
              <span>Geral</span>
            </button>

            <button
              onClick={() => setActiveTab('users')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-[10.5px] font-bold font-display uppercase tracking-wider transition-all cursor-pointer outline-none whitespace-nowrap ${activeTab === 'users' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-400 hover:text-gray-750'
                }`}
            >
              <UserCheck size={13} />
              <span>Usuários ({simulatedUsers.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('tickets')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-[10.5px] font-bold font-display uppercase tracking-wider transition-all cursor-pointer outline-none whitespace-nowrap ${activeTab === 'tickets' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-400 hover:text-gray-750'
                }`}
            >
              <MessageSquare size={13} />
              <span>Suporte ({tickets.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('rooms')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-[10.5px] font-bold font-display uppercase tracking-wider transition-all cursor-pointer outline-none whitespace-nowrap ${activeTab === 'rooms' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-400 hover:text-gray-750'
                }`}
            >
              <Users size={13} />
              <span>Salas ({rooms.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('forum')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-[10.5px] font-bold font-display uppercase tracking-wider transition-all cursor-pointer outline-none whitespace-nowrap ${activeTab === 'forum' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-400 hover:text-gray-750'
                }`}
            >
              <MessageCircle size={13} />
              <span>Fórum ({forumTopics.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('supabase')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-[10.5px] font-bold font-display uppercase tracking-wider transition-all cursor-pointer outline-none whitespace-nowrap ${activeTab === 'supabase' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-400 hover:text-gray-750'
                }`}
            >
              <Database size={13} />
              <span>Integração</span>
            </button>
          </div>

          {/* Tab Screen Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 no-scrollbar">

            {/* -------------------------------------------------------------
                METRICS TAB (OVERVIEW & STATUS STATS)
                ------------------------------------------------------------- */}
            {activeTab === 'metrics' && (
              <div className="space-y-4">
                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-mono">Estatísticas Operacionais Gerais</h3>

                {/* 3 Metrics Cards */}
                <div className="grid grid-cols-2 gap-3.5">
                  <div className="bg-white border border-brand-blue/5 rounded-2xl p-4 space-y-1 shadow-xs">
                    <span className="text-[9px] text-gray-400 uppercase tracking-widest font-mono">Engajamento Total</span>
                    <p className="text-2xl font-display font-black text-brand-text">{totalVisitorCount} <span className="text-xs text-brand-green font-bold">ativos</span></p>
                    <span className="text-[9.5px] text-gray-400 block font-light">Visitantes únicos registrados</span>
                  </div>

                  <div className="bg-white border border-brand-blue/5 rounded-2xl p-4 space-y-1 shadow-xs">
                    <span className="text-[9px] text-gray-400 uppercase tracking-widest font-mono font-mono">Simulação Receita</span>
                    <p className="text-2xl font-display font-black text-indigo-600">R$ {displayMRR.toFixed(2)}</p>
                    <span className="text-[9.5px] text-gray-400 block font-light">Assinaturas recorrentes estimadas</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-brand-gray/40 border border-brand-blue/5 rounded-xl p-3 text-center space-y-1">
                    <span className="text-[8px] uppercase tracking-wide text-indigo-600 font-bold col-span-3">Assinantes PREMIUM</span>
                    <p className="text-lg font-display font-bold text-gray-850">{countPremium}</p>
                  </div>
                  <div className="bg-brand-gray/40 border border-brand-blue/5 rounded-xl p-3 text-center space-y-1">
                    <span className="text-[8px] uppercase tracking-wide text-purple-600 font-bold col-span-3">Assinantes VIP</span>
                    <p className="text-lg font-display font-bold text-gray-850">{countVip}</p>
                  </div>
                  <div className="bg-brand-gray/40 border border-brand-blue/5 rounded-xl p-3 text-center space-y-1">
                    <span className="text-[8px] uppercase tracking-wide text-violet-600 font-bold col-span-3">Assinantes BÁSICO</span>
                    <p className="text-lg font-display font-bold text-gray-850">{countBasic}</p>
                  </div>
                </div>

                {/* Safety & Moderate Controls card */}
                <div className="bg-white border border-brand-blue/5 rounded-2xl p-5 space-y-3 shadow-xs">
                  <div className="flex items-center space-x-2">
                    <Settings size={15} className="text-violet-600" />
                    <h4 className="text-xs font-display font-bold text-gray-900 uppercase tracking-wider">Configurações Globais Rápidas</h4>
                  </div>

                  <div className="space-y-3.5 pt-1">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="text-[11px] font-bold text-gray-850 block">Modo de Segurança Rigoroso</span>
                        <span className="text-[9px] text-gray-400 font-light block">Modera automaticamente palavras de ódio ou ansiedade grave nas salas do app.</span>
                      </div>
                      <button
                        onClick={() => {
                          setSystemSafetyMode(!systemSafetyMode);
                          setApiLogs(prev => [...prev, `[Config] Modo de Segurança Rigoroso alterado para: ${(!systemSafetyMode).toString().toUpperCase()}`]);
                        }}
                        className={`w-11 h-6 rounded-full p-0.5 transition-colors focus:ring-1 focus:ring-indigo-300 outline-none ${systemSafetyMode ? 'bg-brand-green' : 'bg-gray-200'}`}
                      >
                        <div className={`bg-white w-5 h-5 rounded-full shadow-sm transform transition-transform ${systemSafetyMode ? 'translate-x-5' : 'translate-x-0'}`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="text-[11px] font-bold text-gray-850 block">Tempo de Resposta da IA Acolhedora</span>
                        <span className="text-[9px] text-gray-400 font-light block">Tempo simulado de processamento para respostas de suporte e desabafo com IA.</span>
                      </div>
                      <select
                        value={aiResponseDelay}
                        onChange={(e) => {
                          setAiResponseDelay(e.target.value);
                          setApiLogs(prev => [...prev, `[Config] Delay da IA acolhedora alterada para: ${e.target.value.toUpperCase()}`]);
                        }}
                        className="bg-brand-gray border border-brand-blue/5 text-[10px] font-bold text-indigo-700 px-2.5 py-1.5 rounded-lg outline-none cursor-pointer"
                      >
                        <option value="instant">Imediato (0s)</option>
                        <option value="normal">Normal (1-2s)</option>
                        <option value="safe">Seguro (3s + Análise)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* -------------------------------------------------------------
                USERS TAB (SIMULATED USER LIST & CONTROLS)
                ------------------------------------------------------------- */}
            {activeTab === 'users' && (
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-mono">Banco de Dados de Membros</h3>
                  <span className="text-[9px] bg-indigo-50 text-indigo-700 font-mono font-bold px-2 py-0.5 rounded-full font-mono">
                    {simulatedUsers.length} total
                  </span>
                </div>

                <div className="space-y-3">
                  {simulatedUsers.map(user => (
                    <div
                      key={user.id}
                      className="bg-white border border-brand-blue/5 rounded-2xl p-4 space-y-3.5 shadow-xs relative overflow-hidden"
                    >
                      {/* Ribbon representing suspended status */}
                      {user.isBanned && (
                        <div className="absolute top-0 right-0 bg-red-500 text-white text-[8px] font-bold px-3 py-1 font-mono uppercase rounded-bl-xl tracking-wider select-none">
                          Banido
                        </div>
                      )}

                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-1.5">
                            <span className="text-xs font-display font-black text-gray-900">{user.nickname}</span>
                            <span className="text-[8.5px] font-mono text-gray-400">({user.id})</span>
                          </div>

                          <div className="text-[10px] text-gray-400 font-mono select-all">
                            {user.email}
                          </div>

                          <div className="flex items-center space-x-2 pt-0.5">
                            <span className="text-[9px] font-medium bg-brand-gray px-2 py-0.5 rounded text-gray-600">
                              Humor: {user.mood || 'Não informado'}
                            </span>
                            <span className="text-[9px] text-gray-400 font-light">•</span>
                            <span className="text-[9px] text-gray-400 font-light">Cadastrado em {user.createdAt}</span>
                          </div>
                        </div>
                      </div>

                      {/* Interactive Controls Bar for plan upgrade & suspension */}
                      <div className="pt-2.5 border-t border-brand-blue/5 flex items-center justify-between flex-wrap gap-2 text-[10px]">
                        <div className="flex items-center space-x-1">
                          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider select-none mr-1">Plano:</span>
                          {(['FREE', 'VIP', 'PREMIUM'] as const).map(tier => (
                            <button
                              key={tier}
                              onClick={() => handleChangeUserPlan(user.id, tier)}
                              className={`px-2 py-1 rounded text-[8.5px] uppercase font-mono font-bold transition-all cursor-pointer outline-none ${user.plan === tier
                                ? 'bg-indigo-600 text-white'
                                : 'bg-brand-gray text-gray-400 hover:text-gray-700'
                                }`}
                            >
                              {tier}
                            </button>
                          ))}
                        </div>

                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => handleToggleUserStatus(user.id)}
                            className={`p-1.5 rounded-lg active:scale-90 transition-all cursor-pointer outline-none ${!user.isBanned
                              ? 'bg-amber-50 text-amber-600 hover:bg-amber-100'
                              : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                              }`}
                            title={!user.isBanned ? 'Banir usuário' : 'Desbanir usuário'}
                          >
                            {!user.isBanned ? <Ban size={13} /> : <UserCheck size={13} />}
                          </button>

                          <button
                            onClick={() => handleDeleteUser(user.id, user.nickname)}
                            className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg active:scale-95 transition-all cursor-pointer outline-none"
                            title="Banir usuário permanentemente"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* -------------------------------------------------------------
                3. TICKETS TAB
                ------------------------------------------------------------- */}
            {activeTab === 'tickets' && (
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-mono">Chamados de Ajuda Registrados</h3>
                  <span className="text-[9px] bg-purple-100 text-purple-700 font-mono font-bold px-2 py-0.5 rounded-full font-mono">
                    {tickets.filter(t => t.status === 'pending').length} pendentes
                  </span>
                </div>

                {tickets.length === 0 ? (
                  <div className="bg-white rounded-3xl p-8 border border-brand-blue/5 text-center text-gray-400 text-xs font-light space-y-1">
                    <CheckCircle className="mx-auto text-brand-green" size={24} />
                    <p className="font-bold text-gray-750 font-display">Sem chamados abertos</p>
                    <p className="text-[10px]">Todos os contatos de suporte de usuários estão respondidos!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {tickets.map((ticket) => (
                      <div
                        key={ticket.id}
                        className="bg-white border border-brand-blue/5 rounded-2xl p-4 space-y-3 shadow-xs"
                      >
                        <div className="flex items-start justify-between">
                          <div className="space-y-0.5">
                            <span className="font-mono text-[9px] font-bold bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded-md">
                              {ticket.id}
                            </span>
                            <span className="text-[10.5px] font-bold text-gray-900 block mt-1.5">
                              [{ticket.category}]
                            </span>
                          </div>

                          <div className="flex items-center space-x-1.5">
                            <span className={`text-[8.5px] px-1.5 py-0.5 rounded-sm font-bold uppercase ${ticket.status === 'resolved'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                              : 'bg-amber-50 text-amber-700 border border-amber-100 animate-pulse'
                              }`}>
                              {ticket.status === 'resolved' ? 'Respondido' : 'Pendente'}
                            </span>

                            <button
                              onClick={() => handleDeleteTicket(ticket.id)}
                              className="p-1 rounded text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                              title="Deletar chamado"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>

                        <p className="text-[11px] text-gray-600 font-light leading-relaxed bg-brand-gray/30 p-2.5 rounded-xl border border-brand-blue/5">
                          {ticket.description}
                        </p>

                        <div className="text-[10px] text-gray-400 font-light flex items-center space-x-1">
                          <span>Do e-mail:</span>
                          <strong className="text-gray-750 font-medium select-all font-mono">{ticket.contactEmail}</strong>
                          <span className="opacity-40">•</span>
                          <span>{new Date(ticket.createdAt).toLocaleDateString('pt-BR')} às {new Date(ticket.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>

                        {/* Reply workflow */}
                        {ticket.reply ? (
                          <div className="mt-2 bg-indigo-50/20 rounded-xl p-3 border border-indigo-100/10 space-y-1">
                            <span className="text-[9px] font-bold uppercase tracking-wider text-indigo-700 flex items-center space-x-1">
                              <CheckCircle size={10} />
                              <span>Resposta Enviada:</span>
                            </span>
                            <p className="text-[10px] text-indigo-950 leading-normal font-light italic bg-white/70 p-2 rounded-lg">
                              "{ticket.reply}"
                            </p>
                          </div>
                        ) : (
                          <div className="pt-2 border-t border-gray-50 flex flex-col space-y-2">
                            {selectedTicketId === ticket.id ? (
                              <div className="space-y-2">
                                <textarea
                                  placeholder="Formule a resposta de orientação terapêutica ou técnica do suporte..."
                                  rows={2}
                                  value={replyText}
                                  onChange={(e) => setReplyText(e.target.value)}
                                  className="w-full bg-brand-gray/50 border border-brand-blue/5 focus:border-brand-blue/15 rounded-xl p-2.5 text-[10.5px] font-light placeholder-gray-400 text-gray-800 outline-none resize-none leading-relaxed"
                                />
                                <div className="flex space-x-1.5 justify-end">
                                  <button
                                    onClick={() => setSelectedTicketId(null)}
                                    className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-gray-500 hover:bg-gray-100 transition-colors cursor-pointer outline-none"
                                  >
                                    Cancelar
                                  </button>
                                  <button
                                    onClick={() => handleSendTicketReply(ticket.id)}
                                    disabled={submittingReply || !replyText.trim()}
                                    className="px-3.5 py-1.5 bg-indigo-600 disabled:bg-indigo-350 text-white rounded-lg text-[10px] font-bold shadow-sm transition-all active:scale-95 cursor-pointer outline-none flex items-center space-x-1"
                                  >
                                    <Send size={9} />
                                    <span>{submittingReply ? 'Transmitindo...' : 'Enviar Resposta'}</span>
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <button
                                onClick={() => {
                                  setSelectedTicketId(ticket.id);
                                  setReplyText('');
                                }}
                                className="inline-flex self-start py-1.5 px-3 bg-indigo-600 hover:bg-indigo-700 transition-colors text-white font-bold text-[9.5px] rounded-lg cursor-pointer outline-none hover:shadow-xs"
                              >
                                Responder ao Chamado
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* -------------------------------------------------------------
                2. ROOMS TAB
                ------------------------------------------------------------- */}
            {activeTab === 'rooms' && (
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-mono">Salas Customizadas Criadas</h3>
                  <span className="text-[9px] bg-indigo-50 text-indigo-700 font-mono font-bold px-2 py-0.5 rounded-full font-mono">
                    {rooms.length} sala(s) ativa(s)
                  </span>
                </div>

                {rooms.length === 0 ? (
                  <div className="bg-white rounded-3xl p-8 border border-brand-blue/5 text-center text-gray-400 text-xs font-light">
                    Nenhuma sala customizada criada por usuários atualmente no sistema local.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {rooms.map((room) => (
                      <div
                        key={room.id}
                        className="bg-white border border-brand-blue/5 rounded-2xl p-4 flex items-center justify-between shadow-xs"
                      >
                        <div className="space-y-1 pr-4 min-w-0">
                          <div className="flex items-center space-x-1.5">
                            <span className="font-bold text-[11px] text-gray-900 truncate">{room.name}</span>
                            <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded-sm ${room.type === 'vip' ? 'bg-purple-100 text-purple-700' : 'bg-green-50 text-green-700'}`}>
                              {room.type}
                            </span>
                          </div>
                          <p className="text-[10px] text-gray-400 font-light leading-relaxed truncate max-w-xs">{room.description}</p>
                          <div className="text-[9px] text-gray-400 font-mono">
                            Mod: <strong className="text-gray-700 font-medium">{room.invitedBy || 'Anônimo'}</strong> • ID: {room.id}
                          </div>
                        </div>

                        <button
                          onClick={() => handleDeleteRoom(room.id)}
                          className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-all active:scale-95 shrink-0 outline-none cursor-pointer"
                          title="Excluir sala por Moderação"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* -------------------------------------------------------------
                3. FORUM TAB
                ------------------------------------------------------------- */}
            {activeTab === 'forum' && (
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-mono">Moderar Tópicos do Fórum</h3>
                  <span className="text-[9px] bg-indigo-50 text-indigo-700 font-mono font-bold px-2 py-0.5 rounded-full font-mono">
                    {forumTopics.length} tópico(s)
                  </span>
                </div>

                {forumTopics.length === 0 ? (
                  <div className="bg-white rounded-3xl p-8 border border-brand-blue/5 text-center text-gray-400 text-xs font-light">
                    Nenhum tópico encontrado no fórum.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {forumTopics.map((topic) => (
                      <div
                        key={topic.id}
                        className="bg-white border border-brand-blue/5 rounded-2xl p-4 flex items-center justify-between shadow-xs"
                      >
                        <div className="space-y-1 pr-4 min-w-0">
                          <span className="text-[8px] uppercase tracking-wide bg-brand-blue/30 text-brand-green font-bold px-1.5 py-0.5 rounded">
                            {topic.category}
                          </span>
                          <span className="font-bold text-[11px] text-gray-900 block leading-tight mt-0.5">{topic.title}</span>
                          <div className="text-[9px] text-gray-400 mt-1 max-w-xs truncate">
                            Status: <strong className="font-bold text-indigo-600">{topic.posts.length} mensagens</strong> • Iniciado por {topic.authorName}
                          </div>
                        </div>

                        <button
                          onClick={() => handleDeleteForumTopic(topic.id)}
                          className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-all active:scale-95 shrink-0 outline-none cursor-pointer"
                          title="Excluir Tópico do Fórum"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* -------------------------------------------------------------
                4. SUPABASE INTEGRATION LABS & EXPORTABLE SCHEMAS
                ------------------------------------------------------------- */}
            {activeTab === 'supabase' && (
              <div className="space-y-4">
                <div className="bg-white border border-brand-blue/5 rounded-2xl p-5 space-y-4 shadow-xs">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h4 className="text-sm font-display font-bold text-gray-950 flex items-center space-x-1.5">
                        <Database size={15} className="text-brand-green" />
                        <span>Mapeamento do Banco de Dados (Supabase)</span>
                      </h4>
                      <p className="text-[10px] text-gray-400 font-light leading-relaxed">
                        A estrutura do Projeto Recomeçar foi construída de forma modular para sincronização total com o Supabase. Escolha o dialeto e aplique na sua query.
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 flex flex-col space-y-2.5">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-brand-gray/50 p-3 rounded-xl border border-brand-blue/5 space-y-1 text-center">
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest font-mono">Tabela Remota</span>
                        <p className="font-mono font-bold text-[10.5px] text-indigo-700">recomecar_tickets</p>
                      </div>
                      <div className="bg-brand-gray/50 p-3 rounded-xl border border-brand-blue/5 space-y-1 text-center">
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest font-mono">Tabela Remota</span>
                        <p className="font-mono font-bold text-[10.5px] text-indigo-700">recomecar_users</p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center py-1.5 border-t border-brand-blue/5">
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Esquema SQL Proposto:</span>
                      <div className="flex space-x-1.5">
                        <button
                          onClick={() => setSelectedSqlDialect('postgres')}
                          className={`px-2 py-0.5 rounded text-[8.5px] font-mono font-bold ${selectedSqlDialect === 'postgres' ? 'bg-indigo-600 text-white' : 'bg-brand-gray text-gray-400'
                            }`}
                        >
                          Raw SQL
                        </button>
                        <button
                          onClick={() => setSelectedSqlDialect('api-js')}
                          className={`px-2 py-0.5 rounded text-[8.5px] font-mono font-bold ${selectedSqlDialect === 'api-js' ? 'bg-indigo-600 text-white' : 'bg-brand-gray text-gray-400'
                            }`}
                        >
                          API Client
                        </button>
                      </div>
                    </div>

                    {/* Syntax Highlight Box */}
                    <div className="bg-[#1e1e24] p-3.5 rounded-xl text-[9px] font-mono text-emerald-400 select-all overflow-x-auto leading-relaxed border border-brand-blue/5 shadow-xs whitespace-pre">
                      {selectedSqlDialect === 'postgres' ? (
                        `-- Tabela de Suporte no Supabase
CREATE TABLE recomecar_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  contact_email VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'pending',
  reply TEXT
);

-- Tabela de Usuários e Assinantes
CREATE TABLE recomecar_users_db (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE,
  mood VARCHAR(50),
  plan VARCHAR(20) DEFAULT 'free',
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW()
);`
                      ) : (
                        `// Consumo do Supabase no Frontend
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// Enviar chamado para o banco de dados remoto
export async function insertSupportTicket(ticket) {
  const { data, error } = await supabase
    .from('recomecar_tickets')
    .insert([ticket]);
  return { data, error };
}`
                      )}
                    </div>

                    <button
                      onClick={handleTestSupabaseConnection}
                      disabled={supabaseStatus === 'testing'}
                      className={`w-full py-3 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-98 flex items-center justify-center space-x-1.5 cursor-pointer outline-none ${supabaseStatus === 'ready'
                        ? 'bg-emerald-600 text-white'
                        : supabaseStatus === 'testing'
                          ? 'bg-gray-200 text-gray-400'
                          : 'bg-brand-green hover:bg-brand-green/95 text-white'
                        }`}
                    >
                      {supabaseStatus === 'testing' ? (
                        <>
                          <Activity size={14} className="animate-spin" />
                          <span>Testando Apertto de Mão (Handshake)...</span>
                        </>
                      ) : supabaseStatus === 'ready' ? (
                        <>
                          <Check size={14} />
                          <span>Supabase Contectado (API Sincronizada)</span>
                        </>
                      ) : (
                        <>
                          <CloudLightning size={14} />
                          <span>Simular Conexão de Produção</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* API Logs Output Console */}
                <div className="space-y-2">
                  <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-gray-400 px-1">Console de Log do Middleware de API:</span>
                  <div className="bg-[#0f1015] rounded-2xl p-4 border border-[#1b1e2a]/60 text-[9px] font-mono text-indigo-300 space-y-1.5 overflow-hidden shadow-sm shadow-indigo-950/10 mb-2 leading-relaxed max-h-48 overflow-y-auto no-scrollbar">
                    {apiLogs.map((log, index) => (
                      <div key={index} className="flex items-start space-x-1.5">
                        <span className="text-gray-600 shrink-0 select-none">~</span>
                        <span>{log}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}
