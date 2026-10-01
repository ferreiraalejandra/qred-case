import { StyleSheet } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { Dashboard } from './Dashboard';
import { demoDashboard } from '../test/fixtures';

jest.mock('@expo/vector-icons/Ionicons', () => () => null);

const noop = () => {};
const handlers = {
  onRefresh: noop, onRetry: noop, onToggleCompany: noop,
  onShowSheet: noop, onShowTransactions: noop, onSupport: noop,
};

function renderPage(
  dashboardData: typeof demoDashboard | null,
  overrides: { loading?: boolean; error?: boolean } = {},
) {
  return render(
    <Dashboard
      dashboardData={dashboardData}
      loading={overrides.loading ?? false}
      refreshing={false}
      error={overrides.error ?? false}
      companyExpanded={false}
      {...handlers}
    />,
  );
}

function spendWidth(): string | number | undefined {
  return StyleSheet.flatten(screen.getByTestId('spend-progress').props.style).width;
}

test('shows a spinner and no company data while the dashboard is loading', () => {
  renderPage(null, { loading: true });
  expect(screen.getByLabelText('Loading dashboard')).toBeTruthy();
  expect(screen.queryByText('Qred Bank AB')).toBeNull();
});

test('explains that the first load failed instead of showing an empty dashboard', () => {
  renderPage(null, { error: true });
  expect(screen.getByText('Could not load your dashboard. Check your connection.')).toBeTruthy();
  expect(screen.queryByLabelText('Loading dashboard')).toBeNull();
});

test('opens the menu from the header button', () => {
  const onShowSheet = jest.fn();
  render(<Dashboard dashboardData={demoDashboard} loading={false} refreshing={false} error={false}
    companyExpanded={false} {...handlers} onShowSheet={onShowSheet} />);
  fireEvent.press(screen.getByLabelText('Open menu'));
  expect(onShowSheet).toHaveBeenCalledWith('menu');
});

test('reports how many transactions are behind the "view all" action', () => {
  renderPage(demoDashboard);
  expect(screen.getByText('View all transactions · 3 more')).toBeTruthy();
});

test('company row expands and shows the organization number and extra company data', () => {
  const onToggleCompany = jest.fn();
  const props = { dashboardData: demoDashboard, loading: false, refreshing: false, error: false,
    ...handlers, onToggleCompany };
  const { rerender } = render(<Dashboard {...props} companyExpanded={false} />);
  expect(screen.queryByText('Org.nr 559008-9800')).toBeNull();
  fireEvent.press(screen.getByLabelText('View company details'));
  expect(onToggleCompany).toHaveBeenCalledTimes(1);
  rerender(<Dashboard {...props} companyExpanded />);
  expect(screen.getByText('Org.nr 559008-9800')).toBeTruthy();
  expect(screen.getByLabelText('View company details').props.accessibilityState).toEqual({ expanded: true });
});

test('fills the spend bar proportionally to the used limit', () => {
  renderPage(demoDashboard);
  expect(spendWidth()).toBe('46%');
});

test('caps the spend bar at full when the limit is exceeded', () => {
  renderPage({ ...demoDashboard, spend: { ...demoDashboard.spend, limit: 1000, spent: 1200, remaining: 0 } });
  expect(spendWidth()).toBe('100%');
});

test('renders an empty spend bar when no limit is set', () => {
  renderPage({ ...demoDashboard, spend: { ...demoDashboard.spend, limit: 0 } });
  expect(spendWidth()).toBe('0%');
});
