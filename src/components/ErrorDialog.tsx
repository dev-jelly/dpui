import React, { useEffect } from 'react';

/**
 * Error type definitions for categorizing different error scenarios.
 */
export enum ErrorType {
  DISPLAYPLACER_NOT_FOUND = 'displayplacer_not_found',
  COMMAND_FAILED = 'command_failed',
  DISPLAY_NOT_FOUND = 'display_not_found',
  PERMISSION_ERROR = 'permission_error',
  INVALID_CONFIG = 'invalid_config',
  NETWORK_ERROR = 'network_error',
  UNKNOWN_ERROR = 'unknown_error',
}

/**
 * Props for the ErrorDialog component.
 */
interface ErrorDialogProps {
  /** Controls dialog visibility */
  isOpen: boolean;
  /** Error type for categorization */
  errorType?: ErrorType;
  /** Raw error message from the system */
  errorMessage: string;
  /** Additional context about the operation that failed */
  context?: string;
  /** Callback when dialog is closed */
  onClose: () => void;
  /** Optional retry callback */
  onRetry?: () => void;
}

/**
 * Error message translations and troubleshooting hints.
 */
const getErrorDetails = (errorType: ErrorType, errorMessage: string) => {
  switch (errorType) {
    case ErrorType.DISPLAYPLACER_NOT_FOUND:
      return {
        title: '🔧 displayplacer가 설치되지 않음',
        message: 'displayplacer CLI 도구가 시스템에 설치되어 있지 않습니다.',
        hints: [
          'Homebrew를 사용하여 설치: brew install displayplacer',
          '또는 직접 다운로드: https://github.com/jakehilborn/displayplacer',
          '설치 후 앱을 재시작하세요',
        ],
        canRetry: false,
      };

    case ErrorType.COMMAND_FAILED:
      return {
        title: '❌ 명령 실행 실패',
        message: 'displayplacer 명령이 실패했습니다.',
        hints: [
          '디스플레이 연결 상태를 확인하세요',
          '시스템 환경설정 > 디스플레이에서 설정을 확인하세요',
          '다른 디스플레이 관리 앱이 실행 중인지 확인하세요',
          `원본 오류: ${errorMessage}`,
        ],
        canRetry: true,
      };

    case ErrorType.DISPLAY_NOT_FOUND:
      return {
        title: '🖥️ 디스플레이를 찾을 수 없음',
        message: '요청한 디스플레이가 더 이상 연결되어 있지 않습니다.',
        hints: [
          '디스플레이가 올바르게 연결되어 있는지 확인하세요',
          '케이블 연결 상태를 점검하세요',
          'HDMI/DisplayPort/USB-C 포트를 확인하세요',
          '디스플레이 목록을 새로고침하세요',
        ],
        canRetry: true,
      };

    case ErrorType.PERMISSION_ERROR:
      return {
        title: '🔒 권한 오류',
        message: '시스템 권한이 필요합니다.',
        hints: [
          '시스템 환경설정 > 보안 및 개인 정보 보호를 확인하세요',
          'DPUI 앱에 접근성 권한을 부여하세요',
          '터미널 또는 앱에 전체 디스크 접근 권한이 필요할 수 있습니다',
          'macOS를 재시작한 후 다시 시도하세요',
        ],
        canRetry: false,
      };

    case ErrorType.INVALID_CONFIG:
      return {
        title: '⚠️ 잘못된 구성',
        message: '디스플레이 구성이 올바르지 않습니다.',
        hints: [
          '프리셋이 현재 디스플레이 설정과 호환되지 않을 수 있습니다',
          '디스플레이 해상도나 배치가 변경되었을 수 있습니다',
          '프리셋을 삭제하고 다시 저장해보세요',
          '현재 레이아웃을 새로운 프리셋으로 저장하세요',
        ],
        canRetry: false,
      };

    case ErrorType.NETWORK_ERROR:
      return {
        title: '🌐 네트워크 오류',
        message: '네트워크 연결에 문제가 있습니다.',
        hints: [
          '인터넷 연결을 확인하세요',
          '방화벽 설정을 확인하세요',
          'VPN 연결을 확인하세요',
        ],
        canRetry: true,
      };

    default:
      return {
        title: '⚠️ 알 수 없는 오류',
        message: '예상치 못한 오류가 발생했습니다.',
        hints: [
          '앱을 재시작해보세요',
          'displayplacer list 명령을 터미널에서 직접 실행해보세요',
          '시스템 로그를 확인하세요',
          `원본 오류: ${errorMessage}`,
        ],
        canRetry: true,
      };
  }
};

