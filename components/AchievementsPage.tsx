import React from 'react';
import { User, Article } from '../types';
import Icon from './Icon';

interface AchievementsPageProps {
  currentUser: User;
  articles: Article[];
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentProps<typeof Icon>['type'];
  isUnlocked: (user: User, articles: Article[]) => boolean;
}

const allBadges: Badge[] = [
    { id: 'reader-1', name: 'Leitor Iniciante', description: 'Leia seu primeiro artigo.', icon: 'bolt', isUnlocked: user => (user.readArticleIds?.length || 0) >= 1 },
    { id: 'commenter-1', name: 'Comentarista', description: 'Faça seu primeiro comentário.', icon: 'chat', isUnlocked: user => (user.commentCount || 0) >= 1 },
    { id: 'favorite-1', name: 'Curador', description: 'Salve seu primeiro favorito.', icon: 'bookmark', isUnlocked: user => (user.favorites?.length || 0) >= 1 },
    { id: 'reader-5', name: 'Leitor Assíduo', description: 'Leia 5 artigos.', icon: 'trending-up', isUnlocked: user => (user.readArticleIds?.length || 0) >= 5 },
    { id: 'commenter-5', name: 'Debatedor', description: 'Faça 5 comentários.', icon: 'voice_chat', isUnlocked: user => (user.commentCount || 0) >= 5 },
    { id: 'reader-10', name: 'Super Leitor', description: 'Leia 10 artigos.', icon: 'spark', isUnlocked: user => (user.readArticleIds?.length || 0) >= 10 },
];

const BadgeIcon: React.FC<{ badge: Badge; user: User; articles: Article[] }> = ({ badge, user, articles }) => {
    const unlocked = badge.isUnlocked(user, articles);
    return (
        <div className="flex flex-col items-center text-center w-24" title={`${badge.name}: ${badge.description}`}>
            <div className={`relative h-16 w-16 flex items-center justify-center rounded-full border-2 transition-all duration-300 ${unlocked ? 'bg-yellow-100 dark:bg-yellow-900/50 border-yellow-400' : 'bg-gray-100 dark:bg-slate-700 border-gray-300 dark:border-slate-600'}`}>
                <Icon type={badge.icon} className={`h-8 w-8 ${unlocked ? 'text-yellow-500' : 'text-gray-400 dark:text-slate-500'}`} />
                {unlocked && (
                     <div className="absolute -bottom-1 -right-1 bg-green-500 h-5 w-5 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-800">
                        <Icon type="check" className="w-3 h-3 text-white" />
                    </div>
                )}
            </div>
            <p className={`mt-2 text-xs font-semibold ${unlocked ? 'text-gray-800 dark:text-gray-200' : 'text-gray-400 dark:text-slate-500'}`}>{badge.name}</p>
        </div>
    );
};

const ChallengeProgressBar: React.FC<{ progress: number; goal: number; text: string; reward: number }> = ({ progress, goal, text, reward }) => {
    const percentage = Math.min((progress / goal) * 100, 100);
    const isComplete = progress >= goal;
    return (
        <div className={`p-4 rounded-lg flex items-center gap-4 transition-colors ${isComplete ? 'bg-green-100 dark:bg-green-900/50' : 'bg-gray-100 dark:bg-slate-800'}`}>
            <div className={`flex-shrink-0 h-12 w-12 rounded-full flex items-center justify-center ${isComplete ? 'bg-green-200 dark:bg-green-800' : 'bg-gray-200 dark:bg-slate-700'}`}>
                {isComplete ? <Icon type="check" className="w-6 h-6 text-green-600" /> : <Icon type="bolt" className="w-6 h-6 text-gray-500" />}
            </div>
            <div className="flex-grow">
                <p className={`font-semibold ${isComplete ? 'text-green-800 dark:text-green-200' : 'text-gray-800 dark:text-gray-200'}`}>{text}</p>
                <div className="flex items-center gap-2 mt-1">
                    <div className="w-full bg-gray-300 dark:bg-slate-600 rounded-full h-2.5">
                        <div className={`h-2.5 rounded-full ${isComplete ? 'bg-green-500' : 'bg-blue-500'}`} style={{ width: `${percentage}%` }}></div>
                    </div>
                    <span className="text-xs font-mono text-gray-500">{progress}/{goal}</span>
                </div>
            </div>
             <div className="text-center">
                <p className="font-bold text-lg text-yellow-500">+{reward}</p>
                <p className="text-xs text-gray-500">XP</p>
            </div>
        </div>
    );
};


