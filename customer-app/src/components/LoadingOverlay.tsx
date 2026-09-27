import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { COLORS } from '../constants/colors';

export default function LoadingOverlay() {
  return (
    <View style={styles.container}>
      <Text style={styles.logo}>HIRFA</Text>
      <ActivityIndicator size="large" color={COLORS.secondary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  logo: {
    fontSize: 40,
    fontWeight: 'bold',
    color: COLORS.surface,
    marginBottom: 24,
  },
});