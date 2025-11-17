import React, { useState, useRef, useEffect } from 'react';
import { Article, Author, Comment, Lead, User } from '../types';
import Icon from './Icon';
import ArticleCard from './ArticleCard';
import { parseMarkdown, generateSpeechFromText, decodeAudioData, decode } from '../services/geminiService';

const initialComments: Comment[] = [
    {
        id: 1,
        author: 'Alex Johnson',
        authorImageUrl: 'https://i.pravatar.cc/150?u=alex_johnson',
        timestamp: 'há 2 dias',
        text: 'Artigo fantástico! O ponto sobre a IA como um novo paradigma para a descoberta realmente ressoa. É emocionante e um pouco assustador pensar onde isso levará a ciência na próxima década.',
        likes: 3,
        replies: [],
    },
    {
        id: 2,
        author: 'Jane Doe',
        authorImageUrl: 'https://i.pravatar.cc/150?u=jane_doe',
        isAuthor: true,
        timestamp: 'há 1 dia',
        text: 'Obrigada, Alex! Concordo plenamente. A chave será fomentar um ambiente colaborativo onde a intuição humana guie o poder computacional da IA. Fico feliz que tenha gostado da leitura!',
        likes: 1,
        replies: [],
    }
];

const CommentComponent: React.FC<{ comment: Comment; currentUser: User | null; onOpenAuthModal: () => void; onPostReply: (commentId: number, replyText: string) => void; onLikeComment: (commentId: number) => void; likedComments: number[] }> = ({ comment, currentUser, onOpenAuthModal, onPostReply, onLikeComment, likedComments }) => {
    const [isReplying, setIsReplying] = useState(false);
    const [replyText, setReplyText] = useState('');
    const isLiked = likedComments.includes(comment.id);

    const handleReplyClick = () => {
        if (!currentUser) {
            onOpenAuthModal();
        } else {
            setIsReplying(p => !p);
        }
    };

    const handleReplySubmit = () => {
        if (replyText.trim()) {
            onPostReply(comment.id, replyText);
            setReplyText('');
            setIsReplying(false);
        }
    };

    return (
        <div className="flex gap-4">
            <img src={comment.authorImageUrl} alt={comment.author} className="h-10 w-10 rounded-full flex-shrink-0" />
            <div className="flex-1">
                <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900 dark:text-white">{comment.author}</p>
                    {comment.isAuthor && (
                        <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-xs font-medium px-2 py-0.5 rounded-md">Autor</span>
                    )}
                    <span className="text-gray-500 dark:text-gray-400 text-sm">· {comment.timestamp}</span>
                </div>
                <p className="mt-1 text-gray-700 dark:text-gray-300">{comment.text}</p>
                <div className="flex items-center gap-4 mt-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                    <button onClick={() => onLikeComment(comment.id)} className={`flex items-center gap-1 hover:text-gray-900 dark:hover:text-white ${isLiked ? 'text-blue-500 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`}>
                        <Icon type="thumb-up" className="w-4 h-4" />
                        <span>{comment.likes} Curtir</span>
                    </button>
                    <button onClick={handleReplyClick} className="hover:text-gray-900 dark:hover:text-white">Responder</button>
                </div>

                {isReplying && (
                    <div className="mt-4 flex items-start gap-3">
                        <img src={currentUser?.avatarUrl} alt="Your avatar" className="h-8 w-8 rounded-full" />
                        <div className="flex-1">
                            <textarea
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                className="w-full p-2 text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                rows={2}
                                placeholder={`Respondendo a ${comment.author}...`}
                            />
                            <div className="flex gap-2 mt-2">
                                <button onClick={handleReplySubmit} className="bg-blue-700 hover:bg-blue-800 text-white font-semibold py-1 px-3 text-sm rounded-md">Publicar</button>
                                <button onClick={() => setIsReplying(false)} className="bg-gray-200 dark:bg-slate-600 hover:bg-gray-300 dark:hover:bg-slate-500 text-gray-800 dark:text-white font-semibold py-1 px-3 text-sm rounded-md">Cancelar</button>
                            </div>
                        </div>
                    </div>
                )}
                 {comment.replies && comment.replies.length > 0 && (
                    <div className="mt-6 pl-6 border-l-2 border-gray-200 dark:border-slate-700 space-y-6">
                        {comment.replies.map(reply => (
                            <CommentComponent key={reply.id} comment={reply} currentUser={currentUser} onOpenAuthModal={onOpenAuthModal} onPostReply={onPostReply} onLikeComment={onLikeComment} likedComments={likedComments} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

interface ArticlePageProps {
    articleId: number;
    onNavigateHome: () => void;
    onSelectArticle: (id: number) => void;
    currentUser: User | null;
    onToggleFavorite: (id: number) => void;
    onOpenAuthModal: () => void;
    onOpenWhatsAppModal: (email: string) => void;
    onAddLead: (leadData: Partial<Omit<Lead, 'id' | 'date'>> & { email: string }) => void;
    articles: Article[];
    authors: Author[];
    onLikeArticle: (articleId: number) => void;
    onIncrementCommentCount: () => void;
}

const AudioPlayer: React.FC<{ textContent: string }> = ({ textContent }) => {
    const [playbackState, setPlaybackState] = useState<'stopped' | 'loading' | 'playing' | 'error'>('stopped');
    const audioContextRef = useRef<AudioContext | null>(null);
    const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (sourceNodeRef.current) {
                sourceNodeRef.current.stop();
            }
            if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
                audioContextRef.current.close();
            }
        };
    }, []);

    const handlePlay = async () => {
        if (playbackState === 'loading') return;

        // Stop any existing audio
        if (sourceNodeRef.current) {
            sourceNodeRef.current.stop();
            sourceNodeRef.current = null;
        }

        setPlaybackState('loading');

        try {
            if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
                audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            }
            
            const cleanText = textContent.replace(/#|!\[.*?\]\(.*?\)|>|\*/g, '').substring(0, 3000);
            const base64Audio = await generateSpeechFromText(cleanText);
            
            const audioBuffer = await decodeAudioData(decode(base64Audio), audioContextRef.current, 24000, 1);
            
            const source = audioContextRef.current.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(audioContextRef.current.destination);
            source.onended = () => {
                setPlaybackState('stopped');
                sourceNodeRef.current = null;
            };
            source.start();
            sourceNodeRef.current = source;
            setPlaybackState('playing');

        } catch (err) {
            console.error("Error playing audio:", err);
            setPlaybackState('error');
            setTimeout(() => setPlaybackState('stopped'), 3000);
        }
    };
    
    const handleStop = () => {
        if (sourceNodeRef.current) {
            sourceNodeRef.current.stop();
            sourceNodeRef.current = null;
        }
        setPlaybackState('stopped');
    };

    const iconMap: Record<typeof playbackState, React.ComponentProps<typeof Icon>['type']> = {
        stopped: 'headphones',
        loading: 'refresh',
        playing: 'stop',
        error: 'close'
    };
    
    const textMap: Record<typeof playbackState, string> = {
        stopped: 'Ouvir Artigo',
        loading: 'Carregando...',
        playing: 'Parar Áudio',
        error: 'Erro'
    };

    return (
        <button 
            onClick={playbackState === 'playing' ? handleStop : handlePlay}
            disabled={playbackState === 'loading'}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-200 rounded-full font-semibold text-sm hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors disabled:opacity-50"
        >
            <Icon type={iconMap[playbackState]} className={`w-5 h-5 ${playbackState === 'loading' ? 'animate-spin' : ''}`} />
            {textMap[playbackState]}
        </button>
    );
};


const ArticlePage: React.FC<ArticlePageProps> = ({ articleId, onNavigateHome, onSelectArticle, currentUser, onToggleFavorite, onOpenAuthModal, onOpenWhatsAppModal, onAddLead, articles, authors, onLikeArticle, onIncrementCommentCount }) => {
    const article = articles.find(a => a.id === articleId);
    
    const [isLiked, setIsLiked] = useState(false);
    const [comments, setComments] = useState<Comment[]>(initialComments);
    const [likedComments, setLikedComments] = useState<number[]>([]);
    const [email, setEmail] = useState('');
    const [isSubscribed, setIsSubscribed] = useState(false);

    if (!article) {
      return (
        <div className="py-8 text-center">
          <p>Artigo não encontrado.</p>
          <button onClick={onNavigateHome} className="mt-4 text-blue-500">Voltar para a página inicial</button>
        </div>
      );
    }
    
    const author = authors.find(a => a.id === article.authorId);
    
    const isFavorited = currentUser?.favorites?.includes(article.id) ?? false;

    const handleShare = (platform: 'twitter' | 'facebook' | 'linkedin' | 'whatsapp') => {
        const url = window.location.href;
        const title = article.title;
        let shareUrl = '';

        switch (platform) {
            case 'twitter':
                shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
                break;
            case 'facebook':
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(title)}`;
                break;
            case 'linkedin':
                shareUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}&summary=${encodeURIComponent(article.description)}`;
                break;
            case 'whatsapp':
                shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(title + ' ' + url)}`;
                break;
        }

        if (shareUrl) {
            window.open(shareUrl, '_blank', 'noopener,noreferrer');
        }
    };
    
    const handleFavoriteClick = () => {
        if (currentUser) {
            onToggleFavorite(article.id);
        } else {
            onOpenAuthModal();
        }
    };

    const handleLikeClick = () => {
        if (!currentUser) {
            onOpenAuthModal();
            return;
        }
        if (!isLiked) {
            onLikeArticle(article.id);
            setIsLiked(true);
        }
    }

    const handleCommentSubmit = (text: string) => {
        if (!currentUser || !text.trim()) return;
        
        const newComment: Comment = {
            id: Date.now(),
            author: currentUser.name,
            authorImageUrl: currentUser.avatarUrl,
            timestamp: 'agora',
            text,
            likes: 0,
            replies: [],
        };

        setComments(prev => [newComment, ...prev]);
        onIncrementCommentCount();
    };

    const handleLikeComment = (commentId: number) => {
        if (!currentUser) {
            onOpenAuthModal();
            return;
        }
    
        const isAlreadyLiked = likedComments.includes(commentId);
    
        const updateLikesRecursively = (commentsList: Comment[]): Comment[] => {
            return commentsList.map(c => {
                if (c.id === commentId) {
                    const newLikes = isAlreadyLiked ? c.likes - 1 : c.likes + 1;
                    return { ...c, likes: Math.max(0, newLikes) };
                }
                if (c.replies && c.replies.length > 0) {
                    return { ...c, replies: updateLikesRecursively(c.replies) };
                }
                return c;
            });
        };
        
        setComments(currentComments => updateLikesRecursively(currentComments));
    
        if (isAlreadyLiked) {
            setLikedComments(prevLiked => prevLiked.filter(id => id !== commentId));
        } else {
            setLikedComments(prevLiked => [...prevLiked, commentId]);
        }
    };

    const handlePostReply = (commentId: number, replyText: string) => {
        if (!currentUser) return;
        
        const newReply: Comment = {
            id: Date.now(),
            author: currentUser.name,
            authorImageUrl: currentUser.avatarUrl,
            timestamp: 'agora',
            text: replyText,
            likes: 0,
            replies: [],
        };
        
        const addReplyToComment = (commentsList: Comment[]): Comment[] => {
            return commentsList.map(comment => {
                if (comment.id === commentId) {
                    return { ...comment, replies: [...(comment.replies || []), newReply] };
                }
                if (comment.replies && comment.replies.length > 0) {
                    return { ...comment, replies: addReplyToComment(comment.replies) };
                }
                return comment;
            });
        };

        setComments(addReplyToComment(comments));
        onIncrementCommentCount();
    };


    const handleFormSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!email.trim()) return;

      onAddLead({ email });
      setIsSubscribed(true);
      onOpenWhatsAppModal(email);

      setTimeout(() => {
          setIsSubscribed(false);
          setEmail('');
      }, 4000);
    };

    const relatedArticles = articles.filter(a => a.category === article.category && a.id !== article.id).slice(0, 3);
    const likeCount = (article.likes || 0) + (isLiked ? 1 : 0);

    return (
        <div className="py-8">
            <div className="container mx-auto px-4">
                {/* Back to Home Button */}
                <button 
                    onClick={onNavigateHome} 
                    className="mb-8 inline-flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-semibold text-sm transition-colors"
                >
                    <Icon type="arrow-left" className="w-5 h-5" />
                    Voltar à página inicial
                </button>

                {/* Article Header */}
                <div className="text-center mb-8 max-w-3xl mx-auto">
                    <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-sm font-semibold px-3 py-1 rounded-full">{article.category}</span>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mt-4 leading-tight">{article.title}</h1>
                </div>

                {/* Author Info & Audio Player */}
                <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6 mb-8">
                    {author && (
                        <div className="flex items-center gap-3">
                            <img src={author.avatarUrl} alt={author.name} className="h-12 w-12 rounded-full" />
                            <div>
                                <p className="font-semibold text-gray-900 dark:text-white">Por {author.name}</p>
                                <p className="text-gray-500 dark:text-gray-400 text-sm flex items-center gap-3">
                                <span>{article.date} · {article.readTime}</span>
                                <span className="flex items-center gap-1.5">
                                        <Icon type="thumb-up" className="w-4 h-4"/>
                                        {likeCount.toLocaleString('pt-BR')}
                                </span>
                                </p>
                            </div>
                        </div>
                    )}
                    <div className="hidden sm:block h-8 w-px bg-gray-300 dark:bg-slate-600"></div>
                    <AudioPlayer textContent={article.content || ''} />
                </div>


                <div className="grid grid-cols-1 lg:grid-cols-12 lg:gap-8 xl:gap-12 mt-8">
                    {/* Share Sidebar - Left */}
                    <aside className="hidden lg:block lg:col-span-2">
                        <div className="sticky top-28 flex flex-col items-center">
                            <p className="font-semibold text-sm text-gray-600 dark:text-gray-400">Compartilhar</p>
                            <div className="flex flex-col gap-2 mt-2">
                                <button onClick={() => handleShare('twitter')} aria-label="Compartilhar no Twitter" className="h-10 w-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-600 dark:text-gray-300">
                                    <Icon type="twitter" className="w-5 h-5"/>
                                </button>
                                <button onClick={() => handleShare('facebook')} aria-label="Compartilhar no Facebook" className="h-10 w-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-600 dark:text-gray-300">
                                    <Icon type="facebook" className="w-5 h-5"/>
                                </button>
                                <button onClick={() => handleShare('linkedin')} aria-label="Compartilhar no LinkedIn" className="h-10 w-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-600 dark:text-gray-300">
                                    <Icon type="linkedin" className="w-5 h-5"/>
                                </button>
                                 <button onClick={() => handleShare('whatsapp')} aria-label="Compartilhar no WhatsApp" className="h-10 w-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-600 dark:text-gray-300">
                                    <Icon type="whatsapp" className="w-5 h-5"/>
                                </button>
                                <hr className="my-2 border-gray-200 dark:border-slate-600 w-8" />
                                <button onClick={handleFavoriteClick} className="h-10 w-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-600 dark:text-gray-300">
                                    <Icon type={isFavorited ? "bookmark-filled" : "bookmark"} className={`w-5 h-5 ${isFavorited ? 'text-blue-500' : ''}`}/>
                                </button>
                                 <button onClick={handleLikeClick} className="h-10 w-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-600 dark:text-gray-300" disabled={isLiked}>
                                    <Icon type="thumb-up" className={`w-5 h-5 ${isLiked ? 'text-blue-500' : ''}`}/>
                                </button>
                            </div>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <main className="lg:col-span-7">
                        {/* Main Image */}
                        <div className="rounded-lg overflow-hidden">
                            <img src={article.imageUrl} alt={article.title} className="w-full h-auto object-cover" />
                        </div>

                        {/* Article Content */}
                        <div className="prose dark:prose-invert max-w-none mt-8" dangerouslySetInnerHTML={{ __html: parseMarkdown(article.content || '') }} />
                        
                        {/* Mobile Share Bar */}
                        <div className="mt-12 lg:hidden">
                            <p className="font-semibold text-sm text-gray-600 dark:text-gray-400">Compartilhar este artigo</p>
                            <div className="flex items-center gap-2 mt-2">
                                <button onClick={() => handleShare('twitter')} aria-label="Compartilhar no Twitter" className="h-10 w-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-600 dark:text-gray-300">
                                    <Icon type="twitter" className="w-5 h-5"/>
                                </button>
                                <button onClick={() => handleShare('facebook')} aria-label="Compartilhar no Facebook" className="h-10 w-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-600 dark:text-gray-300">
                                    <Icon type="facebook" className="w-5 h-5"/>
                                </button>
                                <button onClick={() => handleShare('linkedin')} aria-label="Compartilhar no LinkedIn" className="h-10 w-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-600 dark:text-gray-300">
                                    <Icon type="linkedin" className="w-5 h-5"/>
                                </button>
                                <button onClick={() => handleShare('whatsapp')} aria-label="Compartilhar no WhatsApp" className="h-10 w-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-600 dark:text-gray-300">
                                    <Icon type="whatsapp" className="w-5 h-5"/>
                                </button>
                                <div className="flex-grow"></div> {/* Spacer */}
                                <button onClick={handleFavoriteClick} className="h-10 w-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-600 dark:text-gray-300">
                                     <Icon type={isFavorited ? "bookmark-filled" : "bookmark"} className={`w-5 h-5 ${isFavorited ? 'text-blue-500' : ''}`}/>
                                </button>
                                 <button onClick={handleLikeClick} className="h-10 w-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-600 dark:text-gray-300" disabled={isLiked}>
                                    <Icon type="thumb-up" className={`w-5 h-5 ${isLiked ? 'text-blue-500' : ''}`}/>
                                </button>
                            </div>
                        </div>

                        {/* Join the Discussion */}
                        <div className="mt-16">
                            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-8">Participe da Discussão</h2>
                            {/* New Comment Form */}
                             <div className="flex items-start gap-4 mb-8">
                                <img src={currentUser?.avatarUrl || "https://i.pravatar.cc/150?u=guest"} alt="Your avatar" className="h-10 w-10 rounded-full" />
                                <div className="flex-1">
                                    <form onSubmit={(e) => {
                                        e.preventDefault();
                                        if (!currentUser) {
                                            onOpenAuthModal();
                                            return;
                                        }
                                        const target = e.target as typeof e.target & { comment: { value: string }};
                                        handleCommentSubmit(target.comment.value);
                                        target.comment.value = '';
                                    }}>
                                        <textarea
                                            name="comment"
                                            className="w-full p-3 text-gray-900 dark:text-white bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed"
                                            rows={3}
                                            placeholder={currentUser ? "Adicione à discussão..." : "Faça login para deixar um comentário."}
                                            disabled={!currentUser}
                                        />
                                        <button 
                                            type="submit"
                                            disabled={!currentUser}
                                            className="mt-3 bg-blue-700 hover:bg-blue-800 text-white font-semibold py-2 px-5 rounded-md transition-colors duration-200 disabled:bg-gray-400 dark:disabled:bg-slate-600"
                                        >
                                            Publicar Comentário
                                        </button>
                                    </form>
                                </div>
                            </div>

                            {/* Comments List */}
                            <div className="space-y-8 border-t border-gray-200 dark:border-slate-700 pt-8">
                                {comments.map(comment => <CommentComponent key={comment.id} comment={comment} currentUser={currentUser} onOpenAuthModal={onOpenAuthModal} onPostReply={handlePostReply} onLikeComment={handleLikeComment} likedComments={likedComments} />)}
                            </div>
                        </div>
                    </main>

                    {/* Right Sidebar */}
                    <aside className="lg:col-span-3 mt-12 lg:mt-0">
                         <div className="sticky top-28">
                            {/* Subscription Box */}
                            <div className="bg-blue-50 dark:bg-blue-900/30 p-6 rounded-lg border border-blue-200 dark:border-blue-800 text-center">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Fique por Dentro</h3>
                                <p className="text-gray-700 dark:text-gray-300 mt-2 text-sm">Receba as últimas novidades do mundo da tecnologia e ciência, entregues em seu e-mail semanalmente.</p>
                                {isSubscribed ? (
                                    <div className="mt-4 flex items-center justify-center gap-2 bg-green-100 dark:bg-green-900/50 p-3 rounded-md text-green-800 dark:text-green-200">
                                        <Icon type="check" className="w-5 h-5" />
                                        <span className="text-sm font-semibold">Inscrição confirmada!</span>
                                    </div>
                                ) : (
                                  <form onSubmit={handleFormSubmit} className="mt-4">
                                      <div className="relative">
                                          <input 
                                              type="email" 
                                              placeholder="Seu melhor e-mail" 
                                              required 
                                              value={email}
                                              onChange={(e) => setEmail(e.target.value)}
                                              className="w-full bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md py-3 pl-4 pr-32 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" 
                                          />
                                          <button 
                                              type="submit" 
                                              className="absolute right-1.5 top-1.5 bg-blue-700 hover:bg-blue-800 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-200 text-sm"
                                          >
                                              Inscrever-se
                                          </button>
                                      </div>
                                  </form>
                                )}
                            </div>
                         </div>
                    </aside>
                </div>
            </div>

            {/* You Might Also Like */}
            <div className="bg-gray-50 dark:bg-slate-900 py-16 mt-16">
                <div className="container mx-auto px-4">
                    <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">Você Também Pode Gostar</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {relatedArticles.map(relatedArticle => (
                             <div key={relatedArticle.id} onClick={() => onSelectArticle(relatedArticle.id)} className="cursor-pointer bg-white dark:bg-slate-800/50 p-4 rounded-lg border border-gray-200 dark:border-slate-700/50 group">
                                 <ArticleCard article={relatedArticle} authors={authors} currentUser={currentUser} onToggleFavorite={onToggleFavorite} onOpenAuthModal={onOpenAuthModal} />
                                 <p className="text-blue-500 dark:text-blue-400 font-semibold text-sm mt-3 inline-flex items-center gap-1 group-hover:text-blue-600 dark:group-hover:text-blue-300">
                                    {relatedArticle.readTime}
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25 21 12m0 0-3.75 3.75M21 12H3" />
                                    </svg>
                                 </p>
                             </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ArticlePage;
