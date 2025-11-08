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
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Saved Presets</h2>
        <button
          onClick={handleRefresh}
          className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
        >
          🔄 Refresh
        </button>
      </div>

      <div className="space-y-2 mb-4">
        {presets.length === 0 ? (
          <div className="text-gray-500 text-center py-8">
            No presets saved yet
          </div>
        ) : (
          presets.map((preset) => (
            <div
              key={preset.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex-1">
                <div className="font-medium text-gray-800">{preset.name}</div>
                {preset.hotkey && (
                  <div className="text-sm text-gray-500">
                    Hotkey: {preset.hotkey}
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleApplyPreset(preset)}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors"
                >
                  Apply
                </button>
                <button
                  onClick={() => deletePreset(preset.id)}
                  className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-md transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {isAddingPreset ? (
        <div className="border-2 border-blue-300 rounded-lg p-4 bg-blue-50">
          <h3 className="font-medium text-gray-800 mb-3">Save Current Layout</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preset Name
              </label>
              <input
                type="text"
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                placeholder="e.g., Dual Monitor Setup"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hotkey (optional)
              </label>
              <input
                type="text"
                value={presetHotkey}
                onChange={(e) => setPresetHotkey(e.target.value)}
                placeholder="e.g., Cmd+Shift+1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSaveCurrentLayout}
                className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors"
              >
                Save Preset
              </button>
              <button
                onClick={() => {
                  setIsAddingPreset(false);
                  setPresetName('');
                  setPresetHotkey('');
                }}
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-md transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsAddingPreset(true)}
          className="w-full px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-md transition-colors font-medium"
        >
          + Save Current Layout
        </button>
      )}
    </div>
  );
};
