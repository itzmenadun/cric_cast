import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator, Platform } from 'react-native';
import Toast from 'react-native-toast-message';
import DateTimePicker from '@react-native-community/datetimepicker';
import { api } from '../../services/api';

const FORMATS = ['T10', 'T20', 'ODI', 'TEST', 'CUSTOM'];
const DEFAULT_OVERS = { T10: '10', T20: '20', ODI: '50', TEST: '90', CUSTOM: '20' };

export default function CreateTournamentScreen({ navigation }) {
  const [name, setName]           = useState('');
  const [format, setFormat]       = useState('T20');
  const [overs, setOvers]         = useState('20');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate]     = useState(null);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [loading, setLoading]     = useState(false);

  const selectFormat = (f) => {
    setFormat(f);
    setOvers(DEFAULT_OVERS[f]);
  };

  const submit = async () => {
    if (!name.trim()) return Toast.show({ type: 'error', text1: 'Validation', text2: 'Tournament name is required.' });
    if (!overs || isNaN(Number(overs))) return Toast.show({ type: 'error', text1: 'Validation', text2: 'Enter a valid overs number.' });
    setLoading(true);
    try {
      await api.post('/api/tournaments', {
        name: name.trim(),
        format,
        oversPerInnings: Number(overs),
        startDate: startDate ? startDate.toISOString() : undefined,
        endDate: endDate ? endDate.toISOString() : undefined,
      });
      Toast.show({ type: 'success', text1: 'Success', text2: `"${name}" created!` });
      navigation.goBack();
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Error', text2: e?.response?.data?.message || 'Failed to create tournament.' });
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

        <Text style={styles.label}>Start Date</Text>
        {Platform.OS === 'web' ? (
          <input
            type="date"
            style={{ width: '100%', padding: '14px', borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: '15px', color: '#1E293B', backgroundColor: '#FFF' }}
            value={startDate ? startDate.toISOString().split('T')[0] : ''}
            onChange={(e) => setStartDate(e.target.value ? new Date(e.target.value) : null)}
          />
        ) : (
          <>
            <TouchableOpacity style={styles.input} onPress={() => setShowStartPicker(true)}>
              <Text style={{ color: startDate ? '#1E293B' : '#94A3B8' }}>
                {startDate ? startDate.toISOString().split('T')[0] : 'Select Date'}
              </Text>
            </TouchableOpacity>
            {showStartPicker && (
              <DateTimePicker
                value={startDate || new Date()}
                mode="date"
                display="default"
                onChange={(event, date) => {
                  setShowStartPicker(false);
                  if (date) setStartDate(date);
                }}
              />
            )}
          </>
        )}

        <Text style={styles.label}>End Date</Text>
        {Platform.OS === 'web' ? (
          <input
            type="date"
            style={{ width: '100%', padding: '14px', borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: '15px', color: '#1E293B', backgroundColor: '#FFF' }}
            value={endDate ? endDate.toISOString().split('T')[0] : ''}
            onChange={(e) => setEndDate(e.target.value ? new Date(e.target.value) : null)}
          />
        ) : (
          <>
            <TouchableOpacity style={styles.input} onPress={() => setShowEndPicker(true)}>
              <Text style={{ color: endDate ? '#1E293B' : '#94A3B8' }}>
                {endDate ? endDate.toISOString().split('T')[0] : 'Select Date'}
              </Text>
            </TouchableOpacity>
            {showEndPicker && (
              <DateTimePicker
                value={endDate || new Date()}
                mode="date"
                display="default"
                onChange={(event, date) => {
                  setShowEndPicker(false);
                  if (date) setEndDate(date);
                }}
              />
            )}
          </>
        )}

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
