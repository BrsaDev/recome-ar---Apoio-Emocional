import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { View, User } from '../types';
import { ArrowLeft, Check, X, Sparkles, AlertCircle, HelpCircle } from 'lucide-react';
import { cn } from '../lib/utils';

interface Props {
  user: User | null;
  navigate: (view: View) => void;
  onUpdateUser: (updated: User) => void;
}

const TIER_DETAILS = [
  {
    id: 'free',
    name: 'Grátis',
    duration: 'Para sempre',
    price: 'R$ 0,00',
    originalPrice: null,
    badgeColor: 'bg-indigo-50/60 text-indigo-600 border-indigo-150',
    headerBg: 'from-indigo-500/5 to-indigo-500/10',
    buttonStyle: 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100',
  },
  {
    id: 'basic',
    name: 'Básico',
    duration: '24 horas',
    price: 'R$ 0,99',
    originalPrice: null,
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
    headerBg: 'from-purple-500/5 to-purple-500/10',
    buttonStyle: 'bg-purple-600 hover:bg-purple-700 shadow-purple-100',
  },
  {
    id: 'vip',
    name: 'VIP',
    duration: '10 dias',
    price: 'R$ 5,99',
    originalPrice: 'R$ 9,99',
    badgeColor: 'bg-violet-50 text-violet-700 border-violet-200',
    headerBg: 'from-violet-500/5 to-violet-500/10',
    buttonStyle: 'bg-violet-600 hover:bg-violet-700 shadow-violet-100',
  },
  {
    id: 'premium',
    name: 'PREMIUM',
    duration: '30 dias',
    price: 'R$ 14,99',
    originalPrice: 'R$ 29,99',
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
    headerBg: 'from-purple-500/5 to-purple-500/10',
    buttonStyle: 'bg-purple-600 hover:bg-purple-700 shadow-purple-100',
    isPopular: true,
  }
];

