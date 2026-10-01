import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { fetchDashboard, fetchTransactions } from './api';
import { AppContainer } from './AppContainer';
import { formatMoney } from './format';
import { demoDashboard, demoTransaction, transactionPage } from './test/fixtures';

jest.mock('@expo/vector-icons/Ionicons', () => () => null);
jest.mock('./api', () => ({ fetchDashboard: jest.fn(), fetchTransactions: jest.fn() }));

const loadDashboard = jest.mocked(fetchDashboard);
const loadTransactions = jest.mocked(fetchTransactions);

beforeEach(() => jest.resetAllMocks());

test('shows loading until the dashboard data request completes', () => {
  loadDashboard.mockImplementation(() => new Promise(() => {}));
  render(<AppContainer />);
  expect(screen.getByLabelText('Loading dashboard')).toBeTruthy();
  expect(screen.queryByText('Qred Bank AB')).toBeNull();
});

test('shows a connection error and can recover on retry', async () => {
  loadDashboard.mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce(demoDashboard);
  render(<AppContainer />);
  expect(await screen.findByText('Could not load your dashboard. Check your connection.')).toBeTruthy();
  fireEvent.press(screen.getByText('Try again'));
  expect(await screen.findByText('Qred Bank AB')).toBeTruthy();
  expect(screen.queryByText('Could not load your dashboard. Check your connection.')).toBeNull();
});

test('renders API data and opens invoice details', async () => {
  loadDashboard.mockResolvedValue(demoDashboard);
  render(<AppContainer />);
  expect(await screen.findByText('Qred Bank AB')).toBeTruthy();
  expect(screen.getByText('•••• 4242')).toBeTruthy();
  expect(screen.getByText(formatMoney(5400, 'SEK'))).toBeTruthy();
  expect(screen.getByText('IKEA')).toBeTruthy();
  expect(screen.getByText('Fuel stop')).toBeTruthy();
  expect(screen.getByText('Office supplies')).toBeTruthy();
  expect(screen.queryByText('Train tickets')).toBeNull();
  fireEvent.press(screen.getByText(/Invoice due/));
  expect(screen.getByText(formatMoney(1200, 'SEK'))).toBeTruthy();
  expect(screen.getByText('Invoice no. DEMO-2026-001')).toBeTruthy();
});

test('expands and collapses company details within the dashboard', async () => {
  loadDashboard.mockResolvedValue(demoDashboard);
  render(<AppContainer />);
  expect(await screen.findByText('Qred Bank AB')).toBeTruthy();
  expect(screen.queryByText('Org.nr 559008-9800')).toBeNull();
  const companyDetails = screen.getByLabelText('View company details');
  expect(companyDetails.props.accessibilityState).toEqual({ expanded: false });
  fireEvent.press(companyDetails);
  expect(screen.getByText('Org.nr 559008-9800')).toBeTruthy();
  expect(screen.getByLabelText('View company details').props.accessibilityState).toEqual({ expanded: true });
  expect(screen.queryByLabelText('Close details')).toBeNull();
  fireEvent.press(screen.getByLabelText('View company details'));
  expect(screen.queryByText('Org.nr 559008-9800')).toBeNull();
  expect(screen.getByLabelText('View company details').props.accessibilityState).toEqual({ expanded: false });
});

test('opens the transaction list and loads the next page from the API', async () => {
  loadDashboard.mockResolvedValue({
    ...demoDashboard, company: { ...demoDashboard.company, name: 'Updated Company' },
  });
  loadTransactions
    .mockResolvedValueOnce(transactionPage([demoTransaction]))
    .mockResolvedValueOnce(transactionPage([{
      id: 'txn_1', merchant: 'Office supplies', merchantLogoUrl: null,
      occurredAt: '2026-09-28T10:00:00Z', amount: 799, currency: 'SEK',
    }], 1));
  render(<AppContainer />);
  fireEvent.press(await screen.findByText(/View all transactions/));
  expect(await screen.findByText('Recent purchases for Updated Company')).toBeTruthy();
  expect(await screen.findByText('1 of 2 transactions')).toBeTruthy();
  fireEvent.press(screen.getByText('Load more'));
  expect(await screen.findByText('Office supplies')).toBeTruthy();
  await waitFor(() => expect(screen.getByText('2 of 2 transactions')).toBeTruthy());
  expect(loadTransactions).toHaveBeenNthCalledWith(2, 'company_demo', 1, expect.anything());
});

test('shows a transaction error and can recover on retry', async () => {
  loadDashboard.mockResolvedValue(demoDashboard);
  loadTransactions.mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce(transactionPage([demoTransaction]));
  render(<AppContainer />);
  fireEvent.press(await screen.findByText(/View all transactions/));
  expect(await screen.findByText('Could not load transactions. Check your connection.')).toBeTruthy();
  fireEvent.press(screen.getByText('Try again'));
  expect(await screen.findByText('Train tickets')).toBeTruthy();
});
