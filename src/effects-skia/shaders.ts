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

// ═══════════════════════════════════════════════════════
// BLOCK DISPLACE
// ═══════════════════════════════════════════════════════

export const BlockDisplaceShader = Skia.RuntimeEffect.Make(`
  uniform shader inputBuffer;
  uniform float2 resolution;
  uniform float blockSize;
  uniform float displaceChance;
  uniform float displaceDistance;
  uniform float time;
  uniform float effectMix;

  float hash(float2 p) {
    return fract(sin(dot(p, float2(12.9898, 78.233))) * 43758.5453);
  }

  half4 main(float2 coord) {
    float2 uv = coord / resolution;
    float2 blockCoord = floor(uv / blockSize) * blockSize;
    float rand = hash(blockCoord + floor(time * 10.0));

    float2 sampleUv = uv;
    if (rand < displaceChance) {
      float dx = (hash(blockCoord + 0.1) - 0.5) * 2.0 * displaceDistance;
      float dy = (hash(blockCoord + 0.2) - 0.5) * 2.0 * displaceDistance;
      sampleUv = sampleUv + float2(dx, dy);
    }

    half4 color = inputBuffer.eval(coord);
    half4 effectColor = inputBuffer.eval(clamp(sampleUv, 0.0, 1.0) * resolution);
    return mix(color, effectColor, effectMix);
  }
`)

export interface BlockDisplaceParams {
  blockSize: number
  displaceChance: number
  displaceDistance: number
  mix: number
}

export const DEFAULT_BLOCK_DISPLACE_PARAMS: BlockDisplaceParams = {
  blockSize: 0.05,
  displaceChance: 0.1,
  displaceDistance: 0.02,
  mix: 1.0,
}

// ═══════════════════════════════════════════════════════
// STATIC DISPLACEMENT
// ═══════════════════════════════════════════════════════

export const StaticDisplaceShader = Skia.RuntimeEffect.Make(`
  uniform shader inputBuffer;
  uniform float2 resolution;
  uniform float intensity;
  uniform float scale;
  uniform float time;
  uniform float effectMix;

  float hash(float2 p) {
    return fract(sin(dot(p, float2(127.1, 311.7))) * 43758.5453);
  }

  // Simplex-like noise
  float3 mod289(float3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  float2 mod289v(float2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  float3 permute(float3 x) { return mod289(((x * 34.0) + 1.0) * x); }

  float snoise(float2 v) {
    const float4 C = float4(0.211324865, 0.366025404, -0.577350269, 0.024390244);
    float2 i = floor(v + dot(v, C.yy));
    float2 x0 = v - i + dot(i, C.xx);
    float2 i1 = (x0.x > x0.y) ? float2(1.0, 0.0) : float2(0.0, 1.0);
    float4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289v(i);
    float3 p = permute(permute(i.y + float3(0.0, i1.y, 1.0)) + i.x + float3(0.0, i1.x, 1.0));
    float3 m = max(0.5 - float3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m * m; m = m * m;
    float3 x = 2.0 * fract(p * C.www) - 1.0;
    float3 h = abs(x) - 0.5;
    float3 ox = floor(x + 0.5);
    float3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
    float3 g;
    g.x = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  half4 main(float2 coord) {
    float2 uv = coord / resolution;
    float2 noiseCoord = uv * scale + time;

    float noiseX = snoise(noiseCoord);
    float noiseY = snoise(noiseCoord + 100.0);

    float2 offset = float2(noiseX, noiseY) * intensity * 0.1;
    float2 displacedUv = clamp(uv + offset, 0.0, 1.0);

    half4 color = inputBuffer.eval(coord);
    half4 effectColor = inputBuffer.eval(displacedUv * resolution);
    return mix(color, effectColor, effectMix);
  }
`)

export interface StaticDisplaceParams {
  intensity: number
  scale: number
  mix: number
}

export const DEFAULT_STATIC_DISPLACE_PARAMS: StaticDisplaceParams = {
  intensity: 0.3,
  scale: 20.0,
  mix: 1.0,
}

// ═══════════════════════════════════════════════════════
// LENS DISTORTION
// ═══════════════════════════════════════════════════════

export const LensDistortionShader = Skia.RuntimeEffect.Make(`
  uniform shader inputBuffer;
  uniform float2 resolution;
  uniform float curvature;
  uniform float vignette;
  uniform float effectMix;

  half4 main(float2 coord) {
    float2 uv = coord / resolution;

    // Barrel/pincushion distortion
    float2 center = uv - 0.5;
    float r2 = dot(center, center);
    float f = 1.0 + curvature * 0.5 * r2;
    float2 distortedUv = center * f + 0.5;

    half4 color = inputBuffer.eval(coord);

    if (distortedUv.x < 0.0 || distortedUv.x > 1.0 || distortedUv.y < 0.0 || distortedUv.y > 1.0) {
      return mix(color, half4(0.0, 0.0, 0.0, 1.0), effectMix);
    }

    half4 effectColor = inputBuffer.eval(distortedUv * resolution);

    // Vignette
    float dist = length(center) * 2.0;
    float vig = 1.0 - smoothstep(0.5, 1.2, dist) * vignette;
    effectColor.rgb *= vig;

    return mix(color, effectColor, effectMix);
  }
`)

