export interface Display {
  id: string;
  resolution: string;
  origin: [number, number];
  rotation: number;
  enabled: boolean;
}

export interface DisplayConfig {
  displays: Display[];
  raw_command: string;
}

export interface Preset {
  id: string;
  name: string;
  config: string;
  hotkey?: string;
  created_at: string;
}

export interface PresetStore {
  version: string;
  presets: Preset[];
}
