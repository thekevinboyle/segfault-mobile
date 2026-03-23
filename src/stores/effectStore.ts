import { create } from 'zustand'

export interface EffectState {
  enabled: boolean
  params: Record<string, number>
}

interface EffectStoreState {
  effects: Record<string, EffectState>

  toggleEffect: (id: string) => void
  setEffectEnabled: (id: string, enabled: boolean) => void
  updateParam: (id: string, key: string, value: number) => void
  getEnabledEffects: () => string[]
}

const INITIAL_EFFECTS: Record<string, EffectState> = {
  rgb_split: { enabled: false, params: { amount: 1.0, mix: 1.0 } },
  pixelate: { enabled: false, params: { pixelSize: 8.0, mix: 1.0 } },
  scan_lines: { enabled: false, params: { lineCount: 300, lineOpacity: 0.15, mix: 1.0 } },
  posterize: { enabled: false, params: { levels: 4, mix: 1.0 } },
  chromatic: { enabled: false, params: { intensity: 1.0, mix: 1.0 } },
  noise: { enabled: false, params: { amount: 0.1, mix: 1.0 } },
  edges: { enabled: false, params: { threshold: 30, mix: 1.0 } },
  color_grade: { enabled: false, params: { brightness: 0, contrast: 1, saturation: 1, mix: 1.0 } },
  vhs: { enabled: false, params: { tearIntensity: 0.5, noiseAmount: 0.05, mix: 1.0 } },
  invert: { enabled: false, params: { mix: 1.0 } },
  dither: { enabled: false, params: { gridSize: 4, mix: 1.0 } },
}

export const useEffectStore = create<EffectStoreState>((set, get) => ({
  effects: { ...INITIAL_EFFECTS },

  toggleEffect: (id) => set((state) => ({
    effects: {
      ...state.effects,
      [id]: { ...state.effects[id], enabled: !state.effects[id]?.enabled },
    },
  })),

  setEffectEnabled: (id, enabled) => set((state) => ({
    effects: {
      ...state.effects,
      [id]: { ...state.effects[id], enabled },
    },
  })),

  updateParam: (id, key, value) => set((state) => ({
    effects: {
      ...state.effects,
      [id]: {
        ...state.effects[id],
        params: { ...state.effects[id]?.params, [key]: value },
      },
    },
  })),

  getEnabledEffects: () => {
    const { effects } = get()
    return Object.entries(effects)
      .filter(([, s]) => s.enabled)
      .map(([id]) => id)
  },
}))
