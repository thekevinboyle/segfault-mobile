import { type SkRuntimeEffect } from '@shopify/react-native-skia'
import {
  RGBSplitShader,
  PixelateShader,
  ScanLinesShader,
  PosterizeShader,
  ChromaticShader,
  NoiseShader,
  EdgeDetectionShader,
  ColorGradeShader,
  VHSShader,
  InvertShader,
  DitherShader,
  BlockDisplaceShader,
  StaticDisplaceShader,
  LensDistortionShader,
  DotsShader,
  PixelSortShader,
  SonifyShader,
  FeedbackShader,
  HalftoneShader,
} from './shaders'

// Map effect IDs to their RuntimeEffect shaders
export const SHADER_MAP: Record<string, SkRuntimeEffect | null> = {
  rgb_split: RGBSplitShader,
  chromatic: ChromaticShader,
  posterize: PosterizeShader,
  color_grade: ColorGradeShader,
  block_displace: BlockDisplaceShader,
  static_displace: StaticDisplaceShader,
  pixelate: PixelateShader,
  lens: LensDistortionShader,
  scan_lines: ScanLinesShader,
  vhs: VHSShader,
  noise: NoiseShader,
  dither: DitherShader,
  edges: EdgeDetectionShader,
  feedback: FeedbackShader,
  invert: InvertShader,
  dots: DotsShader,
  halftone: HalftoneShader,
  pixel_sort: PixelSortShader,
  sonify: SonifyShader,
}

// Map effect IDs to uniform builders
export const UNIFORM_BUILDERS: Record<string, (params: Record<string, number>, resolution: [number, number], time: number) => number[]> = {
  rgb_split: (p, res) => [...res, p.amount ?? 1, p.mix ?? 1],
  chromatic: (p, res) => [...res, p.intensity ?? 1, p.mix ?? 1],
  posterize: (p) => [p.levels ?? 4, p.mix ?? 1],
  color_grade: (p) => [p.brightness ?? 0, p.contrast ?? 1, p.saturation ?? 1, p.mix ?? 1],
  block_displace: (p, res, t) => [...res, p.blockSize ?? 0.05, p.displaceChance ?? 0.1, p.displaceDistance ?? 0.02, t, p.mix ?? 1],
  static_displace: (p, res, t) => [...res, p.intensity ?? 0.3, p.scale ?? 20, t, p.mix ?? 1],
  pixelate: (p, res) => [...res, p.pixelSize ?? 8, p.mix ?? 1],
  lens: (p, res) => [...res, p.curvature ?? 0.2, p.vignette ?? 0.3, p.mix ?? 1],
  scan_lines: (p, res) => [...res, p.lineCount ?? 300, p.lineOpacity ?? 0.15, p.mix ?? 1],
  vhs: (p, res, t) => [...res, t, p.tearIntensity ?? 0.5, p.noiseAmount ?? 0.05, p.mix ?? 1],
  noise: (p, res, t) => [...res, p.amount ?? 0.1, t, p.mix ?? 1],
  dither: (p, res) => [...res, p.gridSize ?? 4, p.mix ?? 1],
  edges: (p, res) => [...res, p.threshold ?? 30, p.mix ?? 1],
  feedback: (p, res) => [...res, p.zoom ?? 1.02, p.rotation ?? 0.5, p.hueShift ?? 5, p.decay ?? 0.92, p.mix ?? 1],
  invert: (p) => [p.mix ?? 1],
  dots: (p, res) => [...res, p.gridSize ?? 8, p.dotScale ?? 0.8, p.mix ?? 1],
  halftone: (p, res) => [...res, p.dotSize ?? 8, p.angle ?? 0.4, p.mix ?? 1],
  pixel_sort: (p, res, t) => [...res, p.threshold ?? 0.3, p.streakLength ?? 120, p.intensity ?? 0.8, t, p.mix ?? 1],
  sonify: (p, res) => [...res, p.sampleRate ?? 0.5, p.bitDepth ?? 4, p.drive ?? 0.15, p.mix ?? 1],
}

// Effect display info for the grid UI — organized by page
export const EFFECT_PAGES: { name: string; effects: { id: string; label: string; color: string }[] }[] = [
  {
    name: 'GLITCH',
    effects: [
      { id: 'rgb_split', label: 'RGB', color: '#0891b2' },
      { id: 'chromatic', label: 'CHROMA', color: '#6366f1' },
      { id: 'posterize', label: 'POSTER', color: '#dc2626' },
      { id: 'color_grade', label: 'GRADE', color: '#ea580c' },
      { id: 'block_displace', label: 'BLOCK', color: '#a855f7' },
      { id: 'static_displace', label: 'STATIC', color: '#8b5cf6' },
      { id: 'pixelate', label: 'PIXEL', color: '#d946ef' },
      { id: 'lens', label: 'LENS', color: '#0284c7' },
      { id: 'scan_lines', label: 'SCAN', color: '#65a30d' },
      { id: 'vhs', label: 'VHS', color: '#059669' },
      { id: 'noise', label: 'NOISE', color: '#84cc16' },
      { id: 'dither', label: 'DITHER', color: '#22c55e' },
      { id: 'edges', label: 'EDGES', color: '#f59e0b' },
      { id: 'feedback', label: 'FDBK', color: '#d97706' },
      { id: 'invert', label: 'INVERT', color: '#8b5cf6' },
      { id: 'dots', label: 'DOTS', color: '#e5e5e5' },
    ],
  },
  {
    name: 'DESTROY',
    effects: [
      { id: 'halftone', label: 'HALF', color: '#fbbf24' },
      { id: 'pixel_sort', label: 'SORT', color: '#ff3366' },
      { id: 'sonify', label: 'SONIFY', color: '#ff6600' },
    ],
  },
]

export const EFFECT_INFO: Record<string, { label: string; color: string }> = {}
for (const page of EFFECT_PAGES) {
  for (const effect of page.effects) {
    EFFECT_INFO[effect.id] = { label: effect.label, color: effect.color }
  }
}

export const EFFECT_IDS = Object.keys(SHADER_MAP)
