import React from 'react';
import { Notification } from '../types';
import Icon from './Icon';

interface NotificationDropdownProps {
  isOpen: boolean;
  notifications: Notification[];
  onClose: () => void;
  onMarkAllAsRead: () => void;
}

const NotificationItem: React.FC<{ notification: Notification }> = ({ notification }) => {
    const iconMap: Record<Notification['type'], React.ComponentProps<typeof Icon>['type']> = {
        comment: 'voice_chat',
        newUser: 'users',
        articlePublished: 'article',
        systemUpdate: 'settings',
    };

    return (
        <div className="flex items-start gap-3 p-3 hover:bg-gray-100 dark:hover:bg-slate-700/50 rounded-md cursor-pointer">
            {!notification.read && <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0"></div>}
            <div className={`flex-shrink-0 ${notification.read ? 'ml-5' : ''}`}>
                <Icon type={iconMap[notification.type]} className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            </div>
            <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{notification.title}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">{notification.description}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{notification.timestamp}</p>
            </div>
        </div>
    );
};


const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ isOpen, notifications, onClose, onMarkAllAsRead }) => {
    if (!isOpen) return null;

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div className="absolute top-full right-0 mt-3 w-80 max-w-sm bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg shadow-2xl z-20 text-gray-900 dark:text-white flex flex-col">
            <header className="flex justify-between items-center p-3 border-b border-gray-300 dark:border-slate-600">
                <h3 className="font-semibold">Notificações</h3>
                {unreadCount > 0 &&
                    <button onClick={onMarkAllAsRead} className="text-xs text-blue-500 dark:text-blue-400 hover:underline">
                        Marcar todas como lidas
                    </button>
                }
            </header>
            <main className="max-h-80 overflow-y-auto">
                {notifications.length > 0 ? (
                    <div className="divide-y divide-gray-100 dark:divide-slate-700/50">
                        {notifications.map(notif => <NotificationItem key={notif.id} notification={notif} />)}
                    </div>
                ) : (
                    <div className="text-center p-8 text-gray-400 dark:text-gray-500 text-sm">
                        <p>Nenhuma notificação nova</p>
                    </div>
                )}
            </main>
            <footer className="p-2 border-t border-gray-300 dark:border-slate-600 text-center">
                <button className="text-sm w-full font-medium text-blue-500 dark:text-blue-400 hover:underline p-2 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700/50 transition-colors">
                    Ver todas as notificações
                </button>
            </footer>
        </div>
    );
};

export default NotificationDropdown;