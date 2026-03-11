import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { WifiOff, RefreshCw } from 'lucide-react-native';

/**
 * Reusable error banner — displays a red bar with message + Retry button.
 * @param {{ message?: string, onRetry?: () => void, visible?: boolean }} props
 */
export default function ErrorBanner({ message = 'Something went wrong.', onRetry, visible = true }) {
  if (!visible) return null;

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <WifiOff size={18} color="#FFF" />
        <Text style={styles.message} numberOfLines={2}>{message}</Text>
      </View>
      {onRetry && (
        <TouchableOpacity style={styles.retryBtn} onPress={onRetry} activeOpacity={0.7}>
          <RefreshCw size={14} color="#DC2626" />
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#DC2626',
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  message: { color: '#FFF', fontSize: 13, fontWeight: '600', flexShrink: 1 },
  retryBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#FFF', paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: 8,
  },
  retryText: { color: '#DC2626', fontWeight: '700', fontSize: 13 },
});
