import React from 'react';
import type { Display } from '../types/display';

interface DisplayCardProps {
  display: Display;
  scale?: number;
  onPositionChange?: (origin: [number, number]) => void;
}

export const DisplayCard: React.FC<DisplayCardProps> = ({
  display,
  scale = 0.1,
  onPositionChange,
}) => {
  const [width, height] = display.resolution.split('x').map(Number);
  const [isDragging, setIsDragging] = React.useState(false);
  const [dragOffset, setDragOffset] = React.useState({ x: 0, y: 0 });

  const scaledWidth = width * scale;
  const scaledHeight = height * scale;
  const scaledX = display.origin[0] * scale;
  const scaledY = display.origin[1] * scale;

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

  return (
    <div
      className={`absolute border-2 border-blue-500 bg-blue-100 rounded-lg shadow-lg
                  flex items-center justify-center cursor-move transition-all
                  ${isDragging ? 'opacity-70 scale-105' : 'hover:shadow-xl'}
                  ${!display.enabled ? 'opacity-50 border-gray-400 bg-gray-200' : ''}`}
      style={{
        left: `${scaledX}px`,
        top: `${scaledY}px`,
        width: `${scaledWidth}px`,
        height: `${scaledHeight}px`,
        transform: `rotate(${display.rotation}deg)`,
      }}
      onMouseDown={handleMouseDown}
    >
      <div className="text-center p-2">
        <div className="font-bold text-lg">Display {display.id}</div>
        <div className="text-sm text-gray-600">{display.resolution}</div>
        <div className="text-xs text-gray-500 mt-1">
          ({display.origin[0]}, {display.origin[1]})
        </div>
      </div>
    </div>
  );
};
