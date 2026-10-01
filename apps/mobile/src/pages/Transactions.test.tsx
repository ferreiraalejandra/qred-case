import { fireEvent, render, screen } from '@testing-library/react-native';
import { Transactions } from './Transactions';
import { demoTransaction, transactionPage } from '../test/fixtures';

jest.mock('@expo/vector-icons/Ionicons', () => () => null);

const noop = () => {};

function renderPage(overrides: Partial<Parameters<typeof Transactions>[0]> = {}) {
  const props = {
    companyName: 'Qred Bank AB',
    items: transactionPage([demoTransaction]).items,
    totalCount: 2,
    loading: false,
    error: false,
    onBack: noop,
    onRetry: noop,
    onLoadMore: noop,
    ...overrides,
  };
  return render(<Transactions {...props} />);
}

test('shows how much of the list is loaded and offers the next page', () => {
  const onLoadMore = jest.fn();
  renderPage({ onLoadMore });
  expect(screen.getByText('1 of 2 transactions')).toBeTruthy();
  fireEvent.press(screen.getByText('Load more'));
  expect(onLoadMore).toHaveBeenCalledTimes(1);
});

test('hides the "load more" action once every transaction is loaded', () => {
  renderPage({ totalCount: 1 });
  expect(screen.getByText('1 of 1 transactions')).toBeTruthy();
  expect(screen.queryByText('Load more')).toBeNull();
});

test('shows an empty message when the company has no transactions', () => {
  renderPage({ items: [], totalCount: 0 });
  expect(screen.getByText('No transactions yet.')).toBeTruthy();
  expect(screen.queryByText('Load more')).toBeNull();
});

test('offers a retry instead of pagination when loading failed', () => {
  const onRetry = jest.fn();
  renderPage({ items: [], totalCount: null, error: true, onRetry });
  expect(screen.getByText('Could not load transactions. Check your connection.')).toBeTruthy();
  expect(screen.queryByText('Load more')).toBeNull();
  fireEvent.press(screen.getByText('Try again'));
  expect(onRetry).toHaveBeenCalledTimes(1);
});

test('returns to the dashboard from the back action', () => {
  const onBack = jest.fn();
  renderPage({ onBack });
  fireEvent.press(screen.getByText(/Dashboard/));
  expect(onBack).toHaveBeenCalledTimes(1);
});
