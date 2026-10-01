import { useEffect, useState } from 'react';
import { Alert, Linking, SafeAreaView } from 'react-native';
import type { Dashboard as DashboardData, TransactionsPage } from '@qred-case/contract';
import { fetchDashboard, fetchTransactions } from './api';
import { BottomSheet, type Sheet } from './components/BottomSheet';
import { Dashboard } from './pages/Dashboard';
import { Transactions } from './pages/Transactions';
import { styles } from './AppContainer.styles';

const companyId = 'company_demo';

export function AppContainer() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);
  const [reload, setReload] = useState(0);
  const [sheet, setSheet] = useState<Sheet>(null);
  const [companyExpanded, setCompanyExpanded] = useState(false);
  const [screen, setScreen] = useState<'dashboard' | 'transactions'>('dashboard');
  const [items, setItems] = useState<TransactionsPage['items']>([]);
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const [offset, setOffset] = useState(0);
  const [retryTransactions, setRetryTransactions] = useState(0);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [transactionsError, setTransactionsError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    setError(false);
    fetchDashboard(companyId, controller.signal)
      .then((data) => { if (!controller.signal.aborted) setDashboardData(data); })
      .catch(() => { if (!controller.signal.aborted) setError(true); })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
          setRefreshing(false);
        }
      });
    return () => controller.abort();
  }, [reload]);

  useEffect(() => {
    if (screen !== 'transactions') return;
    const controller = new AbortController();
    setTransactionsLoading(true);
    setTransactionsError(false);
    fetchTransactions(companyId, offset, controller.signal)
      .then((page) => {
        if (controller.signal.aborted) return;
        setItems((current) => offset === 0 ? page.items : [...current, ...page.items]);
        setTotalCount(page.totalCount);
      })
      .catch(() => { if (!controller.signal.aborted) setTransactionsError(true); })
      .finally(() => { if (!controller.signal.aborted) setTransactionsLoading(false); });
    return () => controller.abort();
  }, [screen, offset, retryTransactions]);

  const showTransactions = () => {
    setSheet(null);
    setItems([]);
    setTotalCount(null);
    setOffset(0);
    setScreen('transactions');
  };
  const openSupport = () => {
    setSheet(null);
    Linking.openURL('https://www.qred.se/kontakt')
      .catch(() => Alert.alert('Unable to open support', 'Please visit qred.se/kontakt.'));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {screen === 'transactions' ? (
        <Transactions
          companyName={dashboardData?.company.name ?? ''}
          items={items}
          totalCount={totalCount}
          loading={transactionsLoading}
          error={transactionsError}
          onBack={() => setScreen('dashboard')}
          onRetry={() => setRetryTransactions((value) => value + 1)}
          onLoadMore={() => setOffset(items.length)}
        />
      ) : (
        <Dashboard
          dashboardData={dashboardData}
          loading={loading}
          refreshing={refreshing}
          error={error}
          onRefresh={() => {
            setRefreshing(true);
            setReload((value) => value + 1);
          }}
          onRetry={() => {
            setLoading(true);
            setReload((value) => value + 1);
          }}
          companyExpanded={companyExpanded}
          onToggleCompany={() => setCompanyExpanded((value) => !value)}
          onShowSheet={setSheet}
          onShowTransactions={showTransactions}
          onSupport={openSupport}
        />
      )}
      <BottomSheet
        sheet={sheet}
        dashboardData={dashboardData}
        onClose={() => setSheet(null)}
        onShowTransactions={showTransactions}
        onSupport={openSupport}
      />
    </SafeAreaView>
  );
}
