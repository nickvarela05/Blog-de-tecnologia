import React, { useState, useRef, useEffect, useMemo } from 'react';
// FIX: Added missing imports for geminiService functions and AnalyticsDashboard
import { suggestArticleMetadata, parseMarkdown, generateImageWithPrompt } from '../services/geminiService';
import Icon from './Icon';
import { Article, Author, Notification, User, Lead, AutomationSettings } from '../types';
import PublishedArticlesView from './PublishedArticlesView';
import ConfirmationModal from './ConfirmationModal';
import TrendingTopicsWidget from './TrendingTopicsWidget';
import AnalyticsDashboard from './AnalyticsDashboard';
import NotificationDropdown from './NotificationDropdown';
import SettingsView from './SettingsView';
import UsersView from './UsersView';
import { GenerationParams, GenerationResult, AllInfoContents } from '../App';
import IntegrationsView from './IntegrationsView';
import LeadsView from './LeadsView';
import Dropdown, { DropdownOption } from './Dropdown';
import ImageCropperModal from './ImageCropperModal';
import MarketingView from './MarketingView';
import SeoToolsView from './SeoToolsView';


interface AdminPanelProps {
  currentUser: User | null;
  onLogout: () => void;
  onNavigateHome: () => void;
  onStartGeneration: (params: GenerationParams) => Promise<void>;
  isGenerating: boolean;
  loadingMessage: string;
  generationResult: GenerationResult | null;
  clearGenerationResult: () => void;
  totalVisitors: number;
  emailLeads: number;
  whatsappLeads: number;
  leads: Lead[];
  setLeads: React.Dispatch<React.SetStateAction<Lead[]>>;
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  footerInfoContents: AllInfoContents;
  setFooterInfoContents: React.Dispatch<React.SetStateAction<AllInfoContents>>;
  articles: Article[];
  setArticles: React.Dispatch<React.SetStateAction<Article[]>>;
  authors: Author[];
  setAuthors: React.Dispatch<React.SetStateAction<Author[]>>;
  categories: string[];
  setCategories: React.Dispatch<React.SetStateAction<string[]>>;
  featuredArticleIds: number[];
  setFeaturedArticleIds: React.Dispatch<React.SetStateAction<number[]>>;
  automationSettings: AutomationSettings;
  setAutomationSettings: React.Dispatch<React.SetStateAction<AutomationSettings>>;
}

type AdminView = 'home' | 'content' | 'analytics' | 'users' | 'settings' | 'aiContentGeneration' | 'integrations' | 'leads' | 'parametrizations' | 'marketing' | 'seoTools';

const mockNotificationsData: Notification[] = [
    { id: 1, type: 'comment', title: 'Novo comentário em "Computação Quântica"', description: 'John Doe comentou: "Ótimo artigo!"', timestamp: 'há 5 minutos', read: false },
    { id: 2, type: 'newUser', title: 'Novo Usuário Registrado', description: 'sara.w@example.com acabou de se inscrever.', timestamp: 'há 1 hora', read: false },
    { id: 3, type: 'articlePublished', title: 'Artigo Publicado', description: '"O Futuro da IA" está no ar.', timestamp: 'há 3 horas', read: true },
    { id: 4, type: 'systemUpdate', title: 'Atualização do Sistema Concluída', description: 'O painel de análises foi atualizado.', timestamp: 'há 1 dia', read: true },
];

// FIX: Added missing AIContentGenerationView component
interface AIContentGenerationViewProps {
  onStartGeneration: (params: GenerationParams) => Promise<void>;
  isGenerating: boolean;
  loadingMessage: string;
  generationResult: GenerationResult | null;
  onSave: (article: Article) => void;
  existingArticle: Article | null;
  clearResult: () => void;
  authors: Author[];
  categories: string[];
}

