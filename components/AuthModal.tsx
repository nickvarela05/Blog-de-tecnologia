import React, { useState } from 'react';
import Icon from './Icon';

export interface LoginData {
    email: string;
    password: string;
}

export interface RegisterData extends LoginData {
    name: string;
    phone: string;
}

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (data: LoginData) => string | undefined;
  onRegister: (data: RegisterData) => string | undefined;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLogin, onRegister }) => {
  const [view, setView] = useState<'login' | 'register'>('login');
  
  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) {
    return null;
  }

  const formatPhoneNumber = (value: string): string => {
    if (!value) return value;
    const phoneNumber = value.replace(/[^\d]/g, '');
    const phoneNumberLength = phoneNumber.length;
    if (phoneNumberLength < 3) return `(${phoneNumber}`;
    if (phoneNumberLength < 8) return `(${phoneNumber.slice(0, 2)}) ${phoneNumber.slice(2)}`;
    return `(${phoneNumber.slice(0, 2)}) ${phoneNumber.slice(2, 7)}-${phoneNumber.slice(7, 11)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedPhoneNumber = formatPhoneNumber(e.target.value);
    setPhone(formattedPhoneNumber);
  };
  
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const result = onLogin({ email, password });
    if (result) {
        setError(result);
    }
  };
  
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const result = onRegister({ name, email, phone, password });
    if (result) {
        setError(result);
    }
  };
  
  const handleSocialLogin = (provider: 'google' | 'github') => {
    const width = 500, height = 600;
    const left = (window.innerWidth / 2) - (width / 2);
    const top = (window.innerHeight / 2) - (height / 2);

    // Placeholder URLs for OAuth flow
    const urls = {
        google: 'https://accounts.google.com/o/oauth2/v2/auth?scope=email%20profile&response_type=code&redirect_uri=http://localhost&client_id=MOCK_CLIENT_ID',
        github: 'https://github.com/login/oauth/authorize?client_id=MOCK_CLIENT_ID&scope=user:email'
    };

    const socialWindow = window.open(urls[provider], 'socialLogin', `width=${width},height=${height},top=${top},left=${left}`);

    // In a real app, a backend would handle the callback. Here, we simulate this.
    const checkWindow = setInterval(() => {
        if (socialWindow && socialWindow.closed) {
            clearInterval(checkWindow);

            // Simulate receiving user data after successful social login
            const mockUserData = {
                name: provider === 'google' ? 'Usuário Google' : 'Usuário GitHub',
                email: provider === 'google' ? `user.google@example.com` : `user.github@example.com`,
                phone: '(00) 00000-0000',
                password: `social_pass_${Date.now()}`
            };

            const registrationResult = onRegister(mockUserData);

            if (registrationResult === "Este e-mail já está em uso.") {
                // User exists, so log them in using the special bypass password
                onLogin({ email: mockUserData.email, password: 'SOCIAL_LOGIN_BYPASS' });
            } else if (registrationResult) {
                // Another registration error occurred
                setError(registrationResult);
            }
            // If undefined, registration was successful and user is now logged in.
        }
    }, 500);
  }

  const switchView = (newView: 'login' | 'register') => {
    setError('');
    setName('');
    setEmail('');
    setPhone('');
    setPassword('');
    setView(newView);
  }

  return (
    <div className="fixed inset-0 bg-black/80 z-[60] flex justify-center items-center p-4 backdrop-blur-sm" aria-modal="true" role="dialog">
      <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-lg border border-gray-300 dark:border-slate-700 shadow-xl flex flex-col animate-fade-scale-in">
        <header className="flex justify-between items-center p-4 border-b border-gray-300 dark:border-slate-600">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {view === 'login' ? 'Bem-vindo de volta!' : 'Crie sua Conta'}
            </h3>
            <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white">
                <Icon type="close" className="h-6 w-6" />
            </button>
        </header>
        
        {view === 'login' ? (
            <form onSubmit={handleLoginSubmit}>
                <main className="p-6 space-y-4">
                    {error && <p className="text-red-500 text-sm text-center bg-red-100 dark:bg-red-900/50 p-3 rounded-md">{error}</p>}
                    <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">E-mail</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full p-2 mt-1 text-gray-900 dark:text-white bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Senha</label>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full p-2 mt-1 text-gray-900 dark:text-white bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                </main>
                <footer className="p-4 pt-0 flex flex-col items-center gap-3">
                    <button type="submit" className="w-full py-2 px-5 font-semibold text-white bg-blue-700 rounded-md hover:bg-blue-800 transition-colors">
                        Entrar
                    </button>
                    <div className="relative flex py-2 items-center w-full">
                        <div className="flex-grow border-t border-gray-300 dark:border-slate-600"></div>
                        <span className="flex-shrink mx-4 text-sm text-gray-400 dark:text-gray-500">OU</span>
                        <div className="flex-grow border-t border-gray-300 dark:border-slate-600"></div>
                    </div>
                    <div className="w-full grid grid-cols-2 gap-3">
                        <button type="button" onClick={() => handleSocialLogin('google')} className="flex items-center justify-center gap-2 w-full py-2 px-4 font-semibold text-gray-800 dark:text-white bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors">
                           <Icon type="google" className="w-5 h-5" /> Google
                        </button>
                         <button type="button" onClick={() => handleSocialLogin('github')} className="flex items-center justify-center gap-2 w-full py-2 px-4 font-semibold text-gray-800 dark:text-white bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors">
                           <Icon type="github" className="w-5 h-5" /> GitHub
                        </button>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                        Não possui conta? <button type="button" onClick={() => switchView('register')} className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">Criar conta</button>
                    </p>
                </footer>
            </form>
        ) : (
            <form onSubmit={handleRegisterSubmit}>
                <main className="p-6 space-y-4">
                     {error && <p className="text-red-500 text-sm text-center bg-red-100 dark:bg-red-900/50 p-3 rounded-md">{error}</p>}
                    <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Nome Completo</label>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full p-2 mt-1 text-gray-900 dark:text-white bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">E-mail</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full p-2 mt-1 text-gray-900 dark:text-white bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Telefone</label>
                        <input type="tel" value={phone} onChange={handlePhoneChange} placeholder="(XX) XXXXX-XXXX" required maxLength={15} className="w-full p-2 mt-1 text-gray-900 dark:text-white bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                     <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Senha</label>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full p-2 mt-1 text-gray-900 dark:text-white bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                </main>
                <footer className="p-4 border-t border-gray-300 dark:border-slate-600 flex flex-col items-center gap-3">
                    <button type="submit" className="w-full py-2 px-5 font-semibold text-white bg-blue-700 rounded-md hover:bg-blue-800 transition-colors">
                        Criar Conta
                    </button>
                     <p className="text-sm text-gray-600 dark:text-gray-400">
                        Já possui conta? <button type="button" onClick={() => switchView('login')} className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">Fazer login</button>
                    </p>
                </footer>
            </form>
        )}
      </div>
    </div>
  );
};

export default AuthModal;