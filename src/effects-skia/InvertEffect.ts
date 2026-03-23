import { Skia } from '@shopify/react-native-skia'

export const InvertShader = Skia.RuntimeEffect.Make(`
  uniform shader inputBuffer;
  uniform float effectMix;

  half4 main(float2 coord) {
    half4 color = inputBuffer.eval(coord);
    half4 inverted = half4(1.0 - color.r, 1.0 - color.g, 1.0 - color.b, color.a);
    return mix(color, inverted, effectMix);
  }
`)
