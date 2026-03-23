import { useCallback, useState } from 'react'
import { View, StyleSheet, Pressable, Text } from 'react-native'
import {
  useCameraDevice,
  Camera,
  type CameraPosition,
} from 'react-native-vision-camera'
import { useSkiaFrameProcessor } from 'react-native-vision-camera'
import { Skia } from '@shopify/react-native-skia'
import { InvertShader } from '../effects-skia/InvertEffect'

export function CameraScreen() {
  const [facing, setFacing] = useState<CameraPosition>('back')
  const [effectEnabled, setEffectEnabled] = useState(false)
  const device = useCameraDevice(facing)

  const frameProcessor = useSkiaFrameProcessor((frame) => {
    'worklet'

    // Apply invert shader when enabled
    if (effectEnabled && InvertShader) {
      const imageShader = frame.toShader()
      const shader = InvertShader.makeShaderWithChildren(
        [1.0], // effectMix
        [imageShader],
      )
      const shaderPaint = Skia.Paint()
      shaderPaint.setShader(shader)
      frame.drawRect(
        Skia.XYWHRect(0, 0, frame.width, frame.height),
        shaderPaint,
      )
    } else {
      frame.render()
    }

    // HUD overlay
    const paint = Skia.Paint()
    paint.setColor(Skia.Color('rgba(0, 255, 204, 0.9)'))

    const font = Skia.Font(null, 28)
    frame.drawText('STRAND TRACER', 24, 56, paint, font)

    // Corner brackets
    const bp = Skia.Paint()
    bp.setColor(Skia.Color('#00ffcc'))
    bp.setStrokeWidth(2.5)
    bp.setStyle(2) // Stroke

    const m = 40
    const bl = 30
    const w = frame.width
    const h = frame.height

    const tl = Skia.Path.Make()
    tl.moveTo(m, m + bl); tl.lineTo(m, m); tl.lineTo(m + bl, m)
    frame.drawPath(tl, bp)

    const tr = Skia.Path.Make()
    tr.moveTo(w - m - bl, m); tr.lineTo(w - m, m); tr.lineTo(w - m, m + bl)
    frame.drawPath(tr, bp)

    const blp = Skia.Path.Make()
    blp.moveTo(m, h - m - bl); blp.lineTo(m, h - m); blp.lineTo(m + bl, h - m)
    frame.drawPath(blp, bp)

    const br = Skia.Path.Make()
    br.moveTo(w - m - bl, h - m); br.lineTo(w - m, h - m); br.lineTo(w - m, h - m - bl)
    frame.drawPath(br, bp)
  }, [effectEnabled])

  const flipCamera = useCallback(() => {
    setFacing(f => f === 'back' ? 'front' : 'back')
  }, [])

  const toggleEffect = useCallback(() => {
    setEffectEnabled(e => !e)
  }, [])

  if (!device) {
    return (
      <View style={styles.container}>
        <Text style={styles.noDevice}>No camera device found</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        frameProcessor={frameProcessor}
        pixelFormat="rgb"
      />

      <View style={styles.bottomBar}>
        <Pressable style={styles.circleButton} onPress={flipCamera}>
          <Text style={styles.buttonLabel}>FLIP</Text>
        </Pressable>

        <View style={styles.recordButton}>
          <View style={styles.recordInner} />
        </View>

        <Pressable
          style={[styles.circleButton, effectEnabled && styles.circleButtonActive]}
          onPress={toggleEffect}
        >
          <Text style={[styles.buttonLabel, effectEnabled && styles.buttonLabelActive]}>FX</Text>
        </Pressable>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  noDevice: {
    color: '#888',
    textAlign: 'center',
    marginTop: 100,
    fontSize: 16,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 110,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingBottom: 40,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  circleButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#00ffcc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleButtonActive: {
    backgroundColor: '#00ffcc',
  },
  buttonLabel: {
    color: '#00ffcc',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  buttonLabelActive: {
    color: '#0a0a0a',
  },
  recordButton: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 3,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordInner: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#ff0044',
  },
})
