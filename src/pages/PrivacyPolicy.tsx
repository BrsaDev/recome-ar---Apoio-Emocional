import { useState } from 'react';
import { motion } from 'motion/react';
import { Shield, ArrowLeft, Lock, FileText, CheckCircle2, Scale, Mail, FileCheck } from 'lucide-react';
import { View } from '../types';

interface Props {
  navigate: (view: View) => void;
  /** Optionally specify where the user returns to when clicking the back button */
  fromView?: View;
}

type Tab = 'privacy' | 'terms' | 'lgpd';

export default function PrivacyPolicy({ navigate, fromView = 'profile' }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('privacy');

  return (
    <div className="h-full w-full bg-brand-white flex flex-col overflow-hidden">
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
            Termos Legais e Privacidade
          </h1>
          <p className="text-[10px] text-gray-400 font-light mt-1 uppercase tracking-wider font-mono">
            Conformidade Google Play & LGPD
          </p>
        </div>
        <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
          <Shield size={16} />
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="px-5 py-2.5 bg-white border-b border-brand-blue/5 flex space-x-2 shrink-0">
        <button
          onClick={() => setActiveTab('privacy')}
          className={`flex-1 py-2 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center space-x-1 outline-none cursor-pointer ${
            activeTab === 'privacy'
              ? 'bg-purple-600 text-white shadow-sm shadow-purple-100'
              : 'bg-brand-gray/50 text-gray-500 hover:text-gray-700'
          }`}
        >
          <Lock size={12} />
          <span>Privacidade</span>
        </button>
        <button
          onClick={() => setActiveTab('terms')}
          className={`flex-1 py-2 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center space-x-1 outline-none cursor-pointer ${
            activeTab === 'terms'
              ? 'bg-purple-600 text-white shadow-sm shadow-purple-100'
              : 'bg-brand-gray/50 text-gray-500 hover:text-gray-750'
          }`}
        >
          <Scale size={13} />
          <span>Termos de Uso</span>
        </button>
        <button
          onClick={() => setActiveTab('lgpd')}
          className={`flex-1 py-2 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center space-x-1 outline-none cursor-pointer ${
            activeTab === 'lgpd'
              ? 'bg-purple-600 text-white shadow-sm shadow-purple-100'
              : 'bg-brand-gray/50 text-gray-500 hover:text-gray-750'
          }`}
        >
          <FileCheck size={12} />
          <span>LGPD Br</span>
        </button>
      </div>

      {/* Main Content Scroll Container */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5 text-gray-650 leading-relaxed text-xs">
        {activeTab === 'privacy' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <div className="bg-purple-50/50 rounded-2xl p-4 border border-purple-100/50">
              <span className="text-purple-800 font-bold block mb-1 text-[11px] uppercase tracking-wider font-display">Política de Privacidade de Dados</span>
              <p className="text-[11px] text-purple-950 font-light">
                Para nós do <strong>FAPEM</strong>, a segurança e a assepsia jurídica com os seus dados pessoais são prioridade máxima. Saiba como cuidamos e protegemos as suas interações.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="font-bold text-gray-900 border-l-2 border-purple-600 pl-2 text-xs">1. Quais dados coletamos?</h3>
              <p className="pl-3 font-light">
                <strong>Dados Cadastrais Básicos:</strong> Nome/Apelido social, faixa etária opcional e humor de entrada selecionado durante o onboarding. Não exigimos documento de identificação nacional no cadastro simples interno.
              </p>
              <p className="pl-3 font-light">
                <strong>Logs de Aceito de Termos:</strong> Registro permanente com carimbo de tempo (Timestamp ISO8601) e sua assinatura eletrônica digital gravada de forma criptografada em nosso servidor de auditoria legal (comprovante inequívoco).
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="font-bold text-gray-900 border-l-2 border-purple-600 pl-2 text-xs">2. Armazenamento e Localização</h3>
              <p className="pl-3 font-light">
                Suas informações de perfil e do seu aplicativo ficam armazenadas primariamente no armazenamento local persistente do seu próprio telefone celular (<code>localStorage</code> seguro do WebView). Se você habilitar a sincronização remota opcional de dados via API, tais metadados são transmitidos de forma segura através do protocolo HTTPS com TLS para os servidores centrais seguros onde são mantidos com total segurança.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="font-bold text-gray-900 border-l-2 border-purple-600 pl-2 text-xs">3. Compartilhamento de Informações</h3>
              <p className="pl-3 font-light">
                Nós <strong>não realizamos, sob nenhuma hipótese, mercantilização ou venda de dados de usuários</strong> para empresas de telemarketing, corretoras de dados ou redes de publicidade direcionada. Suas mensagens nos chats das salas são públicas e visíveis exclusivamente para os integrantes da respetiva sala em tempo real de conversa, não sendo indexadas por navegadores ou de mecanismos de busca.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="font-bold text-gray-900 border-l-2 border-purple-600 pl-2 text-xs">4. Uso de Inteligência Artificial</h3>
              <p className="pl-3 font-light">
                O aplicativo integra os modelos de computação cognitiva da API do Google Gemini para atuar na geração de reflexões de bem-estar. As informações inseridas no chat de aconselhamento com a inteligência artificial não são armazenadas para treinamento geral de modelos, sendo processadas em modo efêmero visando proteger sua privacidade clínica.
              </p>
            </div>
          </motion.div>
        )}

        {activeTab === 'terms' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <div className="bg-red-50/50 rounded-2xl p-4 border border-red-100">
              <span className="text-red-800 font-bold block mb-1 text-[11px] uppercase tracking-wider font-display">Isenção de Atividade Médica</span>
              <p className="text-[11px] text-red-950 font-normal leading-normal">
                Ao utilizar os serviços, você expressamente concorda que o aplicativo FAPEM e qualquer ferramenta ou material fornecido <strong>não servem e não assumem escopo de orientação assistencial médica profissional ou psicoterapia clínica</strong>.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="font-bold text-gray-900 border-l-2 border-purple-600 pl-2 text-xs">1. Regras de Boa Convivência</h3>
              <p className="pl-3 font-light">
                Para manter as salas de integração social um espaço seguro baseado em acolhimento amoroso de pares, fica terminantemente proibido:
              </p>
              <ul className="list-disc pl-7 font-light space-y-1 text-gray-600">
                <li>Discursos inflamados de ódio, xenofobia, racismo, homofobia ou intolerância religiosa;</li>
                <li>Qualquer forma de bullying, assédio direcionado ou ameaças implícitas ou explícitas;</li>
                <li>Incentivo ou indução de condutas de auto-mutilação ou suicídio nas salas de conversação;</li>
                <li>Compartilhamento de links de spam, esquemas comerciais ou publicidade comercial de terceiros.</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="font-bold text-gray-900 border-l-2 border-purple-600 pl-2 text-xs">2. Atendimento Humanitário Urgente</h3>
              <p className="pl-3 font-light">
                Em casos de crise em andamento ou impulsividade autodestrutiva grave, você deve entrar em contato imediato com órgãos devidamente credenciados para assistência humanitária e resgate cívico de saúde.
              </p>
              <div className="bg-brand-gray/50 rounded-xl p-3 border border-brand-blue/5 space-y-1.5 font-light text-[11px]">
                <div className="flex justify-between items-center bg-white p-2 rounded-lg border border-brand-blue/5">
                  <span className="font-medium text-gray-800">Centro de Valorização da Vida (CVV)</span>
                  <span className="text-purple-700 font-bold text-xs">Ligar 188</span>
                </div>
                <div className="flex justify-between items-center bg-white p-2 rounded-lg border border-brand-blue/5">
                  <span className="font-medium text-gray-800">SAMU de Urgência Médica</span>
                  <span className="text-purple-700 font-bold text-xs">Ligar 192</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-bold text-gray-900 border-l-2 border-purple-600 pl-2 text-xs">3. Alterações dos Termos</h3>
              <p className="pl-3 font-light">
                Reservamos o direito de atualizar este instrumento para refletir mudanças regulatórias solicitadas pela Google Play Store ou conformidades legais vigentes. Eventuais novos aceite serão requisitados em tela cheia na entrada do app caso o teor de segurança jurídica seja modificado substancialmente.
              </p>
            </div>
          </motion.div>
        )}

        {activeTab === 'lgpd' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <div className="bg-emerald-50/50 rounded-2xl p-4 border border-emerald-100">
              <span className="text-emerald-800 font-bold block mb-1 text-[11px] uppercase tracking-wider font-display">Lei Geral de Proteção de Dados (L13.709)</span>
              <p className="text-[11px] text-emerald-950 font-light">
                Garantimos os plenos direitos estipulados pela legislação de proteção de dados brasileira aos usuários em todo o território nacional.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="font-bold text-gray-900 border-l-2 border-purple-600 pl-2 text-xs">Seus Direitos Legais de Titular</h3>
              <div className="space-y-2.5 pl-3">
                <div className="flex items-start space-x-2">
                  <CheckCircle2 size={13} className="text-emerald-600 shrink-0 mt-0.5" />
                  <p className="font-light text-[11px]">
                    <strong>Direito de Revogação e Exclusão Completa:</strong> Você pode, a qualquer momento na aba do seu Perfil, desconectar o seu cadastro e apagar permanentemente todas as suas informações gravadas na memória do aparelho. Se optar pela sincronização remota por API, as tabelas de banco serão imediatamente expurgadas sob requisição.
                  </p>
                </div>

                <div className="flex items-start space-x-2">
                  <CheckCircle2 size={13} className="text-emerald-600 shrink-0 mt-0.5" />
                  <p className="font-light text-[11px]">
                    <strong>Confirmação de Tratamento:</strong> Saber de forma transparente quais servidores cuidavam dos envios síncronos da sua conta (no caso, seu Node.js local de API opcional).
                  </p>
                </div>

                <div className="flex items-start space-x-2">
                  <CheckCircle2 size={13} className="text-emerald-600 shrink-0 mt-0.5" />
                  <p className="font-light text-[11px]">
                    <strong>Portabilidade Digital:</strong> Descarregar no seu computador ou celular dados coletados para integridade em outro portal que achar condizente.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-bold text-gray-900 border-l-2 border-purple-600 pl-2 text-xs">Identificação do Encarregado (DPO)</h3>
              <p className="pl-3 font-light text-gray-600">
                Para qualquer solicitação jurídica de violação, dúvidas de conformidade ou exclusão definitiva remota dos servidores sincronizados de API, por favor entre em contato direto com o nosso canal dedicado de ouvidoria legal:
              </p>
              <div className="bg-white rounded-xl border border-brand-blue/5 p-3.5 flex items-center space-x-3.5 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-700 shrink-0">
                  <Mail size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-gray-400 block font-light">E-mail DPO / Suporte</span>
                  <span className="text-xs font-bold text-gray-800 block select-all">dpo-support@recomecar.com.br</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Sticky Bottom Footer Badge */}
      <div className="px-5 py-3.5 bg-white border-t border-brand-blue/5 flex items-center justify-between text-[10px] text-gray-400 shrink-0 font-light font-mono">
        <div className="flex items-center space-x-1">
          <Lock size={12} className="text-emerald-600" />
          <span>Políticas 100% Homologadas</span>
        </div>
        <span>CNPJ Isento de Registro</span>
      </div>
    </div>
  );
}
