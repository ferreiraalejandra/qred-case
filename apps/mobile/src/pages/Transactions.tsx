import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import type { TransactionsPage } from '@qred-case/contract';
import { ActionButton } from '../components/ActionButton';
import { TransactionRow } from '../components/TransactionRow';
import { colors } from '../styles/colors';
import { layout } from '../styles/layout';
import { text } from '../styles/typography';
import { styles } from './Transactions.styles';

type TransactionsProps = {
  companyName: string;
  items: TransactionsPage['items'];
  totalCount: number | null;
  loading: boolean;
  error: boolean;
  onBack: () => void;
  onRetry: () => void;
  onLoadMore: () => void;
};

export function Transactions({ companyName, items, totalCount, loading, error,
  onBack, onRetry, onLoadMore }: TransactionsProps) {
  return (
    <ScrollView contentContainerStyle={layout.screen} style={layout.scroll}>
      <Pressable accessibilityRole="button" onPress={onBack} style={styles.backButton}>
        <Ionicons name="chevron-back" size={24} color={colors.ink} />
        <Text style={text.link}>Dashboard</Text>
      </Pressable>
      <Text style={text.title}>Transactions</Text>
      <Text style={text.caption}>Recent purchases for {companyName}</Text>
      <View style={layout.panel}>
        {items.map((item) => <TransactionRow key={item.id} item={item} />)}
        {totalCount === 0 && <Text style={layout.empty}>No transactions yet.</Text>}
        {loading && <ActivityIndicator accessibilityLabel="Loading transactions" style={layout.loader} />}
        {error && (
          <View style={layout.feedback}>
            <Text accessibilityRole="alert" style={text.caption}>Could not load transactions. Check your connection.</Text>
            <ActionButton label="Try again" secondary onPress={onRetry} />
          </View>
        )}
        {!loading && !error && totalCount !== null && items.length < totalCount && (
          <ActionButton label="Load more" secondary onPress={onLoadMore} />
        )}
        {totalCount !== null && <Text style={[text.caption, styles.count]}>{items.length} of {totalCount} transactions</Text>}
      </View>
    </ScrollView>
  );
}
