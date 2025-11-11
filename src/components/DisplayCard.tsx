import React from 'react';
import type { Display } from '../types/display';
import { ConfirmDialog } from './ConfirmDialog';
import { AlertDialog } from './AlertDialog';

/**
 * Props for the DisplayCard component.
 */
interface DisplayCardProps {
  /** Display information to render */
  display: Display;
  /** Scale factor for rendering (default: 0.1) */
  scale?: number;
  /** Callback when display position changes via drag */
  onPositionChange?: (origin: [number, number]) => void;
  /** Callback when display enabled state changes */
  onToggleEnabled?: (id: string, enabled: boolean) => void;
  /** Total number of currently enabled displays */
  enabledCount?: number;
}

/**
 * DisplayCard component - Interactive display representation
 *
 * Renders a draggable card representing a physical display/monitor.
 * Features include:
 * - Visual ON/OFF state indication
 * - Drag and drop positioning
 * - 15-second countdown confirmation for turning off displays
 * - Last display protection (prevents turning off all displays)
 * - Responsive hover and active states
 *
 * @component
 * @example
 * ```tsx
 * <DisplayCard
 *   display={displayData}
 *   scale={0.1}
 *   onPositionChange={(origin) => updatePosition(displayData.id, origin)}
 *   onToggleEnabled={(id, enabled) => toggleDisplay(id, enabled)}
 *   enabledCount={2}
 * />
 * ```
 */
export const DisplayCard: React.FC<DisplayCardProps> = ({
  display,
  scale = 0.1,
  onPositionChange,
  onToggleEnabled,
  enabledCount = 1,
}) => {
  const [width, height] = display.resolution.split('x').map(Number);
  const [isDragging, setIsDragging] = React.useState(false);
  const [dragOffset, setDragOffset] = React.useState({ x: 0, y: 0 });
  const [showConfirm, setShowConfirm] = React.useState(false);
  const [showAlert, setShowAlert] = React.useState(false);
  const [countdown, setCountdown] = React.useState(15);
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);

  const scaledWidth = width * scale;
  const scaledHeight = height * scale;
  const scaledX = display.origin[0] * scale;
  const scaledY = display.origin[1] * scale;

  /**
   * Handle mouse down event to start dragging.
   * Captures the initial mouse position relative to the display card.
   */
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!onPositionChange) return;

    setIsDragging(true);
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  React.useEffect(() => {
    if (!isDragging || !onPositionChange) return;

    const handleMouseMove = (e: MouseEvent) => {
      const container = document.getElementById('display-canvas');
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left - dragOffset.x) / scale;
      const y = (e.clientY - rect.top - dragOffset.y) / scale;

      onPositionChange([Math.round(x), Math.round(y)]);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset, scale, onPositionChange]);

  /**
   * Handle toggle button click for turning display ON/OFF.
   * Implements safety checks:
   * - Immediate activation for OFF displays
   * - Prevents disabling the last active display
   * - Shows 15-second confirmation dialog for turning OFF
   * - Auto-rollback on timeout
   */
  const handleToggleClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!onToggleEnabled) return;

    // If turning ON, do it immediately
    if (!display.enabled) {
      onToggleEnabled(display.id, true);
      return;
    }

    // If turning OFF, check if it's the last enabled display
    if (display.enabled && enabledCount <= 1) {
      setShowAlert(true);
      return;
    }

    // Show confirmation dialog for turning OFF
    setShowConfirm(true);
    setCountdown(15);

    // Start countdown timer
    let remainingTime = 15;
    timerRef.current = setInterval(() => {
      remainingTime -= 1;
      setCountdown(remainingTime);

      if (remainingTime <= 0) {
        handleCancelDisable();
      }
    }, 1000);
  };

  /**
   * Confirm display disable action.
   * Clears the countdown timer and executes the disable callback.
   */
  const handleConfirmDisable = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setShowConfirm(false);

    if (onToggleEnabled) {
      onToggleEnabled(display.id, false);
    }
  };

  /**
   * Cancel display disable action.
   * Clears the countdown timer and closes the confirmation dialog.
   * This is called either manually or automatically on timeout.
   */
  const handleCancelDisable = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setShowConfirm(false);
    setCountdown(15);
  };

  // Cleanup timer on unmount
  React.useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  return (
    <>
      <div
        className={`absolute border-4 rounded-xl shadow-xl
                    flex flex-col cursor-move transition-all duration-300
                    ${isDragging ? 'opacity-70 scale-105 shadow-2xl' : 'hover:shadow-2xl hover:scale-[1.02]'}
                    ${display.enabled
                      ? 'border-green-500 bg-gradient-to-br from-green-50 to-emerald-50'
                      : 'border-red-500 bg-gradient-to-br from-red-50 to-rose-50 opacity-60'}`}
        style={{
          left: `${scaledX}px`,
          top: `${scaledY}px`,
          width: `${scaledWidth}px`,
          height: `${scaledHeight}px`,
          transform: `rotate(${display.rotation}deg)`,
        }}
        onMouseDown={handleMouseDown}
      >
        {/* Status Badge */}
        <div className={`absolute top-0 left-0 right-0 py-1.5 text-center text-xs font-bold
                        rounded-t-lg shadow-sm transition-colors duration-300
                        ${display.enabled
                          ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                          : 'bg-gradient-to-r from-red-500 to-rose-500 text-white'}`}>
          {display.enabled ? '✓ 활성화됨 (ON)' : '✗ 비활성화됨 (OFF)'}
        </div>

        {/* Toggle Button */}
        {onToggleEnabled && (
          <button
            onClick={handleToggleClick}
            className={`absolute top-8 right-2 px-4 py-2 rounded-lg text-sm font-bold
                        transition-all duration-200 cursor-pointer z-10 shadow-lg
                        ${display.enabled
                          ? 'bg-red-600 text-white hover:bg-red-700 hover:scale-110 active:scale-95'
                          : 'bg-green-600 text-white hover:bg-green-700 hover:scale-110 active:scale-95'}`}
            title={display.enabled ? '디스플레이 끄기' : '디스플레이 켜기'}
          >
            {display.enabled ? '🔴 끄기' : '🟢 켜기'}
          </button>
        )}

        {/* Display Info */}
        <div className="flex-1 flex items-center justify-center text-center p-3 pt-10">
          <div>
            <div className="font-bold text-xl text-gray-900 mb-1">Display {display.id}</div>
            <div className="text-sm text-gray-700 font-semibold bg-white bg-opacity-50 px-3 py-1 rounded-full mb-2">
              {display.resolution}
            </div>
            <div className="text-xs text-gray-600 bg-white bg-opacity-40 px-2 py-1 rounded">
              위치: ({display.origin[0]}, {display.origin[1]})
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showConfirm}
        title="디스플레이 끄기"
        message={`Display ${display.id} (${display.resolution})를 끄시겠습니까?`}
        countdown={countdown}
        onConfirm={handleConfirmDisable}
        onCancel={handleCancelDisable}
      />

      {/* Alert Dialog */}
      <AlertDialog
        isOpen={showAlert}
        title="작업 불가"
        message="⚠️ 마지막 활성화된 디스플레이는 끌 수 없습니다."
        onClose={() => setShowAlert(false)}
      />
    </>
  );
};
