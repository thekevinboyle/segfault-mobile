import { Skia } from '@shopify/react-native-skia'

// ═══════════════════════════════════════════════════════
// RGB SPLIT
// ═══════════════════════════════════════════════════════

export const RGBSplitShader = Skia.RuntimeEffect.Make(`
  uniform shader inputBuffer;
  uniform float2 resolution;
  uniform float amount;
  uniform float effectMix;

  half4 main(float2 coord) {
    float2 uv = coord / resolution;
    float2 rUv = uv + float2(0.01, 0.0) * amount;
    float2 bUv = uv + float2(-0.01, 0.0) * amount;

    half4 color = inputBuffer.eval(coord);
    float r = inputBuffer.eval(rUv * resolution).r;
    float b = inputBuffer.eval(bUv * resolution).b;

    half4 effectColor = half4(r, color.g, b, color.a);
    return mix(color, effectColor, effectMix);
  }
`)

export interface RGBSplitParams {
  amount: number
  mix: number
}

export const DEFAULT_RGB_SPLIT_PARAMS: RGBSplitParams = {
  amount: 1.0,
  mix: 1.0,
}

// ═══════════════════════════════════════════════════════
// PIXELATE
// ═══════════════════════════════════════════════════════

export const PixelateShader = Skia.RuntimeEffect.Make(`
  uniform shader inputBuffer;
  uniform float2 resolution;
  uniform float pixelSize;
  uniform float effectMix;

  half4 main(float2 coord) {
    float2 uv = coord / resolution;
    float2 pixelUv = floor(uv * resolution / pixelSize) * pixelSize / resolution;
    half4 color = inputBuffer.eval(coord);
    half4 effectColor = inputBuffer.eval(pixelUv * resolution);
    return mix(color, effectColor, effectMix);
  }
`)

export interface PixelateParams {
  pixelSize: number
  mix: number
}

export const DEFAULT_PIXELATE_PARAMS: PixelateParams = {
  pixelSize: 8.0,
  mix: 1.0,
}

// ═══════════════════════════════════════════════════════
// SCAN LINES
// ═══════════════════════════════════════════════════════

export const ScanLinesShader = Skia.RuntimeEffect.Make(`
  uniform shader inputBuffer;
  uniform float2 resolution;
  uniform float lineCount;
  uniform float lineOpacity;
  uniform float effectMix;

  half4 main(float2 coord) {
    float2 uv = coord / resolution;
    half4 color = inputBuffer.eval(coord);

    float linePos = mod(uv.y * lineCount, 1.0);
    float scanLine = step(0.5, linePos);
    float darkness = mix(1.0, 1.0 - lineOpacity, scanLine);

    half4 effectColor = half4(color.rgb * darkness, color.a);
    return mix(color, effectColor, effectMix);
  }
`)

export interface ScanLinesParams {
  lineCount: number
  lineOpacity: number
  mix: number
}

export const DEFAULT_SCAN_LINES_PARAMS: ScanLinesParams = {
  lineCount: 300.0,
  lineOpacity: 0.15,
  mix: 1.0,
}

// ═══════════════════════════════════════════════════════
// POSTERIZE
// ═══════════════════════════════════════════════════════

export const PosterizeShader = Skia.RuntimeEffect.Make(`
  uniform shader inputBuffer;
  uniform float levels;
  uniform float effectMix;

  half4 main(float2 coord) {
    half4 color = inputBuffer.eval(coord);
    half3 posterized = floor(color.rgb * levels) / levels;
    half4 effectColor = half4(posterized, color.a);
    return mix(color, effectColor, effectMix);
  }
`)

export interface PosterizeParams {
  levels: number
  mix: number
}

export const DEFAULT_POSTERIZE_PARAMS: PosterizeParams = {
  levels: 4.0,
  mix: 1.0,
}

// ═══════════════════════════════════════════════════════
// CHROMATIC ABERRATION
// ═══════════════════════════════════════════════════════

export const ChromaticShader = Skia.RuntimeEffect.Make(`
  uniform shader inputBuffer;
  uniform float2 resolution;
  uniform float intensity;
  uniform float effectMix;

  half4 main(float2 coord) {
    float2 uv = coord / resolution;
    float2 center = float2(0.5);
    float2 dir = uv - center;
    float dist = length(dir);

    float2 rUv = uv + dir * dist * intensity * 0.02;
    float2 bUv = uv - dir * dist * intensity * 0.02;

    half4 color = inputBuffer.eval(coord);
    float r = inputBuffer.eval(rUv * resolution).r;
    float b = inputBuffer.eval(bUv * resolution).b;

    half4 effectColor = half4(r, color.g, b, color.a);
    return mix(color, effectColor, effectMix);
  }
`)