export default function VIP({ user, navigate, onUpdateUser }: Props) {
  const [selectedPlan, setSelectedPlan] = useState<string>(user?.plan || 'premium');
  const [activeTab, setActiveTab] = useState<'cards' | 'table'>('cards');
  const [successAnimationPlan, setSuccessAnimationPlan] = useState<string | null>(null);

  const userCount = (() => {
    const saved = localStorage.getItem('recomecar_user_count');
    if (saved) {
      const parsed = parseInt(saved, 10);
      if (!isNaN(parsed)) return parsed;
    }
    return 498;
  })();

  const isLimitReached = userCount >= 500;

  const handleSubscribe = (planKey: 'free' | 'basic' | 'vip' | 'premium', planName: string) => {
    setSuccessAnimationPlan(planName);
    if (user && onUpdateUser) {
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
    <div className="h-full w-full bg-brand-white flex flex-col relative select-none">
      {/* Header */}
      <header className="p-4 flex items-center justify-between border-b border-brand-blue/5">
        <div className="flex items-center space-x-3">
          <button onClick={() => navigate('profile')} className="p-2 -ml-2 text-gray-400 hover:text-brand-text active:scale-95 transition-transform">
            <ArrowLeft size={22} />
          </button>
          <h2 className="text-lg font-display font-bold text-brand-text">Planos e Assinaturas</h2>
        </div>
        <div className="flex bg-brand-gray p-0.5 rounded-xl border border-brand-blue/5">
          <button 
            onClick={() => setActiveTab('cards')} 
            className={cn(
              "px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all outline-none",
              activeTab === 'cards' ? "bg-white text-brand-text shadow-xs" : "text-gray-400 hover:text-gray-600"
            )}
          >
            Vitrine
          </button>
          <button 
            onClick={() => setActiveTab('table')} 
            className={cn(
              "px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all outline-none",
              activeTab === 'table' ? "bg-white text-brand-text shadow-xs" : "text-gray-400 hover:text-gray-600"
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
            <div className="text-center space-y-1.5 max-w-xs mx-auto">
              <span className="text-[10px] uppercase font-bold text-brand-blue tracking-widest">Escolha a melhor opção</span>
              <h3 className="text-xl font-display font-bold text-brand-text leading-tight">Cuidado emocional sob medida</h3>
              <p className="text-xs text-brand-text/60 leading-normal font-light">
                Assine de forma simples e rápida com ativação instantânea no aplicativo.
              </p>
            </div>

            {/* Plan selector cards */}
            <div className="grid grid-cols-1 gap-4">
              {TIER_DETAILS.map((plan) => {
                const isSelected = selectedPlan === plan.id;
                const displayPrice = plan.id === 'basic' && !isLimitReached ? 'R$ 0,00' : plan.price;
                const displayOriginalPrice = plan.id === 'basic' && !isLimitReached ? 'R$ 0,99' : plan.originalPrice;
                const displayBadgeColor = plan.id === 'basic' && !isLimitReached ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : plan.badgeColor;

                return (
                  <motion.div
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan.id)}
                    className={cn(
                      "border rounded-3xl p-5 relative overflow-hidden transition-all cursor-pointer",
                      isSelected 
                        ? "bg-brand-white border-brand-text ring-1 ring-brand-text shadow-md" 
                        : "bg-brand-white border-brand-blue/10 hover:border-brand-blue/20"
                    )}
                    layoutId={`plan-${plan.id}`}
                  >
                    {plan.isPopular && (
                      <div className="absolute right-0 top-0 bg-brand-text text-white text-[9px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                        Recomendado
                      </div>
                    )}

                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-1.5">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${displayBadgeColor}`}>
                            {plan.name}
                          </span>
                          <span className="text-[11px] text-gray-400 font-medium font-mono">
                            {plan.duration}
                          </span>
                        </div>
                        <h4 className="font-display font-bold text-[16px] text-brand-text pt-1">
                          Acesso {plan.name}
                        </h4>
                      </div>

                      <div className="text-right">
                        {displayOriginalPrice && (
                          <div className="text-xs text-gray-400 line-through leading-none">
                            {displayOriginalPrice}
                          </div>
                        )}
                        <div className="text-lg font-display font-extrabold text-brand-text">
                          {displayPrice}
                        </div>
                      </div>
                    </div>

                    {/* Features list dynamic preview for selected or all cards */}
                    <AnimatePresence>
                      {isSelected && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-4 pt-4 border-t border-brand-blue/5 space-y-2.5 overflow-hidden"
                        >
                          {plan.id === 'free' && (
                            <>
                              <div className="flex items-center space-x-2 text-xs text-brand-text/75 font-light">
                                <Check size={14} className="text-indigo-500 shrink-0" />
                                <span>Salas temáticas (5 minutos a cada 24 horas)</span>
                              </div>
                              <div className="flex items-center space-x-2 text-xs text-brand-text/75 font-light">
                                <Check size={14} className="text-indigo-500 shrink-0" />
                                <span>Mensagens motivacionais diárias</span>
                              </div>
                              <div className="flex items-center space-x-2 text-xs opacity-40 font-light line-through">
                                <X size={14} className="text-red-400 shrink-0" />
                                <span>Acesso ilimitado ao Fórum</span>
                              </div>
                            </>
                          )}

                          {plan.id === 'basic' && (
                            <>
                              <div className="flex items-center space-x-2 text-xs text-brand-text/75 font-light">
                                <Check size={14} className="text-purple-500 shrink-0" />
                                <span>Salas temáticas sem limite de tempo</span>
                              </div>
                              <div className="flex items-center space-x-2 text-xs text-brand-text/75 font-light">
                                <Check size={14} className="text-purple-500 shrink-0" />
                                <span>Mensagens motivacionais ilimitadas</span>
                              </div>
                              <div className="flex items-center space-x-2 text-xs text-brand-text/75 font-light">
                                <Check size={14} className="text-purple-500 shrink-0" />
                                <span>Fórum integrado</span>
                              </div>
                              <div className="flex items-center space-x-2 text-xs text-brand-text/75 font-light">
                                <Check size={14} className="text-purple-500 shrink-0" />
                                <span>Pode receber convite para Sala VIP</span>
                              </div>
                            </>
                          )}

                          {plan.id === 'vip' && (
                            <>
                              <div className="flex items-center space-x-2 text-xs text-brand-text/75 font-light">
                                <Check size={14} className="text-violet-500 shrink-0" />
                                <span>Salas temáticas ilimitadas</span>
                              </div>
                              <div className="flex items-center space-x-2 text-xs text-brand-text/75 font-light">
                                <Check size={14} className="text-violet-500 shrink-0" />
                                <span>Acesso ao Fórum completo</span>
                              </div>
                              <div className="flex items-center space-x-2 text-xs text-brand-text/75 font-light">
                                <Check size={14} className="text-violet-500 shrink-0" />
                                <span>Pode receber convites para Sala VIP</span>
                              </div>
                              <div className="flex items-center space-x-2 text-xs opacity-40 font-light line-through">
                                <X size={14} className="text-red-400 shrink-0" />
                                <span>Criação de salas de conversas personalizadas</span>
                              </div>
                            </>
                          )}

                          {plan.id === 'premium' && (
                            <>
                              <div className="flex items-center space-x-2 text-xs text-brand-text/75 font-light">
                                <Check size={14} className="text-brand-green shrink-0" />
                                <span>Tudo liberado 24h por 30 dias</span>
                              </div>
                              <div className="flex items-center space-x-2 text-xs text-brand-text/75 font-light">
                                <Check size={14} className="text-brand-green shrink-0" />
                                <span>Acesso total ao Fórum e Salas VIP</span>
                              </div>
                              <div className="flex items-center space-x-2 text-xs text-brand-text/75 font-light">
                                <Check size={14} className="text-brand-green shrink-0" />
                                <span>Permissão para criar suas próprias salas</span>
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
                              "w-full text-white py-3.5 mt-2 rounded-2xl text-xs font-bold font-display shadow-md active:scale-95 transition-all outline-none",
                              plan.buttonStyle
                            )}
                          >
                            Ativar Plano {plan.name}
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

        {/* TAB 2: DETAILED TABLE (COMPARTATIVO DOS GRANDES PLAYERS) */}
        {activeTab === 'table' && (
          <div className="space-y-6">
            <div className="text-center space-y-1.5 max-w-xs mx-auto mb-2">
              <span className="text-[10px] uppercase font-bold text-brand-blue tracking-widest">Tabela de Atributos</span>
              <h3 className="text-xl font-display font-bold text-brand-text leading-tight">Comparação Completa</h3>
            </div>

            {/* Design da tabela */}
            <div className="bg-brand-white border border-brand-blue/10 rounded-[2rem] overflow-hidden shadow-sm">
              <div className="grid grid-cols-5 bg-brand-gray border-b border-brand-blue/5 text-[9px] font-bold text-gray-500 uppercase tracking-wider py-4 px-3 text-center">
                <span className="text-left font-display">Recurso</span>
                <span className="text-indigo-600">Grátis</span>
                <span className="text-purple-600">Básico</span>
                <span className="text-violet-600">VIP</span>
                <span className="text-brand-green">Premium</span>
              </div>

              {/* Rows */}
              <div className="divide-y divide-brand-blue/5 text-xs text-brand-text">
                {/* Row 1 */}
                <div className="grid grid-cols-5 py-3.5 px-3 items-center text-center">
                  <span className="text-left text-[11px] font-semibold text-gray-700">Salas temáticas</span>
                  <div className="flex justify-center text-[8.5px] leading-tight text-indigo-700 font-semibold max-w-full px-1">
                    5 min a cada 24h*
                  </div>
                  <div className="flex justify-center text-purple-600 font-bold">sim</div>
                  <div className="flex justify-center text-violet-600 font-bold">sim</div>
                  <div className="flex justify-center text-brand-green font-bold">sim</div>
                </div>

                {/* Row 2 */}
                <div className="grid grid-cols-5 py-3.5 px-3 items-center text-center">
                  <span className="text-left text-[11px] font-semibold text-gray-700">Mensagens motivacionais</span>
                  <div className="flex justify-center text-indigo-600 font-bold">sim</div>
                  <div className="flex justify-center text-purple-600 font-bold">sim</div>
                  <div className="flex justify-center text-violet-600 font-bold">sim</div>
                  <div className="flex justify-center text-brand-green font-bold">sim</div>
                </div>

                {/* Row 3 */}
                <div className="grid grid-cols-5 py-3.5 px-3 items-center text-center">
                  <span className="text-left text-[11px] font-semibold text-gray-700">Fórum</span>
                  <div className="flex justify-center text-red-400 font-bold">não</div>
                  <div className="flex justify-center text-purple-600 font-bold">sim</div>
                  <div className="flex justify-center text-violet-600 font-bold">sim</div>
                  <div className="flex justify-center text-brand-green font-bold">sim</div>
                </div>

                {/* Row 4 */}
                <div className="grid grid-cols-5 py-3.5 px-3 items-center text-center text-brand-text">
                  <span className="text-left text-[11px] font-semibold text-gray-700">Sala VIP</span>
                  <div className="flex justify-center text-red-400 font-bold">não</div>
                  <div className="flex justify-center text-purple-600 font-bold">sim**</div>
                  <div className="flex justify-center text-violet-600 font-bold">sim**</div>
                  <div className="flex justify-center text-brand-green font-bold">sim</div>
                </div>

                {/* Row 5 */}
                <div className="grid grid-cols-5 py-3.5 px-3 items-center text-center">
                  <span className="text-left text-[11px] font-semibold text-gray-700">Criação de sala</span>
                  <div className="flex justify-center text-red-400 font-bold">não</div>
                  <div className="flex justify-center text-red-400 font-bold">não</div>
                  <div className="flex justify-center text-red-400 font-bold">não</div>
                  <div className="flex justify-center text-brand-green font-bold">sim</div>
                </div>

                {/* Row 6 / Price */}
                <div className="grid grid-cols-5 py-4 px-3 items-center text-center bg-brand-gray/30 font-display">
                  <span className="text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Valor</span>
                  <div className="font-bold text-indigo-700 text-[10px]">Grátis</div>
                  <div className="font-bold text-purple-700 text-[10px]">{isLimitReached ? 'R$ 0,99' : 'R$ 0,00'}</div>
                  <div className="text-[10px] flex flex-col justify-center">
                    <span className="text-[8px] text-gray-400 line-through">R$9,99</span>
                    <span className="font-bold text-violet-750">R$5,99</span>
                  </div>
                  <div className="text-[10px] flex flex-col justify-center">
                    <span className="text-[8px] text-gray-400 line-through">R$29,99</span>
                    <span className="font-bold text-brand-green">R$14,99</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick CTAs for each column below table */}
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => handleSubscribe('free', 'Grátis')}
                className="py-2.5 px-3 rounded-xl bg-indigo-600 active:scale-95 text-white font-bold text-xs shadow-md transition-all outline-none text-center flex flex-col items-center justify-center cursor-pointer"
              >
                <span>Ativar Grátis</span>
                <span className="text-[8.5px] font-light opacity-80">R$ 0,00 (Sempre)</span>
              </button>
              <button
                onClick={() => handleSubscribe('basic', 'Básico')}
                className="py-2.5 px-3 rounded-xl bg-purple-600 active:scale-95 text-white font-bold text-xs shadow-md transition-all outline-none text-center flex flex-col items-center justify-center cursor-pointer"
              >
                <span>Assinar Básico</span>
                <span className="text-[8.5px] font-light opacity-80">
                  {isLimitReached ? 'R$ 0,99 (24 horas)' : 'Grátis (Promo de Abertura)'}
                </span>
              </button>
              <button
                onClick={() => handleSubscribe('vip', 'VIP')}
                className="py-2.5 px-3 rounded-xl bg-violet-600 active:scale-95 text-white font-bold text-xs shadow-md transition-all outline-none text-center flex flex-col items-center justify-center cursor-pointer"
              >
                <span>Assinar VIP</span>
                <span className="text-[8.5px] font-light opacity-80">R$ 5,99 (10 dias)</span>
              </button>
              <button
                onClick={() => handleSubscribe('premium', 'PREMIUM')}
                className="py-2.5 px-3 rounded-xl bg-brand-green active:scale-95 text-white font-bold text-xs shadow-md transition-all outline-none text-center flex flex-col items-center justify-center cursor-pointer"
              >
                <span>Assinar PREMIUM</span>
                <span className="text-[8.5px] font-light opacity-80">R$ 14,99 (30 dias)</span>
              </button>
            </div>
          </div>
        )}

        {/* Footnotes */}
        <div className="bg-brand-gray p-4 rounded-2xl space-y-2 border border-brand-blue/5">
          <div className="flex items-start space-x-2">
            <AlertCircle size={14} className="text-gray-400 mt-0.5 shrink-0" />
            <p className="text-[10px] text-gray-500 font-light leading-relaxed">
              <strong>BÁSICO</strong>: *5 minutos a cada 24h refere-se ao limite de conversação contínua nas salas coletivas gratuitas.
            </p>
          </div>
          <div className="flex items-start space-x-2">
            <HelpCircle size={14} className="text-gray-400 mt-0.5 shrink-0" />
            <p className="text-[10px] text-gray-500 font-light leading-relaxed">
              <strong>VIP</strong>: **Ao assinar o plano Básico ou VIP você pode receber e aceitar link de convite direto para as salas VIPs exclusivas de moderação.
            </p>
          </div>
        </div>
      </div>

      {/* Success Modal animado */}
      <AnimatePresence>
        {successAnimationPlan && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-brand-white rounded-[2.5rem] p-8 max-w-sm w-full border border-yellow-200 shadow-2xl flex flex-col items-center text-center space-y-5"
            >
              <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center text-white text-3xl shadow-xl shadow-yellow-100 animate-pulse">
                👑
              </div>
              <div className="space-y-2">
                <h4 className="font-display font-bold text-brand-text text-xl">Assinatura Ativada!</h4>
                <p className="text-xs text-brand-text/75 font-light leading-relaxed">
                  Parabéns! Sua assinatura do Plano <strong className="text-brand-blue font-semibold">{successAnimationPlan}</strong> foi processada com sucesso via simulação offline. Todos os recursos já estão ativos no seu perfil!
                </p>
              </div>
              <button
                onClick={() => setSuccessAnimationPlan(null)}
                className="w-full py-4 bg-brand-text hover:bg-brand-text/90 active:scale-95 text-white rounded-2xl text-xs font-bold transition-all outline-none"
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
