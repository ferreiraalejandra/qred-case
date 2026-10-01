import { StyleSheet } from 'react-native';
import { colors } from '../styles/colors';

export const styles = StyleSheet.create({
  action: { minHeight: 50, borderRadius: 12, backgroundColor: colors.ink, paddingHorizontal: 15,
    alignItems: 'center', justifyContent: 'center' },
  onDark: { color: colors.surface },
  onLight: { color: colors.ink },
  secondary: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.ink },
  disabled: { opacity: 0.5 },
  pressed: { opacity: 0.8 },
});
