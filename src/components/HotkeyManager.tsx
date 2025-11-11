import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { useDisplayStore } from '../store/useDisplayStore';

/**
 * Interface for hotkey binding data.
 */
interface HotkeyBinding {
  presetId: string;
  shortcut: string;
  description: string;
}

/**
 * HotkeyManager component - System-wide keyboard shortcut configuration
 *
 * Manages global hotkeys for quick preset activation.
 * Features:
 * - Hotkey assignment for each preset
 * - Conflict detection and validation
 * - Visual feedback on activation
 * - Customizable shortcuts
 *
 * @component
 */
export const HotkeyManager: React.FC = () => {
  const { presets, applyConfig } = useDisplayStore();
  const [hotkeys, setHotkeys] = useState<Map<string, string>>(new Map());
  const [editingPreset, setEditingPreset] = useState<string | null>(null);
  const [newShortcut, setNewShortcut] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Load existing hotkeys on mount
  useEffect(() => {
    loadHotkeys();

    // Listen for hotkey activation events
    const unlistenHotkey = listen('apply-preset-hotkey', (event) => {
      const presetId = event.payload as string;
      handlePresetActivation(presetId);
    });

    // Listen for hotkey registration confirmations
    const unlistenRegistered = listen('hotkey-registered', (event) => {
      const binding = event.payload as HotkeyBinding;
      console.log('[Hotkey] Registered:', binding);
    });

    return () => {
      unlistenHotkey.then(fn => fn());
      unlistenRegistered.then(fn => fn());
    };
  }, []);

  /**
   * Load existing hotkey bindings.
   */
  const loadHotkeys = async () => {
    try {
      const bindings = await invoke<HotkeyBinding[]>('get_registered_hotkeys');
      const hotkeyMap = new Map<string, string>();
      bindings.forEach(binding => {
        hotkeyMap.set(binding.presetId, binding.shortcut);
      });
      setHotkeys(hotkeyMap);
    } catch (err) {
      console.error('[Hotkey] Failed to load hotkeys:', err);
    }
  };

  /**
   * Handle preset activation via hotkey.
   */
  const handlePresetActivation = (presetId: string) => {
    const preset = presets.find(p => p.id === presetId);
    if (preset) {
      applyConfig(preset.config);
      showToastMessage(`✅ 프리셋 "${preset.name}" 적용됨`);
    }
  };

  /**
   * Show toast notification.
   */
  const showToastMessage = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  /**
   * Start editing hotkey for a preset.
   */
  const startEditing = (presetId: string) => {
    setEditingPreset(presetId);
    setNewShortcut(hotkeys.get(presetId) || '');
    setError(null);
  };

  /**
   * Cancel hotkey editing.
   */
  const cancelEditing = () => {
    setEditingPreset(null);
    setNewShortcut('');
    setError(null);
  };

  /**
   * Save hotkey assignment.
   */
  const saveHotkey = async (presetId: string) => {
    if (!newShortcut) {
      // Remove hotkey
      await removeHotkey(presetId);
      return;
    }

    try {
      // Validate format
      await invoke('validate_hotkey_format', { shortcutStr: newShortcut });

      // Check availability
      const available = await invoke<boolean>('is_hotkey_available', {
        shortcutStr: newShortcut
      });

      if (!available) {
        setError('이 단축키는 이미 사용 중입니다');
        return;
      }

      // Unregister old hotkey if exists
      const oldShortcut = hotkeys.get(presetId);
      if (oldShortcut) {
        await invoke('unregister_hotkey', { shortcutStr: oldShortcut });
      }

      // Register new hotkey
      await invoke('register_preset_hotkey', {
        presetId,
        shortcutStr: newShortcut
      });

      // Update local state
      const newHotkeys = new Map(hotkeys);
      newHotkeys.set(presetId, newShortcut);
      setHotkeys(newHotkeys);

      showToastMessage(`✅ 단축키 설정됨: ${newShortcut}`);
      cancelEditing();
    } catch (err) {
      setError(String(err));
    }
  };

  /**
   * Remove hotkey assignment.
   */
  const removeHotkey = async (presetId: string) => {
    const shortcut = hotkeys.get(presetId);
    if (!shortcut) return;

    try {
      await invoke('unregister_hotkey', { shortcutStr: shortcut });

      const newHotkeys = new Map(hotkeys);
      newHotkeys.delete(presetId);
      setHotkeys(newHotkeys);

      showToastMessage('✅ 단축키 제거됨');
      cancelEditing();
    } catch (err) {
      setError(String(err));
    }
  };

  /**
   * Format shortcut key for display.
   */
  const formatShortcut = (shortcut: string): string => {
    return shortcut
      .replace('Cmd', '⌘')
      .replace('Ctrl', '⌃')
      .replace('Alt', '⌥')
      .replace('Shift', '⇧')
      .replace('+', '');
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg shadow-md flex items-center justify-center">
          <span className="text-xl">⌨️</span>
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">키보드 단축키</h2>
          <p className="text-sm text-gray-500">프리셋을 빠르게 적용할 수 있는 단축키 설정</p>
        </div>
      </div>

      {/* Preset List */}
      <div className="space-y-3">
        {presets.map((preset) => (
          <div
            key={preset.id}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex-1">
              <div className="font-medium text-gray-900">{preset.name}</div>
              {hotkeys.has(preset.id) && editingPreset !== preset.id && (
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-mono">
                    {formatShortcut(hotkeys.get(preset.id)!)}
                  </span>
                </div>
              )}
            </div>

            {editingPreset === preset.id ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newShortcut}
                  onChange={(e) => setNewShortcut(e.target.value)}
                  placeholder="예: Cmd+Shift+1"
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  autoFocus
                />
                <button
                  onClick={() => saveHotkey(preset.id)}
                  className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                >
                  저장
                </button>
                <button
                  onClick={cancelEditing}
                  className="px-3 py-1.5 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition-colors text-sm font-medium"
                >
                  취소
                </button>
              </div>
            ) : (
              <button
                onClick={() => startEditing(preset.id)}
                className="px-4 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
              >
                {hotkeys.has(preset.id) ? '변경' : '설정'}
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Help Text */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-xs text-blue-700">
          💡 단축키 예시: Cmd+Shift+1, Ctrl+Alt+D, Cmd+Opt+P
        </p>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-4 right-4 px-4 py-3 bg-gray-900 text-white rounded-lg shadow-xl animate-slideIn z-50">
          {toastMessage}
        </div>
      )}
    </div>
  );
};