const AIContentGenerationView: React.FC<AIContentGenerationViewProps> = ({
  onStartGeneration, isGenerating, loadingMessage, generationResult, onSave,
  existingArticle, clearResult, authors, categories
}) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [status, setStatus] = useState<'draft' | 'published'>('draft');
    
    // Generation Params State
    const [prompt, setPrompt] = useState('');
    const [tone, setTone] = useState('Profissional');
    const [style, setStyle] = useState('Artigo de Blog');
    const [category, setCategory] = useState('');
    const [targetAudience, setTargetAudience] = useState('');
    const [authorId, setAuthorId] = useState('');
    const [isResearchMode, setIsResearchMode] = useState(false);
    const [shouldAddImages, setShouldAddImages] = useState(true);

    const [isMetadataLoading, setIsMetadataLoading] = useState(false);
    const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');
    
    useEffect(() => {
        if (generationResult) {
            setContent(generationResult.content);
            setPrompt(generationResult.prompt);
            setTone(generationResult.tone);
            setStyle(generationResult.style);
            setCategory(generationResult.category);
            setTargetAudience(generationResult.targetAudience);
            setAuthorId(generationResult.authorId);
            setIsResearchMode(generationResult.isResearchMode);
            setShouldAddImages(generationResult.shouldAddImages);
            if (!title) {
              setTitle(generationResult.prompt);
            }
        } else if (existingArticle) {
            setTitle(existingArticle.title || '');
            setContent(existingArticle.content || '');
            setCategory(existingArticle.category || '');
            setAuthorId(existingArticle.authorId || '');
            setStatus(existingArticle.status === 'published' ? 'published' : 'draft');
            if ((existingArticle as any).prompt) setPrompt((existingArticle as any).prompt);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [generationResult, existingArticle]);

    const handleGenerate = () => {
        if (!prompt.trim()) {
            alert("Por favor, insira um prompt para gerar o artigo.");
            return;
        }
        onStartGeneration({
            prompt, tone, style, category, targetAudience,
            isResearchMode, shouldAddImages, authorId
        });
    };
    
    const handleSave = (newStatus: 'draft' | 'published') => {
        const articleToSave: Article = {
            id: existingArticle?.id || Date.now(),
            title,
            description: content.substring(0, 150).replace(/(\r\n|\n|\r)/gm," "),
            imageUrl: content.match(/!\[.*?\]\((.*?)\)/)?.[1] || 'https://picsum.photos/seed/default/1200/600',
            publishedAt: newStatus === 'published' ? new Date() : existingArticle?.publishedAt,
            date: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric'}),
            category,
            authorId,
            status: newStatus,
            content,
            // Add prompt to article data for re-editing
            ...( { prompt } as any)
        };
        onSave(articleToSave);
    };
    
    const handleSuggestMetadata = async () => {
        if (!prompt.trim()) {
            alert("Por favor, insira um prompt primeiro.");
            return;
        }
        setIsMetadataLoading(true);
        try {
            const metadata = await suggestArticleMetadata(prompt, authors);
            setCategory(metadata.category);
            setTargetAudience(metadata.targetAudience);
            setTone(metadata.tone);
            setStyle(metadata.style);
            setAuthorId(metadata.authorId);
        } catch (e) {
            console.error(e);
            alert("Falha ao sugerir metadados.");
        } finally {
            setIsMetadataLoading(false);
        }
    };

    const authorOptions: DropdownOption[] = authors.map(a => ({ value: a.id, label: a.name }));
    const categoryOptions: DropdownOption[] = categories.map(c => ({ value: c, label: c }));

    return (
      <div className="space-y-6">
          <header>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{existingArticle ? 'Editar Artigo' : 'Gerador de Conteúdo com IA'}</h2>
              <p className="text-gray-500 dark:text-gray-400 mt-1">Crie e refine artigos com o poder da IA Generativa.</p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Generation Controls */}
              <div className="lg:col-span-1 bg-white dark:bg-slate-800 p-6 rounded-lg border border-gray-300 dark:border-slate-700 space-y-4 self-start">
                   <h3 className="text-lg font-semibold border-b border-gray-200 dark:border-slate-600 pb-2 mb-4">Parâmetros de Geração</h3>
                   <div>
                       <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Prompt do Artigo</label>
                       <textarea
                           value={prompt}
                           onChange={(e) => setPrompt(e.target.value)}
                           rows={3}
                           placeholder="Ex: Escreva sobre o impacto da computação quântica na cibersegurança..."
                           className="w-full mt-1 bg-gray-50 dark:bg-slate-700/50 border border-gray-300 dark:border-slate-600 rounded-md p-2 text-sm"
                       />
                   </div>
                   <button onClick={handleSuggestMetadata} disabled={isMetadataLoading || !prompt.trim()} className="w-full flex items-center justify-center gap-2 text-sm py-2 px-3 bg-gray-200 dark:bg-slate-600 hover:bg-gray-300 dark:hover:bg-slate-500 rounded-md font-semibold disabled:opacity-50">
                       <Icon type="magic" className={`w-4 h-4 ${isMetadataLoading ? 'animate-spin' : ''}`} />
                       Sugerir Metadados com IA
                   </button>
                   <div className="grid grid-cols-2 gap-4">
                       <div>
                           <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Tom</label>
                           <input type="text" value={tone} onChange={(e) => setTone(e.target.value)} className="w-full mt-1 bg-gray-50 dark:bg-slate-700/50 border border-gray-300 dark:border-slate-600 rounded-md p-2 text-sm" />
                       </div>
                       <div>
                           <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Estilo</label>
                           <input type="text" value={style} onChange={(e) => setStyle(e.target.value)} className="w-full mt-1 bg-gray-50 dark:bg-slate-700/50 border border-gray-300 dark:border-slate-600 rounded-md p-2 text-sm" />
                       </div>
                   </div>
                   <div>
                       <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Público-alvo</label>
                       <input type="text" value={targetAudience} onChange={(e) => setTargetAudience(e.target.value)} className="w-full mt-1 bg-gray-50 dark:bg-slate-700/50 border border-gray-300 dark:border-slate-600 rounded-md p-2 text-sm" />
                   </div>
                   <div className="flex items-center justify-between pt-2">
                       <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Modo Pesquisa (Google)</span>
                       <input type="checkbox" checked={isResearchMode} onChange={(e) => setIsResearchMode(e.target.checked)} className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                   </div>
                   <div className="flex items-center justify-between">
                       <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Gerar Imagens com IA</span>
                       <input type="checkbox" checked={shouldAddImages} onChange={(e) => setShouldAddImages(e.target.checked)} className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                   </div>
                   <button onClick={handleGenerate} disabled={isGenerating} className="w-full flex items-center justify-center gap-2 py-2.5 px-4 font-semibold text-white bg-blue-700 rounded-md hover:bg-blue-800 disabled:bg-gray-500">
                       <Icon type="spark" className={`w-5 h-5 ${isGenerating ? 'animate-spin' : ''}`} />
                       {isGenerating ? loadingMessage : 'Gerar Artigo'}
                   </button>
                    {isGenerating && (
                        <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700">
                            <div className="bg-blue-600 h-1.5 rounded-full animate-pulse"></div>
                        </div>
                    )}
              </div>

              {/* Right Column: Editor and Metadata */}
              <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-lg border border-gray-300 dark:border-slate-700 space-y-4">
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                       <div className="md:col-span-2">
                           <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Título do Artigo</label>
                           <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título do seu artigo" className="w-full mt-1 bg-gray-50 dark:bg-slate-700/50 border border-gray-300 dark:border-slate-600 rounded-md p-2 font-semibold" />
                       </div>
                       <div>
                            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</label>
                            <Dropdown options={[{value: 'draft', label: 'Rascunho'}, {value: 'published', label: 'Publicado'}]} value={status} onChange={(v) => setStatus(v as any)} className="mt-1" />
                       </div>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div>
                           <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Categoria</label>
                           <Dropdown options={categoryOptions} value={category} onChange={setCategory} placeholder="Selecione..." className="mt-1" />
                       </div>
                       <div>
                           <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Autor</label>
                           <Dropdown options={authorOptions} value={authorId} onChange={setAuthorId} placeholder="Selecione..." className="mt-1" />
                       </div>
                   </div>
                   <div>
                       <div className="flex justify-between items-center mb-1">
                           <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Conteúdo (Markdown)</label>
                           <div className="flex items-center gap-2">
                               <button onClick={() => setViewMode('edit')} className={`px-2 py-1 text-xs font-semibold rounded-md ${viewMode === 'edit' ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700' : 'bg-gray-100 dark:bg-slate-700'}`}>Editar</button>
                               <button onClick={() => setViewMode('preview')} className={`px-2 py-1 text-xs font-semibold rounded-md ${viewMode === 'preview' ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700' : 'bg-gray-100 dark:bg-slate-700'}`}>Visualizar</button>
                           </div>
                       </div>
                       {viewMode === 'edit' ? (
                           <textarea
                               value={content}
                               onChange={(e) => setContent(e.target.value)}
                               rows={20}
                               className="w-full mt-1 bg-gray-50 dark:bg-slate-700/50 border border-gray-300 dark:border-slate-600 rounded-md p-3 text-sm font-mono"
                           />
                       ) : (
                           <div
                               className="prose dark:prose-invert max-w-none mt-1 p-3 border border-gray-300 dark:border-slate-600 rounded-md h-[470px] overflow-y-auto"
                               dangerouslySetInnerHTML={{ __html: parseMarkdown(content) }}
                           />
                       )}
                   </div>
                   <div className="flex justify-end items-center gap-4 pt-4 border-t border-gray-200 dark:border-slate-600">
                       <button onClick={clearResult} className="font-semibold text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">Limpar</button>
                       <button onClick={() => handleSave('draft')} className="py-2 px-5 font-semibold text-gray-800 dark:text-white bg-gray-200 dark:bg-slate-600 rounded-md hover:bg-gray-300 dark:hover:bg-slate-500">Salvar Rascunho</button>
                       <button onClick={() => handleSave('published')} className="py-2 px-5 font-semibold text-white bg-green-600 rounded-md hover:bg-green-700">Publicar Artigo</button>
                   </div>
              </div>
          </div>
      </div>
    );
};

