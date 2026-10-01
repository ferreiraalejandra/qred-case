import { fireEvent, render, screen } from '@testing-library/react-native';
import { ActionButton } from './ActionButton';

test('calls onPress when pressed', () => {
  const onPress = jest.fn();
  render(<ActionButton label="Contact support" onPress={onPress} />);
  fireEvent.press(screen.getByText('Contact support'));
  expect(onPress).toHaveBeenCalledTimes(1);
});

test('does not call onPress while disabled', () => {
  const onPress = jest.fn();
  render(<ActionButton label="Activate card" onPress={onPress} disabled />);
  fireEvent.press(screen.getByText('Activate card'));
  expect(onPress).not.toHaveBeenCalled();
});
