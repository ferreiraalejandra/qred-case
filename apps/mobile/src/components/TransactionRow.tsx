import { Text, View } from 'react-native';
import type { TransactionsPage } from '@qred-case/contract';
import { formatMoney, formatTimestamp } from '../format';
import { BrandLogo } from './BrandLogo';
import { text } from '../styles/typography';
import { styles } from './TransactionRow.styles';

type Transaction = TransactionsPage['items'][number];

export function TransactionRow({ item }: { item: Transaction }) {
  return (
    <View style={styles.row}>
      <BrandLogo url={item.merchantLogoUrl} label={item.merchant} />
      <View style={styles.info}>
        <Text style={text.body} numberOfLines={1}>{item.merchant}</Text>
        <Text style={text.caption}>{formatTimestamp(item.occurredAt)}</Text>
      </View>
      <Text style={styles.amount}>{formatMoney(item.amount, item.currency)}</Text>
    </View>
  );
}
