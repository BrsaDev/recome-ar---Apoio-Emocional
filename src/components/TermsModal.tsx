import { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { Shield, AlertCircle, FileText, Check, Heart, ShieldCheck, Lock } from 'lucide-react';
import { User } from '../types';

interface Props {
  user?: User | null;
  onAccept: (termsAcceptedAt: string, termsVersion: string) => void;
}

export default function TermsModal({ user, onAccept }: Props) {
  const [isChecked1, setIsChecked1] = useState(false);
  const [isChecked2, setIsChecked2] = useState(false);
  const [isChecked3, setIsChecked3] = useState(false);
  const [isChecked4, setIsChecked4] = useState(false); // Age check
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const checkScrollable = () => {
    const el = scrollRef.current;
    if (el) {
      const isBottom = el.scrollHeight - el.scrollTop <= el.clientHeight + 60;
      if (isBottom || el.scrollHeight <= el.clientHeight) {
        setHasScrolledToBottom(true);
      }
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      checkScrollable();
    }, 200);

    window.addEventListener('resize', checkScrollable);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', checkScrollable);
    };
  }, []);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    checkScrollable();
  };

  const handleAccept = () => {
    if (isChecked1 && isChecked2 && isChecked3 && isChecked4 && hasScrolledToBottom) {
      const timestamp = new Date().toISOString();
      onAccept(timestamp, '1.1.0-LGPD-SAFE');
    }
  };

  const isButtonEnabled = isChecked1 && isChecked2 && isChecked3 && isChecked4 && hasScrolledToBottom;

  return (
    <div className="fixed inset-0 z-[1000] bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 text-white">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
        className="bg-[#0a0f1f]/95 w-full max-w-md rounded-[2.5rem] shadow-2xl flex flex-col h-[85vh] max-h-[95vh] border border-white/5 overflow-hidden"
      >
        {/* Header */}
        <div className="bg-[#12182b]/90 px-6 py-4 border-b border-white/5 flex items-center space-x-3 shrink-0">
          <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0 shadow-sm">
            <ShieldCheck size={22} className="animate-pulse" />
          </div>
          <div className="text-left flex-1 min-w-0">
            <h2 className="text-sm sm:text-base font-display font-bold text-white leading-tight">
              Termos de Uso e Responsabilidade
            </h2>
            <p className="text-[10px] text-purple-400 font-medium uppercase tracking-wider font-mono mt-0.5">
              Conformidade LGPD • Ver. 1.1.0
            </p>
          </div>
        </div>

        {/* Scrollable Content */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto p-5 space-y-4 text-xs text-gray-300 leading-relaxed bg-[#020410]/40 scroll-smooth"
        >
          {/* CRITICAL WARNING */}
          <div className="bg-red-500/10 rounded-2xl p-4 border border-red-500/20 space-y-2 shrink-0 shadow-sm">
            <div className="flex items-center space-x-2 text-red-400">
              <AlertCircle size={16} className="shrink-0" />
              <span className="font-bold font-display text-xs text-red-400 uppercase tracking-wide">Aviso de Natureza do Serviço</span>
            </div>
            <p className="text-[11px] text-red-300 font-medium leading-relaxed">
              O **FAPEM** é uma plataforma de apoio mútuo e integração social. **NÃO substituímos** ajuda profissional (psicólogos/psiquiatras) e **NÃO somos** um serviço de emergência médica.
            </p>
          </div>

          <div className="space-y-4">
            <p className="text-gray-300 text-[11px] sm:text-xs">
              Bem-vindo ao FAPEM. Para prosseguir, você deve declarar estar ciente das regras de segurança e privacidade abaixo:
            </p>

            <div className="bg-[#12182b] rounded-2xl p-4 border border-white/5 space-y-2 shadow-xs">
              <div className="flex items-center space-x-2 text-purple-400 mb-1">
                <Shield size={14} />
                <h4 className="font-bold text-[11px] uppercase tracking-wide">1. Proteção de Dados (LGPD)</h4>
              </div>
              <p className="font-light text-[11px] text-gray-400">
                Seus dados são tratados com base na Lei Geral de Proteção de Dados (LGPD). Coletamos apenas o mínimo necessário para seu acesso. Você tem direito a solicitar a exclusão de sua conta e dados a qualquer momento através do suporte.
              </p>
            </div>

            <div className="bg-[#12182b] rounded-2xl p-4 border border-white/5 space-y-2 shadow-xs">
              <div className="flex items-center space-x-2 text-purple-400 mb-1">
                <Lock size={14} />
                <h4 className="font-bold text-[11px] uppercase tracking-wide">2. Criptografia de Ponta-a-Ponta</h4>
              </div>
              <p className="font-light text-[11px] text-gray-400">
                Implementamos criptografia E2EE. Suas mensagens são cifradas no seu dispositivo e só podem ser lidas pelo destinatário. Nem mesmo o FAPEM tem acesso ao conteúdo de suas conversas privadas.
              </p>
            </div>

            <div className="bg-[#12182b] rounded-2xl p-4 border border-white/5 space-y-2 shadow-xs">
              <div className="flex items-center space-x-2 text-purple-400 mb-1">
                <Heart size={14} />
                <h4 className="font-bold text-[11px] uppercase tracking-wide">3. Ajuda Humanizada (CVV)</h4>
              </div>
              <p className="font-light text-[11px] text-gray-400">
                Caso esteja em uma crise aguda, procure ajuda profissional imediata. O **CVV (Centro de Valorização da Vida)** atende gratuitamente pelo número **188** em todo o Brasil. O FAPEM é apenas um ambiente de conversa entre pares.
              </p>
            </div>

            <div className="bg-[#12182b] rounded-2xl p-4 border border-red-500/20 space-y-2 shadow-xs">
              <div className="flex items-center space-x-2 text-red-400 mb-1">
                <AlertCircle size={14} />
                <h4 className="font-bold text-[11px] uppercase tracking-wide">4. Isenção de Responsabilidade</h4>
              </div>
              <p className="font-light text-[11px] text-gray-450 italic">
                Ao utilizar o app, você isenta integralmente os desenvolvedores de qualquer responsabilidade sobre condutas de terceiros ou decisões tomadas baseadas em conversas ocorridas na plataforma.
              </p>
            </div>
          </div>

          {!hasScrolledToBottom && (
            <div className="sticky bottom-0 bg-gradient-to-t from-[#0a0f1f]/80 to-transparent py-4 text-center shrink-0">
              <span className="inline-block bg-purple-500/10 text-purple-400 border border-purple-500/25 px-4 py-1.5 rounded-full font-bold text-[10px] animate-bounce tracking-wide shadow-sm">
                ↓ Role para ler tudo e liberar o aceite ↓
              </span>
            </div>
          )}
        </div>

        {/* Checkboxes Wrapper */}
        <div className="px-6 py-5 space-y-3 bg-[#0a0f1f]/95 border-t border-white/5 shrink-0">
          <div className="space-y-3">
            <label className="flex items-start space-x-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={isChecked4}
                onChange={(e) => setIsChecked4(e.target.checked)}
                className="mt-0.5 rounded-md border-white/10 bg-[#12182b] text-purple-600 focus:ring-purple-500 h-4 w-4"
              />
              <span className="text-[11px] text-gray-300 font-medium leading-tight group-hover:text-purple-400 transition-colors">
                Confirmo que sou **maior de 18 anos**.
              </span>
            </label>

            <label className="flex items-start space-x-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={isChecked1}
                onChange={(e) => setIsChecked1(e.target.checked)}
                className="mt-0.5 rounded-md border-white/10 bg-[#12182b] text-purple-600 focus:ring-purple-500 h-4 w-4"
              />
              <span className="text-[11px] text-gray-300 leading-tight group-hover:text-purple-400 transition-colors">
                Estou ciente de que o app **não substitui ajuda médica ou psicológica**.
              </span>
            </label>

            <label className="flex items-start space-x-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={isChecked2}
                onChange={(e) => setIsChecked2(e.target.checked)}
                className="mt-0.5 rounded-md border-white/10 bg-[#12182b] text-purple-600 focus:ring-purple-500 h-4 w-4"
              />
              <span className="text-[11px] text-gray-300 leading-tight group-hover:text-purple-400 transition-colors">
                Aceito a Política de Privacidade (LGPD) e isenção de responsabilidade.
              </span>
            </label>

            <label className={`flex items-start space-x-3 cursor-pointer group transition-opacity ${!hasScrolledToBottom ? 'opacity-50' : ''}`}>
              <input
                type="checkbox"
                checked={isChecked3}
                disabled={!hasScrolledToBottom}
                onChange={(e) => setIsChecked3(e.target.checked)}
                className="mt-0.5 rounded-md border-white/10 bg-[#12182b] text-purple-600 focus:ring-purple-500 h-4 w-4 disabled:cursor-not-allowed"
              />
              <span className="text-[11px] text-gray-300 leading-tight group-hover:text-purple-400 transition-colors">
                Entendo que meu aceite é gravado de forma imutável para segurança jurídica.
              </span>
            </label>
          </div>

          <button
            onClick={handleAccept}
            disabled={!isButtonEnabled}
            className={`w-full py-4 mt-2 rounded-[1.5rem] text-sm font-bold transition-all outline-none flex items-center justify-center space-x-2 font-display cursor-pointer ${isButtonEnabled
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-neon-purple shadow-xl border border-purple-550/20'
              : 'bg-white/5 text-gray-500 cursor-not-allowed border border-white/5'
              }`}
          >
            <ShieldCheck size={16} />
            <span>Assinar e Começar</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
