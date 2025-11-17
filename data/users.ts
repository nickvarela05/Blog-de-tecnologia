import { User } from '../types';

export const initialUsers: User[] = [
    { id: 1, name: 'Admin', email: 'admin@admin.com', role: 'Administrator', status: 'Active', avatarUrl: 'https://picsum.photos/id/433/100/100', password: '123', phone: '(11) 98765-4321', favorites: [], readArticleIds: [], commentCount: 0, xp: 0 },
    { id: 2, name: 'Jane Doe', email: 'jane.doe@innovateflow.com', role: 'Leitor', status: 'Active', avatarUrl: 'https://i.pravatar.cc/150?u=jane_doe', password: 'password123', favorites: [101, 3], readArticleIds: [101, 2, 3, 4], commentCount: 2, xp: 100 },
    { id: 3, name: 'John Smith', email: 'john.smith@innovateflow.com', role: 'Leitor', status: 'Inactive', avatarUrl: 'https://i.pravatar.cc/150?u=john_smith', password: 'password123', favorites: [], readArticleIds: [], commentCount: 0, xp: 0 },
    { id: 4, name: 'Emily White', email: 'emily.white@innovateflow.com', role: 'Leitor', status: 'Active', avatarUrl: 'https://i.pravatar.cc/150?u=emily_white', password: 'password123', favorites: [5, 6], readArticleIds: [5], commentCount: 0, xp: 20 },
];