import React, { useState } from 'react';
import { Lead } from '../types';
import Icon from './Icon';

const trendingTopics = ['Ética em IA', 'Computação Quântica', 'Biohacking', 'Web3', 'Energia Limpa', 'Neurociência'];

interface SidebarProps {
    onOpenWhatsAppModal: (email: string) => void;
    onSelectCategory: (category: string) => void;
    onSelectAuthor: (author: string) => void;
    onAddLead: (leadData: Partial<Omit<Lead, 'id' | 'date'>> & { email: string }) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onOpenWhatsAppModal, onSelectCategory, onSelectAuthor, onAddLead }) => {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    onAddLead({ email });
    setIsSubscribed(true);
    onOpenWhatsAppModal(email);

    setTimeout(() => {
        setIsSubscribed(false);
        setEmail('');
    }, 4000);
  };

  return (
    <aside className="space-y-8">
      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-gray-300 dark:border-slate-700">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white border-b border-gray-300 dark:border-slate-600 pb-3">Tópicos em Alta</h3>
        <div className="flex flex-wrap gap-2 mt-4">
          {trendingTopics.map(topic => (
            <button key={topic} onClick={() => onSelectCategory(topic)} className="bg-blue-50 dark:bg-slate-700/50 text-blue-600 dark:text-blue-300 text-sm font-medium px-3 py-1 rounded-full hover:bg-blue-100 dark:hover:bg-slate-600 transition-colors duration-200">
              {topic}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-gray-300 dark:border-slate-700">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white border-b border-gray-300 dark:border-slate-600 pb-3">Autor em Destaque</h3>
        <div className="flex items-center mt-4">
          <img src="https://i.pravatar.cc/150?u=sofia_lima" alt="Sofia Lima" className="h-16 w-16 rounded-full object-cover" />
          <div className="ml-4">
            <p className="font-semibold text-gray-900 dark:text-white">Sofia Lima</p>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Pesquisadora de IA e Ética Digital</p>
            <button onClick={() => onSelectAuthor('Sofia Lima')} className="text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 text-sm font-medium">Ver Artigos</button>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/30 p-6 rounded-lg border border-blue-200 dark:border-blue-800 text-center">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Fique por Dentro</h3>
        <p className="text-gray-700 dark:text-gray-300 mt-2 text-sm">Receba as últimas novidades do mundo da tecnologia e ciência, entregues em seu e-mail semanalmente.</p>
        {isSubscribed ? (
            <div className="mt-4 flex items-center justify-center gap-2 bg-green-100 dark:bg-green-900/50 p-3 rounded-md text-green-800 dark:text-green-200">
                <Icon type="check" className="w-5 h-5" />
                <span className="text-sm font-semibold">Inscrição confirmada!</span>
            </div>
        ) : (
          <form onSubmit={handleFormSubmit} className="mt-4">
            <div className="relative">
                <input 
                    type="email" 
                    placeholder="Seu melhor e-mail" 
                    required 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md py-3 pl-4 pr-32 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" 
                />
                <button 
                    type="submit" 
                    className="absolute right-1.5 top-1.5 bg-blue-700 hover:bg-blue-800 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-200 text-sm"
                >
                    Inscrever-se
                </button>
            </div>
          </form>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;