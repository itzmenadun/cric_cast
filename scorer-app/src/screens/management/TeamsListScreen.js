import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { api, apiWithRetry } from '../../services/api';
import { Users, Plus, Trash2 } from 'lucide-react-native';
import ErrorBanner from '../../components/ErrorBanner';

export default function TeamsListScreen({ navigation }) {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => { loadTeams(); }, []);

  const loadTeams = async () => {
    try {
      setError(null);
      const { data } = await apiWithRetry(() => api.get('/api/teams'));
      setTeams(data);
    } catch {
      setError('Could not load teams.');
    } finally {
      setLoading(false);
    }
  };

  const deleteTeam = (item) => {
    Alert.alert('Delete Team', `Are you sure you want to delete "${item.name}"? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try { await api.delete(`/api/teams/${item.id}`); loadTeams(); }
        catch { Alert.alert('Error', 'Failed to delete team. It may be in use by a match.'); }
      }},
    ]);
  };

  const renderItem = ({ item }) => {
    const playerCount = item._count?.players || item.players?.length || 0;
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('AddPlayer', { teamId: item.id, teamName: item.name })}
        onLongPress={() => {
          Alert.alert(item.name, 'Choose action', [
            { text: 'Manage Players', onPress: () => navigation.navigate('AddPlayer', { teamId: item.id, teamName: item.name }) },
            { text: 'Delete', style: 'destructive', onPress: () => deleteTeam(item) },
            { text: 'Cancel', style: 'cancel' },
          ]);
        }}
      >
        <View style={styles.cardRow}>
          <View style={[styles.colorBar, { backgroundColor: item.color || '#94A3B8' }]} />
          <View style={styles.cardBody}>
            <Text style={styles.teamName}>{item.name}</Text>
            <Text style={styles.teamSub}>{item.shortName} • {playerCount} player{playerCount !== 1 ? 's' : ''}</Text>
          </View>
          <TouchableOpacity style={styles.deleteBtn} onPress={() => deleteTeam(item)}>
            <Trash2 size={18} color="#DC2626" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ErrorBanner message={error} onRetry={loadTeams} visible={!!error} />
      {loading ? (
        <ActivityIndicator size="large" color="#005EB8" style={styles.loader} />
      ) : (
        <FlatList
          data={teams}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.empty}>No teams yet. Create one!</Text>}
        />
      )}
      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('CreateTeam')}>
        <Plus size={24} color="#FFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F5F9' },
  loader: { marginTop: 50 },
  list: { padding: 16, paddingBottom: 90 },
  card: {
    backgroundColor: '#FFF', borderRadius: 12, marginBottom: 10,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2,
    overflow: 'hidden',
  },
  cardRow: { flexDirection: 'row', alignItems: 'center' },
  colorBar: { width: 6, alignSelf: 'stretch' },
  cardBody: { flex: 1, padding: 14 },
  teamName: { fontSize: 16, fontWeight: '700', color: '#1E293B' },
  teamSub: { fontSize: 13, color: '#64748B', marginTop: 2 },
  deleteBtn: { padding: 14 },
  empty: { textAlign: 'center', marginTop: 40, color: '#94A3B8' },
  fab: {
    position: 'absolute', bottom: 24, right: 24,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: '#16A34A',
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#16A34A', shadowOpacity: 0.4, shadowRadius: 8, elevation: 8,
  },
});
