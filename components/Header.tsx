import React, { useState, useRef, useEffect } from 'react';
import Icon from './Icon';
import ThemeSwitcher from './ThemeSwitcher';
import { User, Article, Author } from '../types';

interface Suggestion {
  type: 'article' | 'author' | 'category';
  label: string;
  value: string | number; // article ID, author name, or category name
}

interface HeaderProps {
  currentUser: User | null;
  onLogout: () => void;
  onNavigate: (view: 'home' | 'admin' | 'articlesList' | 'achievements') => void;
  onOpenAuthModal: () => void;
  onSelectCategory: (category: string) => void;
  onShowFavorites: () => void;
  onShowForYou: () => void;
  onSearch: (query: string) => void;
  onOpenProfileModal: () => void;
  articles: Article[];
  authors: Author[];
  categories: string[];
  onSelectArticle: (id: number) => void;
  onSelectAuthor: (authorName: string) => void;
}

const NavItem: React.FC<{ children: React.ReactNode; onClick?: () => void }> = ({ children, onClick }) => (
  <button onClick={onClick} className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200">
    {children}
  </button>
);

const Header: React.FC<HeaderProps> = ({ currentUser, onLogout, onNavigate, onOpenAuthModal, onSelectCategory, onShowFavorites, onShowForYou, onSearch, onOpenProfileModal, articles, authors, categories, onSelectArticle, onSelectAuthor }) => {
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileCategoriesOpen, setIsMobileCategoriesOpen] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);

  const categoriesRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (categoriesRef.current && !categoriesRef.current.contains(event.target as Node)) setIsCategoriesOpen(false);
        if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) setIsUserMenuOpen(false);
        if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) setIsMobileMenuOpen(false);
        if (searchRef.current && !searchRef.current.contains(event.target as Node)) setIsSuggestionsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  
  const handleCategorySelect = (category: string) => {
    onSelectCategory(category);
    setIsCategoriesOpen(false);
    setIsMobileMenuOpen(false);
  };
  
  const handleMobileNav = (view: 'home' | 'admin' | 'articlesList' | 'achievements') => {
    onNavigate(view);
    setIsMobileMenuOpen(false);
  }
  
  const handleShowFavoritesMobile = () => {
      onShowFavorites();
      setIsMobileMenuOpen(false);
  }
  
   const handleShowForYouMobile = () => {
      onShowForYou();
      setIsMobileMenuOpen(false);
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      onSearch(searchTerm.trim());
      setSearchTerm('');
      setIsSuggestionsOpen(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchTerm(query);

    if (query.length > 1) {
      const lowerCaseQuery = query.toLowerCase();
      
      const articleSuggestions = articles
        .filter(a => (a.title || '').toLowerCase().includes(lowerCaseQuery))
        .map(a => ({ type: 'article' as const, label: a.title, value: a.id }));

      const authorSuggestions = authors
        .filter(a => (a.name || '').toLowerCase().includes(lowerCaseQuery))
        .map(a => ({ type: 'author' as const, label: a.name, value: a.name }));
        
      const categorySuggestions = categories
        .filter(c => (c || '').toLowerCase().includes(lowerCaseQuery))
        .map(c => ({ type: 'category' as const, label: c, value: c }));

      setSuggestions([...articleSuggestions, ...authorSuggestions, ...categorySuggestions].slice(0, 7));
      setIsSuggestionsOpen(true);
    } else {
      setSuggestions([]);
      setIsSuggestionsOpen(false);
    }
  };

  const handleSuggestionClick = (suggestion: Suggestion) => {
    switch (suggestion.type) {
      case 'article':
        onSelectArticle(suggestion.value as number);
        break;
      case 'author':
        onSelectAuthor(suggestion.value as string);
        break;
      case 'category':
        onSelectCategory(suggestion.value as string);
        break;
    }
    setSearchTerm('');
    setSuggestions([]);
    setIsSuggestionsOpen(false);
  };

  return (
    <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50 border-b border-gray-200 dark:border-slate-700">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white cursor-pointer" onClick={() => onNavigate('home')}>
              Innovate<span className="text-blue-500">Flow</span>
            </h1>
            <nav className="hidden md:flex items-center space-x-6">
              <NavItem onClick={() => onNavigate('articlesList')}>Artigos</NavItem>
              <div className="relative" ref={categoriesRef}>
                <button 
                  onClick={() => setIsCategoriesOpen(p => !p)} 
                  className="flex items-center gap-1 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
                >
                  Categorias
                  <Icon type="chevron-down" className={`h-4 w-4 transition-transform ${isCategoriesOpen ? 'rotate-180' : ''}`} />
                </button>
                {isCategoriesOpen && (
                  <div className="absolute top-full left-0 mt-3 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-gray-300 dark:border-slate-700 py-1 z-10">
                    {categories.map(category => (
                         <a key={category} onClick={() => handleCategorySelect(category)} className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 cursor-pointer capitalize">{category}</a>
                    ))}
                  </div>
                )}
              </div>
              <NavItem onClick={onShowForYou}>Para Você</NavItem>
              <NavItem onClick={onShowFavorites}>Favoritos</NavItem>
              {currentUser && <NavItem onClick={() => onNavigate('achievements')}>Conquistas</NavItem>}
              {currentUser?.role === 'Administrator' && <NavItem onClick={() => onNavigate('admin')}>Painel Admin</NavItem>}
            </nav>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div ref={searchRef} className="relative hidden sm:block">
              <form onSubmit={handleSearchSubmit}>
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Buscar"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  onFocus={() => searchTerm.length > 1 && setIsSuggestionsOpen(true)}
                  className="w-full bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-md py-2 px-4 pl-10 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:border-transparent transition-colors duration-200"
                />
                <div 
                    className="absolute top-1/2 left-3 -translate-y-1/2 cursor-pointer"
                    title="Buscar artigos, autores e categorias"
                    onClick={() => searchInputRef.current?.focus()}
                >
                  <Icon type="search" className="h-5 w-5 text-gray-400" />
                </div>
              </form>
              {isSuggestionsOpen && suggestions.length > 0 && (
                <div className="absolute top-full left-0 mt-2 w-full bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-gray-300 dark:border-slate-700 py-1 z-10">
                  {suggestions.map((s, i) => (
                    <button key={`${s.type}-${s.value}-${i}`} onClick={() => handleSuggestionClick(s)} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 cursor-pointer flex items-center gap-3">
                      <Icon type={s.type === 'article' ? 'article' : s.type === 'author' ? 'users' : 'bolt'} className="h-4 w-4 text-gray-400" />
                      <span className="truncate flex-1">{s.label}</span>
                      <span className="text-xs text-gray-400 dark:text-gray-500 capitalize">{s.type}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <ThemeSwitcher />
            {currentUser ? (
              <div className="relative" ref={userMenuRef}>
                <button onClick={() => setIsUserMenuOpen(p => !p)} className="flex items-center gap-2">
                  <img src={currentUser.avatarUrl} alt={currentUser.name} className="h-9 w-9 rounded-full object-cover"/>
                  <span className="hidden sm:inline font-semibold text-sm text-gray-700 dark:text-gray-300">{currentUser.name.split(' ')[0]}</span>
                  <Icon type="chevron-down" className="h-4 w-4 text-gray-500" />
                </button>
                {isUserMenuOpen && (
                   <div className="absolute top-full right-0 mt-3 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-gray-300 dark:border-slate-700 py-1 z-10">
                    <a onClick={() => { onOpenProfileModal(); setIsUserMenuOpen(false); }} className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 cursor-pointer">Meu Perfil</a>
                    <div className="my-1 border-t border-gray-200 dark:border-slate-700"></div>
                    <a onClick={() => { onLogout(); setIsUserMenuOpen(false); }} className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/50 cursor-pointer">Sair</a>
                  </div>
                )}
              </div>
            ) : (
              <button 
                onClick={onOpenAuthModal}
                className="bg-blue-700 hover:bg-blue-800 text-white font-semibold py-2 px-5 rounded-md transform transition-all duration-200 hover:scale-105 hover:shadow-lg"
              >
                Login
              </button>
            )}
            <div className="md:hidden">
                <button onClick={() => setIsMobileMenuOpen(p => !p)} className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700">
                    <Icon type={isMobileMenuOpen ? "close" : "menu"} className="h-6 w-6" />
                </button>
            </div>
          </div>
        </div>
      </div>
       {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div ref={mobileMenuRef} className="md:hidden border-t border-gray-200 dark:border-slate-700">
            <nav className="px-4 pt-2 pb-4 space-y-2">
                 <button onClick={() => handleMobileNav('home')} className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 hover:bg-gray-50 dark:hover:text-white dark:hover:bg-slate-700">Início</button>
                 <button onClick={() => handleMobileNav('articlesList')} className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 hover:bg-gray-50 dark:hover:text-white dark:hover:bg-slate-700">Artigos</button>
                 {currentUser?.role === 'Administrator' && <button onClick={() => handleMobileNav('admin')} className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 hover:bg-gray-50 dark:hover:text-white dark:hover:bg-slate-700">Painel Admin</button>}
                 <div>
                    <button onClick={() => setIsMobileCategoriesOpen(p => !p)} className="flex items-center justify-between w-full px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 hover:bg-gray-50 dark:hover:text-white dark:hover:bg-slate-700">
                        <span>Categorias</span>
                        <Icon type="chevron-down" className={`h-5 w-5 transition-transform ${isMobileCategoriesOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isMobileCategoriesOpen && (
                        <div className="pl-6 mt-1 space-y-1">
                            {categories.map(category => (
                                <a key={category} onClick={() => handleCategorySelect(category)} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-600 cursor-pointer capitalize">{category}</a>
                            ))}
                        </div>
                    )}
                </div>
                 <button onClick={handleShowForYouMobile} className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 hover:bg-gray-50 dark:hover:text-white dark:hover:bg-slate-700">Para Você</button>
                 <button onClick={handleShowFavoritesMobile} className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 hover:bg-gray-50 dark:hover:text-white dark:hover:bg-slate-700">Favoritos</button>
                 {currentUser && <button onClick={() => handleMobileNav('achievements')} className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 hover:bg-gray-50 dark:hover:text-white dark:hover:bg-slate-700">Conquistas</button>}
            </nav>
        </div>
      )}
    </header>
  );
};

export default Header;