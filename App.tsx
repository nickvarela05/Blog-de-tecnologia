import React, { useState, useRef, useEffect, useCallback } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './components/HomePage';
import AdminPanel from './components/AdminPanel';
import Chatbot from './components/Chatbot';
import ArticlePage from './components/ArticlePage';
import ArticlesListPage from './components/ArticlesListPage';
import AchievementsPage from './components/AchievementsPage';
import GenerationNotification from './components/GenerationNotification';
import WhatsAppSignupModal from './components/WhatsAppSignupModal';
import { Article, Author, Lead, User, AutomationSettings } from './types';
import { generateArticle, getGroundedResponse, getPersonalizedRecommendations } from './services/geminiService';
import { updateMetaTags, updateArticleSchema, clearSeoTags } from './services/seoService';
import { initialAuthors } from './data/authors';
import { initialUsers } from './data/users';
import InfoModal from './components/InfoModal';
import AuthModal, { LoginData, RegisterData } from './components/AuthModal';
import AdminLoginPage from './components/AdminLoginPage';
import ProfileModal from './components/ProfileModal';

type View = 'home' | 'admin' | 'article' | 'articlesList' | 'achievements';

export interface GenerationParams {
  prompt: string;
  tone: string;
  style: string;
  category: string;
  targetAudience: string;
  isResearchMode: boolean;
  shouldAddImages: boolean;
  authorId: string;
}

export interface GenerationResult extends GenerationParams {
  content: string;
  sources: any[];
}

export interface InfoContent {
  title: string;
  content: string;
}

// FIX: Export interface to be accessible in other modules.
export interface AllInfoContents {
  about: InfoContent;
  contact: InfoContent;
  careers: InfoContent;
  privacy: InfoContent;
}

