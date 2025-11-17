import React from 'react';
import Icon from './Icon';

interface GenerationNotificationProps {
  isVisible: boolean;
  articleTitle: string;
  onView: () => void;
  onDismiss: () => void;
}

const GenerationNotification: React.FC<GenerationNotificationProps> = ({ isVisible, articleTitle, onView, onDismiss }) => {
  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-8 right-8 w-full max-w-sm bg-white dark:bg-slate-800 rounded-lg shadow-2xl border border-gray-300 dark:border-slate-700 z-[100] transform transition-all duration-300 ease-in-out animate-slide-in-right">
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0 pt-0.5">
            <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
                <Icon type="check" className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div className="ml-3 w-0 flex-1">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              Geração Concluída
            </p>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 truncate">
              Seu artigo sobre "{articleTitle}" está pronto.
            </p>
            <div className="mt-4 flex gap-3">
              <button
                onClick={onView}
                className="w-full bg-blue-700 border border-transparent rounded-md px-3 py-2 flex items-center justify-center text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Ver Artigo
              </button>
            </div>
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              onClick={onDismiss}
              className="inline-flex text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400 focus:outline-none"
            >
              <span className="sr-only">Fechar</span>
              <Icon type="close" className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenerationNotification;
