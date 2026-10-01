import { StyleSheet } from 'react-native';
import { colors } from '../styles/colors';
import { layout } from '../styles/layout';

export const styles = StyleSheet.create({
  brand: { backgroundColor: colors.ink, paddingHorizontal: 15, paddingVertical: 9, borderRadius: 12 },
  menuButton: { ...layout.pressable, flexDirection: 'row', alignItems: 'center', gap: 6 },
  companyDetails: { ...layout.panel, minHeight: 75, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between' },
  cardWrap: { paddingTop: 12, marginTop: 4 },
  invoiceBadge: { position: 'absolute', top: 0, left: 20, zIndex: 1, backgroundColor: colors.accent,
    borderRadius: 20, paddingHorizontal: 16, minHeight: 35, flexDirection: 'row', alignItems: 'center', gap: 4 },
  invoiceText: { fontSize: 13, fontWeight: '700', color: colors.ink },
  card: { minHeight: 188, backgroundColor: colors.ink, borderRadius: 20, padding: 23, gap: 40 },
  cardCaption: { color: colors.muted, fontSize: 15, marginBottom: 4 },
  cardDigits: { fontSize: 18, color: colors.surface, marginBottom: 4 },
  progressTrack: { height: 8, borderRadius: 4, backgroundColor: colors.background, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4, backgroundColor: colors.accent },
  moreButton: { minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  moreText: { flexShrink: 1, paddingRight: 8 },
  hint: { textAlign: 'right' },
  caption: { textAlign: 'center' },
});
