import React, { useState, useMemo } from 'react';
import { Article } from '../types';
import Icon from './Icon';
import Dropdown, { DropdownOption } from './Dropdown';

interface PublishedArticlesViewProps {
  articles: Article[];
  onEdit: (article: Article) => void;
  onDelete: (article: Article) => void;
  onNewArticle: () => void;
  onMarketing: (article: Article) => void;
  onNotify: (article: Article) => void;
}

const StatusBadge: React.FC<{ status: Article['status'] }> = ({ status }) => {
  const baseClasses = "px-2.5 py-0.5 text-xs font-semibold rounded-full inline-block";
  const styles: Record<NonNullable<Article['status']>, string> = {
    published: "bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300",
    draft: "bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300",
    inactive: "bg-gray-200 dark:bg-slate-600 text-gray-800 dark:text-gray-300",
  };
  
  const statusTranslations: Record<NonNullable<Article['status']>, string> = {
      published: 'Publicado',
      draft: 'Rascunho',
      inactive: 'Inativo'
  };

  const statusText = status ? statusTranslations[status] : 'Desconhecido';
  return <span className={`${baseClasses} ${styles[status || 'inactive']}`}>{statusText}</span>;
};

const PublishedArticlesView: React.FC<PublishedArticlesViewProps> = ({ articles, onEdit, onDelete, onNewArticle, onMarketing, onNotify }) => {
    const [filter, setFilter] = useState<'all' | Article['status']>('all');

    const filteredArticles = useMemo(() => {
        if (filter === 'all') {
            return articles;
        }
        return articles.filter(article => article.status === filter);
    }, [articles, filter]);

    const statusOptions: DropdownOption[] = [
        { value: 'all', label: 'Todos' },
        { value: 'published', label: 'Publicado' },
        { value: 'draft', label: 'Rascunho' },
        { value: 'inactive', label: 'Inativo' },
    ];

    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-gray-300 dark:border-slate-700">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <label htmlFor="status-filter" className="text-sm font-medium text-gray-600 dark:text-gray-400">Filtrar por status:</label>
                    <div className="w-full sm:w-40">
                         <Dropdown
                            options={statusOptions}
                            value={filter}
                            onChange={(value) => setFilter(value as any)}
                        />
                    </div>
                </div>
                <button
                    onClick={onNewArticle}
                    className="py-2.5 px-5 w-full sm:w-auto font-semibold text-white bg-blue-700 rounded-md hover:bg-blue-800 transition-colors flex items-center justify-center gap-2"
                >
                    <Icon type="spark" className="w-5 h-5" />
                    Novo Artigo
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="border-b border-gray-300 dark:border-slate-600 text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        <tr>
                            <th className="p-3">Título</th>
                            <th className="p-3">Categoria</th>
                            <th className="p-3">Status</th>
                            <th className="p-3">Data</th>
                            <th className="p-3 text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                        {filteredArticles.map(article => (
                            <tr key={article.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50">
                                <td className="p-3 font-medium text-gray-900 dark:text-white max-w-xs truncate">{article.title}</td>
                                <td className="p-3 text-gray-600 dark:text-gray-400">{article.category}</td>
                                <td className="p-3">
                                    <StatusBadge status={article.status} />
                                </td>
                                <td className="p-3 text-gray-600 dark:text-gray-400">{article.date}</td>
                                <td className="p-3">
                                    <div className="flex justify-end items-center gap-3">
                                        {article.status === 'published' && (
                                            <button onClick={() => onNotify(article)} className="text-purple-500 hover:text-purple-600" aria-label={`Notificar sobre ${article.title}`}>
                                                <Icon type="speakerphone" className="w-5 h-5"/>
                                            </button>
                                        )}
                                        <button onClick={() => onMarketing(article)} className="text-green-500 hover:text-green-600" aria-label={`Marketing para ${article.title}`}>
                                            <Icon type="chart-bar" className="w-5 h-5"/>
                                        </button>
                                        <button onClick={() => onEdit(article)} className="text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300" aria-label={`Editar ${article.title}`}>
                                            <Icon type="pencil" className="w-5 h-5"/>
                                        </button>
                                        <button onClick={() => onDelete(article)} className="text-red-500 hover:text-red-600 dark:hover:text-red-400" aria-label={`Excluir ${article.title}`}>
                                            <Icon type="trash" className="w-5 h-5"/>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {filteredArticles.length === 0 && (
                    <div className="text-center py-12 text-gray-400 dark:text-gray-500">
                        <p>Nenhum artigo encontrado para este filtro.</p>
                    </div>
                 )}
            </div>
        </div>
    );
};

export default PublishedArticlesView;
