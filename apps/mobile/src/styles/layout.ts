import { StyleSheet } from 'react-native';
import { colors } from './colors';

export const layout = StyleSheet.create({
  scroll: { flex: 1 },
  screen: { width: '100%', maxWidth: 480, alignSelf: 'center', paddingHorizontal: 20, gap: 18 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  panel: { backgroundColor: colors.surface, borderRadius: 18, borderWidth: 1,
    borderColor: colors.border, padding: 20, gap: 6 },
  stack: { gap: 10 },
  feedback: { backgroundColor: colors.surface, borderRadius: 12, borderWidth: 1,
    borderColor: colors.border, padding: 16, gap: 12 },
  pressable: { minHeight: 44, justifyContent: 'center' },
  empty: { color: colors.muted, paddingVertical: 20 },
  loader: { padding: 28 },
});
