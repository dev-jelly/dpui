import { create } from 'zustand';
import { invoke } from '@tauri-apps/api/core';
import type { Display, DisplayConfig, Preset, PresetStore } from '../types/display';

interface DisplayState {
  displays: Display[];
  presets: Preset[];
  selectedPreset: Preset | null;
  loading: boolean;
  error: string | null;

  // Actions
  fetchDisplays: () => Promise<void>;
  applyConfig: (config: string) => Promise<void>;
  fetchPresets: () => Promise<void>;
  addPreset: (name: string, config: string, hotkey?: string) => Promise<void>;
  deletePreset: (id: string) => Promise<void>;
  updatePreset: (id: string, name?: string, config?: string, hotkey?: string) => Promise<void>;
  selectPreset: (preset: Preset | null) => void;
  updateDisplayPosition: (id: string, origin: [number, number]) => void;
}

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
      set({ error: String(error), loading: false });
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
