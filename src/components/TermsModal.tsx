import { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { Shield, AlertCircle, FileText, Check, Heart } from 'lucide-react';
import { User } from '../types';

interface Props {
  user: User;
  onAccept: (termsAcceptedAt: string, termsVersion: string) => void;
}

export default function TermsModal({ user, onAccept }: Props) {
  const [isChecked1, setIsChecked1] = useState(false);
  const [isChecked2, setIsChecked2] = useState(false);
  const [isChecked3, setIsChecked3] = useState(false);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const checkScrollable = () => {
    const el = scrollRef.current;
    if (el) {
      // Se a altura visível (clientHeight) for igual ou muito próxima da altura total (scrollHeight),
      // significa que cabe tudo na tela sem rolagem, então liberamos direto.
      // Caso contrário, toleramos até 40px para facilitar no mobile.
      const isBottom = el.scrollHeight - el.scrollTop <= el.clientHeight + 40;
      if (isBottom || el.scrollHeight <= el.clientHeight) {
        setHasScrolledToBottom(true);
      }
    }
  };

  useEffect(() => {
    // Roda uma verificação inicial e após o render
    const timer = setTimeout(() => {
      checkScrollable();
    }, 150);

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
    if (isChecked1 && isChecked2 && isChecked3 && hasScrolledToBottom) {
      const timestamp = new Date().toISOString();
      onAccept(timestamp, '1.0.0-PRO-SAFE');
    }
  };

  const isButtonEnabled = isChecked1 && isChecked2 && isChecked3 && hasScrolledToBottom;

  return (
    <div className="fixed inset-0 z-[1000] bg-brand-text/50 backdrop-blur-md flex items-center justify-center p-3">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
        className="bg-white w-full max-w-md rounded-[2.2rem] shadow-2xl flex flex-col h-[82vh] max-h-[90vh] border border-brand-blue/5 overflow-hidden"
      >
        {/* Sleek, Compact Horizontal Header */}
        <div className="bg-gradient-to-b from-purple-50/70 to-white px-5 py-3 border-b border-brand-blue/5 flex items-center space-x-3 shrink-0">
          <div className="w-8 h-8 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600 shrink-0">
            <Shield size={18} className="animate-pulse" />
          </div>
          <div className="text-left flex-1 min-w-0">
            <h2 className="text-xs sm:text-sm font-display font-bold text-gray-950 leading-tight truncate">
              Termo de Consentimento e Responsabilidade
            </h2>
            <p className="text-[9px] text-gray-400 font-light mt-0.5 uppercase tracking-wider font-mono">
              Versão 1.0.0-PRO-SAFE • Segurança Jurídica
            </p>
          </div>
        </div>

        {/* Content Box (Scrollable & Expanded) */}
        <div 
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 text-xs text-gray-600 leading-relaxed bg-brand-gray/20 scroll-smooth"
        >
          <div className="bg-red-50/70 rounded-2xl p-3 border border-red-100 space-y-1.5 shrink-0">
            <div className="flex items-center space-x-2 text-red-700">
              <AlertCircle size={14} className="shrink-0" />
              <span className="font-bold font-display text-[10px] sm:text-xs text-red-900 uppercase">Aviso Técnico-Legal Crucial</span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-red-850 font-normal leading-normal">
              O <strong>Recomeçar</strong> é uma comunidade de integração social e compartilhamento espontâneo de vivências interpessoais. Ele <strong className="underline">não oferece e não substitui</strong> psicoterapias, tratamentos psiquiátricos, diagnósticos ou nenhum tipo de terapia clínico-assistencial.
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-gray-700 text-[11px] sm:text-xs">
              Caro(a) <strong className="text-purple-700 font-semibold">{user.name}</strong>, para mantermos um ambiente seguro e de total blindagem contra responsabilidades de âmbito médico-hospitalar, solicitamos sua leitura e concordância inequívoca com as cláusulas abaixo:
            </p>

            <div className="bg-white/80 rounded-xl p-3 border border-brand-blue/5 space-y-1">
              <h4 className="font-bold text-gray-800 flex items-center space-x-1.5 text-[10px] uppercase tracking-wide">
                <span className="w-1 h-3 bg-purple-600 rounded-xs inline-block"></span>
                <span>1. Natureza do Serviço e Limitações Jurídicas</span>
              </h4>
              <p className="font-light pl-2.5 text-[11px] text-gray-500">
                O aplicativo destina-se apenas à facilitação de conversas em salas públicas/privadas sobre experiências vividas. Nenhuma correspondência, anjo de apoio, moderação, ou bot assistente deve ser interpretado de maneira clínica ou encarado como receita terapêutica profissional.
              </p>
            </div>

            <div className="bg-white/80 rounded-xl p-3 border border-brand-blue/5 space-y-1">
              <h4 className="font-bold text-gray-800 flex items-center space-x-1.5 text-[10px] uppercase tracking-wide">
                <span className="w-1 h-3 bg-purple-600 rounded-xs inline-block"></span>
                <span>2. Atendimento Emergencial Recomendado</span>
              </h4>
              <p className="font-light pl-2.5 text-[11px] text-gray-500">
                Se você se encontra em sofrimento extremo, em crise de pânico aguda ou com ideações de autoagressão, <strong className="text-brand-text font-normal">reconheça que este app não substitui o socorro clínico imediato</strong>. Ligue para as autoridades de saúde no <strong className="text-purple-700 font-bold">SAMU (192)</strong> ou contate o <strong className="text-purple-700 font-bold">Centro de Valorização da Vida - CVV (188)</strong>.
              </p>
            </div>

            <div className="bg-white/80 rounded-xl p-3 border border-brand-blue/5 space-y-1">
              <h4 className="font-bold text-gray-800 flex items-center space-x-1.5 text-[10px] uppercase tracking-wide">
                <span className="w-1 h-3 bg-purple-600 rounded-xs inline-block"></span>
                <span>3. Isenção Total de Custódia e Danos</span>
              </h4>
              <p className="font-light pl-2.5 text-[11px] text-gray-500">
                Os proprietários, mantenedores, desenvolvedores e moderadores deste ambiente digital encontram-se integralmente isentos de qualquer prejuízo advindo de decisões clínicas ou condutas adotadas com base nos fóruns e chats do aplicativo.
              </p>
            </div>

            <div className="bg-white/80 rounded-xl p-3 border border-brand-blue/5 space-y-1">
              <h4 className="font-bold text-gray-800 flex items-center space-x-1.5 text-[10px] uppercase tracking-wide">
                <span className="w-1 h-3 bg-purple-600 rounded-xs inline-block"></span>
                <span>4. Irrevogabilidade do Consentimento</span>
              </h4>
              <p className="font-light pl-2.5 text-[11px] text-gray-500 italic">
                Ao registrar seu aceite, ele se tornará imediatamente imutável e irrevogável no seu perfil para fins de assepsia jurídica de dados, impedindo qualquer questionamento posterior sobre a transparência destas regras operacionais.
              </p>
            </div>
          </div>

          {!hasScrolledToBottom && (
            <div className="sticky bottom-0 bg-gradient-to-t from-brand-gray/20 to-transparent py-2.5 text-center shrink-0">
              <span className="inline-block bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-bold text-[9px] animate-bounce tracking-wide shadow-xs">
                ↓ Role a tela de termos para liberar o aceite ↓
              </span>
            </div>
          )}
        </div>

        {/* Scroll Confirm Sign Tag */}
        {hasScrolledToBottom && (
          <div className="px-5 py-1.5 bg-emerald-50 text-emerald-850 text-[10px] font-bold text-center flex items-center justify-center space-x-1 border-t border-emerald-100 shrink-0">
            <Check size={12} className="shrink-0 text-emerald-600 animate-bounce" />
            <span>Documento lido por completo. Termos de aceitação liberados.</span>
          </div>
        )}

        {/* checkboxes */}
        <div className="px-5 py-3.5 space-y-2.5 bg-brand-white border-t border-brand-blue/5 shrink-0">
          <label className="flex items-start space-x-2 cursor-pointer select-none">
            <input 
              type="checkbox" 
              checked={isChecked1} 
              onChange={(e) => setIsChecked1(e.target.checked)}
              className="mt-0.5 rounded border-gray-300 text-purple-600 focus:ring-purple-500 scale-100"
            />
            <span className="text-[10px] sm:text-[11px] text-gray-600 leading-tight">
              Declaro sob leis civis vigentes que estou ciente de que este app <strong>não provê tratamento médico/psicológico</strong>.
            </span>
          </label>

          <label className="flex items-start space-x-2 cursor-pointer select-none">
            <input 
              type="checkbox" 
              checked={isChecked2} 
              onChange={(e) => setIsChecked2(e.target.checked)}
              className="mt-0.5 rounded border-gray-300 text-purple-600 focus:ring-purple-500 scale-100"
            />
            <span className="text-[10px] sm:text-[11px] text-gray-600 leading-tight">
              Isento totalmente a plataforma e moderadores de qualquer responsabilidade civil ou criminal sobre o uso das salas.
            </span>
          </label>

          <label className={`flex items-start space-x-2 cursor-pointer select-none transition-opacity ${!hasScrolledToBottom ? 'opacity-50' : ''}`}>
            <input 
              type="checkbox" 
              checked={isChecked3} 
              disabled={!hasScrolledToBottom}
              onChange={(e) => setIsChecked3(e.target.checked)}
              className="mt-0.5 rounded border-gray-300 text-purple-600 focus:ring-purple-500 scale-100 disabled:cursor-not-allowed"
            />
            <span className="text-[10px] sm:text-[11px] text-gray-600 leading-tight">
              Entendo que meus dados de aceite ficarão gravados <strong>permanentemente sem opção de revogação</strong> para consulta.
            </span>
          </label>

          {/* Action button */}
          <button
            onClick={handleAccept}
            disabled={!isButtonEnabled}
            className={`w-full py-3 rounded-2xl text-xs font-bold transition-all outline-none flex items-center justify-center space-x-2 font-display ${
              isButtonEnabled 
                ? 'bg-purple-600 hover:bg-purple-700 active:scale-95 text-white shadow-purple-200 shadow-md' 
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Shield size={13} />
            <span>Assinar e Aceitar Responsabilidades</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
