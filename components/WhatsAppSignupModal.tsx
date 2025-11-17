import React, { useState, useEffect } from 'react';
import Icon from './Icon';
import { Lead } from '../types';

interface WhatsAppSignupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddLead: (leadData: Partial<Omit<Lead, 'id' | 'date'>> & { email: string }) => void;
  initialEmail: string | undefined;
}

const WhatsAppSignupModal: React.FC<WhatsAppSignupModalProps> = ({ isOpen, onClose, onAddLead, initialEmail }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setName('');
      setPhone('');
      setSuccessMessage(null);
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen || !initialEmail) {
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
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !phone.trim()) {
      setError("Para salvar, o nome e o telefone são obrigatórios.");
      return;
    }
    
    const justDigits = phone.replace(/[^\d]/g, '');
    if (justDigits.length < 10) { // (11)1234-5678 -> 10 digits
      setError("Por favor, insira um número de telefone válido.");
      return;
    }

    onAddLead({ name, email: initialEmail, phone });
    setSuccessMessage("Perfil atualizado e inscrição confirmada!");
    setTimeout(onClose, 2500);
  };

  const handleNotNow = () => {
    setSuccessMessage("Inscrição confirmada! Você receberá as novidades em breve.");
    setTimeout(onClose, 2500);
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-[60] flex justify-center items-center p-4 backdrop-blur-sm" aria-modal="true" role="dialog">
      <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-lg border border-gray-300 dark:border-slate-700 shadow-xl flex flex-col animate-slide-in-right">
        <header className="flex justify-between items-center p-4 border-b border-gray-300 dark:border-slate-600">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Opcional: Complete seu perfil</h3>
            <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white">
                <Icon type="close" className="h-6 w-6" />
            </button>
        </header>
        {successMessage ? (
            <div className="p-12 text-center">
                <Icon type="check" className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{successMessage}</h3>
            </div>
        ) : (
            <form onSubmit={handleSubmit}>
                <main className="p-6 text-center">
                    <Icon type="whatsapp" className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-300">
                        Sua inscrição foi confirmada! Para uma experiência completa, adicione seu nome e WhatsApp.
                    </p>
                    {error && <p className="text-red-500 text-sm text-center bg-red-100 dark:bg-red-900/50 p-3 rounded-md mt-4">{error}</p>}
                    <div className="space-y-4 mt-6 text-left">
                        <div>
                            <label htmlFor="name-input-modal" className="text-sm font-medium text-gray-500 dark:text-gray-400">Nome</label>
                            <input id="name-input-modal" type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-2 mt-1 text-gray-900 dark:text-white bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div>
                            <label htmlFor="phone-input-modal" className="text-sm font-medium text-gray-500 dark:text-gray-400">Número (WhatsApp)</label>
                            <input id="phone-input-modal" type="tel" value={phone} onChange={handlePhoneChange} placeholder="(XX) XXXXX-XXXX" maxLength={15} className="w-full p-2 mt-1 text-gray-900 dark:text-white bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                    </div>
                </main>
                <footer className="p-4 border-t border-gray-300 dark:border-slate-600 flex flex-col sm:flex-row justify-end gap-3">
                    <button type="button" onClick={handleNotNow} className="py-2 px-5 font-semibold text-gray-800 dark:text-gray-300 bg-gray-200 dark:bg-slate-600 rounded-md hover:bg-gray-300 dark:hover:bg-slate-500 transition-colors">
                        Agora não
                    </button>
                    <button type="submit" className="py-2 px-5 font-semibold text-white bg-blue-700 rounded-md hover:bg-blue-800 transition-colors">
                        Salvar Informações
                    </button>
                </footer>
            </form>
        )}
      </div>
    </div>
  );
};

export default WhatsAppSignupModal;