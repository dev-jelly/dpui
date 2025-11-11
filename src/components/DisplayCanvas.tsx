import React from 'react';
import { DisplayCard } from './DisplayCard';
import { useDisplayStore } from '../store/useDisplayStore';

export const DisplayCanvas: React.FC = () => {
  const { displays, updateDisplayPosition, toggleDisplayEnabled } = useDisplayStore();

  // Count enabled displays
  const enabledCount = React.useMemo(() => {
    return displays.filter(d => d.enabled).length;
  }, [displays]);

  // Calculate canvas bounds
  const bounds = React.useMemo(() => {
    if (displays.length === 0) {
      return { minX: 0, minY: 0, maxX: 2560, maxY: 1440 };
    }

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    displays.forEach((display) => {
      const [x, y] = display.origin;
      const [width, height] = display.resolution.split('x').map(Number);

      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x + width);
      maxY = Math.max(maxY, y + height);
    });

    return { minX, minY, maxX, maxY };
  }, [displays]);

  const canvasWidth = bounds.maxX - bounds.minX;
  const canvasHeight = bounds.maxY - bounds.minY;
  const scale = Math.min(500 / canvasWidth, 400 / canvasHeight, 0.15);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
            <span className="text-xl">📐</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              디스플레이 레이아웃
            </h2>
            <p className="text-xs text-gray-500">
              활성화: {enabledCount} / {displays.length}개
            </p>
          </div>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm font-medium flex items-center gap-2"
        >
          <span>🔄</span> 새로고침
        </button>
      </div>

      <div className="flex justify-center">
        <div
          id="display-canvas"
          className="relative bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 rounded-xl shadow-inner"
          style={{
            width: `${canvasWidth * scale + 40}px`,
            height: `${canvasHeight * scale + 40}px`,
            minWidth: '500px',
            minHeight: '400px',
          }}
        >
          {displays.map((display) => (
            <DisplayCard
              key={display.id}
              display={{
                ...display,
                origin: [
                  display.origin[0] - bounds.minX + 20,
                  display.origin[1] - bounds.minY + 20,
                ],
              }}
              scale={scale}
              onPositionChange={(newOrigin) => {
                const actualOrigin: [number, number] = [
                  newOrigin[0] + bounds.minX - 20,
                  newOrigin[1] + bounds.minY - 20,
                ];
                updateDisplayPosition(display.id, actualOrigin);
              }}
              onToggleEnabled={toggleDisplayEnabled}
              enabledCount={enabledCount}
            />
          ))}
        </div>
      </div>

      <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
        {displays.length > 0 ? (
          <div className="flex items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-lg">🖱️</span>
              <span className="text-gray-700">드래그하여 위치 변경</span>
            </div>
            <div className="w-px h-4 bg-gray-300"></div>
            <div className="flex items-center gap-2">
              <span className="text-lg">👆</span>
              <span className="text-gray-700">버튼 클릭으로 켜기/끄기</span>
            </div>
          </div>
        ) : (
          <p className="text-center text-gray-600">디스플레이 정보를 불러오는 중...</p>
        )}
      </div>
    </div>
  );
};
