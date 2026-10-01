import { StyleSheet } from 'react-native';
import { colors } from './colors';

export const text = StyleSheet.create({
  brand: { fontSize: 22, fontWeight: '800', color: colors.accent },
  title: { fontSize: 26, fontWeight: '700', color: colors.ink },
  heading: { fontSize: 17, fontWeight: '700', color: colors.ink },
  body: { fontSize: 15, fontWeight: '600', color: colors.ink },
  link: { fontSize: 15, fontWeight: '700', color: colors.ink },
  amount: { fontSize: 30, fontWeight: '800', color: colors.ink },
  label: { fontSize: 11, fontWeight: '500', color: colors.muted },
  caption: { fontSize: 13, lineHeight: 19, color: colors.muted },
});
