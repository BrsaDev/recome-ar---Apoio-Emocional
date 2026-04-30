import { Crown, ArrowLeft, CreditCard, QrCode, ShoppingBag } from 'lucide-react';
import { motion } from 'motion/react';
import { View } from '../types';

interface Props {
  navigate: (view: View) => void;
}

export default function Shop({ navigate }: Props) {
  return (
    <div className="h-full w-full bg-brand-white flex flex-col">
      <header className="p-6 flex items-center space-x-4">
        <button onClick={() => navigate('vip')} className="p-2 -ml-2 text-gray-400">
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-xl font-display font-semibold text-brand-text">Finalizar Compra</h2>
      </header>

      <div className="flex-1 px-6 space-y-10">
        <div className="space-y-4">
          <div className="bg-brand-gray p-6 rounded-3xl flex items-center justify-between border border-brand-blue/10">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-yellow-400 rounded-2xl flex items-center justify-center text-white">
                <Crown size={24} fill="currentColor" />
              </div>
              <div>
                <h4 className="font-semibold text-brand-text">Plano Premium</h4>
                <p className="text-sm text-gray-400">Assinatura mensal</p>
              </div>
            </div>
            <span className="text-xl font-display font-bold text-brand-text">R$ 1,99</span>
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-sm font-display font-semibold uppercase tracking-wider text-gray-400 pl-1">Forma de Pagamento</h3>
          <div className="space-y-3">
             <button className="w-full bg-brand-white p-5 rounded-2xl border-2 border-brand-green flex items-center justify-between shadow-sm">
                <div className="flex items-center space-x-4">
                   <QrCode size={24} className="text-brand-green" />
                   <span className="font-semibold text-brand-text">PIX Instantâneo</span>
                </div>
                <div className="w-5 h-5 rounded-full border-4 border-brand-green" />
             </button>
             <button className="w-full bg-brand-white p-5 rounded-2xl border border-gray-100 flex items-center justify-between shadow-sm opacity-50 grayscale">
                <div className="flex items-center space-x-4">
                   <CreditCard size={24} className="text-brand-text" />
                   <span className="font-semibold text-brand-text">Cartão de Crédito</span>
                </div>
                <div className="w-5 h-5 rounded-full border border-gray-200" />
             </button>
          </div>
        </div>

        <div className="pt-10 space-y-6">
           <motion.button 
             whileTap={{ scale: 0.98 }}
             className="w-full bg-brand-green text-white h-16 rounded-2xl font-display font-medium shadow-lg shadow-brand-green/20"
             id="btn-confirm-payment"
           >
              Pagar com PIX
           </motion.button>
           <div className="flex items-center justify-center space-x-2 text-gray-400">
              <ShoppingBag size={14} />
              <span className="text-[10px] uppercase font-medium tracking-widest leading-none">Compra 100% Segura</span>
           </div>
        </div>
      </div>
    </div>
  );
}