export interface ChromaticParams {
  intensity: number
  mix: number
}

export const DEFAULT_CHROMATIC_PARAMS: ChromaticParams = {
  intensity: 1.0,
  mix: 1.0,
}

// ═══════════════════════════════════════════════════════
// NOISE
// ═══════════════════════════════════════════════════════

export const NoiseShader = Skia.RuntimeEffect.Make(`
  uniform shader inputBuffer;
  uniform float2 resolution;
  uniform float amount;
  uniform float time;
  uniform float effectMix;

  float hash(float2 p) {
    return fract(sin(dot(p, float2(127.1, 311.7))) * 43758.5453);
  }

  half4 main(float2 coord) {
    float2 uv = coord / resolution;
    half4 color = inputBuffer.eval(coord);

    float noise = hash(uv * 1000.0 + time) * 2.0 - 1.0;
    half3 noisy = color.rgb + noise * amount;

    half4 effectColor = half4(clamp(noisy, 0.0, 1.0), color.a);
    return mix(color, effectColor, effectMix);
  }
`)

export interface NoiseParams {
  amount: number
  mix: number
}

export const DEFAULT_NOISE_PARAMS: NoiseParams = {
  amount: 0.1,
  mix: 1.0,
}

// ═══════════════════════════════════════════════════════
// EDGE DETECTION
// ═══════════════════════════════════════════════════════

export const EdgeDetectionShader = Skia.RuntimeEffect.Make(`
  uniform shader inputBuffer;
  uniform float2 resolution;
  uniform float threshold;
  uniform float effectMix;

  float luminance(half3 c) {
    return dot(c, half3(0.299, 0.587, 0.114));
  }

  half4 main(float2 coord) {
    float2 texel = 1.0 / resolution;
    half4 color = inputBuffer.eval(coord);

    float tl = luminance(inputBuffer.eval(coord + float2(-texel.x, -texel.y) * resolution / resolution).rgb);
    float t  = luminance(inputBuffer.eval(coord + float2(0.0, -1.0)).rgb);
    float tr = luminance(inputBuffer.eval(coord + float2(1.0, -1.0)).rgb);
    float l  = luminance(inputBuffer.eval(coord + float2(-1.0, 0.0)).rgb);
    float r  = luminance(inputBuffer.eval(coord + float2(1.0, 0.0)).rgb);
    float bl = luminance(inputBuffer.eval(coord + float2(-1.0, 1.0)).rgb);
    float b  = luminance(inputBuffer.eval(coord + float2(0.0, 1.0)).rgb);
    float br = luminance(inputBuffer.eval(coord + float2(1.0, 1.0)).rgb);

    float sobelX = -tl - 2.0*l - bl + tr + 2.0*r + br;
    float sobelY = -tl - 2.0*t - tr + bl + 2.0*b + br;
    float edge = sqrt(sobelX * sobelX + sobelY * sobelY);
    edge = step(threshold / 100.0, edge);

    half4 effectColor = half4(half3(edge), color.a);
    return mix(color, effectColor, effectMix);
  }
`)

export interface EdgeDetectionParams {
  threshold: number
  mix: number
}

export const DEFAULT_EDGE_DETECTION_PARAMS: EdgeDetectionParams = {
  threshold: 30.0,
  mix: 1.0,
}

// ═══════════════════════════════════════════════════════
// COLOR GRADE
// ═══════════════════════════════════════════════════════

export const ColorGradeShader = Skia.RuntimeEffect.Make(`
  uniform shader inputBuffer;
  uniform float brightness;
  uniform float contrast;
  uniform float saturation;
  uniform float effectMix;

  half4 main(float2 coord) {
    half4 color = inputBuffer.eval(coord);
    half3 c = color.rgb;

    // Brightness
    c = c + brightness;

    // Contrast
    c = (c - 0.5) * contrast + 0.5;

    // Saturation
    float lum = dot(c, half3(0.299, 0.587, 0.114));
    c = mix(half3(lum), c, saturation);

    half4 effectColor = half4(clamp(c, 0.0, 1.0), color.a);
    return mix(color, effectColor, effectMix);
  }
`)

