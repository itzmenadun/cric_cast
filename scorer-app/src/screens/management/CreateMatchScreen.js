import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { api } from '../../services/api';

export default function CreateMatchScreen({ navigation }) {
  const [tournaments, setTournaments] = useState([]);
  const [teams, setTeams]             = useState([]);
  const [selectedTournament, setTournament] = useState(null);
  const [homeTeam, setHomeTeam]       = useState(null);
  const [awayTeam, setAwayTeam]       = useState(null);
  const [venue, setVenue]             = useState('');
  const [matchDate, setMatchDate]     = useState('');
  const [loading, setLoading]         = useState(true);
  const [saving, setSaving]           = useState(false);

  useEffect(() => {
    Promise.all([api.get('/api/tournaments'), api.get('/api/teams')])
      .then(([tRes, teamRes]) => {
        setTournaments(tRes.data || []);
        setTeams(teamRes.data || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const submit = async () => {
    if (!selectedTournament) return Alert.alert('Validation', 'Select a tournament.');
    if (!homeTeam || !awayTeam) return Alert.alert('Validation', 'Select both teams.');
    if (homeTeam.id === awayTeam.id) return Alert.alert('Validation', 'Home and away team must be different.');
    setSaving(true);
    try {
      const { data: match } = await api.post('/api/matches', {
        tournamentId: selectedTournament.id,
        homeTeamId: homeTeam.id,
        awayTeamId: awayTeam.id,
        format: selectedTournament.format,
        oversPerInnings: selectedTournament.oversPerInnings,
        venue: venue.trim() || undefined,
        matchDate: matchDate || undefined,
      });
      Alert.alert('Match Created!', `${homeTeam.name} vs ${awayTeam.name}`, [
        { text: 'Setup Match Now', onPress: () => navigation.replace('PreMatchSetup', { matchId: match.id }) },
        { text: 'Done', onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      Alert.alert('Error', e?.response?.data?.message || 'Failed to create match.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <View style={styles.centered}><ActivityIndicator size="large" color="#005EB8" /></View>;

  const SelectorGroup = ({ label, items, selected, onSelect, exclude }) => (
    <View>
      <Text style={styles.label}>{label} *</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hScroll}>
        {items.filter(i => !exclude || i.id !== exclude?.id).map(item => (
          <TouchableOpacity
            key={item.id}
            style={[styles.selectorChip, selected?.id === item.id && styles.selectorChipActive]}
            onPress={() => onSelect(item)}
          >
            {item.color && <View style={[styles.colorDot, { backgroundColor: item.color }]} />}
            <Text style={[styles.selectorText, selected?.id === item.id && styles.selectorTextActive]}>
              {item.shortName || item.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>

        <SelectorGroup label="Tournament" items={tournaments} selected={selectedTournament} onSelect={setTournament} />

        {selectedTournament && (
          <View style={styles.tournamentInfo}>
            <Text style={styles.infoText}>📋 {selectedTournament.format} · {selectedTournament.oversPerInnings} overs</Text>
          </View>
        )}

        <SelectorGroup label="Home Team" items={teams} selected={homeTeam} onSelect={setHomeTeam} exclude={awayTeam} />
        <SelectorGroup label="Away Team" items={teams} selected={awayTeam} onSelect={setAwayTeam} exclude={homeTeam} />

        {homeTeam && awayTeam && (
          <View style={styles.matchPreview}>
            <Text style={styles.matchPreviewText}>{homeTeam.shortName}  vs  {awayTeam.shortName}</Text>
          </View>
        )}

        <Text style={styles.label}>Venue</Text>
        <TextInput style={styles.input} placeholder="e.g. R. Premadasa Stadium, Colombo" placeholderTextColor="#94A3B8" value={venue} onChangeText={setVenue} />

        <Text style={styles.label}>Match Date (YYYY-MM-DD)</Text>
        <TextInput style={styles.input} placeholder="2026-04-05" placeholderTextColor="#94A3B8" value={matchDate} onChangeText={setMatchDate} />

      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.submitBtn} onPress={submit} disabled={saving}>
          {saving ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitText}>Create Match →</Text>}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F5F9' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll: { padding: 20, paddingBottom: 100 },
  label: { fontSize: 14, fontWeight: '600', color: '#475569', marginBottom: 6, marginTop: 20 },
  input: { backgroundColor: '#FFF', borderRadius: 10, padding: 14, fontSize: 15, color: '#1E293B', borderWidth: 1, borderColor: '#E2E8F0' },
  hScroll: { gap: 8, paddingBottom: 4 },
  selectorChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20, borderWidth: 1.5, borderColor: '#CBD5E1', backgroundColor: '#FFF' },
  selectorChipActive: { backgroundColor: '#005EB8', borderColor: '#005EB8' },
  selectorText: { fontWeight: '600', color: '#64748B', fontSize: 14 },
  selectorTextActive: { color: '#FFF' },
  colorDot: { width: 10, height: 10, borderRadius: 5 },
  tournamentInfo: { backgroundColor: '#EFF6FF', padding: 10, borderRadius: 8, marginTop: 8 },
  infoText: { color: '#1D4ED8', fontWeight: '500', fontSize: 13 },
  matchPreview: { marginTop: 16, backgroundColor: '#1E293B', padding: 14, borderRadius: 12, alignItems: 'center' },
  matchPreviewText: { color: '#FFF', fontWeight: '900', fontSize: 22, letterSpacing: 2 },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#E2E8F0' },
  submitBtn: { backgroundColor: '#DC2626', padding: 16, borderRadius: 12, alignItems: 'center' },
  submitText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
});
