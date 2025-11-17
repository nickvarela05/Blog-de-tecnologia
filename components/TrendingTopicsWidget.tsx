import React, { useState, useEffect, useCallback } from 'react';
import { getTrendingTopics } from '../services/geminiService';
import { TrendingTopic } from '../types';
import Icon from './Icon';

interface TrendingTopicsWidgetProps {
    onUseTopic: (title: string) => void;
}

const TrendingTopicsWidget: React.FC<TrendingTopicsWidgetProps> = ({ onUseTopic }) => {
    const [topics, setTopics] = useState<TrendingTopic[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [copiedTopic, setCopiedTopic] = useState<string | null>(null);

    const fetchTopics = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const fetchedTopics = await getTrendingTopics();
            setTopics(fetchedTopics);
        } catch (e) {
            setError('Falha ao carregar tópicos em alta.');
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTopics();
    }, [fetchTopics]);
    
    const handleCopyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopiedTopic(text);
            setTimeout(() => setCopiedTopic(null), 2000);
        });
    };

    const getPotentialChipColor = (potential: string) => {
        const p = (potential || '').toLowerCase();
        if (p.includes('muito alto') || p.includes('extremamente alto')) return 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300';
        if (p.includes('alto')) return 'bg-orange-100 dark:bg-orange-900/50 text-orange-800 dark:text-orange-300';
        if (p.includes('médio')) return 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300';
        return 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300';
    };

    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-gray-300 dark:border-slate-700">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Ideias de Artigos em Alta</h3>
                <button onClick={fetchTopics} disabled={isLoading} className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:text-gray-600 disabled:cursor-not-allowed">
                    <Icon type="refresh" className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
            </div>
            {isLoading ? (
                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                         <div key={i} className="animate-pulse flex space-x-4">
                            <div className="flex-1 space-y-3 py-1">
                                <div className="h-3 bg-gray-200 dark:bg-slate-600 rounded w-3/4"></div>
                                <div className="h-2 bg-gray-200 dark:bg-slate-600 rounded"></div>
                                <div className="h-2 bg-gray-200 dark:bg-slate-600 rounded w-5/6"></div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : error ? (
                <p className="text-red-500 dark:text-red-400 text-sm">{error}</p>
            ) : (
                <div className="space-y-5">
                    {topics.map((topic, index) => (
                        <div key={index}>
                            <div className="flex justify-between items-start gap-2">
                                <h4 className="font-semibold text-gray-900 dark:text-white text-sm flex-1">{topic.title}</h4>
                                <div className="flex items-center gap-3 flex-shrink-0">
                                    <button
                                        onClick={() => onUseTopic(topic.title)}
                                        className="text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                                        title="Usar este tópico no editor"
                                    >
                                        <Icon type="spark" className="w-4 h-4"/>
                                    </button>
                                    <button
                                        onClick={() => handleCopyToClipboard(topic.title)}
                                        className="text-gray-500 dark:text-gray-400 hover:text-green-500 dark:hover:text-green-400 transition-colors"
                                        title="Copiar título"
                                    >
                                        {copiedTopic === topic.title ? (
                                            <Icon type="check" className="w-4 h-4 text-green-500 dark:text-green-400"/>
                                        ) : (
                                            <Icon type="copy" className="w-4 h-4"/>
                                        )}
                                    </button>
                                </div>
                            </div>
                            <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">{topic.description}</p>
                            <div className="mt-2">
                                <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getPotentialChipColor(topic.potential)}`}>
                                    {topic.potential}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TrendingTopicsWidget;