import React from 'react';
import Icon from './Icon';

interface Widget {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentProps<typeof Icon>['type'];
}

interface AddWidgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddWidget: (widgetId: string) => void;
  availableWidgets: Widget[];
}

const AddWidgetModal: React.FC<AddWidgetModalProps> = ({ isOpen, onClose, onAddWidget, availableWidgets }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 z-[60] flex justify-center items-center p-4 backdrop-blur-sm" aria-modal="true" role="dialog">
      <div className="bg-white dark:bg-slate-800 w-full max-w-2xl rounded-lg border border-gray-300 dark:border-slate-700 shadow-xl flex flex-col max-h-[90vh]">
        <header className="flex justify-between items-center p-4 border-b border-gray-300 dark:border-slate-600 flex-shrink-0">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Adicionar um novo widget</h3>
            <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white">
                <Icon type="close" className="h-6 w-6" />
            </button>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableWidgets.map((widget) => (
                    <div 
                        key={widget.name} 
                        className="bg-gray-50 dark:bg-slate-700 p-4 rounded-md border border-gray-300 dark:border-slate-600 flex flex-col justify-between"
                    >
                        <div>
                            <div className="flex items-center gap-3">
                                <Icon type={widget.icon} className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                                <h4 className="font-semibold text-gray-900 dark:text-white">{widget.name}</h4>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{widget.description}</p>
                        </div>
                         <button 
                            onClick={() => onAddWidget(widget.id)}
                            className="mt-4 w-full text-center py-2 px-4 text-sm font-semibold text-white bg-blue-700 rounded-md hover:bg-blue-800 transition-colors"
                        >
                            Adicionar Widget
                        </button>
                    </div>
                ))}
            </div>
        </main>
        <footer className="p-4 border-t border-gray-300 dark:border-slate-600 flex-shrink-0 flex justify-end">
             <button onClick={onClose} className="py-2 px-5 font-semibold text-gray-800 dark:text-gray-300 bg-gray-200 dark:bg-slate-600 rounded-md hover:bg-gray-300 dark:hover:bg-slate-500 transition-colors">
                Fechar
            </button>
        </footer>
      </div>
    </div>
  );
};

export default AddWidgetModal;