export interface LensDistortionParams {
  curvature: number
  vignette: number
  mix: number
}

export const DEFAULT_LENS_DISTORTION_PARAMS: LensDistortionParams = {
  curvature: 0.2,
  vignette: 0.3,
  mix: 1.0,
}

// ═══════════════════════════════════════════════════════
// DOTS
// ═══════════════════════════════════════════════════════

export const DotsShader = Skia.RuntimeEffect.Make(`
  uniform shader inputBuffer;
  uniform float2 resolution;
  uniform float gridSize;
  uniform float dotScale;
  uniform float effectMix;

  half4 main(float2 coord) {
    float2 cellIndex = floor(coord / gridSize);
    float2 cellCenter = (cellIndex + 0.5) * gridSize;
    float2 cellCenterUv = cellCenter / resolution;

    half4 cellColor = inputBuffer.eval(cellCenter);
    float brightness = dot(cellColor.rgb, half3(0.299, 0.587, 0.114));

    float maxRadius = gridSize * 0.5 * dotScale;
    float radius = brightness * maxRadius;
    float dist = length(coord - cellCenter);

    half4 color = inputBuffer.eval(coord);
    half4 dotColor = dist <= radius ? half4(1.0) : half4(0.0, 0.0, 0.0, 1.0);
    return mix(color, dotColor, effectMix);
  }
`)

export interface DotsParams {
  gridSize: number
  dotScale: number
  mix: number
}

export const DEFAULT_DOTS_PARAMS: DotsParams = {
  gridSize: 8.0,
  dotScale: 0.8,
  mix: 1.0,
}

// ═══════════════════════════════════════════════════════
// PIXEL SORT (simplified)
// ═══════════════════════════════════════════════════════

export const PixelSortShader = Skia.RuntimeEffect.Make(`
  uniform shader inputBuffer;
  uniform float2 resolution;
  uniform float threshold;
  uniform float streakLength;
  uniform float intensity;
  uniform float time;
  uniform float effectMix;

  float hash(float2 p) {
    return fract(sin(dot(p, float2(127.1, 311.7))) * 43758.5453);
  }

  half4 main(float2 coord) {
    float2 uv = coord / resolution;
    half4 color = inputBuffer.eval(coord);
    float lum = dot(color.rgb, half3(0.299, 0.587, 0.114));

    if (lum > threshold) {
      // Streak downward from bright pixels
      float streak = hash(float2(floor(coord.x), floor(time * 5.0)));
      float len = streak * streakLength * intensity;
      float2 sampleCoord = coord - float2(0.0, len * lum);
      sampleCoord = clamp(sampleCoord, float2(0.0), resolution);
      half4 streakColor = inputBuffer.eval(sampleCoord);
      half4 effectColor = mix(color, streakColor, intensity * 0.7);
      return mix(color, effectColor, effectMix);
    }

    return color;
  }
`)

export interface PixelSortParams {
  threshold: number
  streakLength: number
  intensity: number
  mix: number
}

export const DEFAULT_PIXEL_SORT_PARAMS: PixelSortParams = {
  threshold: 0.3,
  streakLength: 120.0,
  intensity: 0.8,
  mix: 1.0,
}

// ═══════════════════════════════════════════════════════
// SONIFY (bit crush / sample rate reduction)
// ═══════════════════════════════════════════════════════

export const SonifyShader = Skia.RuntimeEffect.Make(`
  uniform shader inputBuffer;
  uniform float2 resolution;
  uniform float sampleRate;
  uniform float bitDepth;
  uniform float drive;
  uniform float effectMix;

  half4 main(float2 coord) {
    float2 uv = coord / resolution;

    // Sample rate reduction (horizontal quantize)
    float quantX = floor(uv.x / sampleRate) * sampleRate;
    float2 quantUv = float2(quantX, uv.y);
    half4 color = inputBuffer.eval(quantUv * resolution);

    // Bit crushing
    float levels = pow(2.0, bitDepth);
    color.rgb = floor(color.rgb * levels) / levels;

    // Waveshaping distortion (soft clip)
    if (drive > 0.0) {
      float d = 1.0 + drive * 10.0;
      color.rgb = clamp(color.rgb * d, -1.0, 1.0);
      color.rgb = color.rgb - (color.rgb * color.rgb * color.rgb) / 3.0;
      color.rgb = clamp(color.rgb, 0.0, 1.0);
    }

    half4 original = inputBuffer.eval(coord);
    return mix(original, color, effectMix);
  }
`)

