import { StyleSheet } from 'react-native';
import { colors } from '../styles/colors';

export const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    minHeight: 64, borderBottomWidth: 1, borderBottomColor: colors.border, gap: 12 },
  info: { flex: 1, gap: 2 },
  amount: { fontSize: 14, fontWeight: '600', color: colors.ink },
});
