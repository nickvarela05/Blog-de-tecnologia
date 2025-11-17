import React, { useMemo } from 'react';
import { Article, Author, Lead, User } from '../types';
import ArticleCard from './ArticleCard';
import Sidebar from './Sidebar';
import Icon from './Icon';

interface HomePageProps {
  onSelectArticle: (articleId: number) => void;
  onOpenWhatsAppModal: (email: string) => void;
  selectedCategory: string | null;
  onClearCategory: () => void;
  onSelectCategory: (category: string) => void;
  selectedAuthor: string | null;
  onClearAuthor: () => void;
  onSelectAuthor: (author: string) => void;
  isFavoritesView: boolean;
  onClearFavoritesView: () => void;
  isForYouView: boolean;
  onClearForYouView: () => void;
  recommendedArticles: Article[];
  isRecommendationLoading: boolean;
  searchQuery: string | null;
  onClearSearch: () => void;
  currentUser: User | null;
  onAddLead: (leadData: Partial<Omit<Lead, 'id' | 'date'>> & { email: string }) => void;
  articles: Article[];
  authors: Author[];
  featuredArticleIds: number[];
  onToggleFavorite: (articleId: number) => void;
  onOpenAuthModal: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ 
    onSelectArticle, 
    onOpenWhatsAppModal, 
    selectedCategory, 
    onClearCategory, 
    onSelectCategory, 
    selectedAuthor, 
    onClearAuthor, 
    onSelectAuthor,
    isFavoritesView,
    onClearFavoritesView,
    isForYouView,
    onClearForYouView,
    recommendedArticles,
    isRecommendationLoading,
    searchQuery,
    onClearSearch,
    currentUser,
    onAddLead,
    articles,
    authors,
    featuredArticleIds,
    onToggleFavorite,
    onOpenAuthModal,
}) => {
  const featuredArticlesInOrder = useMemo(() => {
    const articlesMap = new Map(articles.map(a => [a.id, a]));
    return featuredArticleIds
        .map(id => articlesMap.get(id))
        .filter((a): a is Article => a !== undefined);
  }, [articles, featuredArticleIds]);

  const heroArticle = featuredArticlesInOrder[0] || articles[0];
  const featuredGridArticles = featuredArticlesInOrder.slice(1, 5);
  const latestStories = featuredArticlesInOrder.slice(5, 7);


  // Create a Set of unique article IDs to prevent duplicates
  const uniqueArticleIds = new Set<number>();
  const uniqueArticles = articles.filter(article => {
    if (uniqueArticleIds.has(article.id)) {
      return false;
    }
    uniqueArticleIds.add(article.id);
    return true;
  });

  const isFiltering = selectedCategory || selectedAuthor || isFavoritesView || searchQuery || isForYouView;

  const filteredArticles = useMemo(() => {
    if (!isFiltering) return [];
    
    if (isForYouView) return recommendedArticles;

    return uniqueArticles.filter(a => {
        if (isFavoritesView) {
            return currentUser?.favorites?.includes(a.id);
        }
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            const author = authors.find(auth => auth.id === a.authorId);
            return (
                (a.title || '').toLowerCase().includes(query) ||
                (a.description || '').toLowerCase().includes(query) ||
                (author && (author.name || '').toLowerCase().includes(query)) ||
                (a.category || '').toLowerCase().includes(query)
            );
        }
        if (selectedCategory) {
            return (a.category || '').toLowerCase() === selectedCategory.toLowerCase();
        }
        if (selectedAuthor) {
            const author = authors.find(auth => auth.id === a.authorId);
            return author ? (author.name || '').toLowerCase() === selectedAuthor.toLowerCase() : false;
        }
        return false;
      });
  }, [isFiltering, isForYouView, recommendedArticles, uniqueArticles, isFavoritesView, currentUser, searchQuery, authors, selectedCategory, selectedAuthor]);


  if (isFiltering) {
    let filterTitle = '';
    let clearFilterAction: () => void;
    let filterValue = '';

    if (isForYouView) {
        filterTitle = 'Recomendado para Você';
        clearFilterAction = onClearForYouView;
        filterValue = 'recomendações';
    } else if (isFavoritesView) {
        filterTitle = 'Meus Favoritos';
        clearFilterAction = onClearFavoritesView;
        filterValue = 'favoritos';
    } else if (searchQuery) {
        filterTitle = `Resultados para "${searchQuery}"`;
        clearFilterAction = onClearSearch;
        filterValue = searchQuery;
    } else if (selectedCategory) {
        filterTitle = `Artigos sobre ${selectedCategory}`;
        clearFilterAction = onClearCategory;
        filterValue = selectedCategory;
    } else {
        filterTitle = `Artigos de ${selectedAuthor}`;
        clearFilterAction = onClearAuthor;
        filterValue = selectedAuthor || '';
    }


    return (
        <div className="container mx-auto px-4">
            <div className="space-y-16 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    <div className="lg:col-span-2 space-y-16">
                        <section>
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-3xl font-bold text-gray-900 dark:text-white border-b-2 border-blue-500 pb-2 inline-block">
                                    {filterTitle}
                                </h2>
                                <button
                                    onClick={clearFilterAction}
                                    className="flex items-center gap-2 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                                >
                                    <Icon type="close" className="w-4 h-4" />
                                    Limpar Filtro
                                </button>
                            </div>
                             {isRecommendationLoading ? (
                                <div className="text-center py-12 text-gray-400 dark:text-gray-500 bg-white dark:bg-slate-800 rounded-lg border border-gray-300 dark:border-slate-700">
                                    <p>Analisando seus favoritos para encontrar as melhores recomendações...</p>
                                </div>
                             ) : filteredArticles.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {filteredArticles.map(article => (
                                    <div key={article.id} onClick={() => onSelectArticle(article.id)} className="cursor-pointer">
                                        <ArticleCard article={article} authors={authors} currentUser={currentUser} onToggleFavorite={onToggleFavorite} onOpenAuthModal={onOpenAuthModal} />
                                    </div>
                                ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 text-gray-400 dark:text-gray-500 bg-white dark:bg-slate-800 rounded-lg border border-gray-300 dark:border-slate-700">
                                    <p>{isFavoritesView ? 'Você ainda não salvou nenhum artigo.' : `Nenhum artigo encontrado para "${filterValue}".`}</p>
                                </div>
                            )}
                        </section>
                    </div>
                     <div className="lg:col-span-1">
                        <Sidebar onOpenWhatsAppModal={onOpenWhatsAppModal} onSelectCategory={onSelectCategory} onSelectAuthor={onSelectAuthor} onAddLead={onAddLead} />
                    </div>
                </div>
            </div>
        </div>
    );
  }

  return (
    <div className="container mx-auto px-4">
        <div className="space-y-16 py-12">
          {/* Hero Section */}
          {heroArticle && (
            <section
              className="bg-cover bg-center rounded-lg min-h-[400px] flex flex-col justify-center relative overflow-hidden"
              style={{ backgroundImage: `url('${heroArticle.imageUrl}')` }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent dark:from-slate-900/90 dark:to-slate-900/70" />
              <div className="relative z-10 max-w-2xl p-8 md:p-16">
                <p className="text-blue-600 dark:text-blue-400 font-semibold uppercase">{heroArticle.category}</p>
                <h2 className="text-4xl md:text-6xl font-extrabold mt-2 text-gray-900 dark:text-white">{heroArticle.title}</h2>
                <p className="mt-4 text-lg text-gray-700 dark:text-gray-300">{heroArticle.description}</p>
                <button onClick={() => onSelectArticle(heroArticle.id)} className="mt-8 bg-blue-700 hover:bg-blue-800 text-white font-semibold py-3 px-6 rounded-md transition-colors duration-200">
                  Leia a Matéria Completa
                </button>
              </div>
            </section>
          )}

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-16">
              {/* Featured Articles */}
              {featuredGridArticles.length > 0 && (
                <section>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white border-b-2 border-blue-500 pb-2 inline-block">Artigos em Destaque</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
                    {featuredGridArticles.map(article => (
                      <div key={article.id} onClick={() => onSelectArticle(article.id)} className="cursor-pointer">
                        <ArticleCard article={article} authors={authors} currentUser={currentUser} onToggleFavorite={onToggleFavorite} onOpenAuthModal={onOpenAuthModal} />
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Latest Stories */}
              {latestStories.length > 0 && (
                <section>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white border-b-2 border-blue-500 pb-2 inline-block">Últimas Matérias</h2>
                  <div className="space-y-12 mt-6">
                      {latestStories.map(article => (
                          <div key={article.id} onClick={() => onSelectArticle(article.id)} className="cursor-pointer">
                              <ArticleCard article={article} layout="list" authors={authors} currentUser={currentUser} onToggleFavorite={onToggleFavorite} onOpenAuthModal={onOpenAuthModal} />
                          </div>
                      ))}
                  </div>
                </section>
              )}
            </div>
            
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <Sidebar onOpenWhatsAppModal={onOpenWhatsAppModal} onSelectCategory={onSelectCategory} onSelectAuthor={onSelectAuthor} onAddLead={onAddLead} />
            </div>
          </div>
        </div>
    </div>
  );
};

export default HomePage;