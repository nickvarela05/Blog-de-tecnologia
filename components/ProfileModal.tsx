import React, { useState } from 'react';
import Icon from './Icon';
import { User } from '../types';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onUpdateUser: (updatedData: Partial<User>) => string | undefined;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, currentUser, onUpdateUser }) => {
  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email);
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (newPassword && newPassword !== confirmPassword) {
      setError("A nova senha e a confirmação não correspondem.");
      return;
    }
    
    if (newPassword && newPassword.length < 6) {
        setError("A nova senha deve ter pelo menos 6 caracteres.");
        return;
    }

    const updateData: Partial<User> = {
        name,
        email,
        phone,
    };
    
    if (newPassword) {
        // In a real app, you'd verify the current password on the backend.
        // Here, we'll just check if it matches the mock data for simplicity.
        if (currentPassword !== currentUser.password) {
            setError("A senha atual está incorreta.");
            return;
        }
        updateData.password = newPassword;
    }

    const result = onUpdateUser(updateData);

    if (result) {
      setError(result);
    } else {
      setSuccessMessage("Perfil atualizado com sucesso!");
      // Clear password fields after successful update
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-[60] flex justify-center items-center p-4 backdrop-blur-sm" aria-modal="true" role="dialog">
      <div className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-lg border border-gray-300 dark:border-slate-700 shadow-xl flex flex-col max-h-[90vh]">
        <header className="flex-shrink-0">
            <div className="flex justify-between items-center p-4 border-b border-gray-300 dark:border-slate-600">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Editar Perfil</h3>
                <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white">
                    <Icon type="close" className="h-6 w-6" />
                </button>
            </div>
        </header>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
            <main className="flex-1 overflow-y-auto p-6 space-y-4">
                {error && <p className="text-red-500 text-sm text-center bg-red-100 dark:bg-red-900/50 p-3 rounded-md">{error}</p>}
                {successMessage && <p className="text-green-600 text-sm text-center bg-green-100 dark:bg-green-900/50 p-3 rounded-md">{successMessage}</p>}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Nome</label>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full p-2 mt-1 text-gray-900 dark:text-white bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">E-mail</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full p-2 mt-1 text-gray-900 dark:text-white bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                </div>
                <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Telefone</label>
                    <input type="tel" value={phone} onChange={handlePhoneChange} placeholder="(XX) XXXXX-XXXX" required maxLength={15} className="w-full p-2 mt-1 text-gray-900 dark:text-white bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="pt-4 border-t border-gray-200 dark:border-slate-700">
                    <h4 className="font-semibold text-gray-700 dark:text-gray-300">Alterar Senha</h4>
                    <div className="space-y-4 mt-2">
                        <div>
                            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Senha Atual</label>
                            <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="Deixe em branco para não alterar" className="w-full p-2 mt-1 text-gray-900 dark:text-white bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Nova Senha</label>
                            <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full p-2 mt-1 text-gray-900 dark:text-white bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Confirmar Nova Senha</label>
                            <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full p-2 mt-1 text-gray-900 dark:text-white bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                    </div>
                </div>
            </main>
            <footer className="p-4 border-t border-gray-300 dark:border-slate-600 flex justify-end gap-4 flex-shrink-0">
                <button type="button" onClick={onClose} className="py-2 px-5 font-semibold text-gray-800 dark:text-gray-300 bg-gray-200 dark:bg-slate-600 rounded-md hover:bg-gray-300 dark:hover:bg-slate-500">Cancelar</button>
                <button type="submit" className="py-2 px-5 font-semibold text-white bg-blue-700 rounded-md hover:bg-blue-800">Salvar Alterações</button>
            </footer>
        </form>
      </div>
    </div>
  );
};

export default ProfileModal;
