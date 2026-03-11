import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { api } from '../../services/api';

export default function EditMatchScreen({ route, navigation }) {
  const { matchId } = route.params;
  const [venue, setVenue]         = useState('');
  const [matchDate, setMatchDate] = useState('');
  const [homeTeam, setHomeTeam]   = useState('');
  const [awayTeam, setAwayTeam]   = useState('');
  const [status, setStatus]       = useState('');
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get(`/api/matches/${matchId}`);
        setVenue(data.venue || '');
        setMatchDate(data.matchDate ? data.matchDate.split('T')[0] : '');
        setHomeTeam(data.homeTeam?.name || '?');
        setAwayTeam(data.awayTeam?.name || '?');
        setStatus(data.status || 'UPCOMING');
      } catch {
        Alert.alert('Error', 'Could not load match details.');
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      await api.put(`/api/matches/${matchId}`, {
        venue: venue.trim() || undefined,
        matchDate: matchDate ? new Date(matchDate).toISOString() : undefined,
      });
      Alert.alert('Saved', 'Match updated!', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } catch (e) {
      Alert.alert('Error', e?.response?.data?.message || 'Failed to update match.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <View style={styles.centered}><ActivityIndicator size="large" color="#005EB8" /></View>;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>

        {/* Read-only info */}
        <View style={styles.readOnlyCard}>
          <Text style={styles.roLabel}>Match</Text>
          <Text style={styles.roValue}>{homeTeam} vs {awayTeam}</Text>
          <Text style={styles.roLabel}>Status</Text>
          <Text style={[styles.roValue, { color: status === 'LIVE' ? '#DC2626' : '#475569' }]}>{status}</Text>
        </View>

        <Text style={styles.label}>Venue</Text>
        <TextInput style={styles.input} value={venue} onChangeText={setVenue} placeholder="e.g. Eden Gardens, Kolkata" placeholderTextColor="#94A3B8" />

        <Text style={styles.label}>Match Date (YYYY-MM-DD)</Text>
        <TextInput style={styles.input} value={matchDate} onChangeText={setMatchDate} placeholder="2026-04-15" placeholderTextColor="#94A3B8" />

      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.submitBtn} onPress={save} disabled={saving}>
          {saving ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitText}>Save Changes</Text>}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F5F9' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll: { padding: 20, paddingBottom: 100 },
  readOnlyCard: { backgroundColor: '#FFF', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  roLabel: { fontSize: 12, color: '#94A3B8', fontWeight: '600', textTransform: 'uppercase', marginTop: 6 },
  roValue: { fontSize: 18, fontWeight: '800', color: '#1E293B', marginBottom: 4 },
  label: { fontSize: 14, fontWeight: '600', color: '#475569', marginBottom: 6, marginTop: 16 },
  input: {
    backgroundColor: '#FFF', borderRadius: 10, padding: 14,
    fontSize: 15, color: '#1E293B', borderWidth: 1, borderColor: '#E2E8F0',
  },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#E2E8F0' },
  submitBtn: { backgroundColor: '#D97706', padding: 16, borderRadius: 12, alignItems: 'center' },
  submitText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
});
