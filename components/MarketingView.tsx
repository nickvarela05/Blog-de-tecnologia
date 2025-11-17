import React, { useState, useEffect, useCallback } from 'react';
import { Article, MarketingAssets } from '../types';
import { generateMarketingAssets, generateImageWithPrompt, editImageWithPrompt } from '../services/geminiService';
import Icon from './Icon';
import MarketingChat from './MarketingChat';
import Dropdown from './Dropdown';

const CopyableText: React.FC<{ text: string }> = ({ text }) => {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        navigator.clipboard.writeText(text).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };
    return (
        <div className="relative p-3 bg-gray-100 dark:bg-slate-700/50 rounded-md">
            <p className="text-sm text-gray-800 dark:text-gray-200 pr-8">{text}</p>
            <button onClick={handleCopy} className="absolute top-2 right-2 p-1 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white" aria-label="Copiar texto">
                <Icon type={copied ? 'check' : 'copy'} className={`w-4 h-4 ${copied ? 'text-green-500' : ''}`} />
            </button>
        </div>
    );
};

const MarketingAssetCard: React.FC<{ title: string; icon: React.ComponentProps<typeof Icon>['type']; children: React.ReactNode }> = ({ title, icon, children }) => (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-gray-300 dark:border-slate-700">
        <div className="flex items-center gap-3 mb-4">
            <Icon type={icon} className="w-6 h-6 text-blue-500 dark:text-blue-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
        </div>
        <div className="space-y-3">
            {children}
        </div>
    </div>
);

interface MarketingViewProps {
  article: Article;
  onBack: () => void;
}

type MarketingTab = 'assets' | 'consultant';

