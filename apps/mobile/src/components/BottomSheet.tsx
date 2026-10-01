import { Modal, Pressable, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import type { Dashboard } from '@qred-case/contract';
import { formatDate, formatMoney } from '../format';
import { ActionButton } from './ActionButton';
import { colors } from '../styles/colors';
import { text } from '../styles/typography';
import { styles } from './BottomSheet.styles';

export type Sheet = 'invoice' | 'card' | 'spend' | 'menu' | null;

type Props = {
  sheet: Sheet;
  dashboardData: Dashboard | null;
  onClose: () => void;
  onShowTransactions: () => void;
  onSupport: () => void;
};

export function BottomSheet({ sheet, dashboardData, onClose, onShowTransactions, onSupport }: Props) {
  return (
    <Modal visible={sheet !== null} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.panel}>
          <Pressable accessibilityRole="button" accessibilityLabel="Close details" onPress={onClose} style={styles.closeButton}>
            <Text style={text.link}>Close</Text>
            <Ionicons name="close" size={22} color={colors.ink} />
          </Pressable>
          {sheet === 'invoice' && dashboardData?.invoiceDue && (
            <>
              <Text style={text.heading}>Invoice due</Text>
              <Text style={styles.value}>{formatMoney(dashboardData.invoiceDue.amount, dashboardData.invoiceDue.currency)}</Text>
              <Text style={text.caption}>Due {formatDate(dashboardData.invoiceDue.dueDate)}</Text>
              <Text style={text.caption}>Invoice no. {dashboardData.invoiceDue.invoiceNumber}</Text>
            </>
          )}
          {sheet === 'card' && dashboardData && (
            <>
              <Text style={text.heading}>{dashboardData.card.label}</Text>
              <Text style={text.body}>Status: {dashboardData.card.status}</Text>
              <Text style={text.caption}>{dashboardData.card.provider.toUpperCase()} •••• {dashboardData.card.lastFour}</Text>
            </>
          )}
          {sheet === 'spend' && dashboardData && (
            <>
              <Text style={text.heading}>Spend for this period</Text>
              <Text style={styles.value}>{formatMoney(dashboardData.spend.remaining, dashboardData.spend.currency)} remaining</Text>
              <Text style={text.caption}>Spent {formatMoney(dashboardData.spend.spent, dashboardData.spend.currency)} of {formatMoney(dashboardData.spend.limit, dashboardData.spend.currency)}</Text>
              <Text style={text.caption}>{formatDate(dashboardData.spend.periodStart)} – {formatDate(dashboardData.spend.periodEnd)}</Text>
            </>
          )}
          {sheet === 'menu' && (
            <>
              <Text style={text.heading}>Menu</Text>
              <ActionButton label="Dashboard" secondary onPress={onClose} />
              <ActionButton label="Transactions" secondary onPress={onShowTransactions} />
              <ActionButton label="Contact support" secondary onPress={onSupport} />
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}
