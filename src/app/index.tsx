import { View, Text, StyleSheet, Pressable } from 'react-native'
import { usePermissions } from '../hooks/usePermissions'
import { CameraScreen } from '../components/CameraScreen'

export default function Index() {
  const { status, requestPermissions } = usePermissions()

  if (status === 'loading') {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Loading...</Text>
      </View>
    )
  }

  if (status === 'granted') {
    return <CameraScreen />
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>STRAND TRACER</Text>
      <Text style={styles.subtitle}>Real-time visual effects</Text>
      <Text style={styles.text}>Camera access is required for real-time effects processing</Text>
      <Pressable style={styles.button} onPress={requestPermissions}>
        <Text style={styles.buttonText}>Enable Camera</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  title: {
    color: '#00ffcc',
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: 4,
    marginBottom: 8,
  },
  subtitle: {
    color: '#666',
    fontSize: 14,
    letterSpacing: 2,
    marginBottom: 32,
    textTransform: 'uppercase',
  },
  text: {
    color: '#888',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  button: {
    backgroundColor: '#00ffcc',
    paddingHorizontal: 36,
    paddingVertical: 16,
    borderRadius: 8,
  },
  buttonText: {
    color: '#0a0a0a',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1,
  },
})
