import React from 'react';
import Icon from './Icon';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string;
}

const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose, title, content }) => {
  if (!isOpen) return null;

  return (
    <div 
        className="fixed inset-0 bg-black/80 z-[60] flex justify-center items-center p-4 backdrop-blur-sm" 
        aria-modal="true" 
        role="dialog"
        onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-slate-800 w-full max-w-2xl rounded-lg border border-gray-300 dark:border-slate-700 shadow-xl flex flex-col max-h-[80vh] animate-slide-in-right"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
      >
        <header className="flex justify-between items-center p-4 border-b border-gray-300 dark:border-slate-600 flex-shrink-0">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
            <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white">
                <Icon type="close" className="h-6 w-6" />
            </button>
        </header>
        <main 
            className="flex-1 overflow-y-auto p-6 prose dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>
    </div>
  );
};

export default InfoModal;