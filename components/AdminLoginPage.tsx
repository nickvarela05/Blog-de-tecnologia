import React, { useState } from 'react';
import Icon from './Icon';
import { LoginData } from './AuthModal';

interface AdminLoginPageProps {
    onLogin: (data: LoginData) => string | undefined;
    onNavigateHome: () => void;
}

const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ onLogin, onNavigateHome }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [keepLoggedIn, setKeepLoggedIn] = useState(false);

    const handleLoginSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        const result = onLogin({ email, password });
        if (result) {
            setError(result);
        }
    };

    return (
        <div className="relative flex items-center justify-center min-h-screen bg-gray-50 dark:bg-slate-900">
            <button 
                onClick={onNavigateHome} 
                className="absolute top-8 left-8 inline-flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-semibold text-sm transition-colors z-10"
            >
                <Icon type="arrow-left" className="w-5 h-5" />
                Voltar à página inicial
            </button>
            <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-slate-800 rounded-lg border border-gray-300 dark:border-slate-700">
                <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white">Login do Admin</h2>
                <form onSubmit={handleLoginSubmit} className="space-y-6">
                    <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">E-mail</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-3 py-2 mt-1 text-gray-900 dark:text-white bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Senha</label>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full px-3 py-2 mt-1 text-gray-900 dark:text-white bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div className="flex items-center">
                        <input
                            id="keep-logged-in"
                            name="keep-logged-in"
                            type="checkbox"
                            checked={keepLoggedIn}
                            onChange={(e) => setKeepLoggedIn(e.target.checked)}
                            className="h-4 w-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:bg-slate-600 dark:border-slate-500 dark:focus:ring-blue-600 dark:ring-offset-slate-800"
                        />
                        <label htmlFor="keep-logged-in" className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                            Manter conectado
                        </label>
                    </div>
                    {error && <p className="text-red-500 dark:text-red-400 text-sm">{error}</p>}
                    <button type="submit" className="w-full py-2 px-4 font-semibold text-white bg-blue-700 rounded-md hover:bg-blue-800 transition-colors">Entrar</button>
                </form>
            </div>
        </div>
    );
};

export default AdminLoginPage;