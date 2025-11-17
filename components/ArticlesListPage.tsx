import React, { useMemo } from 'react';
import { Article, Author, User } from '../types';
import ArticleCard from './ArticleCard';
import Icon from './Icon';

interface ArticlesListPageProps {
  articles: Article[];
  authors: Author[];
  onSelectArticle: (articleId: number) => void;
  currentUser: User | null;
  onToggleFavorite: (articleId: number) => void;
  onOpenAuthModal: () => void;
}

const ArticlesListPage: React.FC<ArticlesListPageProps> = ({ articles, authors, onSelectArticle, currentUser, onToggleFavorite, onOpenAuthModal }) => {
  
  const articlesByCategory = useMemo(() => {
    // Group articles by category
    const grouped = articles.reduce((acc, article) => {
        if (!acc[article.category]) {
            acc[article.category] = [];
        }
        acc[article.category].push(article);
        return acc;
    }, {} as { [category: string]: Article[] });

    // Sort articles within each category by date
    for (const category in grouped) {
        grouped[category].sort((a, b) => {
            const dateA = a.publishedAt?.getTime() || 0;
            const dateB = b.publishedAt?.getTime() || 0;
            return dateB - dateA;
        });
    }

    // Return an array of [category, articles[]] tuples, sorted by category name
    return Object.entries(grouped).sort((a, b) => a[0].localeCompare(b[0]));
  }, [articles]);


  return (
    <div className="container mx-auto px-4 py-12">
      <header className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white">Todos os Artigos</h1>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Explore nosso arquivo completo. Encontre insights sobre tecnologia, ciência, cultura e negócios, tudo em um só lugar.
        </p>
      </header>

      <div className="space-y-16">
        {articlesByCategory.map(([category, articlesInCategory]) => (
          <section key={category}>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white border-b-2 border-blue-500 pb-2 inline-block capitalize">
              {category}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-6">
              {articlesInCategory.map(article => (
                <div key={article.id} onClick={() => onSelectArticle(article.id)} className="cursor-pointer">
                  <ArticleCard article={article} authors={authors} currentUser={currentUser} onToggleFavorite={onToggleFavorite} onOpenAuthModal={onOpenAuthModal} />
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
};

export default ArticlesListPage;