import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView, Alert } from 'react-native';

const WICKET_TYPES = [
  { key: 'BOWLED',          label: '🏏 Bowled' },
  { key: 'CAUGHT',          label: '🙌 Caught' },
  { key: 'CAUGHT_AND_BOWLED', label: '🔄 Caught & Bowled' },
  { key: 'LBW',             label: '🦵 LBW' },
  { key: 'RUN_OUT',         label: '🏃 Run Out' },
  { key: 'STUMPED',         label: '🧤 Stumped' },
  { key: 'HIT_WICKET',      label: '💥 Hit Wicket' },
  { key: 'RETIRED_HURT',    label: '🏥 Retired Hurt' },
];

// Types that need a fielder
const NEEDS_FIELDER = ['CAUGHT', 'RUN_OUT', 'STUMPED'];
// Type where bowler is the only fielder (no extra fielder)
const NO_EXTRA_FIELDER = ['BOWLED', 'CAUGHT_AND_BOWLED', 'LBW', 'HIT_WICKET', 'RETIRED_HURT'];

export default function WicketModal({ visible, onConfirm, onCancel, batsmen, fielders, bowler }) {
  const [wicketType, setWicketType]           = useState('CAUGHT');
  const [dismissedPlayerId, setDismissed]     = useState(null);
  const [fielderId, setFielder]               = useState(null);
  const [extraRuns, setExtraRuns]             = useState(0);

  const needsFielder = NEEDS_FIELDER.includes(wicketType);

  const confirm = () => {
    const onStrike = batsmen?.find(b => b.on_strike);
    if (!onStrike) return Alert.alert('Error', 'No batsman on strike found.');
    if (needsFielder && !fielderId && wicketType !== 'RUN_OUT') return Alert.alert('Validation', 'Please select the fielder.');

    onConfirm({
      wicketType,
      dismissedPlayerId: dismissedPlayerId || onStrike.id,
      fielderId: needsFielder ? fielderId : undefined,
      runsScored: extraRuns,
    });
    // Reset
    setWicketType('CAUGHT'); setDismissed(null); setFielder(null); setExtraRuns(0);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <Text style={styles.title}>🔴 Wicket Details</Text>

          {/* Wicket Type */}
          <Text style={styles.label}>Dismissal Type</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hScroll}>
            {WICKET_TYPES.map(w => (
              <TouchableOpacity
                key={w.key}
                style={[styles.chip, wicketType === w.key && styles.chipActive]}
                onPress={() => { setWicketType(w.key); setFielder(null); }}
              >
                <Text style={[styles.chipText, wicketType === w.key && styles.chipTextActive]}>{w.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Dismissed Batsman (if two on strike — e.g. run out of non-striker) */}
          {batsmen && batsmen.length > 1 && (
            <>
              <Text style={styles.label}>Dismissed Batsman</Text>
              <View style={styles.playerRow}>
                {batsmen.filter(Boolean).map(b => (
                  <TouchableOpacity
                    key={b.id}
                    style={[styles.playerChip, (dismissedPlayerId || batsmen.find(x => x.on_strike)?.id) === b.id && styles.playerChipActive]}
                    onPress={() => setDismissed(b.id)}
                  >
                    <Text style={styles.playerChipText}>{b.name} {b.on_strike ? '*' : ''}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          {/* Fielder Selection */}
          {needsFielder && (
            <>
              <Text style={styles.label}>{wicketType === 'STUMPED' ? 'Wicket-Keeper' : 'Fielder'}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hScroll}>
                {fielders?.map(f => (
                  <TouchableOpacity
                    key={f.id}
                    style={[styles.chip, fielderId === f.id && styles.chipActive]}
                    onPress={() => setFielder(f.id)}
                  >
                    <Text style={[styles.chipText, fielderId === f.id && styles.chipTextActive]}>{f.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </>
          )}

          {/* Runs scored on wicket ball (run out) */}
          {wicketType === 'RUN_OUT' && (
            <>
              <Text style={styles.label}>Runs scored before run out</Text>
              <View style={styles.runsRow}>
                {[0, 1, 2, 3].map(r => (
                  <TouchableOpacity key={r} style={[styles.runChip, extraRuns === r && styles.runChipActive]} onPress={() => setExtraRuns(r)}>
                    <Text style={[styles.runChipText, extraRuns === r && styles.runChipTextActive]}>{r}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmBtn} onPress={confirm}>
              <Text style={styles.confirmText}>Confirm Wicket</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  sheet: { backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 36 },
  handle: { width: 40, height: 4, backgroundColor: '#CBD5E1', borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  title: { fontSize: 20, fontWeight: '800', color: '#DC2626', marginBottom: 16, textAlign: 'center' },
  label: { fontSize: 13, fontWeight: '600', color: '#475569', marginBottom: 8, marginTop: 12 },
  hScroll: { gap: 8, paddingBottom: 4 },
  chip: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 20, borderWidth: 1.5, borderColor: '#CBD5E1', backgroundColor: '#F8FAFC' },
  chipActive: { backgroundColor: '#DC2626', borderColor: '#DC2626' },
  chipText: { fontSize: 13, fontWeight: '600', color: '#64748B' },
  chipTextActive: { color: '#FFF' },
  playerRow: { flexDirection: 'row', gap: 8 },
  playerChip: { flex: 1, padding: 12, borderRadius: 10, borderWidth: 1.5, borderColor: '#CBD5E1', alignItems: 'center' },
  playerChipActive: { backgroundColor: '#1E293B', borderColor: '#1E293B' },
  playerChipText: { fontWeight: '700', color: '#1E293B', fontSize: 14 },
  runsRow: { flexDirection: 'row', gap: 8 },
  runChip: { flex: 1, paddingVertical: 12, borderRadius: 10, borderWidth: 1.5, borderColor: '#CBD5E1', alignItems: 'center' },
  runChipActive: { backgroundColor: '#D97706', borderColor: '#D97706' },
  runChipText: { fontSize: 18, fontWeight: '800', color: '#64748B' },
  runChipTextActive: { color: '#FFF' },
  actions: { flexDirection: 'row', gap: 12, marginTop: 20 },
  cancelBtn: { flex: 1, padding: 14, borderRadius: 12, borderWidth: 1.5, borderColor: '#CBD5E1', alignItems: 'center' },
  cancelText: { fontWeight: '700', color: '#64748B' },
  confirmBtn: { flex: 2, padding: 14, borderRadius: 12, backgroundColor: '#DC2626', alignItems: 'center' },
  confirmText: { fontWeight: '800', color: '#FFF', fontSize: 16 },
});
