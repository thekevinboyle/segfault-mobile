import { create } from 'zustand'

export interface EffectState {
  enabled: boolean
  params: Record<string, number>
}

interface EffectStoreState {
  effects: Record<string, EffectState>
  currentPage: number

  toggleEffect: (id: string) => void
  setEffectEnabled: (id: string, enabled: boolean) => void
  updateParam: (id: string, key: string, value: number) => void
  setPage: (page: number) => void
  nextPage: () => void
  prevPage: () => void
}

const INITIAL_EFFECTS: Record<string, EffectState> = {
  // Glitch page
  rgb_split: { enabled: false, params: { amount: 1.0, mix: 1.0 } },
  chromatic: { enabled: false, params: { intensity: 1.0, mix: 1.0 } },
  posterize: { enabled: false, params: { levels: 4, mix: 1.0 } },
  color_grade: { enabled: false, params: { brightness: 0, contrast: 1, saturation: 1, mix: 1.0 } },
  block_displace: { enabled: false, params: { blockSize: 0.05, displaceChance: 0.1, displaceDistance: 0.02, mix: 1.0 } },
  static_displace: { enabled: false, params: { intensity: 0.3, scale: 20, mix: 1.0 } },
  pixelate: { enabled: false, params: { pixelSize: 8, mix: 1.0 } },
  lens: { enabled: false, params: { curvature: 0.2, vignette: 0.3, mix: 1.0 } },
  scan_lines: { enabled: false, params: { lineCount: 300, lineOpacity: 0.15, mix: 1.0 } },
  vhs: { enabled: false, params: { tearIntensity: 0.5, noiseAmount: 0.05, mix: 1.0 } },
  noise: { enabled: false, params: { amount: 0.1, mix: 1.0 } },
  dither: { enabled: false, params: { gridSize: 4, mix: 1.0 } },
  edges: { enabled: false, params: { threshold: 30, mix: 1.0 } },
  feedback: { enabled: false, params: { zoom: 1.02, rotation: 0.5, hueShift: 5, decay: 0.92, mix: 1.0 } },
  invert: { enabled: false, params: { mix: 1.0 } },
  dots: { enabled: false, params: { gridSize: 8, dotScale: 0.8, mix: 1.0 } },
  // Destroy page
  halftone: { enabled: false, params: { dotSize: 8, angle: 0.4, mix: 1.0 } },
  pixel_sort: { enabled: false, params: { threshold: 0.3, streakLength: 120, intensity: 0.8, mix: 1.0 } },
  sonify: { enabled: false, params: { sampleRate: 0.5, bitDepth: 4, drive: 0.15, mix: 1.0 } },
}

export const useEffectStore = create<EffectStoreState>((set, get) => ({
  effects: { ...INITIAL_EFFECTS },
  currentPage: 0,

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

  setPage: (page) => set({ currentPage: page }),
  nextPage: () => set((state) => ({ currentPage: Math.min(1, state.currentPage + 1) })),
  prevPage: () => set((state) => ({ currentPage: Math.max(0, state.currentPage - 1) })),
}))
