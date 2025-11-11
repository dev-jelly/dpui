import React, { useEffect } from 'react';

interface AlertDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onClose: () => void;
}

export const AlertDialog: React.FC<AlertDialogProps> = ({
  isOpen,
  title,
  message,
  onClose,
}) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4 animate-scaleIn">
        {/* Header */}
        <div className="mb-4 flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-rose-500 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-2xl">⚠️</span>
          </div>
          <h3 className="text-xl font-bold text-gray-900">{title}</h3>
        </div>

        {/* Message */}
        <div className="mb-6">
          <p className="text-gray-700 text-base leading-relaxed">{message}</p>
        </div>

        {/* Actions */}
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg active:scale-95"
            autoFocus
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
};