const allMockArticles: Article[] = [
  {
    id: 101,
    category: 'Ética em IA',
    title: 'O Futuro da IA: Além da Inteligência Humana',
    authorId: 'sofia_lima',
    date: '25 de Jul, 2024',
    publishedAt: new Date(2024, 6, 25),
    readTime: '8 min de leitura',
    imageUrl: 'https://picsum.photos/seed/ai/1200/600',
    description: 'Explore os últimos avanços em inteligência artificial e o que eles significam para a sociedade, a ética e nosso dia a dia.',
    likes: 128,
    status: 'published',
    content: `
# O Futuro da IA: Além da Inteligência Humana

Nos corredores silenciosos de laboratórios e nos movimentados centros de dados de instituições de pesquisa, uma revolução silenciosa está em andamento. A Inteligência Artificial (IA), antes domínio da ficção científica, é agora uma ferramenta poderosa nas mãos de cientistas, acelerando descobertas e remodelando a própria estrutura da investigação científica. Desde decifrar sistemas biológicos complexos até modelar fenômenos cósmicos, a IA está se provando uma parceira indispensável em nossa busca por conhecimento.

## Acelerando a Descoberta

Um dos impactos mais significativos da IA na ciência é sua capacidade de analisar vastos conjuntos de dados em velocidades inatingíveis por pesquisadores humanos. Em genômica, por exemplo, algoritmos de aprendizado de máquina podem identificar padrões em sequências de DNA ligados a doenças, uma tarefa que levaria décadas para humanos completarem. Isso levou a avanços na medicina personalizada, onde os tratamentos podem ser adaptados à composição genética de um individued>

![Uma renderização 3D futurista de uma dupla hélice de DNA brilhante sendo analisada por redes neurais.](https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)

> "A IA não é apenas uma ferramenta; é um novo paradigma para a descoberta científica. Ela nos permite fazer perguntas que nunca pensamos serem possíveis."

No entanto, a integração da IA na ciência não está isenta de desafios. Questões de privacidade de dados, viés algorítmico e a necessidade de novas diretrizes éticas são primordiais. À medida que delegamos mais do processo de descoberta às máquinas, garantir a transparência e a reprodutibilidade se torna crucial. O futuro da ciência dependerá de uma parceria sinergica entre o intelecto humano e a inteligência artificial, uma colaboração pronta para desvendar os mistérios mais profundos do nosso universo.
`
  },
  {
    id: 2,
    category: 'Computação Quântica',
    title: "O Próximo Salto da Computação Quântica",
    authorId: 'beatriz_costa',
    date: '22 de Jul, 2024',
    publishedAt: new Date(2024, 6, 22),
    readTime: '7 min de leitura',
    imageUrl: "https://picsum.photos/seed/quantum/1200/600",
    description: 'Desvendando o potencial revolucionário dos mais recentes processadores quânticos.',
    likes: 97,
    status: 'published',
    content: `
# O Próximo Salto da Computação Quântica

A computação quântica deixou de ser um conceito teórico para se tornar uma realidade tangível que promete revolucionar inúmeras indústrias. Com os recentes avanços em processadores quânticos, estamos à beira de um novo salto tecnológico com implicações profundas.

## O que é Computação Quântica?

Diferente dos computadores clássicos que usam bits (0s e 1s), os computadores quânticos usam qubits. Graças a princípios da mecânica quântica como superposição e entrelaçamento, um qubit pode representar um 0, um 1, ou ambos ao mesmo tempo. Isso permite que computadores quânticos processem um volume massivo de informações de forma exponencialmente mais rápida que os supercomputadores mais potentes de hoje.

![Uma representação visual de um qubit brilhante, mostrando os estados de superposição.](https://images.unsplash.com/photo-1635070045094-733470192a79?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)

As aplicações são vastas, desde a descoberta de novos medicamentos até a otimização de sistemas financeiros complexos. O caminho à frente ainda tem desafios, mas o progresso é inegável.
`
  },
  {
    id: 3,
    category: 'Biohacking',
    title: 'Biohacking: A Ética do Aprimoramento Humano',
    authorId: 'laura_mendes',
    date: '20 de Jul, 2024',
    publishedAt: new Date(2024, 6, 20),
    readTime: '9 min de leitura',
    imageUrl: "https://picsum.photos/seed/biohacking/1200/600",
    description: 'Onde traçamos a linha entre terapia e aprimoramento?',
    likes: 72,
    status: 'published',
    content: `
# Biohacking: A Ética do Aprimoramento Humano

O biohacking, a prática de usar a tecnologia para modificar a própria biologia, está saindo das margens da ficção científica para o debate público. Desde implantes de chips até terapias genéticas DIY, as possibilidades parecem infinitas, mas as questões éticas são igualmente vastas.

## Terapia vs. Aprimoramento

A principal questão ética reside na distinção entre usar a tecnologia para curar doenças (terapia) e usá-la para aprimorar capacidades humanas normais. Enquanto o primeiro é amplamente aceito, o segundo abre uma caixa de Pandora de preocupações sobre desigualdade e o que significa ser humano. Quem terá acesso a esses aprimoramentos? E que tipo de sociedade criaremos se apenas os ricos puderem pagar por melhores capacidades cognitivas ou físicas?
`
  },
  {
    id: 4,
    category: 'Web3',
    title: 'O Metaverso em uma Encruzilhada',
    authorId: 'sofia_lima',
    date: '18 de Jul, 2024',
    publishedAt: new Date(2024, 6, 18),
    readTime: '6 min de leitura',
    imageUrl: "https://picsum.photos/seed/metaverse/1200/600",
    description: 'É a próxima internet ou uma fantasia passageira de bilionários?',
    likes: 54,
    status: 'published',
    content: `
# O Metaverso em uma Encruzilhada

Anunciado como a próxima evolução da internet, o metaverso prometeu mundos virtuais imersivos onde poderíamos trabalhar, socializar e jogar. No entanto, após o hype inicial, a empolgação diminuiu. A tecnologia ainda é desajeitada, as experiências são fragmentadas e a adoção em massa parece distante.

O metaverso está em uma encruzilhada: ele se tornará a plataforma onipresente que seus proponentes imaginam, ou será relegado a um nicho para gamers e entusiastas de tecnologia? O futuro dependerá da superação de barreiras técnicas e da criação de aplicações verdadeiramente úteis e atraentes para o público em geral.
`
  },
  {
    id: 5,
    category: 'Web3',
    title: 'Finanças Descentralizadas: Uma Revolução em Andamento',
    authorId: 'camila_rocha',
    date: '15 de Jul, 2024',
    publishedAt: new Date(2024, 6, 15),
    readTime: '10 min de leitura',
    imageUrl: "https://picsum.photos/seed/defi/1200/600",
    description: 'Como o DeFi está desafiando os alicerces do sistema bancário tradicional.',
    likes: 105,
    status: 'published',
    content: `
# Finanças Descentralizadas: Uma Revolução em Andamento

Finanças Descentralizadas, ou DeFi, é um ecossistema financeiro emergente construído em tecnologia blockchain. Ele visa recriar os sistemas financeiros tradicionais - como empréstimos, negociações e seguros - de forma aberta e sem permissão, sem a necessidade de intermediários como bancos.

A promessa do DeFi é a democratização do acesso aos serviços financeiros, maior transparência e custos mais baixos. No entanto, o setor ainda enfrenta desafios significativos, incluindo riscos de segurança, incerteza regulatória e escalabilidade. Apesar dos obstáculos, o DeFi representa uma mudança fundamental em como pensamos sobre dinheiro e finanças.
`
  },
  {
    id: 6,
    category: 'Ciência',
    title: 'Os Princípios do Design Generativo',
    authorId: 'clara_ribeiro',
    date: '12 de Jul, 2024',
    publishedAt: new Date(2024, 6, 12),
    readTime: '7 min de leitura',
    imageUrl: "https://picsum.photos/seed/design/1200/600",
    description: 'Como os algoritmos estão se tornando parceiros criativos para arquitetos e engenheiros, expandindo os limites do possível.',
    likes: 88,
    status: 'published',
    content: `
# Os Princípios do Design Generativo

O design generativo é uma parceria entre designer e computador. Em vez de desenhar manualmente cada linha, o designer define metas e restrições, e o algoritmo gera milhares de opções de design possíveis. Essa abordagem está transformando campos como arquitetura, engenharia e design de produtos.

Este artigo explora os princípios fundamentais por trás do design generativo, mostra exemplos impressionantes de seu uso no mundo real e discute como essa tecnologia está capacitando uma nova era de criatividade e eficiência.
`
  },
  {
    id: 7,
    category: 'Tecnologia',
    title: 'Por Dentro da Escassez Global de Chips',
    authorId: 'lucas_martins',
    date: '10 de Jul, 2024',
    publishedAt: new Date(2024, 6, 10),
    readTime: '7 min de leitura',
    imageUrl: "https://picsum.photos/seed/chip/1200/600",
    description: 'Um mergulho profundo nos desafios geopolíticos e logísticos que paralisaram as cadeias de suprimentos e o que isso significa para o futuro.',
    likes: 88,
    status: 'published',
    content: `
# Por Dentro da Escassez Global de Chips

Nos últimos anos, uma escassez global de semicondutores (chips) afetou tudo, desde a produção de carros até a disponibilidade de consoles de videogame. Essa crise complexa foi causada por uma tempestade perfeita de fatores: aumento da demanda durante a pandemia, interrupções na cadeia de suprimentos e tensões geopolíticas.

Este artigo explora as causas profundas da escassez de chips, analisa seu impacto em várias indústrias e discute as estratégias de longo prazo que nações e empresas estão adotando para construir cadeias de suprimentos mais resilientes e evitar futuras crises.
`
  },
];