const MarketingView: React.FC<MarketingViewProps> = ({ article, onBack }) => {
  const [activeTab, setActiveTab] = useState<MarketingTab>('assets');
  const [assets, setAssets] = useState<MarketingAssets | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isEditingImage, setIsEditingImage] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '16:9' | '9:16' | '4:3' | '3:4'>('1:1');

  const fetchMarketingAssets = useCallback(async () => {
    if (activeTab === 'assets' && !assets) {
        setIsLoading(true);
        setError(null);
        try {
          const result = await generateMarketingAssets(article.title, article.content || '');
          setAssets(result);
        } catch (e) {
          console.error(e);
          setError("Falha ao gerar os ativos de marketing. Tente novamente.");
        } finally {
          setIsLoading(false);
        }
    } else if (assets) {
        setIsLoading(false);
    }
  }, [article, activeTab, assets]);

  useEffect(() => {
    fetchMarketingAssets();
  }, [fetchMarketingAssets]);

  const handleGenerateImage = async () => {
    setIsGeneratingImage(true);
    setGeneratedImageUrl(null);
    setError(null);
    try {
        const prompt = `Uma imagem de anúncio atraente para um artigo de blog intitulado "${article.title}". A imagem deve ser visualmente impactante e adequada para feeds de redes sociais. Estilo: moderno, limpo, com um toque de tecnologia.`;
        const imageUrl = await generateImageWithPrompt(prompt, aspectRatio);
        setGeneratedImageUrl(imageUrl);
    } catch (e) {
        console.error(e);
        setError("Falha ao gerar imagem.");
    } finally {
        setIsGeneratingImage(false);
    }
  };

  const handleAspectRatioChange = async (newRatio: typeof aspectRatio) => {
    const oldRatio = aspectRatio;
    setAspectRatio(newRatio);

    if (generatedImageUrl && newRatio !== oldRatio) {
        setIsEditingImage(true);
        setError(null);
        try {
            const prompt = `Altere a proporção desta imagem para ${newRatio}, expandindo-a de forma criativa e preenchendo as novas áreas de forma coerente com o conteúdo existente. Mantenha o estilo e o tema da imagem original.`;
            const newImageUrl = await editImageWithPrompt(generatedImageUrl, prompt);
            setGeneratedImageUrl(newImageUrl);
        } catch (e) {
            console.error(e);
            setError("Falha ao expandir a imagem.");
            setAspectRatio(oldRatio); // Revert on failure
        } finally {
            setIsEditingImage(false);
        }
    }
  };

  const renderLoadingSkeleton = () => (
    <div className="animate-pulse space-y-6 mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
                <div className="h-64 bg-gray-200 dark:bg-slate-700 rounded-lg"></div>
                <div className="h-48 bg-gray-200 dark:bg-slate-700 rounded-lg"></div>
            </div>
            <div className="lg:col-span-1 space-y-6">
                <div className="h-80 bg-gray-200 dark:bg-slate-700 rounded-lg"></div>
                <div className="h-64 bg-gray-200 dark:bg-slate-700 rounded-lg"></div>
            </div>
        </div>
    </div>
  );
  
  const aspectRatioOptions = [
    { value: '1:1', label: '1:1 (Quadrado)' },
    { value: '16:9', label: '16:9 (Paisagem)' },
    { value: '9:16', label: '9:16 (Vertical)' },
    { value: '4:3', label: '4:3 (Clássico)' },
    { value: '3:4', label: '3:4 (Retrato)' },
  ];

  return (
    <div className="space-y-6">
        <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700">
                <Icon type="arrow-left" className="w-5 h-5" />
            </button>
            <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Ferramentas de Marketing</h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm truncate">Para o artigo: "{article.title}"</p>
            </div>
        </div>
        
        <div className="border-b border-gray-300 dark:border-slate-700">
            <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                <button
                    onClick={() => setActiveTab('assets')}
                    className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                        activeTab === 'assets'
                            ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-slate-600'
                    }`}
                >
                    <Icon type="speakerphone" className="w-5 h-5" />
                    Ativos de Marketing
                </button>
                <button
                    onClick={() => setActiveTab('consultant')}
                    className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                        activeTab === 'consultant'
                            ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-slate-600'
                    }`}
                >
                    <Icon type="voice_chat" className="w-5 h-5" />
                    Consultor de IA
                </button>
            </nav>
        </div>

        <div>
            {activeTab === 'assets' && (
                isLoading ? renderLoadingSkeleton() : error ? <p className="text-red-500 text-center p-4">{error}</p> : assets && (
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-6">
                        <div className="xl:col-span-2 space-y-6">
                            <MarketingAssetCard title="Criativos para Redes Sociais (Facebook, Instagram)" icon="share">
                                {assets.socialAds?.map((ad, i) => <CopyableText key={`social-${i}`} text={ad.text} />)}
                            </MarketingAssetCard>
                            <MarketingAssetCard title="Criativos para LinkedIn" icon="linkedin">
                                {assets.linkedinAds?.map((ad, i) => <CopyableText key={`linkedin-${i}`} text={ad.text} />)}
                            </MarketingAssetCard>
                             <MarketingAssetCard title="Criativos para Google Ads" icon="google">
                                <div>
                                    <h4 className="text-sm font-semibold mb-2 text-gray-600 dark:text-gray-400">Títulos (Headlines)</h4>
                                    <div className="space-y-2">
                                        {assets.googleAds?.headlines?.map((h, i) => <CopyableText key={`ga-h-${i}`} text={h} />)}
                                    </div>
                                </div>
                                 <div>
                                    <h4 className="text-sm font-semibold mb-2 mt-4 text-gray-600 dark:text-gray-400">Descrições</h4>
                                    <div className="space-y-2">
                                        {assets.googleAds?.descriptions?.map((d, i) => <CopyableText key={`ga-d-${i}`} text={d} />)}
                                    </div>
                                </div>
                            </MarketingAssetCard>
                        </div>

                        <div className="xl:col-span-1 space-y-6">
                             <MarketingAssetCard title="Imagem para Anúncio" icon="image">
                                <div className="space-y-4">
                                     {(isGeneratingImage || isEditingImage) ? (
                                        <div className="w-full bg-gray-100 dark:bg-slate-700 rounded-md flex items-center justify-center" style={{ aspectRatio: aspectRatio.replace(':', '/') }}>
                                            <div className="flex flex-col items-center gap-2 text-gray-500 dark:text-gray-400">
                                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                                                <span className="text-sm font-medium">{isEditingImage ? 'Expandindo imagem...' : 'Gerando imagem...'}</span>
                                            </div>
                                        </div>
                                    ) : generatedImageUrl ? (
                                        <img src={generatedImageUrl} alt="Imagem de anúncio gerada" className="w-full object-cover rounded-md" style={{ aspectRatio: aspectRatio.replace(':', '/') }} />
                                    ) : (
                                        <div className="w-full bg-gray-100 dark:bg-slate-700 rounded-md flex items-center justify-center text-center p-4" style={{ aspectRatio: aspectRatio.replace(':', '/') }}>
                                            <p className="text-sm text-gray-500">Clique no botão abaixo para gerar uma imagem de anúncio com IA.</p>
                                        </div>
                                    )}
                                    <div>
                                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Proporção (Aspect Ratio)</label>
                                        <Dropdown
                                            options={aspectRatioOptions}
                                            value={aspectRatio}
                                            onChange={(value) => handleAspectRatioChange(value as any)}
                                            className="mt-1"
                                            disabled={isGeneratingImage || isEditingImage}
                                        />
                                    </div>
                                    <button onClick={handleGenerateImage} disabled={isGeneratingImage || isEditingImage} className="w-full py-2 px-4 font-semibold text-white bg-blue-700 rounded-md hover:bg-blue-800 disabled:bg-gray-500 flex items-center justify-center gap-2">
                                        <Icon type="spark" className={`w-5 h-5 ${(isGeneratingImage || isEditingImage) ? 'animate-pulse' : ''}`} />
                                        {isGeneratingImage ? 'Gerando...' : isEditingImage ? 'Expandindo...' : 'Gerar Imagem'}
                                    </button>
                                </div>
                            </MarketingAssetCard>

                            <MarketingAssetCard title="Orientações de Campanha" icon="bolt">
                                <div>
                                    <h4 className="text-sm font-semibold mb-2 text-gray-600 dark:text-gray-400">Público-Alvo</h4>
                                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-800 dark:text-gray-200">
                                        {assets.targetAudience?.map((t, i) => <li key={`target-${i}`}>{t}</li>)}
                                    </ul>
                                </div>
                                 <div>
                                    <h4 className="text-sm font-semibold mb-2 mt-4 text-gray-600 dark:text-gray-400">Palavras-Chave</h4>
                                     <div className="flex flex-wrap gap-1.5">
                                        {assets.keywords?.map((k, i) => <span key={`kw-${i}`} className="text-xs font-medium bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-gray-200 px-2 py-1 rounded-full">{k}</span>)}
                                    </div>
                                </div>
                                 <div>
                                    <h4 className="text-sm font-semibold mb-2 mt-4 text-gray-600 dark:text-gray-400">Ângulos de Campanha</h4>
                                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-800 dark:text-gray-200">
                                        {assets.campaignAngles?.map((a, i) => <li key={`angle-${i}`}>{a}</li>)}
                                    </ul>
                                </div>
                            </MarketingAssetCard>
                        </div>
                    </div>
                )
            )}
            {activeTab === 'consultant' && <MarketingChat article={article} />}
        </div>
    </div>
  );
};

export default MarketingView;