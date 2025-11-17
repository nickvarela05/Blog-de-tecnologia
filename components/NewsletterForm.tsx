import React, { useState } from 'react';
import Icon from './Icon';
import { Lead } from '../types';

interface NewsletterFormProps {
  onAddLead: (leadData: Omit<Lead, 'id' | 'date'>) => void;
}

const NewsletterForm: React.FC<NewsletterFormProps> = ({ onAddLead }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

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

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddLead({ name, email, phone });
    setName('');
    setEmail('');
    setPhone('');
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  if (showSuccess) {
    return (
      <div className="mt-4 p-3 bg-green-100 dark:bg-green-900/50 border border-green-200 dark:border-green-800 rounded-md text-center text-sm text-green-800 dark:text-green-200">
        Obrigado por se inscrever!
      </div>
    );
  }

  return (
    <form className="mt-4 space-y-3" onSubmit={handleFormSubmit}>
      <div>
        <input 
          type="text" 
          placeholder="Seu nome"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md py-2 px-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" 
        />
      </div>
      <div className="relative flex items-center">
        <Icon type="whatsapp" className="absolute left-3 h-5 w-5 text-gray-400 dark:text-gray-500" />
        <input 
          type="tel" 
          placeholder="(XX) XXXXX-XXXX"
          value={phone}
          onChange={handlePhoneChange}
          required
          maxLength={15}
          className="w-full bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md py-2 px-3 pl-10 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" 
        />
      </div>
      <div>
        <input 
          type="email" 
          placeholder="Seu melhor e-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md py-2 px-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" 
        />
      </div>
      <button 
        type="submit" 
        className="w-full bg-blue-700 hover:bg-blue-800 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-200"
      >
        Enviar
      </button>
    </form>
  );
};

export default NewsletterForm;