const defaultFooterInfo: AllInfoContents = {
    about: {
        title: 'Sobre Nós',
        content: `<h2>Nossa Missão</h2><p>O InnovateFlow é um blog dedicado a explorar as fronteiras da tecnologia, ciência, cultura e negócios. Nossa missão é fornecer conteúdo perspicaz, informativo e envolvente que inspire nossos leitores a pensar criticamente sobre o futuro e o impacto da inovação em nosso mundo.</p><h2>Nossa Equipe</h2><p>Somos uma equipe diversificada de engenheiros, escritores, cientistas e sonhadores apaixonados por desvendar as complexidades do mundo moderno. Acreditamos no poder da informação para capacitar indivíduos e impulsionar o progresso.</p>`
    },
    contact: {
        title: 'Contato',
        content: `<p>Tem alguma pergunta, sugestão ou apenas quer dizer olá? Adoraríamos ouvir de você!</p><p>Para dúvidas gerais, parcerias ou envio de artigos, entre em contato com nossa equipe editorial em:</p><p><a href="mailto:{{adminEmail}}" class="text-blue-500 hover:underline">{{adminEmail}}</a></p><p>Estamos ansiosos para nos conectar!</p>`
    },
    careers: {
        title: 'Carreiras',
        content: `<h2>Junte-se à Nossa Equipe!</h2><p>Estamos sempre em busca de indivíduos talentosos e apaixonados para se juntarem à nossa missão. Se você é um pensador inovador com amor por tecnologia e narrativa, este pode ser o lugar certo para você.</p><h3>Vagas Abertas</h3><ul><li>Redator de Conteúdo de IA (Remoto)</li><li>Engenheiro de Frontend (Remoto)</li><li>Especialista em Marketing Digital</li></ul><p>Para se candidatar, envie seu currículo e portfólio para <a href="mailto:careers@innovateflow.com" class="text-blue-500 hover:underline">careers@innovateflow.com</a>.</p>`
    },
    privacy: {
        title: 'Política de Privacidade',
        content: `<h2>1. Coleta de Informações</h2><p>Coletamos informações que você nos fornece diretamente, como quando você se inscreve em nossa newsletter (e-mail, nome, número de telefone). Também coletamos informações automaticamente, como seu endereço IP e informações sobre o dispositivo.</p><h2>2. Uso das Informações</h2><p>Usamos suas informações para fornecer e melhorar nossos serviços, enviar newsletters e outras comunicações, e para fins de análise.</p><h2>3. Compartilhamento de Informações</h2><p>Não compartilhamos suas informações pessoais com terceiros, exceto conforme necessário para fornecer nossos serviços ou conforme exigido por lei.</p>`
    }
};

