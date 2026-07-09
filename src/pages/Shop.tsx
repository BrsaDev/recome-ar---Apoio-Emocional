import { Crown, ArrowLeft, CreditCard, QrCode, ShoppingBag, Lock, Shield } from 'lucide-react';
import { motion } from 'motion/react';
import { View } from '../types';

interface Props {
  navigate: (view: View) => void;
}

export default function Shop({ navigate }: Props) {
  return (
    <div className="h-full w-full bg-[#020410] flex flex-col">
      <header className="p-6 flex items-center space-x-4 border-b border-white/5">
        <button onClick={() => navigate('vip')} className="p-2 -ml-2 text-gray-400 hover:text-white transition-colors cursor-pointer outline-none">
          <ArrowLeft size={22} />
        </button>
        <h2 className="text-xl font-display font-semibold text-white">Finalizar Compra</h2>
      </header>

      <div className="flex-1 px-6 space-y-8 overflow-y-auto py-6 no-scrollbar">
        {/* Order Summary */}
        <div className="glass-card p-5 rounded-3xl border border-white/5 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-amber-900/30">
              <Crown size={22} fill="currentColor" />
            </div>
            <div>
              <h4 className="font-semibold text-white">Plano Premium</h4>
              <p className="text-xs text-gray-500 mt-0.5">Assinatura 30 dias</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs text-gray-500 line-through">R$ 29,99</span>
            <p className="text-xl font-display font-bold text-white">R$ 14,99</p>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="space-y-4">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-500 pl-1">Forma de Pagamento</h3>
          <div className="space-y-3">
            <motion.button
              whileTap={{ scale: 0.98 }}
              className="w-full glass-card p-5 rounded-2xl border-2 border-purple-500/40 flex items-center justify-between shadow-sm cursor-pointer outline-none"
            >
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center border border-purple-500/20">
                  <QrCode size={20} className="text-purple-400" />
                </div>
                <div className="text-left">
                  <span className="font-semibold text-white text-sm">PIX Instantâneo</span>
                  <p className="text-[10px] text-green-400 font-semibold mt-0.5">Confirmação imediata</p>
                </div>
              </div>
              <div className="w-5 h-5 rounded-full border-4 border-purple-500 bg-purple-500/20" />
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.98 }}
              className="w-full glass-card p-5 rounded-2xl border border-white/5 flex items-center justify-between shadow-sm opacity-50 grayscale cursor-not-allowed outline-none"
            >
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/5">
                  <CreditCard size={20} className="text-gray-400" />
                </div>
                <div className="text-left">
                  <span className="font-semibold text-gray-400 text-sm">Cartão de Crédito</span>
                  <p className="text-[10px] text-gray-600 mt-0.5">Em breve</p>
                </div>
              </div>
              <div className="w-5 h-5 rounded-full border border-white/10" />
            </motion.button>
          </div>
        </div>

        {/* Security badges */}
        <div className="flex items-center justify-center space-x-5">
          <div className="flex flex-col items-center space-y-1">
            <Lock size={14} className="text-cyan-400" />
            <span className="text-[9px] text-gray-500 uppercase tracking-wider font-semibold">SSL Seguro</span>
          </div>
          <div className="w-px h-8 bg-white/5" />
          <div className="flex flex-col items-center space-y-1">
            <Shield size={14} className="text-cyan-400" />
            <span className="text-[9px] text-gray-500 uppercase tracking-wider font-semibold">Dados protegidos</span>
          </div>
          <div className="w-px h-8 bg-white/5" />
          <div className="flex flex-col items-center space-y-1">
            <ShoppingBag size={14} className="text-cyan-400" />
            <span className="text-[9px] text-gray-500 uppercase tracking-wider font-semibold">100% Seguro</span>
          </div>
        </div>

        {/* Pay CTA */}
        <div className="space-y-4">
          <motion.button
            whileTap={{ scale: 0.98 }}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white h-16 rounded-2xl font-display font-bold text-sm shadow-lg shadow-purple-900/30 border border-purple-500/25 cursor-pointer outline-none"
            id="btn-confirm-payment"
          >
            Pagar R$ 14,99 com PIX
          </motion.button>

          <p className="text-[10px] text-gray-600 text-center leading-relaxed">
            Ao prosseguir você concorda com os nossos <span className="text-purple-400 cursor-pointer">Termos de Serviço</span>. Pagamento processado de forma segura.
          </p>
        </div>
      </div>
    </div>
  );
}
