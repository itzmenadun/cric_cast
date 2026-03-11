import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView, Alert } from 'react-native';

export default function BowlerChangeModal({ visible, onConfirm, players, lastBowlerId }) {
  const [selectedId, setSelected] = useState(null);

  // Filter out the bowler who bowled the last over (can't bowl consecutive)
  const eligible = players?.filter(p =>
    (p.role === 'BOWLER' || p.role === 'ALL_ROUNDER') && p.id !== lastBowlerId
  ) || [];

  const confirm = () => {
    if (!selectedId) return Alert.alert('Select Bowler', 'Please pick the next bowler.');
    onConfirm(selectedId);
    setSelected(null);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={() => {}}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <Text style={styles.title}>⚾ New Over — Select Bowler</Text>

          <ScrollView contentContainerStyle={styles.list}>
            {eligible.map(p => (
              <TouchableOpacity
                key={p.id}
                style={[styles.playerRow, selectedId === p.id && styles.playerRowActive]}
                onPress={() => setSelected(p.id)}
              >
                <View style={[styles.roleTag, { backgroundColor: p.role === 'BOWLER' ? '#FEE2E2' : '#EFF6FF' }]}>
                  <Text style={[styles.roleTagText, { color: p.role === 'BOWLER' ? '#DC2626' : '#1D4ED8' }]}>
                    {p.role === 'BOWLER' ? 'B' : 'AR'}
                  </Text>
                </View>
                <Text style={[styles.playerName, selectedId === p.id && styles.playerNameActive]}>
                  {p.name}
                </Text>
                {p.stats && (
                  <Text style={styles.playerStats}>
                    {p.stats.overs}ov  {p.stats.wickets}W  {p.stats.runs}R
                  </Text>
                )}
              </TouchableOpacity>
            ))}
            {eligible.length === 0 && (
              <Text style={styles.empty}>No eligible bowlers found.</Text>
            )}
          </ScrollView>

          <TouchableOpacity style={styles.confirmBtn} onPress={confirm}>
            <Text style={styles.confirmText}>Start Over with Selected Bowler →</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.55)' },
  sheet: { backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 36, maxHeight: '75%' },
  handle: { width: 40, height: 4, backgroundColor: '#CBD5E1', borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  title: { fontSize: 18, fontWeight: '800', color: '#1E293B', marginBottom: 14, textAlign: 'center' },
  list: { gap: 8, paddingBottom: 12 },
  playerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 12, borderWidth: 1.5, borderColor: '#E2E8F0', backgroundColor: '#F8FAFC' },
  playerRowActive: { borderColor: '#005EB8', backgroundColor: '#EFF6FF' },
  roleTag: { width: 28, height: 28, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  roleTagText: { fontSize: 11, fontWeight: '800' },
  playerName: { flex: 1, fontSize: 16, fontWeight: '700', color: '#1E293B' },
  playerNameActive: { color: '#005EB8' },
  playerStats: { fontSize: 12, color: '#64748B', fontVariant: ['tabular-nums'] },
  empty: { textAlign: 'center', color: '#94A3B8', marginTop: 20, fontStyle: 'italic' },
  confirmBtn: { marginTop: 12, backgroundColor: '#005EB8', padding: 16, borderRadius: 12, alignItems: 'center' },
  confirmText: { color: '#FFF', fontWeight: '800', fontSize: 15 },
});
