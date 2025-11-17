import React from 'react';
import { Article, Author, User } from '../types';
import Icon from './Icon';

interface ArticleCardProps {
  article: Article;
  authors: Author[];
  layout?: 'grid' | 'list';
  currentUser: User | null;
  onToggleFavorite: (articleId: number) => void;
  onOpenAuthModal: () => void;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article, authors, layout = 'grid', currentUser, onToggleFavorite, onOpenAuthModal }) => {
  const { category, title, description, authorId, imageUrl, publishedAt, id } = article;
  const author = authors.find(a => a.id === authorId);

  const isFavorited = currentUser?.favorites?.includes(id) ?? false;

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent the card's onSelectArticle from firing
    if (currentUser) {
      onToggleFavorite(id);
    } else {
      onOpenAuthModal();
    }
  };

  const formattedDate = publishedAt ? new Intl.DateTimeFormat('pt-BR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
  }).format(publishedAt) : article.date;


  if (layout === 'list') {
    return (
      <div className="flex flex-col md:flex-row gap-6 group">
        <div className="md:w-1/3 h-48 md:h-auto overflow-hidden rounded-lg">
          <img src={imageUrl} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        </div>
        <div className="md:w-2/3">
          <p className="text-blue-500 dark:text-blue-400 font-semibold text-sm uppercase">{category}</p>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-2 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors duration-200">{title}</h3>
          <p className="text-gray-600 dark:text-gray-400 mt-3 mb-3">{description}</p>
          {author && (
            <div className="flex items-center justify-between gap-2 mt-4 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-2 truncate">
                    <img src={author.avatarUrl} alt={author.name} className="h-6 w-6 rounded-full object-cover" />
                    <div className="truncate">
                        <span className="font-medium text-gray-800 dark:text-gray-200">Por {author.name}</span>
                        {formattedDate && <span className="text-gray-500 dark:text-gray-400"> · {formattedDate}</span>}
                    </div>
                </div>
                 <button 
                    onClick={handleFavoriteClick} 
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors flex-shrink-0 -mr-2"
                    aria-label="Salvar para ler mais tarde"
                >
                    <Icon 
                        type={isFavorited ? "bookmark-filled" : "bookmark"} 
                        className={`w-5 h-5 ${isFavorited ? 'text-blue-500' : 'text-gray-500 dark:text-gray-400'}`}
                    />
                </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="group">
      <div className="overflow-hidden rounded-lg">
        <img src={imageUrl} alt={title} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" />
      </div>
      <div className="mt-4">
        <p className="text-blue-500 dark:text-blue-400 font-semibold text-sm uppercase">{category}</p>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-2 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors duration-200">{title}</h3>
        <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm mb-3">{description}</p>
        {author && (
            <div className="flex items-center justify-between gap-2 mt-3 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-2 truncate">
                    <img src={author.avatarUrl} alt={author.name} className="h-6 w-6 rounded-full object-cover" />
                    <div className="truncate">
                        <span className="font-medium text-gray-800 dark:text-gray-200">{author.name}</span>
                        {formattedDate && <span className="text-gray-500 dark:text-gray-400 hidden sm:inline"> · {formattedDate}</span>}
                    </div>
                </div>
                <button 
                    onClick={handleFavoriteClick} 
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors flex-shrink-0 -mr-2"
                    aria-label="Salvar para ler mais tarde"
                >
                    <Icon 
                        type={isFavorited ? "bookmark-filled" : "bookmark"} 
                        className={`w-5 h-5 ${isFavorited ? 'text-blue-500' : 'text-gray-500 dark:text-gray-400'}`}
                    />
                </button>
            </div>
        )}
      </div>
    </div>
  );
};

export default ArticleCard;