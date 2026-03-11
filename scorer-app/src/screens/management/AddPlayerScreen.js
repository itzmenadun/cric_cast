import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Alert, ActivityIndicator, FlatList } from 'react-native';
import { api } from '../../services/api';
import { UserPlus, Trash2 } from 'lucide-react-native';

const ROLES = ['BATSMAN', 'BOWLER', 'ALL_ROUNDER', 'WICKET_KEEPER'];
const ROLE_LABELS = { BATSMAN: '🏏 Batsman', BOWLER: '⚾ Bowler', ALL_ROUNDER: '⭐ All-Rounder', WICKET_KEEPER: '🧤 Wicket-Keeper' };

export default function AddPlayerScreen({ route, navigation }) {
  const { teamId, teamName } = route.params;
  const [players, setPlayers]   = useState([]);  // players already on team
  const [firstName, setFirst]   = useState('');
  const [lastName, setLast]     = useState('');
  const [role, setRole]         = useState('BATSMAN');
  const [jersey, setJersey]     = useState('');
  const [saving, setSaving]     = useState(false);
  const [loadingList, setLoadingList] = useState(true);

  useEffect(() => {
    navigation.setOptions({ title: `Players — ${teamName}` });
    loadPlayers();
  }, []);

  const loadPlayers = async () => {
    try {
      const { data } = await api.get(`/api/teams/${teamId}/players`);
      setPlayers(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingList(false);
    }
  };

  const addPlayer = async () => {
    if (!firstName.trim() || !lastName.trim()) return Alert.alert('Validation', 'First and last name required.');
    setSaving(true);
    try {
      // Create player globally then link to team
      const { data: player } = await api.post('/api/players', {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        role,
        jerseyNumber: jersey ? Number(jersey) : undefined,
      });
      await api.post(`/api/teams/${teamId}/players`, { playerId: player.id });
      setFirst(''); setLast(''); setJersey(''); setRole('BATSMAN');
      await loadPlayers();
    } catch (e) {
      Alert.alert('Error', e?.response?.data?.message || 'Failed to add player.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

        {/* Add Player Form */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Add New Player</Text>
          <View style={styles.nameRow}>
            <TextInput style={[styles.input, { flex: 1 }]} placeholder="First Name" placeholderTextColor="#94A3B8" value={firstName} onChangeText={setFirst} />
            <TextInput style={[styles.input, { flex: 1 }]} placeholder="Last Name" placeholderTextColor="#94A3B8" value={lastName} onChangeText={setLast} />
          </View>
          <Text style={styles.label}>Role</Text>
          <View style={styles.chipRow}>
            {ROLES.map(r => (
              <TouchableOpacity key={r} style={[styles.chip, role === r && styles.chipActive]} onPress={() => setRole(r)}>
                <Text style={[styles.chipText, role === r && styles.chipTextActive]}>{ROLE_LABELS[r]}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TextInput style={styles.input} placeholder="Jersey # (optional)" placeholderTextColor="#94A3B8" value={jersey} onChangeText={setJersey} keyboardType="number-pad" />
          <TouchableOpacity style={styles.addBtn} onPress={addPlayer} disabled={saving}>
            {saving ? <ActivityIndicator color="#FFF" size="small" /> : (
              <><UserPlus size={16} color="#FFF" /><Text style={styles.addBtnText}>Add to {teamName}</Text></>
            )}
          </TouchableOpacity>
        </View>

        {/* Player List */}
        <Text style={styles.listTitle}>{players.length} Players on Roster</Text>
        {loadingList ? <ActivityIndicator color="#005EB8" style={{ marginTop: 16 }} /> :
          players.map((tp, i) => (
            <View key={tp.player?.id || i} style={styles.playerRow}>
              <View style={styles.jerseyBadge}>
                <Text style={styles.jerseyNum}>{tp.player?.jerseyNumber ?? '—'}</Text>
              </View>
              <View style={styles.playerInfo}>
                <Text style={styles.playerName}>{tp.player?.firstName} {tp.player?.lastName}</Text>
                <Text style={styles.playerRole}>{ROLE_LABELS[tp.player?.role]}</Text>
              </View>
            </View>
          ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F5F9' },
  scroll: { padding: 16, paddingBottom: 40 },
  card: { backgroundColor: '#FFF', borderRadius: 14, padding: 16, marginBottom: 20, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#1E293B', marginBottom: 12 },
  nameRow: { flexDirection: 'row', gap: 8, marginBottom: 4 },
  label: { fontSize: 13, fontWeight: '600', color: '#475569', marginTop: 12, marginBottom: 6 },
  input: { backgroundColor: '#F1F5F9', borderRadius: 8, padding: 12, fontSize: 14, color: '#1E293B', marginBottom: 8, borderWidth: 1, borderColor: '#E2E8F0' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16, borderWidth: 1, borderColor: '#CBD5E1', backgroundColor: '#FFF' },
  chipActive: { backgroundColor: '#005EB8', borderColor: '#005EB8' },
  chipText: { fontSize: 12, fontWeight: '600', color: '#64748B' },
  chipTextActive: { color: '#FFF' },
  addBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#005EB8', padding: 13, borderRadius: 10, marginTop: 6 },
  addBtnText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
  listTitle: { fontSize: 14, fontWeight: '700', color: '#64748B', marginBottom: 10 },
  playerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#FFF', padding: 12, borderRadius: 10, marginBottom: 8, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 3, elevation: 1 },
  jerseyBadge: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center' },
  jerseyNum: { fontWeight: '800', color: '#1D4ED8', fontSize: 15 },
  playerInfo: { flex: 1 },
  playerName: { fontSize: 15, fontWeight: '700', color: '#1E293B' },
  playerRole: { fontSize: 12, color: '#64748B', marginTop: 2 },
});
