import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { api } from '../../services/api';

const PRESET_COLORS = ['#005EB8', '#DC2626', '#16A34A', '#D97706', '#7C3AED', '#0F172A', '#0E7490', '#BE185D'];

export default function CreateTeamScreen({ navigation }) {
  const [name, setName]         = useState('');
  const [shortName, setShort]   = useState('');
  const [color, setColor]       = useState('#005EB8');
  const [loading, setLoading]   = useState(false);

  const submit = async () => {
    if (!name.trim()) return Alert.alert('Validation', 'Team name is required.');
    if (!shortName.trim() || shortName.length > 4) return Alert.alert('Validation', 'Short name required (max 4 chars).');
    setLoading(true);
    try {
      const { data: team } = await api.post('/api/teams', { name: name.trim(), shortName: shortName.trim().toUpperCase(), color });
      Alert.alert('Success', `${team.name} created!`, [
        { text: 'Add Players', onPress: () => navigation.replace('AddPlayer', { teamId: team.id, teamName: team.name }) },
        { text: 'Done', onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      Alert.alert('Error', e?.response?.data?.message || 'Failed to create team.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>

        <Text style={styles.label}>Team Name *</Text>
        <TextInput style={styles.input} placeholder="e.g. Mumbai Lions" placeholderTextColor="#94A3B8" value={name} onChangeText={setName} />

        <Text style={styles.label}>Short Name * (max 4 chars)</Text>
        <TextInput
          style={styles.input} placeholder="e.g. ML" placeholderTextColor="#94A3B8"
          value={shortName} onChangeText={t => setShort(t.slice(0, 4).toUpperCase())}
          autoCapitalize="characters" maxLength={4}
        />

        <Text style={styles.label}>Team Color</Text>
        <View style={styles.colorRow}>
          {PRESET_COLORS.map(c => (
            <TouchableOpacity
              key={c}
              style={[styles.colorSwatch, { backgroundColor: c }, color === c && styles.colorSelected]}
              onPress={() => setColor(c)}
            />
          ))}
        </View>

        {/* Preview */}
        <View style={styles.preview}>
          <View style={[styles.previewBadge, { backgroundColor: color }]}>
            <Text style={styles.previewText}>{shortName || '??'}</Text>
          </View>
          <Text style={styles.previewName}>{name || 'Team Name'}</Text>
        </View>

      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.submitBtn} onPress={submit} disabled={loading}>
          {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitText}>Create Team & Add Players →</Text>}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F5F9' },
  scroll: { padding: 20, paddingBottom: 100 },
  label: { fontSize: 14, fontWeight: '600', color: '#475569', marginBottom: 6, marginTop: 16 },
  input: { backgroundColor: '#FFF', borderRadius: 10, padding: 14, fontSize: 15, color: '#1E293B', borderWidth: 1, borderColor: '#E2E8F0' },
  colorRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 4 },
  colorSwatch: { width: 40, height: 40, borderRadius: 20 },
  colorSelected: { borderWidth: 3, borderColor: '#1E293B' },
  preview: { marginTop: 24, flexDirection: 'row', alignItems: 'center', gap: 16, backgroundColor: '#FFF', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  previewBadge: { width: 60, height: 60, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  previewText: { color: '#FFF', fontSize: 20, fontWeight: '900' },
  previewName: { fontSize: 18, fontWeight: '700', color: '#1E293B', flex: 1 },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#E2E8F0' },
  submitBtn: { backgroundColor: '#16A34A', padding: 16, borderRadius: 12, alignItems: 'center' },
  submitText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
});
