import React from 'react';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, title, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 z-[60] flex justify-center items-center p-4 backdrop-blur-sm" aria-modal="true" role="dialog">
      <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-lg border border-gray-300 dark:border-slate-700 p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
        <p className="mt-2 text-gray-600 dark:text-gray-400 text-sm">{message}</p>
        <div className="mt-6 flex justify-end gap-4">
          <button onClick={onCancel} className="py-2 px-5 font-semibold text-gray-800 dark:text-gray-300 bg-gray-200 dark:bg-slate-600 rounded-md hover:bg-gray-300 dark:hover:bg-slate-500 transition-colors">
            Cancelar
          </button>
          <button onClick={onConfirm} className="py-2 px-5 font-semibold text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors">
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;