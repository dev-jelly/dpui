import { create } from 'zustand';
import { invoke } from '@tauri-apps/api/core';
import type { Display, DisplayConfig, Preset, PresetStore } from '../types/display';

/**
 * Zustand store interface for display management.
 * Manages display state, presets, and all display-related operations.
 */
interface DisplayState {
  /** Current list of displays from displayplacer */
  displays: Display[];
  /** Saved preset configurations */
  presets: Preset[];
  /** Currently selected preset */
  selectedPreset: Preset | null;
  /** Loading state for async operations */
  loading: boolean;
  /** Error message from last operation */
  error: string | null;

  // Actions
  /** Fetch current display configuration from displayplacer */
  fetchDisplays: () => Promise<void>;
  /** Apply a displayplacer configuration string */
  applyConfig: (config: string) => Promise<void>;
  /** Toggle a display's enabled/disabled state */
  toggleDisplayEnabled: (id: string, enabled: boolean) => Promise<void>;
  /** Load saved presets from storage */
  fetchPresets: () => Promise<void>;
  /** Add a new preset configuration */
  addPreset: (name: string, config: string, hotkey?: string) => Promise<void>;
  /** Delete a preset by ID */
  deletePreset: (id: string) => Promise<void>;
  /** Update an existing preset */
  updatePreset: (id: string, name?: string, config?: string, hotkey?: string) => Promise<void>;
  /** Select a preset for viewing/editing */
  selectPreset: (preset: Preset | null) => void;
  /** Update display position locally (for drag operations) */
  updateDisplayPosition: (id: string, origin: [number, number]) => void;
}

/**
 * Global display state management store.
 *
 * This Zustand store handles all display-related state and operations,
 * serving as the bridge between the React frontend and Tauri backend.
 * All displayplacer operations are invoked through this store.
 *
 * Features:
 * - Display configuration management
 * - Preset CRUD operations
 * - Error handling and loading states
 * - Optimistic UI updates for drag operations
 *
 * @example
 * ```tsx
 * const { displays, fetchDisplays, toggleDisplayEnabled } = useDisplayStore();
 *
 * // Fetch displays on mount
 * useEffect(() => {
 *   fetchDisplays();
 * }, []);
 *
 * // Toggle display state
 * const handleToggle = (id: string) => {
 *   toggleDisplayEnabled(id, false);
 * };
 * ```
 */
export const useDisplayStore = create<DisplayState>((set, get) => ({
  displays: [],
  presets: [],
  selectedPreset: null,
  loading: false,
  error: null,

  fetchDisplays: async () => {
    set({ loading: true, error: null });
    try {
      const config = await invoke<DisplayConfig>('get_displays');
      set({ displays: config.displays, loading: false });
    } catch (error) {
      const errorMessage = String(error);
      console.error('[Display Fetch Error]', {
        operation: 'fetchDisplays',
        error: errorMessage,
        timestamp: new Date().toISOString(),
      });
      set({ error: errorMessage, loading: false });
    }
  },

  applyConfig: async (config: string) => {
    set({ loading: true, error: null });
    try {
      await invoke('apply_config', { config });
      // Refresh displays after applying config
      await get().fetchDisplays();
      set({ loading: false });
    } catch (error) {
      set({ error: String(error), loading: false });
    }
  },

  toggleDisplayEnabled: async (id: string, enabled: boolean) => {
    set({ loading: true, error: null });
    try {
      await invoke('toggle_display_enabled', { id, enabled });
      // Refresh displays after toggling
      await get().fetchDisplays();
      set({ loading: false });
    } catch (error) {
      const errorMessage = String(error);
      console.error('[Display Toggle Error]', {
        operation: enabled ? 'enable' : 'disable',
        displayId: id,
        error: errorMessage,
        timestamp: new Date().toISOString(),
      });
      set({ error: errorMessage, loading: false });
    }
  },

  fetchPresets: async () => {
    set({ loading: true, error: null });
    try {
      const presetStore = await invoke<PresetStore>('load_presets');
      set({ presets: presetStore.presets, loading: false });
    } catch (error) {
      set({ error: String(error), loading: false });
    }
  },

  addPreset: async (name: string, config: string, hotkey?: string) => {
    set({ loading: true, error: null });
    try {
      await invoke('add_preset', { name, config, hotkey });
      await get().fetchPresets();
      // Update system tray menu
      await invoke('update_tray_presets');
      set({ loading: false });
    } catch (error) {
      set({ error: String(error), loading: false });
    }
  },

  deletePreset: async (id: string) => {
    set({ loading: true, error: null });
    try {
      await invoke('delete_preset', { id });
      await get().fetchPresets();
      // Update system tray menu
      await invoke('update_tray_presets');
      set({ loading: false });
    } catch (error) {
      set({ error: String(error), loading: false });
    }
  },

  updatePreset: async (id: string, name?: string, config?: string, hotkey?: string) => {
    set({ loading: true, error: null });
    try {
      await invoke('update_preset', { id, name, config, hotkey });
      await get().fetchPresets();
      set({ loading: false });
    } catch (error) {
      set({ error: String(error), loading: false });
    }
  },

  selectPreset: (preset: Preset | null) => {
    set({ selectedPreset: preset });
  },

  updateDisplayPosition: (id: string, origin: [number, number]) => {
    set((state) => ({
      displays: state.displays.map((d) =>
        d.id === id ? { ...d, origin } : d
      ),
    }));
  },
}));
