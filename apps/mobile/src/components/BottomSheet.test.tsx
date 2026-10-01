import { fireEvent, render, screen } from '@testing-library/react-native';
import { BottomSheet } from './BottomSheet';
import { formatMoney } from '../format';
import { demoDashboard } from '../test/fixtures';

jest.mock('@expo/vector-icons/Ionicons', () => () => null);

const noop = () => {};

function renderSheet(sheet: Parameters<typeof BottomSheet>[0]['sheet'], dashboardData = demoDashboard) {
  const props = {
    sheet,
    dashboardData,
    onClose: noop,
    onShowTransactions: noop,
    onSupport: noop,
  };
  return { ...render(<BottomSheet {...props} />), props };
}

// Tests for every sheet type and scenario

test('shows the invoice amount and due date', () => {
  renderSheet('invoice');
  expect(screen.getByText(formatMoney(1200, 'SEK'))).toBeTruthy();
  expect(screen.getByText('Invoice no. DEMO-2026-001')).toBeTruthy();
});

test('shows the card status and masked digits', () => {
  renderSheet('card');
  expect(screen.getByText('Status: inactive')).toBeTruthy();
  expect(screen.getByText('VISA •••• 4242')).toBeTruthy();
});

test('shows spent, remaining and the period for the spend detail', () => {
  renderSheet('spend');
  expect(screen.getByText(`${formatMoney(5400, 'SEK')} remaining`)).toBeTruthy();
  expect(screen.getByText(`Spent ${formatMoney(4600, 'SEK')} of ${formatMoney(10000, 'SEK')}`)).toBeTruthy();
  expect(screen.getByText(/1 sep\. 2026\s+–\s+30 sep\. 2026/)).toBeTruthy();
});

test('routes the menu actions to the dashboard, transactions and support', () => {
  const onClose = jest.fn();
  const onShowTransactions = jest.fn();
  const onSupport = jest.fn();
  render(
    <BottomSheet sheet="menu" dashboardData={demoDashboard} onClose={onClose}
      onShowTransactions={onShowTransactions} onSupport={onSupport} />,
  );
  fireEvent.press(screen.getByText('Dashboard'));
  fireEvent.press(screen.getByText('Transactions'));
  fireEvent.press(screen.getByText('Contact support'));
  expect(onClose).toHaveBeenCalledTimes(1);
  expect(onShowTransactions).toHaveBeenCalledTimes(1);
  expect(onSupport).toHaveBeenCalledTimes(1);
});

test('closes the sheet from the close action', () => {
  const onClose = jest.fn();
  render(
    <BottomSheet sheet="card" dashboardData={demoDashboard} onClose={onClose}
      onShowTransactions={noop} onSupport={noop} />,
  );
  fireEvent.press(screen.getByLabelText('Close details'));
  expect(onClose).toHaveBeenCalledTimes(1);
});
