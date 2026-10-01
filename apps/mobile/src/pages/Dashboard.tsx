import { ActivityIndicator, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import type { Dashboard as DashboardData } from '@qred-case/contract';
import { formatMoney } from '../format';
import { ActionButton } from '../components/ActionButton';
import { BrandLogo } from '../components/BrandLogo';
import { TransactionRow } from '../components/TransactionRow';
import type { Sheet } from '../components/BottomSheet';
import { colors } from '../styles/colors';
import { layout } from '../styles/layout';
import { text } from '../styles/typography';
import { styles } from './Dashboard.styles';

type DashboardProps = {
  dashboardData: DashboardData | null;
  loading: boolean;
  refreshing: boolean;
  error: boolean;
  companyExpanded: boolean;
  onRefresh: () => void;
  onRetry: () => void;
  onToggleCompany: () => void;
  onShowSheet: (sheet: Sheet) => void;
  onShowTransactions: () => void;
  onSupport: () => void;
};

export function Dashboard({ dashboardData, loading, refreshing, error, companyExpanded,
  onRefresh, onRetry, onToggleCompany, onShowSheet, onShowTransactions, onSupport }: DashboardProps) {
  const remainingTransactionCount = dashboardData
    ? Math.max(0, dashboardData.transactions.totalCount - dashboardData.transactions.items.length) : 0;
  const spendProgressFraction = dashboardData && dashboardData.spend.limit > 0
    ? Math.min(1, dashboardData.spend.spent / dashboardData.spend.limit) : 0;

  return (
    <ScrollView
      style={layout.scroll}
      contentContainerStyle={layout.screen}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={layout.row}>
        <View style={styles.brand}>
          <Text style={text.brand}>qred.</Text>
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel="Open menu"
          onPress={() => onShowSheet('menu')} style={styles.menuButton}>
          <Text style={text.link}>Menu</Text>
          <Ionicons name="menu" size={24} color={colors.ink} />
        </Pressable>
      </View>

      {!dashboardData && loading && <ActivityIndicator accessibilityLabel="Loading dashboard" style={layout.loader} />}
      {error && (
        <View style={layout.feedback}>
          <Text accessibilityRole="alert" style={text.caption}>
            {dashboardData ? 'Could not refresh. Showing previously loaded data.' : 'Could not load your dashboard. Check your connection.'}
          </Text>
          <ActionButton label="Try again" onPress={onRetry} />
        </View>
      )}

      {dashboardData && (
        <>
          <Pressable accessibilityRole="button" accessibilityLabel="View company details"
            accessibilityState={{ expanded: companyExpanded }} onPress={onToggleCompany} style={styles.companyDetails}>
            <View>
              <Text style={text.label}>Your company</Text>
              <Text style={text.heading}>{dashboardData.company.name}</Text>
              {companyExpanded && <Text style={text.caption}>Org.nr {dashboardData.company.organizationNumber}</Text>}
            </View>
            <Ionicons name={companyExpanded ? 'chevron-up' : 'chevron-down'} size={24} color={colors.ink} />
          </Pressable>

          <View style={styles.cardWrap}>
            {dashboardData.invoiceDue && (
              <Pressable accessibilityRole="button" onPress={() => onShowSheet('invoice')} style={styles.invoiceBadge}>
                <Text style={styles.invoiceText}>Invoice due</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.ink} />
              </Pressable>
            )}
            <Pressable accessibilityRole="button" onPress={() => onShowSheet('card')} style={styles.card}>
              <View style={layout.row}>
                <Text style={text.brand}>qred.</Text>
                <BrandLogo url={dashboardData.card.logoUrl} label={dashboardData.card.provider} card />
              </View>
              <View style={layout.row}>
                <View>
                  <Text style={styles.cardCaption}>{dashboardData.card.label}</Text>
                  <Text style={styles.cardDigits}>•••• {dashboardData.card.lastFour}</Text>
                  <Text style={text.label}>{dashboardData.card.status.toUpperCase()}</Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color={colors.surface} />
              </View>
            </Pressable>
          </View>

          <Pressable accessibilityRole="button" onPress={() => onShowSheet('spend')} style={layout.panel}>
            <View style={layout.row}>
              <Text style={text.heading}>Remaining spend</Text>
              <Ionicons name="chevron-forward" size={24} color={colors.ink} />
            </View>
            <Text style={text.amount}>{formatMoney(dashboardData.spend.remaining, dashboardData.spend.currency)}</Text>
            <Text style={text.caption}>of {formatMoney(dashboardData.spend.limit, dashboardData.spend.currency)} available in this period</Text>
            <View style={styles.progressTrack}>
              <View testID="spend-progress" style={[styles.progressFill, { width: `${spendProgressFraction * 100}%` }]} />
            </View>
            <Text style={[text.caption, styles.hint]}>Based on your set limit</Text>
          </Pressable>

          <View style={layout.panel}>
            <Text style={text.heading}>Latest transactions</Text>
            {dashboardData.transactions.items.length === 0 ? (
              <Text style={layout.empty}>No transactions yet.</Text>
            ) : dashboardData.transactions.items.map((item) => <TransactionRow key={item.id} item={item} />)}
            {dashboardData.transactions.totalCount > 0 && (
              <Pressable accessibilityRole="button" onPress={onShowTransactions} style={styles.moreButton}>
                <Text style={[text.link, styles.moreText]}>
                  {remainingTransactionCount > 0 ? `View all transactions · ${remainingTransactionCount} more` : 'View all transactions'}
                </Text>
                <Ionicons name="chevron-forward" size={24} color={colors.ink} />
              </Pressable>
            )}
          </View>

          <View style={layout.stack}>
            <ActionButton label={dashboardData.card.status === 'inactive' ? 'Activate card'
              : dashboardData.card.status === 'active' ? 'Card active' : 'Card blocked'} disabled />
            {dashboardData.card.status === 'inactive' && (
              <Text style={[text.caption, styles.caption]}>Activation requires a secure flow and is unavailable in this demo.</Text>
            )}
            <ActionButton label="Contact Qred’s support" secondary onPress={onSupport} />
          </View>
        </>
      )}
    </ScrollView>
  );
}
