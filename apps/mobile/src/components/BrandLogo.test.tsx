import { fireEvent, render, screen } from '@testing-library/react-native';
import { BrandLogo } from './BrandLogo';

test('renders the provided image for a merchant', () => {
  render(<BrandLogo url="https://example.test/ikea.png" label="IKEA" />);
  expect(screen.getByLabelText('IKEA logo').props.source).toEqual({ uri: 'https://example.test/ikea.png' });
});

test('falls back to the merchant initial when no logo url is provided', () => {
  render(<BrandLogo url={null} label="Train tickets" />);
  expect(screen.getByText('T')).toBeTruthy();
});

test('falls back to the merchant initial when the image fails to load', () => {
  render(<BrandLogo url="https://example.test/broken.png" label="IKEA" />);
  fireEvent(screen.getByLabelText('IKEA logo'), 'error');
  expect(screen.getByText('I')).toBeTruthy();
});

test('shows the uppercase provider word on a card when no card logo is provided', () => {
  render(<BrandLogo url={null} label="visa" card />);
  expect(screen.getByText('VISA')).toBeTruthy();
});
