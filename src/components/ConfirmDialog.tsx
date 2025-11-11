import React, { useEffect } from 'react';

/**
 * Props for the ConfirmDialog component.
 */
interface ConfirmDialogProps {
  /** Controls dialog visibility */
  isOpen: boolean;
  /** Dialog title text */
  title: string;
  /** Main message to display */
  message: string;
  /** Current countdown value in seconds */
  countdown: number;
  /** Callback when user confirms the action */
  onConfirm: () => void;
  /** Callback when user cancels or timeout occurs */
  onCancel: () => void;
}

/**
 * ConfirmDialog component - 15-second countdown confirmation modal
 *
 * Displays a confirmation dialog with an auto-rollback countdown timer.
 * Used specifically for dangerous operations like turning off displays.
 * Features:
 * - 15-second countdown with visual indicator
 * - Auto-cancel on timeout for safety
 * - ESC key handling for quick cancel
 * - Gradient styling for visual emphasis
 *
 * @component
 * @example
 * ```tsx
 * <ConfirmDialog
 *   isOpen={showConfirm}
 *   title="디스플레이 끄기"
 *   message="Display를 끄시겠습니까?"
 *   countdown={15}
 *   onConfirm={handleConfirm}
 *   onCancel={handleCancel}
 * />
 * ```
 */
export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  countdown,
  onConfirm,
  onCancel,
}) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onCancel();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4 animate-scaleIn">
        {/* Header */}
        <div className="mb-4 flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-2xl">⚠️</span>
          </div>
          <h3 className="text-xl font-bold text-gray-900">{title}</h3>
        </div>

        {/* Message */}
        <div className="mb-6">
          <p className="text-gray-700 text-base">{message}</p>
          <div className="mt-4 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-400 rounded-lg shadow-sm">
            <p className="text-sm text-yellow-800 font-medium">
              ⏰ 15초 내에 확인하지 않으면 자동으로 원복됩니다.
            </p>
          </div>
        </div>

        {/* Countdown */}
        <div className="mb-6 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-red-500 to-rose-600 text-white font-bold text-3xl shadow-lg animate-pulse">
            {countdown}
          </div>
          <p className="text-xs text-gray-500 mt-2">초 남음</p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-all duration-200 font-medium shadow-sm hover:shadow active:scale-95"
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-lg hover:from-red-700 hover:to-rose-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg active:scale-95"
          >
            확인 (화면 끄기)
          </button>
        </div>
      </div>
    </div>
  );
};
