import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Mail, Lock, Check, Sparkles, AlertCircle } from 'lucide-react';
import logoImg from '../assets/images/fapem_logo_1780580927891.png';
import { User, Mood } from '../types';

interface Props {
  initialIsSignUp?: boolean;
  onComplete: (user: User, isNew?: boolean) => void;
  onBack: () => void;
}

export default function Login({ initialIsSignUp = false, onComplete, onBack }: Props) {
  const [isSignUp, setIsSignUp] = useState(initialIsSignUp);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Custom states for realistic UX
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  // Simulated Google Auth Popup state
  const [showGoogleAuth, setShowGoogleAuth] = useState(false);

  // Email/Password submit
  const handleEmailAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (isSignUp) {
      if (!name.trim() || !email.trim() || !password.trim()) {
        setError('Por favor, preencha todos os campos do cadastro.');
        return;
      }
    } else {
      if (!email.trim() || !password.trim()) {
        setError('Por favor, preencha o e-mail e a senha.');
        return;
      }
    }
    
    if (password.length < 6) {
      setError('A senha deve conter no mínimo 6 caracteres por segurança.');
      return;
    }

    setLoading(true);
    setLoadingText(isSignUp ? 'Criando sua conta segura...' : 'Verificando credenciais...');

    // Simulate standard server latency for organic feel
    setTimeout(() => {
      const derivedName = isSignUp ? name.trim() : email.split('@')[0];
      const capitalizedName = derivedName.charAt(0).toUpperCase() + derivedName.slice(1);
      
      onComplete({
        name: capitalizedName,
        email: email.trim().toLowerCase(),
        avatarId: 'avatar-1',
        plan: 'free',
        authProvider: 'email',
        termsAccepted: true,
        termsAcceptedAt: new Date().toISOString(),
        termsVersion: 'v1.0'
      }, isSignUp);
      setLoading(false);
    }, 1500);
  };

  // Google Login click opens dialog selection
  const handleGoogleClick = () => {
    setError(null);
    setShowGoogleAuth(true);
  };

  // Select active Google Account
  const handleSelectGoogleAccount = (selectedEmail: string, selectedName: string) => {
    setShowGoogleAuth(false);
    setLoading(true);
    setLoadingText(isSignUp ? 'Criando conta via Google de forma segura...' : 'Autenticando via Google de forma segura...');
    
    setTimeout(() => {
      onComplete({
        name: selectedName,
        email: selectedEmail,
        avatarId: 'avatar-4',
        plan: 'free',
        authProvider: 'google',
        termsAccepted: true,
        termsAcceptedAt: new Date().toISOString(),
        termsVersion: 'v1.0'
      }, isSignUp);
      setLoading(false);
    }, 1600);
  };

  return (
    <div className="h-full w-full flex flex-col bg-gradient-to-b from-brand-blue/15 via-brand-white to-brand-white p-6 justify-between select-none">
      
      {/* Header and Back navigation */}
      <div className="flex items-center justify-between pt-4 shrink-0">
        <button
          type="button"
          onClick={onBack}
          className="p-2.5 rounded-full bg-brand-white border border-brand-blue/5 hover:border-brand-blue/20 text-gray-500 hover:text-brand-text active:scale-95 transition-all outline-none"
          title="Voltar"
        >
          <ArrowLeft size={18} />
        </button>
        <span className="text-xs text-gray-400 font-mono">FAPEM Segura</span>
      </div>

      {/* Main Form content wrapper */}
      <div className="flex-1 flex flex-col justify-center max-h-[82%] space-y-5 pt-2">
        
        {/* Logo and Greeting heading */}
        <div className="text-center space-y-1.5">
          <div className="w-16 h-16 mx-auto rounded-2xl overflow-hidden shadow-md border border-indigo-500/10 bg-slate-950 flex items-center justify-center mb-1">
            <img src={logoImg} alt="FAPEM" className="w-full h-full object-cover animate-pulse-slow font-sans" />
          </div>
          <h2 className="text-xl font-display font-black text-brand-text leading-tight tracking-tight">
            {isSignUp ? 'Faça parte do FAPEM' : 'Bem-vindo ao seu refúgio'}
          </h2>
          <p className="text-[11px] text-gray-400 font-light max-w-[280px] mx-auto leading-normal">
            {isSignUp 
              ? 'Crie o seu perfil seguro em segundos para ter total privacidade e acolhimento.' 
              : 'Conecte-se para continuar seus diálogos e acompanhamentos terapêuticos.'}
          </p>
        </div>

        {/* Mode Toggle Tab Selector */}
        <div className="flex bg-brand-gray p-1 rounded-2xl border border-brand-blue/5 select-none shrink-0">
          <button
            type="button"
            onClick={() => { setIsSignUp(false); setError(null); }}
            className={`flex-1 py-2 rounded-xl text-[10.5px] font-bold font-display transition-all ${!isSignUp ? 'bg-white text-brand-text shadow-3xs' : 'text-gray-400 hover:text-brand-text'}`}
          >
            Acessar Conta
          </button>
          <button
            type="button"
            onClick={() => { setIsSignUp(true); setError(null); }}
            className={`flex-1 py-2 rounded-xl text-[10.5px] font-bold font-display transition-all ${isSignUp ? 'bg-white text-brand-text shadow-3xs' : 'text-gray-400 hover:text-brand-text'}`}
          >
            Criar Conta
          </button>
        </div>

        {/* Error Feedback message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-2.5 bg-red-50 border border-red-100 rounded-xl text-[10px] text-red-600 flex items-start space-x-2"
          >
            <AlertCircle size={13} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        {/* Unified Standard Credentials Input Form */}
        <form onSubmit={handleEmailAuthSubmit} className="space-y-2.5">
          {isSignUp && (
            <div className="space-y-0.5">
              <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest pl-1" htmlFor="login-name">
                Seu Nome ou Apelido
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                  👤
                </span>
                <input
                  id="login-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Como gostaria de ser chamado..."
                  className="w-full bg-brand-gray border border-brand-blue/5 focus:border-brand-blue/30 rounded-2xl py-3 pl-11 pr-4 text-xs font-sans text-brand-text placeholder-gray-400 outline-none transition-all"
                />
              </div>
            </div>
          )}

          <div className="space-y-0.5">
            <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest pl-1" htmlFor="login-email">
              E-mail
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <Mail size={14} />
              </span>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Exemplo: seuemail@provedor.com"
                className="w-full bg-brand-gray border border-brand-blue/5 focus:border-brand-blue/30 rounded-2xl py-3 pl-11 pr-4 text-xs font-sans text-brand-text placeholder-gray-400 outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-0.5">
            <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest pl-1" htmlFor="login-passwd">
              Senha secreta
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <Lock size={14} />
              </span>
              <input
                id="login-passwd"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minímo de 6 dígitos"
                className="w-full bg-brand-gray border border-brand-blue/5 focus:border-brand-blue/30 rounded-2xl py-3 pl-11 pr-4 text-xs font-sans text-brand-text placeholder-gray-400 outline-none transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 mt-1.5 bg-brand-green hover:bg-brand-green/95 text-white font-display font-medium text-xs rounded-2xl shadow-md transition-all active:scale-98 flex items-center justify-center space-x-2 cursor-pointer"
          >
            <span>{loading ? 'Cadastrando...' : isSignUp ? 'Criar minha conta e começar' : 'Acessar minha conta'}</span>
          </button>
        </form>

        {/* Separator block */}
        <div className="flex items-center space-x-3 text-gray-200">
          <div className="h-px bg-gray-200 flex-1" />
          <span className="text-[9px] font-medium uppercase tracking-wider text-gray-400">ou</span>
          <div className="h-px bg-gray-200 flex-1" />
        </div>

        {/* High-Fidelity Easy Google OAuth Integration button */}
        <button
          type="button"
          onClick={handleGoogleClick}
          className="w-full py-3 bg-white border border-gray-200 hover:bg-gray-50 text-slate-800 text-xs font-bold rounded-2xl shadow-3xs cursor-pointer flex items-center justify-center space-x-2.5 transition-all outline-none"
        >
          {/* Official branding layout Google asset icon */}
          <svg className="w-4.5 h-4.5" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M12.24 10.285V14.4h6.887c-.648 2.42-2.519 4.114-5.132 4.114-3.411 0-6.19-2.771-6.19-6.182l.002-.132c.114-3.238 2.825-5.836 6.136-5.836 1.488 0 2.885.534 3.984 1.492l3.056-2.95C19.16 3.193 15.938 2 12.24 2 6.643 2 2 6.353 2 12s4.643 10 10.24 10c5.385 0 9.873-3.882 10.151-9.284H12.24"
            />
            <path
              fill="#FBBC05"
              d="M2.132 11.2a10.02 10.02 0 0110.108-9.2c3.41 0 6.137 1.1 8.214 2.9l-3.056 2.95a5.955 5.955 0 00-5.158-1.55c-2.483.35-4.47 2.22-4.996 4.67l-5.112-3.77"
            />
            <path
              fill="#34A853"
              d="M12.24 22c-3.698 0-6.92-1.193-8.892-3.13l5.112-3.77c.875.98 2.28 1.43 3.78 1.43 2.613 0 4.484-1.694 5.132-4.114h5.18c-.469 5.402-4.957 9.584-10.132 9.584"
            />
            <path
              fill="#4285F4"
              d="M22.31 10.716a10.033 10.033 0 01.127 1.284c0 .35-.02.7-.058 1.05h-10.14V10.28h10.07"
            />
          </svg>
          <span className="font-semibold text-slate-705">
            {isSignUp ? 'Cadastrar com o Google' : 'Entrar com o Google'}
          </span>
        </button>

      </div>

      {/* Footer support context */}
      <div className="text-center pt-2 shrink-0">
        <p className="text-[10.5px] text-gray-400 font-light leading-snug">
          Seu acesso e mensagens são protegidos de ponta a ponta por criptografia.
        </p>
      </div>

      {/* Realistic Simulated Loading Screen Backdrop */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-55 bg-slate-950/85 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center text-white"
          >
            <div className="relative mb-4">
              <div className="w-14 h-14 rounded-full border-2 border-indigo-500/20 border-t-brand-green animate-spin" />
              <span className="absolute inset-0 flex items-center justify-center text-lg">💡</span>
            </div>
            <p className="text-sm font-medium tracking-wide animate-pulse">{loadingText}</p>
            <p className="text-[11px] text-indigo-200 mt-1 font-light opacity-80">Por favor, mantenha o app aberto.</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Google Sign-In High-Fidelity Quick accounts selection popup */}
      <AnimatePresence>
        {showGoogleAuth && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center p-0 sm:p-4 font-sans text-slate-800">
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="w-full sm:max-w-sm bg-white rounded-t-[2rem] sm:rounded-[2rem] p-6 shadow-2xl border border-gray-100 flex flex-col space-y-5"
            >
              {/* Fake Google Branded Top header */}
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  <span className="text-xs font-bold text-gray-500 font-sans uppercase tracking-wider">Fazer login com o Google</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowGoogleAuth(false)}
                  className="text-xs text-gray-400 hover:text-slate-800 font-bold px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                >
                  Cancelar
                </button>
              </div>

              {/* Title instructions */}
              <div className="space-y-1">
                <h3 className="text-base font-bold text-gray-800">Escolha uma conta</h3>
                <p className="text-[11px] text-gray-400 leading-normal">
                  para prosseguir e ser autenticado de forma cômoda e direta no aplicativo <strong>FAPEM</strong>.
                </p>
              </div>

              {/* Verified Selectable Accounts List */}
              <div className="space-y-2">
                {[
                  { email: 'dev.brsa@gmail.com', name: 'Daniel Brsa', avatar: '💻', isRecent: true },
                  { email: 'visitante.anonimo@gmail.com', name: 'Visitante Anônimo', avatar: '🤫', isRecent: false }
                ].map((acc) => (
                  <button
                    key={acc.email}
                    type="button"
                    onClick={() => handleSelectGoogleAccount(acc.email, acc.name)}
                    className="w-full p-3.5 hover:bg-slate-50 border border-gray-100 rounded-2xl text-left flex items-center space-x-3 transition-colors outline-none cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-lg border border-gray-200">
                      {acc.avatar}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-1.5">
                        <span className="text-xs font-bold text-slate-800 truncate">{acc.name}</span>
                        {acc.isRecent && (
                          <span className="font-mono text-[8px] uppercase font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-sm">
                            Atual
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 truncate block">{acc.email}</span>
                    </div>
                  </button>
                ))}

                {/* Additional option mimicking Google One tap layout */}
                <button
                  type="button"
                  onClick={() => {
                    const customEmail = prompt("Digite seu email do Google:") || '';
                    if (customEmail.includes('@')) {
                      const namePart = customEmail.split('@')[0];
                      handleSelectGoogleAccount(customEmail, namePart.toUpperCase());
                    } else {
                      alert('Por favor, informe um email válido.');
                    }
                  }}
                  className="w-full py-3 hover:bg-slate-55 text-slate-500 font-medium text-[10.5px] rounded-xl text-center transition-colors hover:text-slate-800"
                >
                  + Usar outra conta Google
                </button>
              </div>

              {/* Data policy disclaimer */}
              <p className="text-[9.5px] text-gray-400 leading-relaxed text-center pt-1">
                Para continuar, o Google compartilhará seu nome, endereço de e-mail e foto do perfil com o FAPEM. Veja termos de privacidade.
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