/**
 * Determine error type from error message.
 */
const determineErrorType = (errorMessage: string): ErrorType => {
  const message = errorMessage.toLowerCase();

  if (message.includes('displayplacer') && (message.includes('not found') || message.includes('command not found'))) {
    return ErrorType.DISPLAYPLACER_NOT_FOUND;
  }
  if (message.includes('permission') || message.includes('denied')) {
    return ErrorType.PERMISSION_ERROR;
  }
  if (message.includes('unable to find screen') || message.includes('display not found')) {
    return ErrorType.DISPLAY_NOT_FOUND;
  }
  if (message.includes('invalid') || message.includes('configuration')) {
    return ErrorType.INVALID_CONFIG;
  }
  if (message.includes('network') || message.includes('connection')) {
    return ErrorType.NETWORK_ERROR;
  }
  if (message.includes('failed to execute') || message.includes('command failed')) {
    return ErrorType.COMMAND_FAILED;
  }

  return ErrorType.UNKNOWN_ERROR;
};

/**
 * ErrorDialog component - Comprehensive error handling modal
 *
 * Displays detailed error information with Korean translations,
 * troubleshooting hints, and recovery suggestions.
 * Features:
 * - Automatic error type detection
 * - Korean error messages
 * - Actionable troubleshooting steps
 * - Optional retry functionality
 * - Error logging to console
 *
 * @component
 * @example
 * ```tsx
 * <ErrorDialog
 *   isOpen={showError}
 *   errorMessage={error}
 *   context="디스플레이 끄기 시도 중"
 *   onClose={() => setShowError(false)}
 *   onRetry={retryOperation}
 * />
 * ```
 */
export const ErrorDialog: React.FC<ErrorDialogProps> = ({
  isOpen,
  errorType,
  errorMessage,
  context,
  onClose,
  onRetry,
}) => {
  const type = errorType || determineErrorType(errorMessage);
  const details = getErrorDetails(type, errorMessage);

  useEffect(() => {
    if (isOpen) {
      // Log error for debugging
      console.error('[DPUI Error]', {
        type,
        message: errorMessage,
        context,
        timestamp: new Date().toISOString(),
      });
    }
  }, [isOpen, type, errorMessage, context]);

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
      <div className="bg-white rounded-xl shadow-2xl p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto animate-scaleIn">
        {/* Header */}
        <div className="mb-4 flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-rose-600 rounded-full flex items-center justify-center shadow-lg animate-pulse">
            <span className="text-2xl">⚠️</span>
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900">{details.title}</h3>
            {context && (
              <p className="text-sm text-gray-500 mt-1">작업: {context}</p>
            )}
          </div>
        </div>

        {/* Main Message */}
        <div className="mb-4">
          <p className="text-gray-700 text-base leading-relaxed">{details.message}</p>
        </div>

        {/* Troubleshooting Hints */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-900 mb-2">🔍 해결 방법:</h4>
          <ul className="space-y-2">
            {details.hints.map((hint, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">•</span>
                <span className="text-sm text-gray-600">{hint}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Error Details (Collapsible) */}
        <details className="mb-6 bg-gray-50 rounded-lg p-3">
          <summary className="text-sm font-medium text-gray-700 cursor-pointer hover:text-gray-900">
            🔧 기술적 세부사항
          </summary>
          <div className="mt-2 p-2 bg-gray-100 rounded text-xs font-mono text-gray-600 break-all">
            {errorMessage}
          </div>
        </details>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-all duration-200 font-medium shadow-sm hover:shadow active:scale-95"
          >
            닫기
          </button>
          {details.canRetry && onRetry && (
            <button
              onClick={() => {
                onClose();
                onRetry();
              }}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg active:scale-95"
            >
              🔄 다시 시도
            </button>
          )}
        </div>
      </div>
    </div>
  );
};