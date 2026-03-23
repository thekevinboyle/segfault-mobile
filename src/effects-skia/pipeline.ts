import { Skia, type SkRuntimeEffect } from '@shopify/react-native-skia'
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
} from './shaders'

// Map effect IDs to their RuntimeEffect shaders
export const SHADER_MAP: Record<string, SkRuntimeEffect | null> = {
  rgb_split: RGBSplitShader,
  pixelate: PixelateShader,
  scan_lines: ScanLinesShader,
  posterize: PosterizeShader,
  chromatic: ChromaticShader,
  noise: NoiseShader,
  edges: EdgeDetectionShader,
  color_grade: ColorGradeShader,
  vhs: VHSShader,
  invert: InvertShader,
  dither: DitherShader,
}

// Map effect IDs to uniform builders
// Each function takes params and returns the flat uniform array expected by makeShaderWithChildren
export const UNIFORM_BUILDERS: Record<string, (params: Record<string, number>, resolution: [number, number], time: number) => number[]> = {
  rgb_split: (p, res) => [...res, p.amount ?? 1, p.mix ?? 1],
  pixelate: (p, res) => [...res, p.pixelSize ?? 8, p.mix ?? 1],
  scan_lines: (p, res) => [...res, p.lineCount ?? 300, p.lineOpacity ?? 0.15, p.mix ?? 1],
  posterize: (p) => [p.levels ?? 4, p.mix ?? 1],
  chromatic: (p, res) => [...res, p.intensity ?? 1, p.mix ?? 1],
  noise: (p, res, t) => [...res, p.amount ?? 0.1, t, p.mix ?? 1],
  edges: (p, res) => [...res, p.threshold ?? 30, p.mix ?? 1],
  color_grade: (p) => [p.brightness ?? 0, p.contrast ?? 1, p.saturation ?? 1, p.mix ?? 1],
  vhs: (p, res, t) => [...res, t, p.tearIntensity ?? 0.5, p.noiseAmount ?? 0.05, p.mix ?? 1],
  invert: (p) => [p.mix ?? 1],
  dither: (p, res) => [...res, p.gridSize ?? 4, p.mix ?? 1],
}

// Effect display info for the grid UI
export const EFFECT_INFO: Record<string, { label: string; color: string }> = {
  rgb_split: { label: 'RGB', color: '#0891b2' },
  pixelate: { label: 'PIXEL', color: '#d946ef' },
  scan_lines: { label: 'SCAN', color: '#65a30d' },
  posterize: { label: 'POSTER', color: '#dc2626' },
  chromatic: { label: 'CHROMA', color: '#6366f1' },
  noise: { label: 'NOISE', color: '#84cc16' },
  edges: { label: 'EDGES', color: '#f59e0b' },
  color_grade: { label: 'GRADE', color: '#ea580c' },
  vhs: { label: 'VHS', color: '#059669' },
  invert: { label: 'INVERT', color: '#8b5cf6' },
  dither: { label: 'DITHER', color: '#22c55e' },
}

export const EFFECT_IDS = Object.keys(SHADER_MAP)
