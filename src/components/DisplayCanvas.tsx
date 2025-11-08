import React from 'react';
import { DisplayCard } from './DisplayCard';
import { useDisplayStore } from '../store/useDisplayStore';

export const DisplayCanvas: React.FC = () => {
  const { displays, updateDisplayPosition } = useDisplayStore();

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
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">
        Current Display Layout
      </h2>

      <div className="flex justify-center">
        <div
          id="display-canvas"
          className="relative bg-gray-50 border-2 border-gray-300 rounded-lg"
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
            />
          ))}
        </div>
      </div>

      <div className="mt-4 text-sm text-gray-600 text-center">
        {displays.length > 0 ? (
          <p>Drag displays to reposition them</p>
        ) : (
          <p>Loading displays...</p>
        )}
      </div>
    </div>
  );
};
