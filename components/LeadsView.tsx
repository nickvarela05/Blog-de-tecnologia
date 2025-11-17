import React, { useState, useMemo } from 'react';
import { Lead } from '../types';
import Icon from './Icon';
import ConfirmationModal from './ConfirmationModal';

interface LeadsViewProps {
  leads: Lead[];
  setLeads: React.Dispatch<React.SetStateAction<Lead[]>>;
}

const LeadsView: React.FC<LeadsViewProps> = ({ leads, setLeads }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLeads, setSelectedLeads] = useState<number[]>([]);
    const [leadToDelete, setLeadToDelete] = useState<Lead[] | null>(null);

    const filteredLeads = useMemo(() => {
        return leads.filter(lead => {
            const lowerCaseSearch = searchTerm.toLowerCase();
            return (
                (lead.name || '').toLowerCase().includes(lowerCaseSearch) ||
                (lead.email || '').toLowerCase().includes(lowerCaseSearch) ||
                (lead.phone || '').toLowerCase().includes(lowerCaseSearch)
            )
        });
    }, [leads, searchTerm]);

    const handleSelectLead = (id: number) => {
        setSelectedLeads(prev => 
            prev.includes(id) ? prev.filter(leadId => leadId !== id) : [...prev, id]
        );
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedLeads(filteredLeads.map(lead => lead.id));
        } else {
            setSelectedLeads([]);
        }
    };

    const exportToCsv = (leadsToExport: Lead[]) => {
        if (leadsToExport.length === 0) return;
        const header = ['ID', 'Nome', 'Email', 'Telefone', 'Data de Inscrição'];
        const rows = leadsToExport.map(lead => 
            [lead.id, `"${lead.name || ''}"`, `"${lead.email}"`, `"${lead.phone || ''}"`, lead.date]
        );
        let csvContent = "data:text/csv;charset=utf-8," 
            + [header, ...rows].map(e => e.join(",")).join("\n");
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "leads.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleDelete = () => {
        if (!leadToDelete) return;
        const idsToDelete = leadToDelete.map(l => l.id);
        setLeads(prev => prev.filter(lead => !idsToDelete.includes(lead.id)));
        setSelectedLeads([]);
        setLeadToDelete(null);
    };

    const openDeleteConfirmation = () => {
        if (selectedLeads.length === 0) return;
        const toDelete = leads.filter(lead => selectedLeads.includes(lead.id));
        setLeadToDelete(toDelete);
    };

    return (
        <div className="space-y-8">
            <header>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Gerenciamento de Leads</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Visualize, gerencie e exporte os contatos capturados através dos formulários.</p>
            </header>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-gray-300 dark:border-slate-700">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                    <div className="relative w-full sm:max-w-xs">
                        <input
                            type="text"
                            placeholder="Pesquisar por nome, e-mail..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md py-2 px-4 pl-10 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Icon type="search" className="h-5 w-5 text-gray-400" />
                        </div>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <button
                            onClick={() => exportToCsv(leads.filter(l => selectedLeads.includes(l.id)))}
                            disabled={selectedLeads.length === 0}
                            className="w-full sm:w-auto py-2.5 px-5 font-semibold text-gray-800 dark:text-white bg-gray-200 dark:bg-slate-600 rounded-md hover:bg-gray-300 dark:hover:bg-slate-500 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Exportar Selecionados
                        </button>
                        <button
                            onClick={openDeleteConfirmation}
                            disabled={selectedLeads.length === 0}
                            className="w-full sm:w-auto py-2.5 px-5 font-semibold text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors flex items-center justify-center gap-2 disabled:bg-red-400 disabled:cursor-not-allowed"
                        >
                            <Icon type="trash" className="w-5 h-5" />
                            Excluir
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b border-gray-300 dark:border-slate-600 text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            <tr>
                                <th className="p-3 w-12 text-center">
                                    <input type="checkbox"
                                        className="h-4 w-4 rounded border-gray-400 dark:border-slate-500 text-blue-600 bg-gray-100 dark:bg-slate-700 focus:ring-blue-500"
                                        onChange={handleSelectAll}
                                        checked={filteredLeads.length > 0 && selectedLeads.length === filteredLeads.length}
                                    />
                                </th>
                                <th className="p-3">Nome</th>
                                <th className="p-3">Email</th>
                                <th className="p-3">Telefone</th>
                                <th className="p-3">Data de Inscrição</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                            {filteredLeads.map(lead => (
                                <tr key={lead.id} className={`hover:bg-gray-50 dark:hover:bg-slate-800/50 ${selectedLeads.includes(lead.id) ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
                                    <td className="p-3 text-center">
                                        <input type="checkbox"
                                            className="h-4 w-4 rounded border-gray-400 dark:border-slate-500 text-blue-600 bg-gray-100 dark:bg-slate-700 focus:ring-blue-500"
                                            checked={selectedLeads.includes(lead.id)}
                                            onChange={() => handleSelectLead(lead.id)}
                                        />
                                    </td>
                                    <td className="p-3 font-medium text-gray-900 dark:text-white">{lead.name}</td>
                                    <td className="p-3 text-gray-600 dark:text-gray-400">{lead.email}</td>
                                    <td className="p-3 text-gray-600 dark:text-gray-400">{lead.phone}</td>
                                    <td className="p-3 text-gray-600 dark:text-gray-400">{lead.date}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredLeads.length === 0 && (
                        <div className="text-center py-12 text-gray-400 dark:text-gray-500">
                            <p>Nenhum lead encontrado.</p>
                        </div>
                    )}
                </div>
            </div>

            <ConfirmationModal
                isOpen={!!leadToDelete}
                title={`Excluir ${leadToDelete?.length || 0} Lead(s)`}
                message={`Você tem certeza que deseja excluir permanentemente ${leadToDelete?.length || 0} lead(s)? Esta ação não pode ser desfeita.`}
                onConfirm={handleDelete}
                onCancel={() => setLeadToDelete(null)}
            />
        </div>
    );
};

export default LeadsView;