import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { View, User } from '../types';
import { ArrowLeft, Check, X, Sparkles, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { apiService } from '../services/api';

interface Props {
  user: User | null;
  navigate: (view: View) => void;
  onUpdateUser: (updated: User) => void;
}

const TIER_DETAILS = [
  {
    id: 'FREE',
    name: 'Grátis',
    duration: 'Para sempre',
    price: 'R$ 0,00',
    originalPrice: null,
    badgeColor: 'bg-indigo-50/60 text-indigo-600 border-indigo-150',
    headerBg: 'from-indigo-500/5 to-indigo-500/10',
    buttonStyle: 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100',
  },
  {
    id: 'PREMIUM1',
    name: 'PREMIUM 1',
    duration: '1 dia',
    price: 'R$ 0,99',
    originalPrice: null,
    badgeColor: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    headerBg: 'from-cyan-500/5 to-cyan-500/10',
    buttonStyle: 'bg-cyan-600 hover:bg-cyan-700 shadow-cyan-100',
  },
  {
    id: 'PREMIUM2',
    name: 'PREMIUM 2',
    duration: '10 dias',
    price: 'R$ 9,90',
    originalPrice: null,
    badgeColor: 'bg-violet-50 text-violet-750 border-violet-200',
    headerBg: 'from-violet-500/5 to-violet-500/10',
    buttonStyle: 'bg-violet-600 hover:bg-violet-700 shadow-violet-100',
    isPopular: true,
  },
  {
    id: 'PREMIUM3',
    name: 'PREMIUM 3',
    duration: '30 dias',
    price: 'R$ 24,99',
    originalPrice: 'R$ 29,70',
    badgeColor: 'bg-[#fffaeb] text-amber-700 border-amber-200',
    headerBg: 'from-amber-500/5 to-amber-500/10',
    buttonStyle: 'bg-amber-600 hover:bg-amber-700 shadow-amber-100',
  }
];

export default function VIP({ user, navigate, onUpdateUser }: Props) {
  const [selectedPlan, setSelectedPlan] = useState<string>(user?.plan || 'PREMIUM2');
  const [activeTab, setActiveTab] = useState<'cards' | 'table'>('cards');
  const [successAnimationPlan, setSuccessAnimationPlan] = useState<string | null>(null);

  const handleSubscribe = async (planKey: 'FREE' | 'PREMIUM1' | 'PREMIUM2' | 'PREMIUM3', planName: string) => {
    setSuccessAnimationPlan(planName);
    const USE_API = (import.meta as any).env?.VITE_USE_API === 'true';

    if (USE_API && user) {
      try {
        const { user: updatedUser, token } = await apiService.profile.updatePlan(planKey);
        localStorage.setItem('fapem_token', token);
        onUpdateUser(updatedUser);
      } catch (err) {
        console.error('[VIP Purchase] Sync failed:', err);
      }
    } else if (user && onUpdateUser) {
      onUpdateUser({
        ...user,
        plan: planKey
      });
    }

    setTimeout(() => {
      setSuccessAnimationPlan(null);
    }, 4000);
  };

  return (
    <div className="h-full w-full bg-[#020410] flex flex-col relative select-none">
      {/* Header */}
      <header className="p-4 pt-12 flex items-center justify-between border-b border-white/5 bg-[#0a0f1f]/90 backdrop-blur-sm">
        <div className="flex items-center space-x-3">
          <button onClick={() => navigate('profile')} className="p-2 -ml-2 text-gray-400 hover:text-white active:scale-95 transition-all cursor-pointer outline-none">
            <ArrowLeft size={22} />
          </button>
          <h2 className="text-lg font-display font-bold text-white">Planos e Assinaturas</h2>
        </div>
        <div className="flex bg-white/5 p-0.5 rounded-xl border border-white/5">
          <button
            onClick={() => setActiveTab('cards')}
            className={cn(
              "px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all outline-none cursor-pointer",
              activeTab === 'cards' ? "bg-white/10 text-white" : "text-gray-500 hover:text-gray-300"
            )}
          >
            Vitrine
          </button>
          <button
            onClick={() => setActiveTab('table')}
            className={cn(
              "px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all outline-none cursor-pointer",
              activeTab === 'table' ? "bg-white/10 text-white" : "text-gray-500 hover:text-gray-300"
            )}
          >
            Tabela
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 no-scrollbar pb-10">

        {/* TAB 1: CARDS */}
        {activeTab === 'cards' && (
          <div className="space-y-6">
            <div className="text-center space-y-1.5 max-w-xs mx-auto pt-2">
              <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-widest font-mono">Escolha a melhor opção</span>
              <h3 className="text-xl font-display font-bold text-white leading-tight">Cuidado emocional sob medida</h3>
              <p className="text-xs text-gray-500 leading-normal font-light">
                Assine de forma simples e rápida com ativação instantânea no aplicativo.
              </p>
            </div>

            {/* Plan selector cards */}
            <div className="grid grid-cols-1 gap-3">
              {TIER_DETAILS.map((plan) => {
                const isSelected = selectedPlan === plan.id;

                return (
                  <motion.div
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan.id)}
                    className={cn(
                      "border rounded-3xl p-5 relative overflow-hidden transition-all cursor-pointer",
                      isSelected
                        ? "bg-[#0a0f1f]/95 border-purple-500 ring-1 ring-white/10 shadow-md"
                        : "bg-[#0a0f1f]/95 border-white/10 hover:border-purple-500/30"
                    )}
                    layoutId={`plan-${plan.id}`}
                  >
                    {plan.isPopular && (
                      <div className="absolute right-0 top-0 bg-violet-605 text-white text-[9px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider font-mono">
                        Recomendado
                      </div>
                    )}

                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase font-mono ${plan.badgeColor}`}>
                            {plan.name}
                          </span>
                          <span className="text-[11px] text-gray-400 font-medium font-mono">
                            {plan.duration}
                          </span>
                        </div>
                        <h4 className="font-display font-bold text-[16px] text-white pt-1">
                          Acesso {plan.name}
                        </h4>
                      </div>

                      <div className="text-right">
                        {plan.originalPrice && (
                          <div className="text-xs text-gray-400 line-through leading-none font-mono">
                            {plan.originalPrice}
                          </div>
                        )}
                        <div className="text-lg font-display font-extrabold text-white font-mono">
                          {plan.price}
                        </div>
                      </div>
                    </div>

                    {/* Features list preview */}
                    <AnimatePresence>
                      {isSelected && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-4 pt-4 border-t border-white/5 space-y-2.5 overflow-hidden"
                        >
                          {plan.id === 'FREE' && (
                            <>
                              <div className="flex items-center space-x-2 text-xs text-white/75 font-light">
                                <Check size={14} className="text-indigo-500 shrink-0" />
                                <span>Mensagens motivacionais diárias</span>
                              </div>
                              <div className="flex items-center space-x-2 text-xs text-white/75 font-light">
                                <Check size={14} className="text-indigo-500 shrink-0" />
                                <span>Acesso total ao Fórum</span>
                              </div>
                              <div className="flex items-center space-x-2 text-xs text-white/75 font-light">
                                <Check size={14} className="text-indigo-505 shrink-0" />
                                <span>Salas temáticas de conversão (Apenas por chat de texto*)</span>
                              </div>
                              <div className="flex items-center space-x-2 text-xs opacity-40 font-light line-through">
                                <X size={14} className="text-red-400 shrink-0" />
                                <span>Participação em áudio/voz nas salas temáticas</span>
                              </div>
                              <div className="flex items-center space-x-2 text-xs opacity-40 font-light line-through">
                                <X size={14} className="text-red-400 shrink-0" />
                                <span>Acesso ou criação de salas virtuais personalizadas</span>
                              </div>
                            </>
                          )}

                          {plan.id !== 'FREE' && (
                            <>
                              <div className="flex items-center space-x-2 text-xs text-white/75 font-light">
                                <Check size={14} className="text-emerald-400 shrink-0" />
                                <span>Salas temáticas com áudio de voz ao vivo e texto liberados</span>
                              </div>
                              <div className="flex items-center space-x-2 text-xs text-white/75 font-light">
                                <Check size={14} className="text-emerald-400 shrink-0" />
                                <span>Mensagens motivacionais ilimitadas</span>
                              </div>
                              <div className="flex items-center space-x-2 text-xs text-white/75 font-light">
                                <Check size={14} className="text-emerald-400 shrink-0" />
                                <span>Fórum integrado</span>
                              </div>
                              <div className="flex items-center space-x-2 text-xs text-white/75 font-light">
                                <Check size={14} className="text-emerald-400 shrink-0" />
                                <span>Acesso a Salas VIPs</span>
                              </div>
                              <div className="flex items-center space-x-2 text-xs text-white/75 font-light">
                                <Check size={14} className="text-emerald-400 shrink-0" />
                                <span>Criação e gerenciamento de salas temáticas customizadas</span>
                              </div>
                            </>
                          )}

                          {/* CTA Button */}
                          <motion.button
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSubscribe(plan.id as any, plan.name);
                            }}
                            className={cn(
                              "w-full text-white py-3.5 mt-2 rounded-2xl text-xs font-bold font-display shadow-md active:scale-95 transition-all outline-none cursor-pointer",
                              plan.buttonStyle
                            )}
                          >
                            Ativar {plan.name}
                          </motion.button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: DETAILED TABLE */}
        {activeTab === 'table' && (
          <div className="space-y-6">
            <div className="text-center space-y-1.5 max-w-xs mx-auto mb-2">
              <span className="text-[10px] uppercase font-bold text-purple-400 tracking-widest font-mono">Tabela de Atributos</span>
              <h3 className="text-xl font-display font-bold text-white leading-tight">Comparação Completa</h3>
            </div>

            {/* Design da tabela */}
            <div className="bg-[#0a0f1f]/95 border border-white/10 rounded-[2rem] overflow-hidden shadow-sm">
              <div className="grid grid-cols-5 bg-[#12182b] border-b border-white/5 text-[9px] font-bold text-gray-500 uppercase tracking-wider py-4 px-3 text-center font-mono">
                <span className="text-left font-display">Recurso</span>
                <span className="text-indigo-600">Grátis</span>
                <span className="text-cyan-500">PREMIUM 1</span>
                <span className="text-violet-600">PREMIUM 2</span>
                <span className="text-amber-400">PREMIUM 3</span>
              </div>

              {/* Rows */}
              <div className="divide-y divide-white/5 text-xs text-white">
                {/* Row 1 */}
                <div className="grid grid-cols-5 py-3.5 px-3 items-center text-center">
                  <span className="text-left text-[11px] font-semibold text-gray-400">Voz ao vivo e texto</span>
                  <div className="flex justify-center text-[8.5px] leading-tight text-indigo-400 font-semibold px-1">
                    somente texto*
                  </div>
                  <div className="flex justify-center text-cyan-400 font-bold text-[10px]">sim</div>
                  <div className="flex justify-center text-violet-400 font-bold text-[10px]">sim</div>
                  <div className="flex justify-center text-amber-500 font-bold text-[10px]">sim</div>
                </div>

                {/* Row 2 */}
                <div className="grid grid-cols-5 py-3.5 px-3 items-center text-center">
                  <span className="text-left text-[11px] font-semibold text-gray-400">Msg Motivacionais</span>
                  <div className="flex justify-center text-indigo-400 font-bold text-[10px]">sim</div>
                  <div className="flex justify-center text-cyan-400 font-bold text-[10px]">sim</div>
                  <div className="flex justify-center text-violet-400 font-bold text-[10px]">sim</div>
                  <div className="flex justify-center text-amber-500 font-bold text-[10px]">sim</div>
                </div>

                {/* Row 3 */}
                <div className="grid grid-cols-5 py-3.5 px-3 items-center text-center">
                  <span className="text-left text-[11px] font-semibold text-gray-400">Fórum</span>
                  <div className="flex justify-center text-indigo-400 font-bold text-[10px]">sim</div>
                  <div className="flex justify-center text-cyan-400 font-bold text-[10px]">sim</div>
                  <div className="flex justify-center text-violet-400 font-bold text-[10px]">sim</div>
                  <div className="flex justify-center text-amber-500 font-bold text-[10px]">sim</div>
                </div>

                {/* Row 4 */}
                <div className="grid grid-cols-5 py-3.5 px-3 items-center text-center">
                  <span className="text-left text-[11px] font-semibold text-gray-400">Sala VIP</span>
                  <div className="flex justify-center text-red-400 font-bold text-[10px]">não</div>
                  <div className="flex justify-center text-cyan-400 font-bold text-[10px]">sim</div>
                  <div className="flex justify-center text-violet-400 font-bold text-[10px]">sim</div>
                  <div className="flex justify-center text-amber-500 font-bold text-[10px]">sim</div>
                </div>

                {/* Row 5 */}
                <div className="grid grid-cols-5 py-3.5 px-3 items-center text-center">
                  <span className="text-left text-[11px] font-semibold text-gray-400">Criar sala temática</span>
                  <div className="flex justify-center text-red-400 font-bold text-[10px]">não</div>
                  <div className="flex justify-center text-cyan-400 font-bold text-[10px]">sim</div>
                  <div className="flex justify-center text-violet-400 font-bold text-[10px]">sim</div>
                  <div className="flex justify-center text-amber-500 font-bold text-[10px]">sim</div>
                </div>

                {/* Row 6 / Price */}
                <div className="grid grid-cols-5 py-4 px-3 items-center text-center bg-[#12182b]/30 font-display font-mono">
                  <span className="text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider font-sans">Valor</span>
                  <span className="font-bold text-indigo-400 text-[10px]">Grátis</span>
                  <span className="font-bold text-cyan-400 text-[10px]">R$0,99</span>
                  <span className="font-bold text-violet-400 text-[10px]">R$9,90</span>
                  <div className="text-[10px] flex flex-col justify-center">
                    <span className="text-[8px] text-gray-400 line-through">R$29,70</span>
                    <span className="font-bold text-amber-500">R$24,99</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick CTAs for each column below table */}
            <div className="grid grid-cols-2 gap-2.5 pb-2">
              <button
                onClick={() => handleSubscribe('FREE', 'Grátis')}
                className="py-2.5 px-3 rounded-xl bg-indigo-600/80 border border-indigo-500/25 active:scale-95 text-white font-bold text-xs shadow-md transition-all outline-none text-center flex flex-col items-center justify-center cursor-pointer"
              >
                <span>Ativar Grátis</span>
                <span className="text-[8.5px] font-light opacity-80 font-mono">R$ 0,00</span>
              </button>
              <button
                onClick={() => handleSubscribe('PREMIUM1', 'PREMIUM 1')}
                className="py-2.5 px-3 rounded-xl bg-cyan-600/80 border border-cyan-500/25 active:scale-95 text-white font-bold text-xs shadow-md transition-all outline-none text-center flex flex-col items-center justify-center cursor-pointer"
              >
                <span>Assinar Premium 1</span>
                <span className="text-[8.5px] font-light opacity-80 font-mono">R$ 0,99 (1 dia)</span>
              </button>
              <button
                onClick={() => handleSubscribe('PREMIUM2', 'PREMIUM 2')}
                className="py-2.5 px-3 rounded-xl bg-violet-650/80 border border-violet-500/25 active:scale-95 text-white font-bold text-xs shadow-md transition-all outline-none text-center flex flex-col items-center justify-center cursor-pointer"
              >
                <span>Assinar Premium 2</span>
                <span className="text-[8.5px] font-light opacity-80 font-mono">R$ 9,90 (10 dias)</span>
              </button>
              <button
                onClick={() => handleSubscribe('PREMIUM3', 'PREMIUM 3')}
                className="py-2.5 px-3 rounded-xl bg-amber-600/80 border border-amber-500/25 active:scale-95 text-white font-bold text-xs shadow-md transition-all outline-none text-center flex flex-col items-center justify-center cursor-pointer"
              >
                <span>Assinar Premium 3</span>
                <span className="text-[8.5px] font-light opacity-80 font-mono">R$ 24,99 (30 dias)</span>
              </button>
            </div>
          </div>
        )}

        {/* Footnotes */}
        <div className="bg-[#12182b] p-4 rounded-2xl space-y-2 border border-white/5">
          <div className="flex items-start space-x-2">
            <AlertCircle size={14} className="text-gray-400 mt-0.5 shrink-0" />
            <p className="text-[10px] text-gray-500 font-light leading-relaxed">
              <strong>GRÁTIS</strong>: *O chat de voz das salas temáticas está restrito a recepção e transmissão por chat de texto. Ative qualquer plano Premium para voz ao vivo.
            </p>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <AnimatePresence>
        {successAnimationPlan && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#0a0f1f]/95 rounded-[2.5rem] p-8 max-w-sm w-full border border-violet-500 shadow-2xl flex flex-col items-center text-center space-y-5"
            >
              <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center text-white text-3xl shadow-xl shadow-yellow-500/20 animate-pulse">
                👑
              </div>
              <div className="space-y-2">
                <h4 className="font-display font-bold text-white text-xl">Assinatura Ativada!</h4>
                <p className="text-xs text-white/75 font-light leading-relaxed">
                  Parabéns! Sua assinatura do Plano <strong className="text-violet-400 font-semibold">{successAnimationPlan}</strong> foi processada com sucesso. Todos os recursos já estão ativos no seu perfil!
                </p>
              </div>
              <button
                onClick={() => setSuccessAnimationPlan(null)}
                className="w-full py-4 bg-violet-600 hover:bg-violet-750 text-white rounded-2xl text-xs font-bold transition-all outline-none cursor-pointer"
              >
                Começar a Usar
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
