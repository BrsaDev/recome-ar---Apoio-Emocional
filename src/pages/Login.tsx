import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Mail, Lock, Check, Sparkles, AlertCircle } from 'lucide-react';
import logoImg from '../assets/images/fapem_logo_1780580927891.png';
import { User, Mood } from '../types';
import { apiService } from '../services/api';
import { generateKeyPair, exportPublicKey, storePrivateKey, getPrivateKey } from '../services/crypto';

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

  // Real Google Auth SDK is handled inside useEffect hook

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

    apiService.auth.access(name || email.split('@')[0], 'avatar-1', email, password)
      .then(async ({ user: userData, token }) => {
        localStorage.setItem('fapem_token', token);

        // E2EE Key Management
        try {
          let privateKey = await getPrivateKey();
          if (!privateKey) {
            const keys = await generateKeyPair();
            await storePrivateKey(keys.privateKey);
            const pubKeyStr = await exportPublicKey(keys.publicKey);
            await apiService.auth.updatePublicKey(pubKeyStr);
          } else if (!userData.publicKey) {
            // Re-sync public key if missing on server but exists locally
            // In a real app we'd need the actual public key from the pair
            // Since we can't easily get it back from privateKey in all browsers without extra steps,
            // we'd normally store both. For this implementation, we'll assume new keys if sync is needed.
            const keys = await generateKeyPair();
            await storePrivateKey(keys.privateKey);
            const pubKeyStr = await exportPublicKey(keys.publicKey);
            await apiService.auth.updatePublicKey(pubKeyStr);
          }
        } catch (cryptoErr) {
          console.error('Erro ao configurar chaves de segurança:', cryptoErr);
        }

        onComplete(userData, isSignUp);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Erro ao autenticar. Verifique sua conexão.');
        setLoading(false);
      });
  };

  // Google OAuth Credential Handler
  const handleGoogleCredentialResponse = (credential: string) => {
    setError(null);
    setLoading(true);
    setLoadingText(isSignUp ? 'Criando conta via Google...' : 'Autenticando via Google...');

    apiService.auth.googleLogin(credential, 'avatar-4')
      .then(async ({ user: userData, token }) => {
        localStorage.setItem('fapem_token', token);

        // E2EE Key Management
        try {
          let privateKey = await getPrivateKey();
          if (!privateKey) {
            const keys = await generateKeyPair();
            await storePrivateKey(keys.privateKey);
            const pubKeyStr = await exportPublicKey(keys.publicKey);
            await apiService.auth.updatePublicKey(pubKeyStr);
          }
        } catch (cryptoErr) {
          console.error('Erro ao configurar chaves de segurança:', cryptoErr);
        }

        onComplete(userData, isSignUp);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Erro no login Google. Verifique sua conexão.');
        setLoading(false);
      });
  };

  useEffect(() => {
    const initializeGoogleSignIn = () => {
      const google = (window as any).google;
      if (google?.accounts?.id) {
        google.accounts.id.initialize({
          client_id: "1046649841148-llcvq6v8o9jg863goiibrbmq9qtalqid.apps.googleusercontent.com",
          callback: (response: any) => {
            handleGoogleCredentialResponse(response.credential);
          },
        });

        const btnParent = document.getElementById("google-signin-btn");
        if (btnParent) {
          google.accounts.id.renderButton(btnParent, {
            theme: "dark",
            size: "large",
            width: btnParent.clientWidth || 320,
            text: isSignUp ? "signup_with" : "signin_with",
            shape: "pill",
          });
        }
      }
    };

    const interval = setInterval(() => {
      const google = (window as any).google;
      if (google?.accounts?.id) {
        initializeGoogleSignIn();
        clearInterval(interval);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [isSignUp]);

  return (
    <div className="h-full w-full flex flex-col bg-[#020410] p-6 justify-between select-none relative overflow-hidden">
      {/* Background neon blobs */}
      <div className="absolute top-[-20%] left-[-20%] w-72 h-72 rounded-full bg-purple-600/10 blur-[80px]" />
      <div className="absolute bottom-[-20%] right-[-20%] w-72 h-72 rounded-full bg-cyan-600/10 blur-[80px]" />

      {/* Header and Back navigation */}
      <div className="flex items-center justify-between pt-4 shrink-0 relative z-10">
        <button
          type="button"
          onClick={onBack}
          className="p-2.5 rounded-full bg-white/5 border border-white/10 hover:border-white/20 text-gray-400 hover:text-white active:scale-95 transition-all outline-none"
          title="Voltar"
        >
          <ArrowLeft size={18} />
        </button>
        <span className="text-xs text-gray-500 font-mono text-neon-cyan">FAPEM Segura</span>
      </div>

      {/* Main Form content wrapper */}
      <div className="flex-1 flex flex-col justify-center max-h-[82%] space-y-6 pt-2 relative z-10">

        {/* Logo and Greeting heading */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 mx-auto rounded-2xl overflow-hidden border border-purple-500/20 bg-slate-950/40 flex items-center justify-center mb-1 shadow-neon-purple/5">
            <img src={logoImg} alt="FAPEM" className="w-10 h-10 object-contain font-sans" />
          </div>
          <h2 className="text-2xl font-display font-black text-white leading-tight tracking-tight">
            {isSignUp ? 'Faça parte do FAPEM' : 'Bem-vindo ao seu refúgio'}
          </h2>
          <p className="text-[12px] text-gray-400 font-light max-w-[280px] mx-auto leading-normal">
            {isSignUp
              ? 'Crie o seu perfil seguro em segundos para ter total privacidade e acolhimento.'
              : 'Conecte-se para continuar seus diálogos e acompanhamentos terapêuticos.'}
          </p>
        </div>

        {/* Mode Toggle Tab Selector */}
        <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5 select-none shrink-0">
          <button
            type="button"
            onClick={() => { setIsSignUp(false); setError(null); }}
            className={`flex-1 py-2 rounded-xl text-[11px] font-bold font-display transition-all outline-none cursor-pointer ${!isSignUp ? 'bg-gradient-to-r from-purple-650 to-indigo-650 text-white shadow-md border border-purple-500/20' : 'text-gray-400 hover:text-white bg-transparent'}`}
          >
            Acessar Conta
          </button>
          <button
            type="button"
            onClick={() => { setIsSignUp(true); setError(null); }}
            className={`flex-1 py-2 rounded-xl text-[11px] font-bold font-display transition-all outline-none cursor-pointer ${isSignUp ? 'bg-gradient-to-r from-purple-650 to-indigo-650 text-white shadow-md border border-purple-500/20' : 'text-gray-400 hover:text-white bg-transparent'}`}
          >
            Criar Conta
          </button>
        </div>

        {/* Error Feedback message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 bg-red-950/20 border border-red-500/30 rounded-xl text-[11px] text-red-400 flex items-start space-x-2"
          >
            <AlertCircle size={14} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        {/* Unified Standard Credentials Input Form */}
        <form onSubmit={handleEmailAuthSubmit} className="space-y-3">
          {isSignUp && (
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1" htmlFor="login-name">
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
                  className="w-full bg-white/5 border border-white/5 focus:border-purple-500/30 rounded-2xl py-3.5 pl-11 pr-4 text-xs font-sans text-white placeholder-gray-550 outline-none transition-all focus:ring-1 focus:ring-purple-500/30"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1" htmlFor="login-email">
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
                className="w-full bg-white/5 border border-white/5 focus:border-purple-500/30 rounded-2xl py-3.5 pl-11 pr-4 text-xs font-sans text-white placeholder-gray-550 outline-none transition-all focus:ring-1 focus:ring-purple-500/30"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1" htmlFor="login-passwd">
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
                placeholder="Mínimo de 6 dígitos"
                className="w-full bg-white/5 border border-white/5 focus:border-purple-500/30 rounded-2xl py-3.5 pl-11 pr-4 text-xs font-sans text-white placeholder-gray-550 outline-none transition-all focus:ring-1 focus:ring-purple-500/30"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 mt-2 bg-gradient-to-r from-purple-650 to-indigo-650 text-white border border-purple-500/25 font-display font-bold text-sm rounded-2xl shadow-lg shadow-purple-500/10 transition-all active:scale-98 flex items-center justify-center space-x-2 cursor-pointer"
          >
            <span>{loading ? 'Cadastrando...' : isSignUp ? 'Criar minha conta e começar' : 'Acessar minha conta'}</span>
          </button>
        </form>

        {/* Separator block */}
        <div className="flex items-center space-x-3 text-white/10">
          <div className="h-px bg-white/10 flex-1" />
          <span className="text-[9px] font-medium uppercase tracking-wider text-gray-400">ou</span>
          <div className="h-px bg-white/10 flex-1" />
        </div>

        {/* High-Fidelity Easy Google OAuth Integration button */}
        <div className="w-full flex justify-center py-1">
          <div id="google-signin-btn" className="w-full flex justify-center" />
        </div>

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
              <div className="w-14 h-14 rounded-full border-2 border-indigo-500/20 border-t-emerald-400 animate-spin" />
              <span className="absolute inset-0 flex items-center justify-center text-lg">💡</span>
            </div>
            <p className="text-sm font-medium tracking-wide animate-pulse">{loadingText}</p>
            <p className="text-[11px] text-indigo-200 mt-1 font-light opacity-80">Por favor, mantenha o app aberto.</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Real Google login integration has replaced mock select popup */}

    </div>
  );
}
