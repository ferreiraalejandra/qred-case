import { StyleSheet } from 'react-native';
import { layout } from '../styles/layout';

export const styles = StyleSheet.create({
  backButton: { ...layout.pressable, flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start' },
  count: { textAlign: 'center', paddingTop: 12 },
});
