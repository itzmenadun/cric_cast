import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { api } from '../../services/api';

const FORMATS = ['T10', 'T20', 'ODI', 'TEST', 'CUSTOM'];
const DEFAULT_OVERS = { T10: '10', T20: '20', ODI: '50', TEST: '90', CUSTOM: '20' };

export default function CreateTournamentScreen({ navigation }) {
  const [name, setName]           = useState('');
  const [format, setFormat]       = useState('T20');
  const [overs, setOvers]         = useState('20');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate]     = useState('');
  const [loading, setLoading]     = useState(false);

  const selectFormat = (f) => {
    setFormat(f);
    setOvers(DEFAULT_OVERS[f]);
  };

  const submit = async () => {
    if (!name.trim()) return Alert.alert('Validation', 'Tournament name is required.');
    if (!overs || isNaN(Number(overs))) return Alert.alert('Validation', 'Enter a valid overs number.');
    setLoading(true);
    try {
      await api.post('/api/tournaments', {
        name: name.trim(),
        format,
        oversPerInnings: Number(overs),
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
      Alert.alert('Success', `"${name}" created!`, [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } catch (e) {
      Alert.alert('Error', e?.response?.data?.message || 'Failed to create tournament.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>

        <Text style={styles.label}>Tournament Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Club T20 Premier League 2026"
          placeholderTextColor="#94A3B8"
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.label}>Format *</Text>
        <View style={styles.chipRow}>
          {FORMATS.map(f => (
            <TouchableOpacity
              key={f}
              style={[styles.chip, format === f && styles.chipActive]}
              onPress={() => selectFormat(f)}
            >
              <Text style={[styles.chipText, format === f && styles.chipTextActive]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Overs Per Innings *</Text>
        <TextInput
          style={styles.input}
          placeholder="20"
          placeholderTextColor="#94A3B8"
          value={overs}
          onChangeText={setOvers}
          keyboardType="number-pad"
        />

        <Text style={styles.label}>Start Date (YYYY-MM-DD)</Text>
        <TextInput
          style={styles.input}
          placeholder="2026-04-01"
          placeholderTextColor="#94A3B8"
          value={startDate}
          onChangeText={setStartDate}
        />

        <Text style={styles.label}>End Date (YYYY-MM-DD)</Text>
        <TextInput
          style={styles.input}
          placeholder="2026-04-21"
          placeholderTextColor="#94A3B8"
          value={endDate}
          onChangeText={setEndDate}
        />

      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.submitBtn} onPress={submit} disabled={loading}>
          {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitText}>Create Tournament</Text>}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F5F9' },
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
  submitBtn: { backgroundColor: '#005EB8', padding: 16, borderRadius: 12, alignItems: 'center' },
  submitText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
});
