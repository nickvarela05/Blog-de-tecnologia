export interface User {
  id: number;
  name: string;
  email: string;
  avatarUrl: string;
  role: 'Administrator' | 'Leitor';
  status: 'Active' | 'Inactive';
  phone?: string;
  password?: string;
  favorites?: number[];
  readArticleIds?: number[];
  commentCount?: number;
  xp?: number;
}

export interface Author {
  id: string;
  name: string;
  specialty: string;
  avatarUrl: string;
  categories: string[];
}

export interface Article {
  id: number;
  category: string;
  title: string;
  description: string;
  authorId: string;
  readTime?: string;
  imageUrl: string;
  status?: 'published' | 'draft' | 'inactive';
  date?: string;
  publishedAt?: Date;
  content?: string;
  likes?: number;
}

export interface Comment {
  id: number;
  author: string;
  authorImageUrl: string;
  timestamp: string;
  text: string;
  likes: number;
  isAuthor?: boolean;
  replies?: Comment[];
}

export interface ChatMessage {
  sender: 'user' | 'bot';
  text: string;
}

export interface TrendingTopic {
  title:string;
  description: string;
  potential: string;
}

export interface KpiData {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
}

export interface Notification {
  id: number;
  type: 'comment' | 'newUser' | 'articlePublished' | 'systemUpdate';
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
}

export interface Lead {
  id: number;
  name?: string;
  email: string;
  phone?: string;
  date: string;
}

export interface MarketingAssets {
  socialAds: { text: string }[];
  googleAds: {
    headlines: string[];
    descriptions: string[];
  };
  linkedinAds: { text: string }[];
  targetAudience: string[];
  keywords: string[];
  campaignAngles: string[];
}

export interface SeoSuggestions {
  title: string;
  description: string;
  keywords: string[];
}

export interface AutomationSettings {
  autoPostEnabled: boolean;
  postingDays: string[];
  postingTimes: string[];
  customDaySchedules: Record<string, string[]>;
}