const AchievementsPage: React.FC<AchievementsPageProps> = ({ currentUser, articles }) => {
    const xp = currentUser.xp || 0;

    const getLevelInfo = (currentXp: number) => {
        let level = 1;
        let requiredXp = 100;
        let base_xp = 0;
        while (currentXp >= requiredXp) {
            level++;
            base_xp = requiredXp;
            requiredXp += Math.floor(100 * Math.pow(level, 1.5));
        }
        const xpForCurrentLevel = currentXp - base_xp;
        const xpForNextLevel = requiredXp - base_xp;
        const progressPercentage = (xpForCurrentLevel / xpForNextLevel) * 100;

        return { level, progressPercentage, xpForCurrentLevel, xpForNextLevel };
    };

    const { level, progressPercentage, xpForCurrentLevel, xpForNextLevel } = getLevelInfo(xp);
    
    // Challenge Progress Calculation
    const readArticleCount = currentUser.readArticleIds?.length || 0;
    const readCategories = new Set(currentUser.readArticleIds?.map(id => articles.find(a => a.id === id)?.category).filter(Boolean)).size;
    const commentCount = currentUser.commentCount || 0;
    const scienceFavorites = currentUser.favorites?.filter(id => articles.find(a => a.id === id)?.category === 'Ciência').length || 0;

    return (
        <div className="container mx-auto px-4 py-12">
             <header className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white">Suas Conquistas</h1>
                <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                    Complete desafios, ganhe pontos de experiência (XP) e desbloqueie conquistas por sua participação na comunidade InnovateFlow!
                </p>
            </header>

            <div className="max-w-4xl mx-auto space-y-12">
                {/* User Progress Section */}
                <section className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-gray-300 dark:border-slate-700 flex flex-col sm:flex-row items-center gap-6">
                    <img src={currentUser.avatarUrl} alt={currentUser.name} className="h-24 w-24 rounded-full border-4 border-blue-500" />
                    <div className="flex-grow w-full">
                        <div className="flex justify-between items-baseline">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Nível {level}</h2>
                            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Próximo Nível: <span className="font-mono">{xpForNextLevel - xpForCurrentLevel} XP</span></p>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-4 mt-2">
                            <div className="bg-blue-600 h-4 rounded-full text-center" style={{ width: `${progressPercentage}%` }}></div>
                        </div>
                         <p className="text-right text-sm font-mono text-gray-500 dark:text-gray-400 mt-1">{xpForCurrentLevel} / {xpForNextLevel} XP</p>
                    </div>
                </section>

                {/* Current Challenges */}
                 <section>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Desafios Atuais</h2>
                    <div className="space-y-4">
                        <ChallengeProgressBar progress={readCategories} goal={3} text="Leitor Versátil: Leia artigos de 3 categorias diferentes." reward={50} />
                        <ChallengeProgressBar progress={commentCount} goal={2} text="Voz Ativa: Deixe 2 comentários construtivos." reward={75} />
                        <ChallengeProgressBar progress={scienceFavorites} goal={2} text="Curador de Ciência: Salve 2 artigos de 'Ciência' nos seus favoritos." reward={50} />
                        <ChallengeProgressBar progress={readArticleCount} goal={5} text="Maratonista: Leia um total de 5 artigos." reward={100} />
                    </div>
                </section>
                
                {/* Badges Section */}
                <section>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Conquistas Desbloqueadas</h2>
                    <div className="p-6 bg-white dark:bg-slate-800 rounded-lg border border-gray-300 dark:border-slate-700">
                        <div className="flex flex-wrap gap-6 justify-center">
                            {allBadges.map(badge => (
                                <BadgeIcon key={badge.id} badge={badge} user={currentUser} articles={articles} />
                            ))}
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default AchievementsPage;
