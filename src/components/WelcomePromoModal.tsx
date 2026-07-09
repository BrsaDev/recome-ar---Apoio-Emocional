import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, Gift, Users, Sparkles, Sliders } from 'lucide-react';
import { User } from '../types';

interface Props {
  user: User;
  onUpdateUser: (updated: User) => void;
  userCount: number;
  onUpdateUserCount: (count: number) => void;
  onClose: () => void;
}

export default function WelcomePromoModal({
  user,
  onUpdateUser,
  userCount,
  onUpdateUserCount,
  onClose
}: Props) {
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [redeemed, setRedeemed] = useState(false);

  // Check if they have already redeemed
  const isLimitReached = userCount >= 500;

  const handleRedeem = () => {
    if (isLimitReached) return;

    setIsRedeeming(true);
    // Simulate slight loading for better UX feel
    setTimeout(() => {
      onUpdateUser({
        ...user,
        plan: 'FREE'
      });
      // Increment count
      onUpdateUserCount(userCount + 1);
      setRedeemed(true);
      setIsRedeeming(false);
    }, 1200);
  };

  const handleQuickTestToggle = () => {
    // Easily toggle between 498 and 501 for instant verification
    const nextCount = userCount < 500 ? 501 : 498;
    onUpdateUserCount(nextCount);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-350">
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 15 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="relative bg-gradient-to-b from-indigo-950 via-slate-900 to-slate-950 text-white rounded-[2.5rem] w-full max-w-md pb-6 overflow-hidden border border-slate-800/80 shadow-2xl flex flex-col font-sans"
      >
        {/* Subtle Decorative Aura */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-32 bg-indigo-505/20 blur-3xl rounded-full pointer-events-none" />

        {/* Top Header with Close and spots left indicator */}
        <div className="flex items-center justify-between px-6 pt-6 z-10">
          <div className="flex items-center space-x-2 bg-indigo-500/10 border border-indigo-400/20 rounded-full px-3 py-1">
            <Users size={12} className="text-indigo-300" />
            <span className="text-[10px] font-bold text-indigo-200 uppercase tracking-widest font-mono">
              Campanha de Abertura
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-slate-800/40 hover:bg-slate-800 rounded-full transition-all outline-none"
            aria-label="Minimizar propaganda"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable Gift Content to keep elegant vertical constraints */}
        <div className="flex-1 overflow-y-auto px-7 py-3 max-h-[72dvh] space-y-5 no-scrollbar scroll-smooth">

          {/* Calming Welcome Illustration */}
          <div className="flex justify-center pt-2">
            <div className="relative w-28 h-28 flex items-center justify-center rounded-full bg-indigo-950/50 border border-indigo-500/20">
              {/* Spinning border */}
              <div className="absolute inset-0 rounded-full border-t border-r border-indigo-400/30 animate-spin" style={{ animationDuration: '6s' }} />

              {/* Custom SVG: Minimalist heart inside comforting hands */}
              <svg className="w-16 h-16 text-indigo-300 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="currentColor" className="text-indigo-500/30" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.05 17.5a4.5 4.5 0 011.95.5 4.5 4.5 0 011.95-.5M6 13h12M8 10h8" />
              </svg>

              <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center text-sm shadow-lg shadow-indigo-500/20">
                🌟
              </div>
            </div>
          </div>

          {!redeemed ? (
            <>
              {/* Campaign Status Ribbon */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-3 text-center">
                <div className="text-xs font-light text-slate-400">
                  {isLimitReached ? (
                    <span className="text-red-400 font-medium flex items-center justify-center gap-1">
                      ⚠️ Promoção esgotada ({userCount}/500 vagas preenchidas)
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-1.5 font-sans">
                      🔥 <strong className="text-indigo-200 font-bold font-mono">{userCount}</strong> pessoas já ativaram. Restam apenas <strong className="text-emerald-400 font-bold font-mono">{500 - userCount}</strong> vagas livres!
                    </span>
                  )}
                </div>
              </div>

              {/* Promo Title */}
              <div className="text-center space-y-1">
                <h3 className="text-xl font-display font-bold leading-tight bg-gradient-to-r from-white via-indigo-150 to-indigo-100 bg-clip-text text-transparent">
                  🌟 Um presente de boas-vindas para você!
                </h3>
                <p className="text-xs font-light text-indigo-200">
                  FAPEM • Seu novo espaço seguro de acolhimento
                </p>
              </div>

              {/* Dynamic Body Content */}
              {!isLimitReached ? (
                <div className="space-y-4">
                  <p className="text-xs text-slate-300 leading-relaxed font-light text-center">
                    Que bom que você está aqui. O FAPEM é o seu novo porto seguro, e queremos que você se sinta em casa desde o primeiro segundo.
                  </p>

                  <p className="text-xs text-indigo-100 bg-indigo-500/10 border border-indigo-500/20 p-3 rounded-2xl leading-relaxed font-normal text-center">
                    Para celebrar o seu início nessa jornada de acolhimento e apoio nós liberamos o <strong>Acesso Gratuito por Tempo Limitado</strong> ao nosso plano básico (que normalmente custa apenas R$ 0,99/dia).
                  </p>

                  <div className="space-y-2.5 pt-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                      Olha só tudo o que já está esperando por você:
                    </span>

                    <div className="grid grid-cols-1 gap-2 text-left">
                      <div className="bg-slate-900/40 hover:bg-slate-900 border border-slate-800/50 rounded-xl p-2.5 flex items-start gap-2.5 transition-colors">
                        <span className="text-base pt-0.5" role="img" aria-label="Microfone">🎙️</span>
                        <div>
                          <h4 className="text-[11px] font-bold text-white">Salas Temáticas com Chat de Voz ao Vivo</h4>
                          <p className="text-[10px] text-slate-400 font-light mt-0.5">Entre, ouça ou fale no seu ritmo, em salas criadas para compartilhar e acolher sem pressa.</p>
                        </div>
                      </div>

                      <div className="bg-slate-900/40 hover:bg-slate-900 border border-slate-800/50 rounded-xl p-2.5 flex items-start gap-2.5 transition-colors">
                        <span className="text-base pt-0.5" role="img" aria-label="Balão de conversa">💬</span>
                        <div>
                          <h4 className="text-[11px] font-bold text-white">Chats de Texto Instântaneos</h4>
                          <p className="text-[10px] text-slate-400 font-light mt-0.5">Conexões textuais em tempo real com pessoas que entendem exatamente o que você está passando.</p>
                        </div>
                      </div>

                      <div className="bg-slate-900/40 hover:bg-slate-900 border border-slate-800/50 rounded-xl p-2.5 flex items-start gap-2.5 transition-colors">
                        <span className="text-base pt-0.5" role="img" aria-label="Pessoas">👥</span>
                        <div>
                          <h4 className="text-[11px] font-bold text-white">Fórum da Comunidade Inteira</h4>
                          <p className="text-[10px] text-slate-400 font-light mt-0.5">Deixe seus relatos, sentimentos, leia histórias inspiradoras e interaja livremente de julgamentos.</p>
                        </div>
                      </div>

                      <div className="bg-slate-900/40 hover:bg-slate-900 border border-slate-800/50 rounded-xl p-2.5 flex items-start gap-2.5 transition-colors">
                        <span className="text-base pt-0.5" role="img" aria-label="Planta">🌱</span>
                        <div>
                          <h4 className="text-[11px] font-bold text-white">Pílulas Diárias de Motivação</h4>
                          <p className="text-[10px] text-slate-400 font-light mt-0.5">Mensagens exclusivas para dar um quentinho no coração e força extra para carregar seu dia.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="text-[11px] text-indigo-300 font-light text-center leading-normal">
                    Tudo isso, 100% gratuito agora para você experimentar o poder do apoio mútuo.
                  </p>
                </div>
              ) : (
                <div className="space-y-4 py-4 text-center">
                  <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-3xl text-slate-300 text-xs leading-relaxed font-light space-y-2">
                    <p className="text-red-300 font-bold text-sm">Contador Esgotado!</p>
                    <p>
                      Infelizmente, todas as 500 licenças gratuitas de lançamento já foram resgatadas pela nossa comunidade ativa nesta campanha de início.
                    </p>
                    <p>
                      Mas não se preocupe! Você ainda pode se cadastrar no plano gratuito comum ou experimentar o nosso Plano Básico por apenas R$0,99/dia para desfrutar de todos esses fantásticos recursos.
                    </p>
                  </div>

                  <div className="space-y-2 pt-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-2xl transition-all shadow-md active:scale-97 cursor-pointer outline-none"
                    >
                      Explorar No Plano Grátis
                    </button>
                    <p className="text-[10px] text-slate-400 font-light">
                      Fapem é grátis para recursos essenciais, ative planos apenas se quiser mais conforto.
                    </p>
                  </div>
                </div>
              )}
            </>
          ) : (
            // Success Redeem State
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-6 text-center space-y-4"
            >
              <div className="w-16 h-16 bg-emerald-500 text-white rounded-full flex items-center justify-center text-2xl mx-auto shadow-lg shadow-emerald-500/30 animate-bounce">
                ✓
              </div>

              <div className="space-y-1.5">
                <h4 className="text-lg font-bold text-emerald-400">🎁 Acesso Grátis Resgatado!</h4>
                <p className="text-xs text-slate-300 leading-relaxed font-light">
                  Seu Plano Básico foi ativado com sucesso! Você já pode desfrutar de salas de conversas sem limites, focar no fórum e muito mais, tudo totalmente gratuito por tempo limitado.
                </p>
              </div>

              <div className="bg-slate-900/40 p-3 rounded-2xl border border-slate-800 text-[10px] text-indigo-200">
                Nenhum cartão foi exigido. Sinta-se acolhido e confortável.
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-4 bg-indigo-650 hover:bg-indigo-700 text-white text-xs font-bold rounded-2xl shadow-lg transition-all"
              >
                Entrar no Aplicativo ➔
              </button>
            </motion.div>
          )}
        </div>

        {/* Action Bottom Section (Only if not redeemed yet) */}
        {!redeemed && !isLimitReached && (
          <div className="px-7 pt-2 flex flex-col items-center space-y-3 z-10">
            <motion.button
              type="button"
              whileTap={{ scale: 0.98 }}
              onClick={handleRedeem}
              disabled={isRedeeming}
              className="w-full py-4 bg-purple-650 hover:bg-purple-700 active:scale-98 disabled:opacity-50 text-white text-xs font-bold rounded-2xl shadow-lg shadow-purple-950/40 transition-all flex items-center justify-center space-x-2 cursor-pointer outline-none font-sans"
              id="btn-redeem-free-gift"
            >
              <span>{isRedeeming ? 'Ativando...' : '💜 Resgatar Meu Acesso Grátis'}</span>
            </motion.button>

            <p className="text-[10px] text-slate-400 text-center font-light leading-snug">
              Não se preocupe, nenhuma cobrança será feita agora.
            </p>

            <button
              type="button"
              onClick={onClose}
              className="text-[11px] text-slate-400 hover:text-white font-medium underline transition-all bg-transparent border-none p-1 cursor-pointer outline-none"
            >
              Explorar o app primeiro
            </button>
          </div>
        )}

        {/* Development testing bar to easily toggle counts */}
        <div className="mt-4 border-t border-slate-800/60 p-2 text-center bg-slate-950/40">
          <button
            type="button"
            onClick={handleQuickTestToggle}
            className="inline-flex items-center space-x-1.5 text-[9px] text-slate-500 hover:text-indigo-400 font-mono transition-colors"
            title="Clique para alternar o contador e testar o app esgotado/liberado"
          >
            <Sliders size={10} />
            <span>Simulador de Vagas: {userCount}/500 ({userCount < 500 ? "LIVRE" : "ESGOTADO"})</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
