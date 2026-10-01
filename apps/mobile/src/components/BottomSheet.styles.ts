import { StyleSheet } from 'react-native';
import { colors } from '../styles/colors';
import { layout } from '../styles/layout';

export const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: '#101a1a99', justifyContent: 'flex-end' },
  panel: { backgroundColor: colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, paddingBottom: 50, gap: 14 },
  closeButton: { ...layout.pressable, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', gap: 4 },
  value: { fontSize: 22, fontWeight: '700', color: colors.ink },
});