const defaultAutomationSettings: AutomationSettings = {
  autoPostEnabled: false,
  postingDays: [],
  postingTimes: ['09:00'],
  customDaySchedules: {},
};


const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('home');
  const [selectedArticleId, setSelectedArticleId] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedAuthor, setSelectedAuthor] = useState<string | null>(null);
  const [isFavoritesView, setIsFavoritesView] = useState(false);
  const [isForYouView, setIsForYouView] = useState(false);
  const [recommendedArticles, setRecommendedArticles] = useState<Article[]>([]);
  const [isRecommendationLoading, setIsRecommendationLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string | null>(null);
  const [hasUnreadBotMessage, setHasUnreadBotMessage] = useState(false);
  const [articles, setArticles] = useState<Article[]>(allMockArticles);
  const [authors, setAuthors] = useState<Author[]>(initialAuthors);
  const [categories, setCategories] = useState<string[]>(() => {
    const allCategories = allMockArticles.map(a => a.category);
    const authorCategories = initialAuthors.flatMap(a => a.categories);
    return [...new Set([...allCategories, ...authorCategories])];
  });
  const [featuredArticleIds, setFeaturedArticleIds] = useState<number[]>(() => {
    const saved = localStorage.getItem('innovateFlowFeatured');
    return saved ? JSON.parse(saved) : [101, 2, 3, 4, 5, 6, 7];
  });
  
  // Users & Auth State
  const [users, setUsers] = useState<User[]>(() => {
    try {
        const savedUsers = localStorage.getItem('innovateFlowUsers');
        return savedUsers ? JSON.parse(savedUsers) : initialUsers;
    } catch (e) {
        return initialUsers;
    }
  });
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);


  // State for background generation
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [generationResult, setGenerationResult] = useState<GenerationResult | null>(null);
  const [showNotification, setShowNotification] = useState(false);

  // State for WhatsApp signup modal
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [emailForModal, setEmailForModal] = useState<string | undefined>(undefined);
  
  // State for Info Modal (Footer links)
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [infoModalContent, setInfoModalContent] = useState({ title: '', content: '' });
  const [footerInfoContents, setFooterInfoContents] = useState<AllInfoContents>(() => {
    try {
        const savedContent = localStorage.getItem('innovateFlowFooterContent');
        return savedContent ? JSON.parse(savedContent) : defaultFooterInfo;
    } catch (e) {
        return defaultFooterInfo;
    }
  });

  
  // State for Analytics & Leads
  const [totalVisitors, setTotalVisitors] = useState<number>(() => parseInt(localStorage.getItem('totalVisitors') || '14838'));
  const [emailLeads, setEmailLeads] = useState<number>(() => parseInt(localStorage.getItem('emailLeads') || '852'));
  const [whatsappLeads, setWhatsappLeads] = useState<number>(() => parseInt(localStorage.getItem('whatsappLeads') || '352'));
  const [leads, setLeads] = useState<Lead[]>(() => {
    try {
        const savedLeads = localStorage.getItem('innovateFlowLeads');
        return savedLeads ? JSON.parse(savedLeads) : [];
    } catch (e) {
        return [];
    }
  });

  // State for Automation Settings
    const [automationSettings, setAutomationSettings] = useState<AutomationSettings>(() => {
        try {
            const savedSettings = localStorage.getItem('innovateFlowAutomationSettings');
            return savedSettings ? JSON.parse(savedSettings) : defaultAutomationSettings;
        } catch (e) {
            return defaultAutomationSettings;
        }
    });


  const viewRef = useRef(currentView);
  useEffect(() => {
    viewRef.current = currentView;
  }, [currentView]);
  
  // Effect to increment visitor count on app load
  useEffect(() => {
    const newVisitorCount = totalVisitors + 1;
    setTotalVisitors(newVisitorCount);
    localStorage.setItem('totalVisitors', newVisitorCount.toString());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Effect to save users to localStorage
  useEffect(() => {
    try {
        localStorage.setItem('innovateFlowUsers', JSON.stringify(users));
    } catch (e) {
        console.error("Failed to save users to localStorage", e);
    }
  }, [users]);

  // Effect to save footer content to localStorage
  useEffect(() => {
    try {
        localStorage.setItem('innovateFlowFooterContent', JSON.stringify(footerInfoContents));
    } catch (e) {
        console.error("Failed to save footer content to localStorage", e);
    }
  }, [footerInfoContents]);

  // Effect to save leads to localStorage
  useEffect(() => {
    try {
        localStorage.setItem('innovateFlowLeads', JSON.stringify(leads));
    } catch (e) {
        console.error("Failed to save leads to localStorage", e);
    }
  }, [leads]);
  
  // Effect to save featured articles to localStorage
  useEffect(() => {
    try {
        localStorage.setItem('innovateFlowFeatured', JSON.stringify(featuredArticleIds));
    } catch (e) {
        console.error("Failed to save featured articles to localStorage", e);
    }
  }, [featuredArticleIds]);

  // Effect to save automation settings to localStorage
    useEffect(() => {
        try {
            localStorage.setItem('innovateFlowAutomationSettings', JSON.stringify(automationSettings));
        } catch (e) {
            console.error("Failed to save automation settings to localStorage", e);
        }
    }, [automationSettings]);
  
  // SEO Effect
  useEffect(() => {
    if (currentView === 'article' && selectedArticleId) {
        const article = articles.find(a => a.id === selectedArticleId);
        const author = article ? authors.find(auth => auth.id === article.authorId) : undefined;
        if (article) {
            const url = `${window.location.origin}/article/${article.id}`;
            updateMetaTags(article.title, article.description, article.imageUrl, url);
            if (author) {
                updateArticleSchema(article, author);
            }
        }
    } else {
        clearSeoTags();
    }
  }, [currentView, selectedArticleId, articles, authors]);
  
  const handleLogin = (loginData: LoginData): string | undefined => {
    const isSocialBypass = loginData.password === 'SOCIAL_LOGIN_BYPASS';
    const user = users.find(u => u.email === loginData.email);

    if (user && (isSocialBypass || user.password === loginData.password)) {
        setCurrentUser(user);
        setIsAuthModalOpen(false);
        if (user.role === 'Administrator') {
            setCurrentView('admin');
        }
        return undefined; // Success
    }
    return "Credenciais inválidas. Por favor, tente novamente.";
  };

  const handleAdminLogin = (loginData: LoginData): string | undefined => {
    if (loginData.email === 'admin@admin.com' && loginData.password === '123') {
        const adminUser = users.find(u => u.email === 'admin@admin.com' && u.role === 'Administrator');
        if (adminUser) {
            setCurrentUser(adminUser);
            setCurrentView('admin');
            return undefined; // Success
        }
        return "Usuário administrador não encontrado no sistema.";
    }
    return "Credenciais de administrador inválidas.";
  };

  const handleRegister = (registerData: RegisterData): string | undefined => {
      if (users.some(u => u.email === registerData.email)) {
          return "Este e-mail já está em uso.";
      }
      const newUser: User = {
          id: Date.now(),
          name: registerData.name,
          email: registerData.email,
          phone: registerData.phone,
          password: registerData.password,
          role: 'Leitor',
          status: 'Active',
          avatarUrl: `https://i.pravatar.cc/150?u=${Date.now()}`,
          favorites: [],
          readArticleIds: [],
          commentCount: 0,
          xp: 0,
      };
      setUsers(prev => [newUser, ...prev]);
      setCurrentUser(newUser);
      setIsAuthModalOpen(false);
      return undefined; // Success
  };

  const handleLogout = () => {
      if (currentUser?.role === 'Administrator') {
          handleNavigate('home');
      }
      setCurrentUser(null);
  };
  
    const calculateXp = (user: User): number => {
      const readXp = (user.readArticleIds?.length || 0) * 10;
      const commentXp = (user.commentCount || 0) * 25;
      const favoriteXp = (user.favorites?.length || 0) * 5;
      return readXp + commentXp + favoriteXp;
    };
    
    const handleUpdateUser = (updatedData: Partial<User>): string | undefined => {
        if (!currentUser) return "Nenhum usuário logado.";
    
        let userWithUpdates: User = { ...currentUser, ...updatedData };
        userWithUpdates.xp = calculateXp(userWithUpdates); // Recalculate XP on every update
    
        setCurrentUser(userWithUpdates);
        setUsers(users.map(u => u.id === currentUser.id ? userWithUpdates : u));
        
        return undefined; // Success
    };
    
    const handleToggleFavorite = (articleId: number) => {
        if (!currentUser) return;
        
        const favorites = currentUser.favorites || [];
        const isFavorited = favorites.includes(articleId);
        const newFavorites = isFavorited
            ? favorites.filter(id => id !== articleId)
            : [...favorites, articleId];
            
        handleUpdateUser({ favorites: newFavorites });
    };
    
    const handleLikeArticle = (articleId: number) => {
        setArticles(prevArticles => prevArticles.map(article => {
            if (article.id === articleId) {
                return { ...article, likes: (article.likes || 0) + 1 };
            }
            return article;
        }));
    };
    
    const handleTrackArticleRead = useCallback((articleId: number) => {
        if (!currentUser) return;
        const readArticles = currentUser.readArticleIds || [];
        if (!readArticles.includes(articleId)) {
            handleUpdateUser({ readArticleIds: [...readArticles, articleId] });
        }
    }, [currentUser]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleIncrementCommentCount = useCallback(() => {
        if (!currentUser) return;
        const count = (currentUser.commentCount || 0) + 1;
        handleUpdateUser({ commentCount: count });
    }, [currentUser]); // eslint-disable-line react-hooks/exhaustive-deps


  const handleStartGeneration = async (params: GenerationParams) => {
    if (isGenerating) return;

    setIsGenerating(true);
    setShowNotification(false);
    setGenerationResult(null);
    setLoadingMessage('Inicializando...');

    const onProgress = (status: string) => {
        setLoadingMessage(status);
    };
    
    const selectedAuthor = authors.find(a => a.id === params.authorId);
    const authorPromptPart = selectedAuthor 
      ? `Escreva este artigo da perspectiva de ${selectedAuthor.name}, um(a) ${selectedAuthor.specialty}.` 
      : 'Escreva este artigo da perspectiva de um especialista do InnovateFlow.';

    const fullPrompt = `
      ${authorPromptPart}
      Gere um artigo para a categoria: ${params.category || 'Geral'}
      Descreva o artigo que você quer gerar: ${params.prompt}
      Tom: ${params.tone || 'Não especificado'}
      Estilo: ${params.style || 'Não especificado'}
      Público-alvo: ${params.targetAudience || 'Não especificado'}
    `;

    const promise = params.isResearchMode
      ? getGroundedResponse(fullPrompt, params.shouldAddImages, onProgress)
      : generateArticle(fullPrompt, true, params.shouldAddImages, onProgress);

    try {
        const response = await promise;
        const result: GenerationResult = {
            ...params,
            content: response.text,
            sources: 'sources' in response && Array.isArray(response.sources) ? response.sources : [],
        };
        setGenerationResult(result);
        
        if (viewRef.current !== 'admin') {
            setShowNotification(true);
        }
    } catch (e) {
        console.error("A geração falhou", e);
        setLoadingMessage(`Erro: ${(e as Error).message}`);
    } finally {
        setIsGenerating(false);
    }
  };

  const clearGenerationResult = () => {
    setGenerationResult(null);
  };
  
  const handleViewGeneratedArticle = () => {
    setShowNotification(false);
    setCurrentView('admin');
  };

  const handleNavigate = (view: View) => {
    setCurrentView(view);
    setSelectedCategory(null);
    setSelectedAuthor(null);
    setIsFavoritesView(false);
    setIsForYouView(false);
    setSearchQuery(null);
    window.scrollTo(0, 0);
  };
  
  const handleSelectCategory = (category: string) => {
    setSelectedCategory(category);
    setSelectedAuthor(null);
    setIsFavoritesView(false);
    setIsForYouView(false);
    setSearchQuery(null);
    setCurrentView('home');
    window.scrollTo(0, 0);
  };

  const handleClearCategory = () => {
    setSelectedCategory(null);
  };

  const handleSelectAuthor = (authorName: string) => {
    setSelectedAuthor(authorName);
    setSelectedCategory(null);
    setIsFavoritesView(false);
    setIsForYouView(false);
    setSearchQuery(null);
    setCurrentView('home');
    window.scrollTo(0, 0);
  };

  const handleClearAuthor = () => {
    setSelectedAuthor(null);
  };
  
  const handleShowFavorites = () => {
    if (currentUser) {
        setSelectedAuthor(null);
        setSelectedCategory(null);
        setIsForYouView(false);
        setIsFavoritesView(true);
        setSearchQuery(null);
        setCurrentView('home');
        window.scrollTo(0, 0);
    } else {
        setIsAuthModalOpen(true);
    }
  };

  const handleClearFavoritesView = () => {
    setIsFavoritesView(false);
  };

  const handleShowForYou = async () => {
    if (!currentUser) {
        setIsAuthModalOpen(true);
        return;
    }
    if (!currentUser.favorites || currentUser.favorites.length === 0) {
        alert("Adicione artigos aos seus favoritos para receber recomendações personalizadas!");
        return;
    }

    setSelectedAuthor(null);
    setSelectedCategory(null);
    setIsFavoritesView(false);
    setSearchQuery(null);
    setIsForYouView(true);
    setCurrentView('home');
    window.scrollTo(0, 0);

    setIsRecommendationLoading(true);
    try {
        const favoriteArticles = articles.filter(a => currentUser.favorites!.includes(a.id));
        const recommendedIds = await getPersonalizedRecommendations(favoriteArticles, articles);
        setRecommendedArticles(articles.filter(a => recommendedIds.includes(a.id)));
    } catch (error) {
        console.error("Failed to get recommendations:", error);
        alert("Não foi possível carregar as recomendações. Tente novamente mais tarde.");
    } finally {
        setIsRecommendationLoading(false);
    }
  };

  const handleClearForYouView = () => {
    setIsForYouView(false);
  };


  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setSelectedCategory(null);
    setSelectedAuthor(null);
    setIsFavoritesView(false);
    setIsForYouView(false);
    setCurrentView('home');
    window.scrollTo(0, 0);
  };

  const handleClearSearch = () => {
    setSearchQuery(null);
  };

  const handleSelectArticle = (articleId: number) => {
    setSelectedArticleId(articleId);
    setCurrentView('article');
    handleTrackArticleRead(articleId);
    window.scrollTo(0, 0);
  };
  
  const handleOpenWhatsAppModal = (email?: string) => {
    setEmailForModal(email);
    setIsWhatsAppModalOpen(true);
  };

  const handleAddLead = (leadData: Partial<Omit<Lead, 'id' | 'date'>> & { email: string }) => {
    const existingLeadIndex = leads.findIndex(l => l.email === leadData.email);
    const isNewLead = existingLeadIndex === -1;
    let wasWhatsappAdded = false;

    if (isNewLead) {
        const newLead: Lead = {
            id: Date.now(),
            date: new Date().toISOString().split('T')[0],
            name: leadData.name,
            email: leadData.email,
            phone: leadData.phone,
        };
        setLeads(prevLeads => [newLead, ...prevLeads]);
    } else {
        const updatedLeads = [...leads];
        const originalLead = updatedLeads[existingLeadIndex];
        wasWhatsappAdded = !!leadData.phone && !originalLead.phone;
        updatedLeads[existingLeadIndex] = { ...originalLead, ...leadData };
        setLeads(updatedLeads);
    }
    
    if (isNewLead) {
        const newEmailCount = emailLeads + 1;
        setEmailLeads(newEmailCount);
        localStorage.setItem('emailLeads', newEmailCount.toString());
        if (leadData.phone) {
            const newWhatsappCount = whatsappLeads + 1;
            setWhatsappLeads(newWhatsappCount);
            localStorage.setItem('whatsappLeads', newWhatsappCount.toString());
        }
    } else if (wasWhatsappAdded) {
        const newWhatsappCount = whatsappLeads + 1;
        setWhatsappLeads(newWhatsappCount);
        localStorage.setItem('whatsappLeads', newWhatsappCount.toString());
    }
  };


  const handleOpenInfoModal = (section: keyof AllInfoContents) => {
    const adminEmail = users.find(u => u.role === 'Administrator')?.email || 'contato@innovateflow.com';
    const sectionInfo = footerInfoContents[section];
    
    if (sectionInfo) {
        let finalContent = sectionInfo.content;
        if (section === 'contact') {
            finalContent = finalContent.replace(/{{adminEmail}}/g, adminEmail);
        }
        setInfoModalContent({
            title: sectionInfo.title,
            content: finalContent
        });
        setIsInfoModalOpen(true);
    }
  };


  if (currentView === 'admin') {
    return (
        <>
            {currentUser?.role === 'Administrator' ? (
                <AdminPanel 
                    currentUser={currentUser}
                    onLogout={handleLogout}
                    onNavigateHome={() => handleNavigate('home')}
                    onStartGeneration={handleStartGeneration}
                    isGenerating={isGenerating}
                    loadingMessage={loadingMessage}
                    generationResult={generationResult}
                    clearGenerationResult={clearGenerationResult}
                    totalVisitors={totalVisitors}
                    emailLeads={emailLeads}
                    whatsappLeads={whatsappLeads}
                    leads={leads}
                    setLeads={setLeads}
                    users={users}
                    setUsers={setUsers}
                    footerInfoContents={footerInfoContents}
                    setFooterInfoContents={setFooterInfoContents}
                    articles={articles}
                    setArticles={setArticles}
                    authors={authors}
                    setAuthors={setAuthors}
                    categories={categories}
                    setCategories={setCategories}
                    featuredArticleIds={featuredArticleIds}
                    setFeaturedArticleIds={setFeaturedArticleIds}
                    automationSettings={automationSettings}
                    setAutomationSettings={setAutomationSettings}
                />
            ) : (
                <AdminLoginPage onLogin={handleAdminLogin} onNavigateHome={() => handleNavigate('home')} />
            )}
            <GenerationNotification 
                isVisible={showNotification}
                articleTitle={generationResult?.prompt || ''}
                onView={handleViewGeneratedArticle}
                onDismiss={() => setShowNotification(false)}
            />
        </>
    );
  }

  return (
    <div className="min-h-screen font-sans flex flex-col">
      <Header 
        currentUser={currentUser}
        onLogout={handleLogout}
        onNavigate={handleNavigate} 
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onSelectCategory={handleSelectCategory}
        onShowFavorites={handleShowFavorites}
        onShowForYou={handleShowForYou}
        onSearch={handleSearch}
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
        articles={articles}
        authors={authors}
        categories={categories}
        onSelectArticle={handleSelectArticle}
        onSelectAuthor={handleSelectAuthor}
      />
      <main className="flex-grow">
        {currentView === 'home' && (
          <HomePage 
            onSelectArticle={handleSelectArticle} 
            onOpenWhatsAppModal={handleOpenWhatsAppModal} 
            selectedCategory={selectedCategory}
            onClearCategory={handleClearCategory}
            onSelectCategory={handleSelectCategory}
            selectedAuthor={selectedAuthor}
            onClearAuthor={handleClearAuthor}
            onSelectAuthor={handleSelectAuthor}
            isFavoritesView={isFavoritesView}
            onClearFavoritesView={handleClearFavoritesView}
            isForYouView={isForYouView}
            onClearForYouView={handleClearForYouView}
            recommendedArticles={recommendedArticles}
            isRecommendationLoading={isRecommendationLoading}
            searchQuery={searchQuery}
            onClearSearch={handleClearSearch}
            currentUser={currentUser}
            onAddLead={handleAddLead}
            articles={articles}
            authors={authors}
            featuredArticleIds={featuredArticleIds}
            onToggleFavorite={handleToggleFavorite}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
          />
        )}
        {currentView === 'article' && selectedArticleId && (
          <ArticlePage 
            articleId={selectedArticleId} 
            onNavigateHome={() => handleNavigate('home')} 
            onSelectArticle={handleSelectArticle} 
            currentUser={currentUser}
            onToggleFavorite={handleToggleFavorite}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
            onOpenWhatsAppModal={handleOpenWhatsAppModal}
            onAddLead={handleAddLead}
            articles={articles}
            authors={authors}
            onLikeArticle={handleLikeArticle}
            onIncrementCommentCount={handleIncrementCommentCount}
          />
        )}
        {currentView === 'articlesList' && (
          <ArticlesListPage 
            articles={articles}
            authors={authors}
            onSelectArticle={handleSelectArticle}
            currentUser={currentUser}
            onToggleFavorite={handleToggleFavorite}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
          />
        )}
        {currentView === 'achievements' && currentUser && (
          <AchievementsPage 
            currentUser={currentUser}
            articles={articles}
          />
        )}
      </main>
      <Footer onSelectCategory={handleSelectCategory} onAddLead={handleAddLead} onOpenInfoModal={handleOpenInfoModal} onOpenWhatsAppModal={handleOpenWhatsAppModal} categories={categories} onNavigateToAdmin={() => handleNavigate('admin')} />
      <Chatbot hasUnreadBotMessage={hasUnreadBotMessage} setHasUnreadBotMessage={setHasUnreadBotMessage} />
       <GenerationNotification 
            isVisible={showNotification}
            articleTitle={generationResult?.prompt || ''}
            onView={handleViewGeneratedArticle}
            onDismiss={() => setShowNotification(false)}
        />
        <WhatsAppSignupModal
            isOpen={isWhatsAppModalOpen}
            onClose={() => setIsWhatsAppModalOpen(false)}
            onAddLead={handleAddLead}
            initialEmail={emailForModal}
        />
        <InfoModal
            isOpen={isInfoModalOpen}
            onClose={() => setIsInfoModalOpen(false)}
            title={infoModalContent.title}
            content={infoModalContent.content}
        />
        <AuthModal
            isOpen={isAuthModalOpen}
            onClose={() => setIsAuthModalOpen(false)}
            onLogin={handleLogin}
            onRegister={handleRegister}
        />
        {currentUser && (
             <ProfileModal
                isOpen={isProfileModalOpen}
                onClose={() => setIsProfileModalOpen(false)}
                currentUser={currentUser}
                onUpdateUser={handleUpdateUser}
            />
        )}
    </div>
  );
};

export default App;