export interface SonifyParams {
  sampleRate: number
  bitDepth: number
  drive: number
  mix: number
}

export const DEFAULT_SONIFY_PARAMS: SonifyParams = {
  sampleRate: 0.5,
  bitDepth: 4.0,
  drive: 0.15,
  mix: 1.0,
}

// ═══════════════════════════════════════════════════════
// FEEDBACK LOOP (simplified — single-pass glow/trail)
// ═══════════════════════════════════════════════════════

export const FeedbackShader = Skia.RuntimeEffect.Make(`
  uniform shader inputBuffer;
  uniform float2 resolution;
  uniform float zoom;
  uniform float rotation;
  uniform float hueShift;
  uniform float decay;
  uniform float effectMix;

  half3 shiftHue(half3 c, float shift) {
    float cosA = cos(shift);
    float sinA = sin(shift);
    half3 result;
    result.r = c.r * (0.299 + 0.701 * cosA + 0.168 * sinA)
             + c.g * (0.587 - 0.587 * cosA + 0.330 * sinA)
             + c.b * (0.114 - 0.114 * cosA - 0.497 * sinA);
    result.g = c.r * (0.299 - 0.299 * cosA - 0.328 * sinA)
             + c.g * (0.587 + 0.413 * cosA + 0.035 * sinA)
             + c.b * (0.114 - 0.114 * cosA + 0.292 * sinA);
    result.b = c.r * (0.299 - 0.300 * cosA + 1.250 * sinA)
             + c.g * (0.587 - 0.588 * cosA - 1.050 * sinA)
             + c.b * (0.114 + 0.886 * cosA - 0.203 * sinA);
    return result;
  }

  half4 main(float2 coord) {
    float2 uv = coord / resolution;
    half4 color = inputBuffer.eval(coord);

    // Transform UV for feedback sampling (zoom + rotate from center)
    float2 center = uv - 0.5;
    float s = sin(rotation * 0.0174533);
    float c2 = cos(rotation * 0.0174533);
    float2 rotated = float2(center.x * c2 - center.y * s, center.x * s + center.y * c2);
    float2 feedbackUv = rotated / zoom + 0.5;
    feedbackUv = clamp(feedbackUv, 0.0, 1.0);

    half4 feedback = inputBuffer.eval(feedbackUv * resolution);
    feedback.rgb = shiftHue(feedback.rgb, hueShift * 0.0174533) * decay;

    // Additive blend
    half4 effectColor = half4(color.rgb + feedback.rgb * 0.3, color.a);
    return mix(color, effectColor, effectMix);
  }
`)

export interface FeedbackParams {
  zoom: number
  rotation: number
  hueShift: number
  decay: number
  mix: number
}

export const DEFAULT_FEEDBACK_PARAMS: FeedbackParams = {
  zoom: 1.02,
  rotation: 0.5,
  hueShift: 5.0,
  decay: 0.92,
  mix: 1.0,
}

// ═══════════════════════════════════════════════════════
// HALFTONE
// ═══════════════════════════════════════════════════════

export const HalftoneShader = Skia.RuntimeEffect.Make(`
  uniform shader inputBuffer;
  uniform float2 resolution;
  uniform float dotSize;
  uniform float angle;
  uniform float effectMix;

  half4 main(float2 coord) {
    float2 uv = coord / resolution;
    half4 color = inputBuffer.eval(coord);

    // Rotate grid
    float s = sin(angle);
    float c = cos(angle);
    float2 rotCoord = float2(coord.x * c - coord.y * s, coord.x * s + coord.y * c);

    float2 cellIndex = floor(rotCoord / dotSize);
    float2 cellCenter = (cellIndex + 0.5) * dotSize;

    // Un-rotate cell center to sample original image
    float2 unrot = float2(cellCenter.x * c + cellCenter.y * s, -cellCenter.x * s + cellCenter.y * c);
    half4 cellColor = inputBuffer.eval(clamp(unrot, float2(0.0), resolution));
    float lum = dot(cellColor.rgb, half3(0.299, 0.587, 0.114));

    float radius = lum * dotSize * 0.5;
    float dist = length(rotCoord - cellCenter);

    half4 halftoneDot = dist < radius ? half4(1.0) : half4(0.0, 0.0, 0.0, 1.0);
    return mix(color, halftoneDot, effectMix);
  }
`)

export interface HalftoneParams {
  dotSize: number
  angle: number
  mix: number
}

export const DEFAULT_HALFTONE_PARAMS: HalftoneParams = {
  dotSize: 8.0,
  angle: 0.4,
  mix: 1.0,
}
