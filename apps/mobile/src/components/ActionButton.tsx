import { Pressable, Text } from 'react-native';
import { text } from '../styles/typography';
import { styles } from './ActionButton.styles';

type Props = {
  label: string;
  onPress?: () => void;
  secondary?: boolean;
  disabled?: boolean;
};

export function ActionButton({ label, onPress, secondary = false, disabled = false }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.action, secondary && styles.secondary,
        disabled && styles.disabled, pressed && styles.pressed]}
    >
      <Text style={[text.link, secondary ? styles.onLight : styles.onDark]}>{label}</Text>
    </Pressable>
  );
}