// START: ParametrizationsView Component (defined in-file)
// This new component handles the UI and logic for managing authors and categories.

interface ParametrizationsViewProps {
  authors: Author[];
  setAuthors: React.Dispatch<React.SetStateAction<Author[]>>;
  categories: string[];
  setCategories: React.Dispatch<React.SetStateAction<string[]>>;
  articles: Article[];
  featuredArticleIds: number[];
  setFeaturedArticleIds: React.Dispatch<React.SetStateAction<number[]>>;
}

const ParametrizationsView: React.FC<ParametrizationsViewProps> = ({ authors, setAuthors, categories, setCategories, articles, featuredArticleIds, setFeaturedArticleIds }) => {
    // Author state
    const [editingAuthor, setEditingAuthor] = useState<Partial<Author> | null>(null);
    const [authorToDelete, setAuthorToDelete] = useState<Author | null>(null);

    // Category state
    const [newCategory, setNewCategory] = useState('');
    const [editingCategory, setEditingCategory] = useState<{ oldName: string; newName: string } | null>(null);
    const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);

    // Featured Articles state
    const { featuredArticles, availableArticles } = useMemo(() => {
        const featuredSet = new Set(featuredArticleIds);
        const featured = featuredArticleIds
            .map(id => articles.find(a => a.id === id))
            .filter((a): a is Article => a !== undefined);

        const available = articles.filter(a => !featuredSet.has(a.id));
        return { featuredArticles: featured, availableArticles: available };
    }, [articles, featuredArticleIds]);

    // Author Handlers
    const handleSaveAuthor = (authorToSave: Partial<Author>) => {
        if (authorToSave.id) {
            setAuthors(prev => prev.map(a => a.id === authorToSave.id ? { ...a, ...authorToSave } as Author : a));
        } else {
            const newAuthor: Author = {
                id: `author_${Date.now()}`,
                name: authorToSave.name || 'Novo Autor',
                specialty: authorToSave.specialty || '',
                avatarUrl: authorToSave.avatarUrl || `https://i.pravatar.cc/150?u=${Date.now()}`,
                categories: authorToSave.categories || [],
            };
            setAuthors(prev => [newAuthor, ...prev]);
        }
        setEditingAuthor(null);
    };

    const handleDeleteAuthor = () => {
        if (!authorToDelete) return;
        setAuthors(prev => prev.filter(a => a.id !== authorToDelete.id));
        setAuthorToDelete(null);
    };
    
    // Category Handlers
    const handleAddCategory = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedCategory = newCategory.trim();
        if (trimmedCategory && !categories.find(c => c.toLowerCase() === trimmedCategory.toLowerCase())) {
            setCategories(prev => [...prev, trimmedCategory]);
            setNewCategory('');
        }
    };

    const handleUpdateCategory = () => {
        if (!editingCategory || !editingCategory.newName.trim() || editingCategory.newName === editingCategory.oldName) {
            setEditingCategory(null);
            return;
        }
        
        setCategories(prev => prev.map(c => c === editingCategory.oldName ? editingCategory.newName.trim() : c));

        setAuthors(prev => prev.map(author => ({
            ...author,
            categories: author.categories.map(cat => cat === editingCategory.oldName ? editingCategory.newName.trim() : cat)
        })));

        setEditingCategory(null);
    };
    
    const handleDeleteCategory = () => {
        if (!categoryToDelete) return;
        
        setCategories(prev => prev.filter(c => c !== categoryToDelete));

        setAuthors(prev => prev.map(author => ({
            ...author,
            categories: author.categories.filter(cat => cat !== categoryToDelete)
        })));
        
        setCategoryToDelete(null);
    };

    // Featured Articles Handlers
    const handleAddFeatured = (articleId: number) => {
        setFeaturedArticleIds(prev => [...prev, articleId]);
    };

    const handleRemoveFeatured = (articleId: number) => {
        setFeaturedArticleIds(prev => prev.filter(id => id !== articleId));
    };

    const handleMoveFeatured = (articleId: number, direction: 'up' | 'down') => {
        const index = featuredArticleIds.indexOf(articleId);
        if (index === -1) return;
        
        const newOrder = [...featuredArticleIds];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;

        if (targetIndex < 0 || targetIndex >= newOrder.length) return;

        [newOrder[index], newOrder[targetIndex]] = [newOrder[targetIndex], newOrder[index]];
        setFeaturedArticleIds(newOrder);
    };


    return (
    <div className="space-y-8">
        <header>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Parametrizações</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Gerencie os autores e as categorias de conteúdo do seu blog.</p>
        </header>

        {/* Featured Articles Management */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-gray-300 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Gerenciamento de Artigos em Destaque</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Selecione e ordene os artigos que aparecem na página inicial. O 1º é o herói, os 4 seguintes vão para a grade e os 2 últimos para a lista.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Featured Articles List */}
                <div>
                    <h4 className="font-semibold mb-2">Artigos em Destaque ({featuredArticles.length})</h4>
                    <ul className="space-y-2 border border-gray-200 dark:border-slate-700 rounded-md p-2 h-96 overflow-y-auto">
                        {featuredArticles.map((article, index) => (
                            <li key={article.id} className="flex items-center justify-between p-2 rounded-md bg-gray-50 dark:bg-slate-700/50">
                                <span className="text-sm font-medium truncate flex-1 pr-2">{index + 1}. {article.title}</span>
                                <div className="flex items-center gap-1">
                                    <button onClick={() => handleMoveFeatured(article.id, 'up')} disabled={index === 0} className="p-1 disabled:opacity-30"><Icon type="arrow-up" className="w-4 h-4" /></button>
                                    <button onClick={() => handleMoveFeatured(article.id, 'down')} disabled={index === featuredArticles.length - 1} className="p-1 disabled:opacity-30"><Icon type="arrow-down" className="w-4 h-4" /></button>
                                    <button onClick={() => handleRemoveFeatured(article.id)} className="p-1 text-red-500"><Icon type="close" className="w-4 h-4" /></button>
                                </div>
                            </li>
                        ))}
                        {featuredArticles.length === 0 && <li className="text-center text-sm text-gray-400 p-4">Nenhum artigo em destaque.</li>}
                    </ul>
                </div>
                {/* Available Articles List */}
                <div>
                     <h4 className="font-semibold mb-2">Outros Artigos Disponíveis ({availableArticles.length})</h4>
                     <ul className="space-y-2 border border-gray-200 dark:border-slate-700 rounded-md p-2 h-96 overflow-y-auto">
                        {availableArticles.map(article => (
                            <li key={article.id} className="flex items-center justify-between p-2 rounded-md bg-gray-50 dark:bg-slate-700/50">
                                <span className="text-sm truncate pr-2">{article.title}</span>
                                <button onClick={() => handleAddFeatured(article.id)} className="p-1 text-green-500"><Icon type="plus" className="w-4 h-4" /></button>
                            </li>
                        ))}
                         {availableArticles.length === 0 && <li className="text-center text-sm text-gray-400 p-4">Todos os artigos estão em destaque.</li>}
                    </ul>
                </div>
            </div>
        </div>


        {/* Authors Management */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-gray-300 dark:border-slate-700">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Gerenciamento de Autores</h3>
                <button onClick={() => setEditingAuthor({})} className="py-2 px-4 font-semibold text-white bg-blue-700 rounded-md hover:bg-blue-800 text-sm flex items-center gap-2"><Icon type="plus" className="w-4 h-4" />Adicionar Autor</button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="border-b border-gray-300 dark:border-slate-600 text-gray-500 dark:text-gray-400 uppercase">
                        <tr>
                            <th className="p-3">Autor</th>
                            <th className="p-3">Especialidade</th>
                            <th className="p-3">Categorias</th>
                            <th className="p-3 text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                        {authors.map(author => (
                            <tr key={author.id}>
                                <td className="p-3 font-medium text-gray-900 dark:text-white">
                                    <div className="flex items-center gap-3">
                                        <img src={author.avatarUrl} alt={author.name} className="h-9 w-9 rounded-full" />
                                        <span>{author.name}</span>
                                    </div>
                                </td>
                                <td className="p-3 text-gray-600 dark:text-gray-400 max-w-xs truncate">{author.specialty}</td>
                                <td className="p-3 max-w-sm">
                                    <div className="flex flex-wrap gap-1.5">
                                        {author.categories.map(cat => (
                                            <span key={cat} className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300">{cat}</span>
                                        ))}
                                    </div>
                                </td>
                                <td className="p-3">
                                    <div className="flex justify-end items-center gap-3">
                                        <button onClick={() => setEditingAuthor(author)} className="text-blue-500 hover:text-blue-600"><Icon type="pencil" className="w-5 h-5"/></button>
                                        <button onClick={() => setAuthorToDelete(author)} className="text-red-500 hover:text-red-600"><Icon type="trash" className="w-5 h-5"/></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>

        {/* Categories Management */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-gray-300 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Gerenciamento de Categorias</h3>
            <form onSubmit={handleAddCategory} className="flex gap-2 mb-6">
                <input type="text" value={newCategory} onChange={e => setNewCategory(e.target.value)} placeholder="Nova categoria..." className="flex-grow bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <button type="submit" className="py-2 px-4 font-semibold text-white bg-blue-700 rounded-md hover:bg-blue-800 text-sm">Adicionar</button>
            </form>
            <ul className="space-y-2">
                {categories.map(category => (
                    <li key={category} className="flex items-center justify-between p-2 rounded-md bg-gray-50 dark:bg-slate-700/50">
                        {editingCategory?.oldName === category ? (
                            <div className="flex-grow flex gap-2 items-center">
                                <input type="text" value={editingCategory.newName} onChange={e => setEditingCategory({ ...editingCategory, newName: e.target.value })} className="flex-grow bg-white dark:bg-slate-600 border border-gray-300 dark:border-slate-500 rounded-md py-1 px-2 text-sm" />
                                <button onClick={handleUpdateCategory} className="text-green-500 hover:text-green-600"><Icon type="check" className="w-5 h-5"/></button>
                                <button onClick={() => setEditingCategory(null)} className="text-gray-500 hover:text-gray-600"><Icon type="close" className="w-5 h-5"/></button>
                            </div>
                        ) : (
                            <>
                                <span className="text-sm capitalize">{category}</span>
                                <div className="flex items-center gap-3">
                                    <button onClick={() => setEditingCategory({ oldName: category, newName: category })} className="text-blue-500 hover:text-blue-600"><Icon type="pencil" className="w-4 h-4"/></button>
                                    <button onClick={() => setCategoryToDelete(category)} className="text-red-500 hover:text-red-600"><Icon type="trash" className="w-4 h-4"/></button>
                                </div>
                            </>
                        )}
                    </li>
                ))}
            </ul>
        </div>
        
        {/* Author Edit/Add Modal */}
        {editingAuthor && (
            <div className="fixed inset-0 bg-black/80 z-[60] flex justify-center items-center p-4 backdrop-blur-sm" aria-modal="true">
                <div className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-lg border border-gray-300 dark:border-slate-700 shadow-xl">
                    <header className="flex justify-between items-center p-4 border-b border-gray-300 dark:border-slate-600">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{editingAuthor.id ? 'Editar Autor' : 'Adicionar Autor'}</h3>
                        <button onClick={() => setEditingAuthor(null)} className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white"><Icon type="close" className="h-6 w-6" /></button>
                    </header>
                    <main className="p-6 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div>
                                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Nome</label>
                                <input type="text" value={editingAuthor.name || ''} onChange={e => setEditingAuthor(p => ({ ...p, name: e.target.value }))} className="w-full p-2 mt-1 text-gray-900 dark:text-white bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md"/>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">URL do Avatar</label>
                                <input type="text" value={editingAuthor.avatarUrl || ''} onChange={e => setEditingAuthor(p => ({ ...p, avatarUrl: e.target.value }))} className="w-full p-2 mt-1 text-gray-900 dark:text-white bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md"/>
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Especialidade</label>
                            <input type="text" value={editingAuthor.specialty || ''} onChange={e => setEditingAuthor(p => ({ ...p, specialty: e.target.value }))} className="w-full p-2 mt-1 text-gray-900 dark:text-white bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md"/>
                        </div>
                         <div>
                            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Categorias</label>
                            <div className="flex flex-wrap gap-2 p-2 mt-1 border border-gray-300 dark:border-slate-600 rounded-md bg-gray-50 dark:bg-slate-700">
                                {categories.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => {
                                            const currentCats = editingAuthor.categories || [];
                                            const newCats = currentCats.includes(cat) ? currentCats.filter(c => c !== cat) : [...currentCats, cat];
                                            setEditingAuthor(p => ({ ...p, categories: newCats }));
                                        }}
                                        className={`px-2 py-0.5 text-xs font-medium rounded-full ${editingAuthor.categories?.includes(cat) ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-gray-300'}`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </main>
                     <footer className="p-4 border-t border-gray-300 dark:border-slate-600 flex justify-end gap-4">
                        <button onClick={() => setEditingAuthor(null)} className="py-2 px-5 font-semibold text-gray-800 dark:text-gray-300 bg-gray-200 dark:bg-slate-600 rounded-md hover:bg-gray-300 dark:hover:bg-slate-500">Cancelar</button>
                        <button onClick={() => handleSaveAuthor(editingAuthor)} className="py-2 px-5 font-semibold text-white bg-blue-700 rounded-md hover:bg-blue-800">Salvar Autor</button>
                    </footer>
                </div>
            </div>
        )}

        <ConfirmationModal
            isOpen={!!authorToDelete}
            title="Excluir Autor"
            message={`Tem certeza que deseja excluir "${authorToDelete?.name}"? Isso não pode ser desfeito.`}
            onConfirm={handleDeleteAuthor}
            onCancel={() => setAuthorToDelete(null)}
        />
        <ConfirmationModal
            isOpen={!!categoryToDelete}
            title="Excluir Categoria"
            message={`Tem certeza que deseja excluir a categoria "${categoryToDelete}"? Isso também a removerá de todos os autores associados.`}
            onConfirm={handleDeleteCategory}
            onCancel={() => setCategoryToDelete(null)}
        />
    </div>
    );
};
// END: ParametrizationsView Component

// --- AdminPanel Main Component ---

const AdminPanel: React.FC<AdminPanelProps> = ({ 
    currentUser, onLogout, onNavigateHome, onStartGeneration, 
    isGenerating, loadingMessage, generationResult, clearGenerationResult,
    totalVisitors, emailLeads, whatsappLeads, leads, setLeads,
    users, setUsers, footerInfoContents, setFooterInfoContents,
    articles, setArticles, authors, setAuthors, categories, setCategories,
    featuredArticleIds, setFeaturedArticleIds,
    automationSettings, setAutomationSettings
}) => {
    const [view, setView] = useState<AdminView>('home');
    const [articleToEdit, setArticleToEdit] = useState<Article | null>(null);
    const [articleToDelete, setArticleToDelete] = useState<Article | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [notifications, setNotifications] = useState(mockNotificationsData);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [articleForMarketing, setArticleForMarketing] = useState<Article | null>(null);
    
    const sidebarRef = useRef<HTMLDivElement>(null);
    const notificationRef = useRef<HTMLDivElement>(null);

    const unreadCount = notifications.filter(n => !n.read).length;

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
                setIsSidebarOpen(false);
            }
            if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
                setIsNotificationOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    
    useEffect(() => {
        if (generationResult && view !== 'aiContentGeneration') {
            setView('aiContentGeneration');
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [generationResult]);


    const handleNavigation = (newView: AdminView) => {
        setView(newView);
        setIsSidebarOpen(false); // Close sidebar on navigation
        // Reset specific states when navigating away
        if (newView !== 'aiContentGeneration' && newView !== 'content') {
            setArticleToEdit(null);
        }
        if (newView !== 'marketing') {
            setArticleForMarketing(null);
        }
    };
    
    const handleEditArticle = (article: Article) => {
        setArticleToEdit(article);
        setView('aiContentGeneration');
    };
    
    const handleNewArticle = () => {
        setArticleToEdit(null); // Clear any existing article being edited
        clearGenerationResult(); // Clear any existing generation result
        setView('aiContentGeneration');
    };

    const handleDeleteArticle = () => {
        if (articleToDelete) {
            setArticles(prev => prev.filter(a => a.id !== articleToDelete.id));
            setArticleToDelete(null);
        }
    };
    
    const handleMarkAllAsRead = () => {
        setNotifications(notifications.map(n => ({...n, read: true})));
    };
    
    const handleOpenMarketingTools = (article: Article) => {
        setArticleForMarketing(article);
        setView('marketing');
    };
    
    const updateArticleAndNavigate = (updatedArticle: Article) => {
        const exists = articles.some(a => a.id === updatedArticle.id);
        if (exists) {
            setArticles(articles.map(a => a.id === updatedArticle.id ? updatedArticle : a));
        } else {
            setArticles([updatedArticle, ...articles]);
        }
        setView('content');
        setArticleToEdit(null);
        clearGenerationResult();
    };

    const handleUpdateArticle = (updatedArticle: Partial<Article> & { id: number }) => {
        setArticles(prev => prev.map(a => 
            a.id === updatedArticle.id 
            ? { ...a, ...updatedArticle } 
            : a
        ));
    };

    const handleNotify = (article: Article) => {
        // Mock notification logic
        console.log(`Disparando notificações para o artigo: "${article.title}"`);
        const newNotification: Notification = {
            id: Date.now(),
            type: 'articlePublished',
            title: 'Artigo Notificado',
            description: `Notificações para "${article.title}" foram enviadas.`,
            timestamp: 'agora',
            read: false,
        };
        setNotifications(prev => [newNotification, ...prev]);
    };

  const NavItem: React.FC<{ icon: React.ComponentProps<typeof Icon>['type']; label: string; viewName: AdminView; }> = ({ icon, label, viewName }) => (
    <button
      onClick={() => handleNavigation(viewName)}
      className={`flex items-center w-full px-4 py-2.5 rounded-lg transition-colors text-sm font-medium ${
        view === viewName
          ? 'bg-blue-700 text-white shadow-md'
          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700'
      }`}
    >
      <Icon type={icon} className="h-5 w-5 mr-3" />
      <span>{label}</span>
    </button>
  );

  const sidebarContent = (
    <div className="flex flex-col h-full">
        <div className="flex items-center justify-center p-6 border-b border-gray-200 dark:border-slate-700">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white cursor-pointer" onClick={onNavigateHome}>
              Innovate<span className="text-blue-500">Flow</span>
            </h1>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            <NavItem icon="dashboard" label="Início" viewName="home" />
            <NavItem icon="edit-document" label="Conteúdo" viewName="content" />
            <NavItem icon="speakerphone" label="Marketing" viewName="marketing" />
            <NavItem icon="trending-up" label="Ferramentas de SEO" viewName="seoTools" />
            <NavItem icon="analytics" label="Análises" viewName="analytics" />
            <NavItem icon="leads" label="Leads" viewName="leads" />
            <NavItem icon="integrations" label="Integrações" viewName="integrations" />
            <NavItem icon="users" label="Usuários" viewName="users" />
            <NavItem icon="pencil" label="Parametrizações" viewName="parametrizations" />
            <NavItem icon="settings" label="Configurações" viewName="settings" />
        </nav>
        <div className="p-4 border-t border-gray-200 dark:border-slate-700">
             <a href="https://github.com/seu-usuario/innovate-flow" target="_blank" rel="noopener noreferrer" className="flex items-center w-full px-4 py-2.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700 text-sm font-medium">
                <Icon type="github" className="h-5 w-5 mr-3" />
                <span>Ver no GitHub</span>
            </a>
        </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-slate-900 overflow-hidden">
      {/* Static Sidebar for larger screens */}
      <div className="hidden lg:flex lg:flex-shrink-0">
          <div className="flex flex-col w-64 bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700">
              {sidebarContent}
          </div>
      </div>
      
       {/* Mobile Sidebar */}
       <div className={`fixed inset-0 z-40 flex lg:hidden ${isSidebarOpen ? '' : 'pointer-events-none'}`}>
            <div
                className={`fixed inset-0 bg-black/60 transition-opacity ${isSidebarOpen ? 'opacity-100' : 'opacity-0'}`}
                onClick={() => setIsSidebarOpen(false)}
            />
            <div
                ref={sidebarRef}
                className={`relative flex-1 flex flex-col max-w-xs w-full bg-white dark:bg-slate-800 transform transition-transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >
                {sidebarContent}
            </div>
      </div>


      <div className="flex-1 overflow-y-auto">
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-slate-700">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
                 {/* Mobile Menu Button */}
                <button
                    className="lg:hidden text-gray-500 dark:text-gray-400"
                    onClick={() => setIsSidebarOpen(true)}
                >
                    <Icon type="menu" className="h-6 w-6" />
                </button>

                {/* Search (placeholder) */}
                <div className="flex-1 flex justify-center px-2 lg:ml-6 lg:justify-end">
                    {/* Search can be added here if needed */}
                </div>
              
                <div className="flex items-center gap-4">
                    <div ref={notificationRef} className="relative">
                        <button onClick={() => setIsNotificationOpen(p => !p)} className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700">
                            <Icon type="bell" className="h-6 w-6" />
                             {unreadCount > 0 && <span className="absolute top-1 right-1 block h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-white dark:border-slate-800"></span>}
                        </button>
                        <NotificationDropdown
                            isOpen={isNotificationOpen}
                            notifications={notifications}
                            onClose={() => setIsNotificationOpen(false)}
                            onMarkAllAsRead={handleMarkAllAsRead}
                        />
                    </div>
                    {currentUser && (
                        <div className="flex items-center gap-3">
                            <img src={currentUser.avatarUrl} alt={currentUser.name} className="h-9 w-9 rounded-full" />
                            <div>
                                <p className="text-sm font-semibold text-gray-900 dark:text-white">{currentUser.name}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{currentUser.role}</p>
                            </div>
                            <button onClick={onLogout} title="Sair" className="ml-2 p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700">
                                <Icon type="logout" className="h-5 w-5" />
                            </button>
                        </div>
                    )}
                </div>
            </div>
          </div>
        </header>
        <main className="p-4 sm:p-6 lg:p-8">
          {/* FIX: Corrected component name from AdminDashboard to AnalyticsDashboard */}
          {view === 'home' && <AnalyticsDashboard totalVisitors={totalVisitors} emailLeads={emailLeads} whatsappLeads={whatsappLeads} />}
          {view === 'content' && (
              <div className="space-y-8">
                <header>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Gerenciamento de Conteúdo</h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Crie, edite e gerencie os artigos do seu blog.</p>
                </header>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <PublishedArticlesView
                            articles={articles}
                            onEdit={handleEditArticle}
                            onDelete={(article) => setArticleToDelete(article)}
                            onNewArticle={handleNewArticle}
                            onMarketing={handleOpenMarketingTools}
                            onNotify={handleNotify}
                        />
                    </div>
                    <div className="lg:col-span-1">
                        <TrendingTopicsWidget onUseTopic={(title) => { setArticleToEdit({ title } as any); setView('aiContentGeneration'); }}/>
                    </div>
                </div>
              </div>
          )}
          {/* FIX: Corrected component name from AIContentGenerationView to AnalyticsDashboard */}
          {view === 'aiContentGeneration' && (
            <AIContentGenerationView
              onStartGeneration={onStartGeneration}
              isGenerating={isGenerating}
              loadingMessage={loadingMessage}
              generationResult={generationResult}
              onSave={updateArticleAndNavigate}
              existingArticle={articleToEdit}
              clearResult={clearGenerationResult}
              authors={authors}
              categories={categories}
            />
          )}
          {view === 'analytics' && <AnalyticsDashboard totalVisitors={totalVisitors} emailLeads={emailLeads} whatsappLeads={whatsappLeads} />}
          {view === 'settings' && <SettingsView footerInfoContents={footerInfoContents} setFooterInfoContents={setFooterInfoContents} automationSettings={automationSettings} setAutomationSettings={setAutomationSettings} />}
          {view === 'users' && <UsersView users={users} setUsers={setUsers} currentUserRole={currentUser?.role || 'Leitor'} />}
          {view === 'integrations' && <IntegrationsView />}
          {view === 'leads' && <LeadsView leads={leads} setLeads={setLeads} />}
          {view === 'parametrizations' && <ParametrizationsView authors={authors} setAuthors={setAuthors} categories={categories} setCategories={setCategories} articles={articles} featuredArticleIds={featuredArticleIds} setFeaturedArticleIds={setFeaturedArticleIds} />}
          {view === 'marketing' && articleForMarketing && <MarketingView article={articleForMarketing} onBack={() => handleNavigation('content')} />}
          {view === 'seoTools' && <SeoToolsView articles={articles} onUpdateArticle={handleUpdateArticle} />}
        </main>
      </div>

       <ConfirmationModal
            isOpen={!!articleToDelete}
            title="Excluir Artigo"
            message={`Você tem certeza que deseja excluir permanentemente o artigo "${articleToDelete?.title}"? Esta ação não pode ser desfeita.`}
            onConfirm={handleDeleteArticle}
            onCancel={() => setArticleToDelete(null)}
        />
    </div>
  );
};

export default AdminPanel;