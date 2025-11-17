import React, { useState } from 'react';
import { Article, SeoSuggestions } from '../types';
import { generateSitemap } from '../services/seoService';
import { suggestSeoMetadata } from '../services/geminiService';
import Icon from './Icon';
import Dropdown, { DropdownOption } from './Dropdown';


interface SeoToolsViewProps {
    articles: Article[];
    onUpdateArticle: (article: Partial<Article> & { id: number }) => void;
}

const SeoToolsView: React.FC<SeoToolsViewProps> = ({ articles, onUpdateArticle }) => {
    const [sitemapContent, setSitemapContent] = useState('');
    const [isSitemapCopied, setIsSitemapCopied] = useState(false);

    const [previewTitle, setPreviewTitle] = useState('');
    const [previewDescription, setPreviewDescription] = useState('');
    
    // State for SEO AI Specialist
    const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [seoSuggestions, setSeoSuggestions] = useState<SeoSuggestions | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isKeywordsCopied, setIsKeywordsCopied] = useState(false);

    // New state for tracking changes and showing confirmation
    const [originalArticle, setOriginalArticle] = useState<Article | null>(null);
    const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);


    const articleOptions: DropdownOption[] = articles
        .filter(a => a.status === 'published')
        .map(a => ({ value: String(a.id), label: a.title }));

    const handleGenerateSitemap = () => {
        const content = generateSitemap(articles);
        setSitemapContent(content);
    };

    const handleCopySitemap = () => {
        navigator.clipboard.writeText(sitemapContent).then(() => {
            setIsSitemapCopied(true);
            setTimeout(() => setIsSitemapCopied(false), 2000);
        });
    };
    
    const handleArticleSelect = (id: string) => {
        setSelectedArticleId(id);
        const article = articles.find(a => String(a.id) === id);
        if (article) {
            setPreviewTitle(article.title);
            setPreviewDescription(article.description);
            setOriginalArticle(article); // Store original article
            setSeoSuggestions(null); // Clear previous suggestions
            setError(null);
        }
    };
    
    const handleOptimize = async () => {
        if (!selectedArticleId) return;
        const article = articles.find(a => String(a.id) === selectedArticleId);
        if (!article || !article.content) {
            setError("O artigo selecionado não tem conteúdo para analisar.");
            return;
        }

        setIsLoading(true);
        setError(null);
        setSeoSuggestions(null);
        try {
            const suggestions = await suggestSeoMetadata(article.title, article.content);
            setSeoSuggestions(suggestions);
        } catch (e) {
            console.error(e);
            setError("Falha ao obter sugestões de SEO. Por favor, tente novamente.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleCopyKeywords = () => {
        if (!seoSuggestions) return;
        navigator.clipboard.writeText(seoSuggestions.keywords.join(', ')).then(() => {
            setIsKeywordsCopied(true);
            setTimeout(() => setIsKeywordsCopied(false), 2000);
        });
    };
    
    const hasChanges = originalArticle && (originalArticle.title !== previewTitle || originalArticle.description !== previewDescription);

    const handleSaveChanges = () => {
        if (!selectedArticleId || !hasChanges || !originalArticle) return;
        
        const updatedData = {
            id: originalArticle.id,
            title: previewTitle,
            description: previewDescription,
        };

        onUpdateArticle(updatedData);
        
        setOriginalArticle(prev => prev ? { ...prev, ...updatedData } : null);

        setShowSaveConfirmation(true);
        setTimeout(() => setShowSaveConfirmation(false), 3000);
    };

    return (
        <div className="space-y-8">
            <header>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Ferramentas de SEO</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Otimize a visibilidade do seu blog nos motores de busca.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* SEO Specialist */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-gray-300 dark:border-slate-700">
                     <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Especialista de SEO com IA</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Selecione um artigo e deixe a IA otimizar seu título, descrição e palavras-chave.</p>
                    
                    <div className="mt-4 flex flex-col sm:flex-row items-center gap-2">
                        <div className="w-full flex-grow">
                             <Dropdown
                                options={articleOptions}
                                value={selectedArticleId || ''}
                                onChange={handleArticleSelect}
                                placeholder="Selecione um artigo..."
                            />
                        </div>
                        <button 
                            onClick={handleOptimize}
                            disabled={!selectedArticleId || isLoading}
                            className="w-full sm:w-auto py-2 px-4 font-semibold text-white bg-blue-700 rounded-md hover:bg-blue-800 text-sm flex items-center justify-center gap-2 disabled:bg-gray-500 disabled:cursor-not-allowed"
                        >
                            <Icon type="spark" className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                            {isLoading ? 'Otimizando...' : 'Otimizar com IA'}
                        </button>
                    </div>

                    {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
                    
                    {seoSuggestions && (
                         <div className="mt-6 space-y-4 animate-fade-scale-in">
                            <div>
                                <h4 className="text-sm font-semibold mb-1 text-gray-600 dark:text-gray-400">Título Sugerido</h4>
                                <div className="flex items-center gap-2">
                                    <p className="flex-grow p-2 bg-gray-100 dark:bg-slate-700 rounded-md text-sm">{seoSuggestions.title}</p>
                                    <button onClick={() => setPreviewTitle(seoSuggestions.title)} className="text-sm font-semibold text-blue-500 hover:underline">Aplicar</button>
                                </div>
                            </div>
                             <div>
                                <h4 className="text-sm font-semibold mb-1 text-gray-600 dark:text-gray-400">Descrição Sugerida</h4>
                                <div className="flex items-center gap-2">
                                     <p className="flex-grow p-2 bg-gray-100 dark:bg-slate-700 rounded-md text-sm">{seoSuggestions.description}</p>
                                    <button onClick={() => setPreviewDescription(seoSuggestions.description)} className="text-sm font-semibold text-blue-500 hover:underline">Aplicar</button>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-400">Palavras-chave Sugeridas</h4>
                                    <button onClick={handleCopyKeywords} className="text-sm font-medium text-blue-500 hover:underline flex items-center gap-1">
                                        <Icon type={isKeywordsCopied ? 'check' : 'copy'} className={`w-4 h-4 ${isKeywordsCopied ? 'text-green-500' : ''}`} />
                                        {isKeywordsCopied ? 'Copiado!' : 'Copiar'}
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2 p-2 bg-gray-100 dark:bg-slate-700 rounded-md">
                                    {seoSuggestions.keywords.map((kw, i) => (
                                        <span key={i} className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-gray-300">{kw}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Meta Tag Previewer */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-gray-300 dark:border-slate-700">
                     <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Pré-visualizador de Meta Tags</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Veja como o título e a descrição do seu artigo podem aparecer no Google.</p>
                    <div className="mt-4 space-y-4">
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Título</label>
                                <span className={`text-xs ${previewTitle.length > 60 ? 'text-red-500' : 'text-gray-400'}`}>{previewTitle.length} / 60</span>
                            </div>
                            <input 
                                type="text"
                                value={previewTitle}
                                onChange={e => setPreviewTitle(e.target.value)}
                                className="w-full p-2 bg-gray-50 dark:bg-slate-700/50 border border-gray-300 dark:border-slate-600 rounded-md"
                            />
                        </div>
                        <div>
                             <div className="flex justify-between items-center mb-1">
                                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Descrição</label>
                                <span className={`text-xs ${previewDescription.length > 160 ? 'text-red-500' : 'text-gray-400'}`}>{previewDescription.length} / 160</span>
                            </div>
                            <textarea
                                value={previewDescription}
                                onChange={e => setPreviewDescription(e.target.value)}
                                rows={3}
                                className="w-full p-2 bg-gray-50 dark:bg-slate-700/50 border border-gray-300 dark:border-slate-600 rounded-md"
                            />
                        </div>
                    </div>
                    <div className="mt-6 border-t border-gray-200 dark:border-slate-700 pt-4">
                         <h4 className="text-sm font-semibold mb-2">Pré-visualização do Google</h4>
                         <div className="p-4 bg-gray-50 dark:bg-slate-900/50 rounded-md border border-gray-200 dark:border-slate-700">
                             <span className="text-sm text-gray-800 dark:text-gray-200">https://www.innovateflow.com/artigo/...</span>
                             <h3 className="text-xl text-blue-800 dark:text-blue-400 truncate">{previewTitle || 'Seu Título Otimizado Aparece Aqui'}</h3>
                             <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {previewDescription || 'A meta descrição do seu artigo será exibida aqui. Escreva algo atraente para incentivar os usuários a clicarem no seu resultado de pesquisa.'}
                             </p>
                         </div>
                    </div>
                    <div className="mt-6 flex justify-end items-center gap-4 border-t border-gray-200 dark:border-slate-700 pt-4">
                        {showSaveConfirmation && (
                            <span className="text-sm text-green-600 dark:text-green-400 animate-fade-scale-in">
                                Alterações salvas!
                            </span>
                        )}
                        <button
                            onClick={handleSaveChanges}
                            disabled={!hasChanges}
                            className="py-2 px-5 font-semibold text-white bg-blue-700 rounded-md hover:bg-blue-800 disabled:bg-gray-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
                        >
                            Salvar Alterações
                        </button>
                    </div>
                </div>

                 {/* Sitemap Generator */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-gray-300 dark:border-slate-700 lg:col-span-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Gerador de Sitemap</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Gere um sitemap.xml para ajudar os motores de busca a descobrir todo o seu conteúdo.</p>
                    <button 
                        onClick={handleGenerateSitemap}
                        className="mt-4 py-2 px-4 font-semibold text-white bg-blue-700 rounded-md hover:bg-blue-800 text-sm flex items-center gap-2"
                    >
                        <Icon type="spark" className="w-4 h-4" />
                        Gerar Sitemap
                    </button>
                    {sitemapContent && (
                        <div className="mt-4">
                            <div className="flex justify-between items-center mb-1">
                                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Conteúdo do sitemap.xml</label>
                                <button onClick={handleCopySitemap} className="text-sm font-medium text-blue-500 hover:underline flex items-center gap-1">
                                    <Icon type={isSitemapCopied ? 'check' : 'copy'} className={`w-4 h-4 ${isSitemapCopied ? 'text-green-500' : ''}`} />
                                    {isSitemapCopied ? 'Copiado!' : 'Copiar'}
                                </button>
                            </div>
                            <textarea
                                readOnly
                                value={sitemapContent}
                                className="w-full h-64 p-2 font-mono text-xs text-gray-900 dark:text-white bg-gray-50 dark:bg-slate-900/50 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                             <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Copie este conteúdo, salve-o como um arquivo chamado `sitemap.xml` na raiz do seu site e envie-o para o Google Search Console.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SeoToolsView;