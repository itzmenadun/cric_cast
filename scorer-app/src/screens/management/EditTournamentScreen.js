import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { api } from '../../services/api';

const FORMATS = ['T10', 'T20', 'ODI', 'TEST', 'CUSTOM'];

export default function EditTournamentScreen({ route, navigation }) {
  const { tournamentId } = route.params;
  const [name, setName]           = useState('');
  const [format, setFormat]       = useState('T20');
  const [overs, setOvers]         = useState('20');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate]     = useState('');
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get(`/api/tournaments/${tournamentId}`);
        setName(data.name || '');
        setFormat(data.format || 'T20');
        setOvers(String(data.oversPerInnings || 20));
        setStartDate(data.startDate ? data.startDate.split('T')[0] : '');
        setEndDate(data.endDate ? data.endDate.split('T')[0] : '');
      } catch {
        Alert.alert('Error', 'Could not load tournament details.');
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const save = async () => {
    if (!name.trim()) return Alert.alert('Validation', 'Tournament name is required.');
    setSaving(true);
    try {
      await api.put(`/api/tournaments/${tournamentId}`, {
        name: name.trim(),
        format,
        oversPerInnings: Number(overs),
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
      Alert.alert('Saved', `"${name}" updated!`, [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } catch (e) {
      Alert.alert('Error', e?.response?.data?.message || 'Failed to update tournament.');
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

        <Text style={styles.label}>Tournament Name *</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} placeholderTextColor="#94A3B8" />

        <Text style={styles.label}>Format *</Text>
        <View style={styles.chipRow}>
          {FORMATS.map(f => (
            <TouchableOpacity key={f} style={[styles.chip, format === f && styles.chipActive]} onPress={() => setFormat(f)}>
              <Text style={[styles.chipText, format === f && styles.chipTextActive]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Overs Per Innings *</Text>
        <TextInput style={styles.input} value={overs} onChangeText={setOvers} keyboardType="number-pad" placeholderTextColor="#94A3B8" />

        <Text style={styles.label}>Start Date (YYYY-MM-DD)</Text>
        <TextInput style={styles.input} value={startDate} onChangeText={setStartDate} placeholder="2026-04-01" placeholderTextColor="#94A3B8" />

        <Text style={styles.label}>End Date (YYYY-MM-DD)</Text>
        <TextInput style={styles.input} value={endDate} onChangeText={setEndDate} placeholder="2026-04-21" placeholderTextColor="#94A3B8" />

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
  label: { fontSize: 14, fontWeight: '600', color: '#475569', marginBottom: 6, marginTop: 16 },
  input: {
    backgroundColor: '#FFF', borderRadius: 10, padding: 14,
    fontSize: 15, color: '#1E293B', borderWidth: 1, borderColor: '#E2E8F0',
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 20, borderWidth: 1.5, borderColor: '#CBD5E1', backgroundColor: '#FFF' },
  chipActive: { backgroundColor: '#005EB8', borderColor: '#005EB8' },
  chipText: { fontWeight: '600', color: '#64748B', fontSize: 14 },
  chipTextActive: { color: '#FFF' },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#E2E8F0' },
  submitBtn: { backgroundColor: '#D97706', padding: 16, borderRadius: 12, alignItems: 'center' },
  submitText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
});
