import { useEffect, useState } from 'react';
import { Image, Text, View } from 'react-native';
import { styles } from './BrandLogo.styles';

type Props = { url: string | null; label: string; card?: boolean };

export function BrandLogo({ url, label, card = false }: Props) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [url]);

  if (!url || failed) {
    return (
      <View style={card ? styles.cardProvider : styles.merchantFallback}>
        <Text style={card ? styles.cardProviderText : styles.merchantFallbackText}>
          {card ? label.toUpperCase() : label.slice(0, 1).toUpperCase()}
        </Text>
      </View>
    );
  }

  return <Image source={{ uri: url }} style={card ? styles.cardLogo : styles.merchantLogo}
    accessibilityLabel={`${label} logo`} onError={() => setFailed(true)} />;
}