export interface ColorGradeParams {
  brightness: number
  contrast: number
  saturation: number
  mix: number
}

export const DEFAULT_COLOR_GRADE_PARAMS: ColorGradeParams = {
  brightness: 0.0,
  contrast: 1.0,
  saturation: 1.0,
  mix: 1.0,
}

// ═══════════════════════════════════════════════════════
// VHS
// ═══════════════════════════════════════════════════════

export const VHSShader = Skia.RuntimeEffect.Make(`
  uniform shader inputBuffer;
  uniform float2 resolution;
  uniform float time;
  uniform float tearIntensity;
  uniform float noiseAmount;
  uniform float effectMix;

  float hash(float2 p) {
    return fract(sin(dot(p, float2(127.1, 311.7))) * 43758.5453);
  }

  half4 main(float2 coord) {
    float2 uv = coord / resolution;
    half4 color = inputBuffer.eval(coord);

    // Horizontal tear/jitter
    float tear = hash(float2(floor(uv.y * 50.0), floor(time * 15.0)));
    float tearOffset = (tear - 0.5) * tearIntensity * 0.02;
    float2 tearUv = float2(uv.x + tearOffset, uv.y);

    // RGB offset (VHS color bleed)
    float r = inputBuffer.eval(float2(tearUv.x + 0.003, tearUv.y) * resolution).r;
    float g = inputBuffer.eval(tearUv * resolution).g;
    float b = inputBuffer.eval(float2(tearUv.x - 0.003, tearUv.y) * resolution).b;

    // Static noise
    float noise = hash(uv * 500.0 + time * 100.0) * noiseAmount;

    half3 vhs = half3(r, g, b) + noise;
    half4 effectColor = half4(clamp(vhs, 0.0, 1.0), color.a);
    return mix(color, effectColor, effectMix);
  }
`)

export interface VHSParams {
  tearIntensity: number
  noiseAmount: number
  mix: number
}

export const DEFAULT_VHS_PARAMS: VHSParams = {
  tearIntensity: 0.5,
  noiseAmount: 0.05,
  mix: 1.0,
}

// ═══════════════════════════════════════════════════════
// INVERT
// ═══════════════════════════════════════════════════════

export const InvertShader = Skia.RuntimeEffect.Make(`
  uniform shader inputBuffer;
  uniform float effectMix;

  half4 main(float2 coord) {
    half4 color = inputBuffer.eval(coord);
    half4 inverted = half4(1.0 - color.r, 1.0 - color.g, 1.0 - color.b, color.a);
    return mix(color, inverted, effectMix);
  }
`)

export interface InvertParams {
  mix: number
}

export const DEFAULT_INVERT_PARAMS: InvertParams = {
  mix: 1.0,
}

// ═══════════════════════════════════════════════════════
// DITHER
// ═══════════════════════════════════════════════════════

export const DitherShader = Skia.RuntimeEffect.Make(`
  uniform shader inputBuffer;
  uniform float2 resolution;
  uniform float gridSize;
  uniform float effectMix;

  // 4x4 Bayer matrix
  float bayer(float2 coord) {
    float2 c = mod(coord, 4.0);
    int x = int(c.x);
    int y = int(c.y);
    int index = x + y * 4;

    // Bayer 4x4 values divided by 16
    float m[16] = float[16](
      0.0/16.0, 8.0/16.0, 2.0/16.0, 10.0/16.0,
      12.0/16.0, 4.0/16.0, 14.0/16.0, 6.0/16.0,
      3.0/16.0, 11.0/16.0, 1.0/16.0, 9.0/16.0,
      15.0/16.0, 7.0/16.0, 13.0/16.0, 5.0/16.0
    );
    return m[index];
  }

  half4 main(float2 coord) {
    half4 color = inputBuffer.eval(coord);
    float lum = dot(color.rgb, half3(0.299, 0.587, 0.114));

    float2 ditherCoord = coord / gridSize;
    float threshold = bayer(ditherCoord);
    float dithered = step(threshold, lum);

    half4 effectColor = half4(half3(dithered), color.a);
    return mix(color, effectColor, effectMix);
  }
`)

export interface DitherParams {
  gridSize: number
  mix: number
}

export const DEFAULT_DITHER_PARAMS: DitherParams = {
  gridSize: 4.0,
  mix: 1.0,
}
