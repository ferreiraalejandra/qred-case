import { StyleSheet } from 'react-native';
import { colors } from '../styles/colors';

export const styles = StyleSheet.create({
  cardProvider: { minWidth: 54, alignItems: 'center' },
  cardLogo: { width: 54, height: 32, resizeMode: 'contain' },
  cardProviderText: { color: colors.surface, fontSize: 16, fontWeight: '700' },
  merchantLogo: { width: 38, height: 38, borderRadius: 8, resizeMode: 'contain' },
  merchantFallback: { width: 38, height: 38, borderRadius: 8, backgroundColor: colors.background,
    alignItems: 'center', justifyContent: 'center' },
  merchantFallbackText: { color: colors.ink, fontWeight: '700' },
});
