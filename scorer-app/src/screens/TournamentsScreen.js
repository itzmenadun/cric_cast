import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { api, apiWithRetry } from '../services/api';
import { Trophy, Plus } from 'lucide-react-native';
import ErrorBanner from '../components/ErrorBanner';

export default function TournamentsScreen({ navigation }) {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => { loadTournaments(); }, []);

  const loadTournaments = async () => {
    try {
      setError(null);
      const { data } = await apiWithRetry(() => api.get('/api/tournaments'));
      setTournaments(data);
    } catch (e) {
      setError('Could not load tournaments. Check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const deleteTournament = (item) => {
    Alert.alert('Delete Tournament', `Are you sure you want to delete "${item.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try { await api.delete(`/api/tournaments/${item.id}`); loadTournaments(); }
        catch { Alert.alert('Error', 'Failed to delete tournament.'); }
      }},
    ]);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('Matches', { tournamentId: item.id, tournamentName: item.name })}
      onLongPress={() => {
        Alert.alert(item.name, 'Choose action', [
          { text: 'Edit', onPress: () => navigation.navigate('EditTournament', { tournamentId: item.id }) },
          { text: 'Delete', style: 'destructive', onPress: () => deleteTournament(item) },
          { text: 'Cancel', style: 'cancel' },
        ]);
      }}
    >
      <View style={styles.cardHeader}>
        <Trophy size={24} color="#005EB8" />
        <Text style={styles.title}>{item.name}</Text>
      </View>
      <Text style={styles.subtitle}>{item.format} • {item.oversPerInnings} Overs</Text>
      <View style={styles.pill}>
        <Text style={styles.pillText}>{item.matches?.length || 0} Matches</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ErrorBanner message={error} onRetry={loadTournaments} visible={!!error} />
      {loading ? (
        <ActivityIndicator size="large" color="#005EB8" style={styles.loader} />
      ) : (
        <FlatList
          data={tournaments}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.empty}>No tournaments found. Create one!</Text>}
        />
      )}
      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('CreateTournament')}>
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
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  title: { fontSize: 18, fontWeight: 'bold', color: '#1E293B', marginLeft: 12 },
  subtitle: { fontSize: 14, color: '#64748B', marginBottom: 12 },
  pill: {
    alignSelf: 'flex-start',
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pillText: { fontSize: 12, color: '#0369A1', fontWeight: '600' },
  empty: { textAlign: 'center', marginTop: 40, color: '#94A3B8' },
  fab: {
    position: 'absolute', bottom: 24, right: 24,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: '#005EB8',
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#005EB8', shadowOpacity: 0.4, shadowRadius: 8, elevation: 8,
  },
});
