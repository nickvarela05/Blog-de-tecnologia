import React, { useState, useMemo } from 'react';
import { User } from '../types';
import Icon from './Icon';
import ConfirmationModal from './ConfirmationModal';
import Dropdown, { DropdownOption } from './Dropdown';

interface UsersViewProps {
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  currentUserRole: 'Administrator' | 'Leitor';
}

const UserStatusBadge: React.FC<{ status: User['status'] }> = ({ status }) => {
  const baseClasses = "px-2.5 py-0.5 text-xs font-semibold rounded-full inline-block";
  const styles: Record<User['status'], string> = {
    Active: "bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300",
    Inactive: "bg-gray-200 dark:bg-slate-600 text-gray-800 dark:text-gray-300",
  };
  const statusTranslations: Record<User['status'], string> = {
      Active: 'Ativo',
      Inactive: 'Inativo'
  };
  return <span className={`${baseClasses} ${styles[status]}`}>{statusTranslations[status]}</span>;
};

const UserRoleBadge: React.FC<{ role: User['role'] }> = ({ role }) => {
    const is_admin = role === 'Administrator';
    const classes = is_admin 
        ? "bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300"
        : "bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-300";
    return <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full inline-block ${classes}`}>{role}</span>;
};


const UsersView: React.FC<UsersViewProps> = ({ users, setUsers, currentUserRole }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | User['status']>('all');
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [isAddModalOpen, setAddModalOpen] = useState(false);
    
    const is_admin = currentUserRole === 'Administrator';

    const filteredUsers = useMemo(() => {
        return users.filter(user => {
            const matchesSearch = (user.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                                  (user.email || '').toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [users, searchTerm, statusFilter]);
    
    const handleDeleteUser = () => {
        if (!userToDelete) return;
        setUsers(users.filter(u => u.id !== userToDelete.id));
        setUserToDelete(null);
    };

    const handleSaveUser = (userToSave: User) => {
        if (userToSave.id) { // Editing existing user
            setUsers(users.map(u => u.id === userToSave.id ? userToSave : u));
        } else { // Adding new user
            const newUser = { ...userToSave, id: Date.now(), avatarUrl: `https://i.pravatar.cc/150?u=${Date.now()}` };
            setUsers([newUser, ...users]);
        }
        setEditingUser(null);
        setAddModalOpen(false);
    };

    const UserEditModal: React.FC<{ user: User | null; onClose: () => void; onSave: (user: User) => void }> = ({ user, onClose, onSave }) => {
        const [formData, setFormData] = useState<Omit<User, 'id' | 'avatarUrl'>>({
            name: user?.name || '',
            email: user?.email || '',
            role: user?.role || 'Leitor',
            status: user?.status || 'Active',
        });
    
        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            setFormData({ ...formData, [e.target.name]: e.target.value });
        };

        const handleDropdownChange = (name: 'role' | 'status', value: string) => {
            setFormData({ ...formData, [name]: value as any });
        };
    
        const handleSubmit = (e: React.FormEvent) => {
            e.preventDefault();
            onSave({ ...formData, id: user?.id || 0, avatarUrl: user?.avatarUrl || '' });
        };

        const roleOptions: DropdownOption[] = [
            { value: 'Leitor', label: 'Leitor' },
            { value: 'Administrator', label: 'Administrator' },
        ];

        const statusOptions: DropdownOption[] = [
            { value: 'Active', label: 'Ativo' },
            { value: 'Inactive', label: 'Inativo' },
        ];
    
        return (
            <div className="fixed inset-0 bg-black/80 z-[60] flex justify-center items-center p-4 backdrop-blur-sm" aria-modal="true">
                <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-lg border border-gray-300 dark:border-slate-700 shadow-xl">
                    <form onSubmit={handleSubmit}>
                        <header className="flex justify-between items-center p-4 border-b border-gray-300 dark:border-slate-600">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{user ? 'Editar Usuário' : 'Adicionar Usuário'}</h3>
                            <button type="button" onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white"><Icon type="close" className="h-6 w-6" /></button>
                        </header>
                        <main className="p-6 space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Nome</label>
                                <input name="name" value={formData.name} onChange={handleChange} className="w-full p-2 mt-1 text-gray-900 dark:text-white bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</label>
                                <input name="email" type="email" value={formData.email} onChange={handleChange} className="w-full p-2 mt-1 text-gray-900 dark:text-white bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Função</label>
                                    <Dropdown
                                        options={roleOptions}
                                        value={formData.role}
                                        onChange={(value) => handleDropdownChange('role', value)}
                                        className="mt-1"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</label>
                                    <Dropdown
                                        options={statusOptions}
                                        value={formData.status}
                                        onChange={(value) => handleDropdownChange('status', value)}
                                        className="mt-1"
                                    />
                                </div>
                            </div>
                        </main>
                        <footer className="p-4 border-t border-gray-300 dark:border-slate-600 flex justify-end gap-4">
                            <button type="button" onClick={onClose} className="py-2 px-5 font-semibold text-gray-800 dark:text-gray-300 bg-gray-200 dark:bg-slate-600 rounded-md hover:bg-gray-300 dark:hover:bg-slate-500">Cancelar</button>
                            <button type="submit" className="py-2 px-5 font-semibold text-white bg-blue-700 rounded-md hover:bg-blue-800">Salvar</button>
                        </footer>
                    </form>
                </div>
            </div>
        );
    };

    const statusFilterOptions: DropdownOption[] = [
        { value: 'all', label: 'Todos os Status' },
        { value: 'Active', label: 'Ativo' },
        { value: 'Inactive', label: 'Inativo' },
    ];

    return (
        <div className="space-y-8">
            <header>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Gerenciamento de Usuários</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Adicione, edite ou remova usuários com acesso ao painel de administração.</p>
            </header>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-gray-300 dark:border-slate-700">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                    <div className="relative w-full sm:max-w-xs">
                        <input
                            type="text"
                            placeholder="Pesquisar por nome ou e-mail..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md py-2 px-4 pl-10 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Icon type="search" className="h-5 w-5 text-gray-400" />
                        </div>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <div className="w-full sm:w-40">
                             <Dropdown
                                options={statusFilterOptions}
                                value={statusFilter}
                                onChange={(value) => setStatusFilter(value as any)}
                            />
                        </div>
                         <button
                            onClick={() => setAddModalOpen(true)}
                            disabled={!is_admin}
                            className="w-full sm:w-auto py-2.5 px-5 font-semibold text-white bg-blue-700 rounded-md hover:bg-blue-800 transition-colors flex items-center justify-center gap-2 disabled:bg-gray-500 disabled:cursor-not-allowed"
                        >
                            <Icon type="plus" className="w-5 h-5" />
                            Adicionar Usuário
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b border-gray-300 dark:border-slate-600 text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            <tr>
                                <th className="p-3">Nome</th>
                                <th className="p-3">Email</th>
                                <th className="p-3">Função</th>
                                <th className="p-3">Status</th>
                                {is_admin && <th className="p-3 text-right">Ações</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                            {filteredUsers.map(user => (
                                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50">
                                    <td className="p-3 font-medium text-gray-900 dark:text-white">
                                        <div className="flex items-center gap-3">
                                            <img src={user.avatarUrl} alt={user.name} className="h-9 w-9 rounded-full"/>
                                            <span>{user.name}</span>
                                        </div>
                                    </td>
                                    <td className="p-3 text-gray-600 dark:text-gray-400">
                                        {is_admin ? user.email : `${user.email.substring(0, 3)}...${user.email.substring(user.email.indexOf('@'))}`}
                                    </td>
                                    <td className="p-3"><UserRoleBadge role={user.role} /></td>
                                    <td className="p-3"><UserStatusBadge status={user.status} /></td>
                                    {is_admin && (
                                        <td className="p-3">
                                            <div className="flex justify-end items-center gap-3">
                                                <button onClick={() => setEditingUser(user)} className="text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300" aria-label={`Editar ${user.name}`}>
                                                    <Icon type="pencil" className="w-5 h-5"/>
                                                </button>
                                                <button onClick={() => setUserToDelete(user)} className="text-red-500 hover:text-red-600 dark:hover:text-red-400" aria-label={`Excluir ${user.name}`}>
                                                    <Icon type="trash" className="w-5 h-5"/>
                                                </button>
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredUsers.length === 0 && (
                        <div className="text-center py-12 text-gray-400 dark:text-gray-500">
                            <p>Nenhum usuário encontrado.</p>
                        </div>
                    )}
                </div>
            </div>

            <ConfirmationModal
                isOpen={!!userToDelete}
                title="Excluir Usuário"
                message={`Você tem certeza que deseja excluir permanentemente "${userToDelete?.name}"? Esta ação não pode ser desfeita.`}
                onConfirm={handleDeleteUser}
                onCancel={() => setUserToDelete(null)}
            />

            {(editingUser || isAddModalOpen) && (
                 <UserEditModal
                    user={editingUser}
                    onClose={() => { setEditingUser(null); setAddModalOpen(false); }}
                    onSave={handleSaveUser}
                />
            )}
        </div>
    );
};

export default UsersView;