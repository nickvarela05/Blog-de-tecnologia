import React, { useState } from 'react';
import Icon from './Icon';
import { Lead } from '../types';

interface FooterProps {
  onSelectCategory: (category: string) => void;
  onAddLead: (leadData: Partial<Omit<Lead, 'id' | 'date'>> & { email: string }) => void;
  onOpenInfoModal: (section: 'about' | 'contact' | 'careers' | 'privacy') => void;
  onOpenWhatsAppModal: (email: string) => void;
  categories: string[];
  onNavigateToAdmin: () => void;
}

const FooterLink: React.FC<{ children: React.ReactNode; onClick?: () => void }> = ({ children, onClick }) => (
  <button onClick={onClick} className="text-left text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200">{children}</button>
);

const Footer: React.FC<FooterProps> = ({ onSelectCategory, onAddLead, onOpenInfoModal, onOpenWhatsAppModal, categories, onNavigateToAdmin }) => {
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
    <footer className="bg-gray-50 dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Innovate<span className="text-blue-500">Flow</span>
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">
              © 2024 <span onClick={onNavigateToAdmin} title="Acesso ao Painel">InnovateFlow</span>. Todos os direitos reservados.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Categorias</h3>
            <ul className="mt-4 space-y-2">
              {categories.map(category => (
                <li key={category}><FooterLink onClick={() => onSelectCategory(category)}><span className="capitalize">{category}</span></FooterLink></li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Sobre</h3>
            <ul className="mt-4 space-y-2">
              <li><FooterLink onClick={() => onOpenInfoModal('about')}>Sobre Nós</FooterLink></li>
              <li><FooterLink onClick={() => onOpenInfoModal('contact')}>Contato</FooterLink></li>
              <li><FooterLink onClick={() => onOpenInfoModal('careers')}>Carreiras</FooterLink></li>
              <li><FooterLink onClick={() => onOpenInfoModal('privacy')}>Política de Privacidade</FooterLink></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Receba novidades</h3>
            <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">Receba os melhores artigos e novidades diretamente no seu e-mail.</p>
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
                        className="w-full bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md py-3 pl-4 pr-32 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" 
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
        </div>
      </div>
    </footer>
  );
};

export default Footer;