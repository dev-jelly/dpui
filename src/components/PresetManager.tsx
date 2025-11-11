import React from 'react';
import { useDisplayStore } from '../store/useDisplayStore';
import type { Preset } from '../types/display';

export const PresetManager: React.FC = () => {
  const {
    presets,
    displays,
    applyConfig,
    addPreset,
    deletePreset,
    fetchDisplays,
  } = useDisplayStore();

  const [isAddingPreset, setIsAddingPreset] = React.useState(false);
  const [presetName, setPresetName] = React.useState('');
  const [presetHotkey, setPresetHotkey] = React.useState('');

  const handleApplyPreset = async (preset: Preset) => {
    await applyConfig(preset.config);
  };

  const handleSaveCurrentLayout = async () => {
    if (!presetName.trim()) {
      alert('Please enter a preset name');
      return;
    }

    // Generate displayplacer command from current layout
    const config = generateDisplayplacerCommand(displays);
    await addPreset(presetName, config, presetHotkey || undefined);

    setPresetName('');
    setPresetHotkey('');
    setIsAddingPreset(false);
  };

  const handleRefresh = async () => {
    await fetchDisplays();
  };

  const generateDisplayplacerCommand = (displays: Array<{
    id: string;
    resolution: string;
    origin: [number, number];
    rotation: number;
  }>) => {
    const configs = displays.map((d) => {
      return `"id:${d.id} res:${d.resolution} origin:(${d.origin[0]},${d.origin[1]}) degree:${d.rotation}"`;
    });

    return `displayplacer ${configs.join(' ')}`;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <span className="text-xl">💾</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">저장된 프리셋</h2>
            <p className="text-xs text-gray-500">{presets.length}개 프리셋</p>
          </div>
        </div>
        <button
          onClick={handleRefresh}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all duration-200 text-sm font-medium flex items-center gap-2 shadow-sm hover:shadow active:scale-95"
        >
          <span>🔄</span> 새로고침
        </button>
      </div>

      <div className="space-y-3 mb-6">
        {presets.length === 0 ? (
          <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-dashed border-gray-300">
            <div className="text-4xl mb-3">📦</div>
            <p className="text-gray-500 font-medium">아직 저장된 프리셋이 없습니다</p>
            <p className="text-sm text-gray-400 mt-1">현재 레이아웃을 저장하여 빠르게 적용하세요</p>
          </div>
        ) : (
          presets.map((preset) => (
            <div
              key={preset.id}
              className="flex items-center justify-between p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 border border-gray-200 hover:border-blue-300 shadow-sm hover:shadow-md"
            >
              <div className="flex-1">
                <div className="font-semibold text-gray-900 text-lg">{preset.name}</div>
                {preset.hotkey && (
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs bg-white px-2 py-1 rounded border border-gray-300 text-gray-600 font-mono">
                      ⌨️ {preset.hotkey}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleApplyPreset(preset)}
                  className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg transition-all duration-200 font-medium shadow-md hover:shadow-lg active:scale-95"
                >
                  적용
                </button>
                <button
                  onClick={() => deletePreset(preset.id)}
                  className="px-3 py-2.5 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-all duration-200 font-bold shadow-sm hover:shadow active:scale-95"
                >
                  ✕
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {isAddingPreset ? (
        <div className="border-2 border-blue-300 rounded-xl p-5 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-inner">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">💾</span>
            <h3 className="font-bold text-gray-900">현재 레이아웃 저장</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                프리셋 이름
              </label>
              <input
                type="text"
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                placeholder="예: 듀얼 모니터 설정"
                className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all shadow-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                단축키 (선택사항)
              </label>
              <input
                type="text"
                value={presetHotkey}
                onChange={(e) => setPresetHotkey(e.target.value)}
                placeholder="예: Cmd+Shift+1"
                className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all shadow-sm"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleSaveCurrentLayout}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg transition-all duration-200 font-semibold shadow-md hover:shadow-lg active:scale-95"
              >
                저장
              </button>
              <button
                onClick={() => {
                  setIsAddingPreset(false);
                  setPresetName('');
                  setPresetHotkey('');
                }}
                className="px-5 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all duration-200 font-medium shadow-sm hover:shadow active:scale-95"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsAddingPreset(true)}
          className="w-full px-4 py-3.5 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl transition-all duration-200 font-semibold shadow-lg hover:shadow-xl active:scale-95 flex items-center justify-center gap-2"
        >
          <span className="text-xl">+</span> 현재 레이아웃 저장
        </button>
      )}
    </div>
  );
};
