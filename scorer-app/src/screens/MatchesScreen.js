import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { api, apiWithRetry } from '../services/api';
import { Calendar, Users } from 'lucide-react-native';
import { useMatch } from '../context/MatchContext';
import ErrorBanner from '../components/ErrorBanner';

export default function MatchesScreen({ route, navigation }) {
  const { tournamentId, tournamentName } = route.params;
  const { loadMatchState } = useMatch();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    navigation.setOptions({
      title: tournamentName,
      headerRight: () => (
        <TouchableOpacity onPress={() => navigation.navigate('CreateMatch')} style={{ marginRight: 8 }}>
          <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 15 }}>+ Match</Text>
        </TouchableOpacity>
      ),
    });
    loadMatches();
  }, []);

  const loadMatches = async () => {
    try {
      setError(null);
      const { data } = await apiWithRetry(() => api.get(`/api/matches?tournamentId=${tournamentId}`));
      setMatches(data);
    } catch (e) {
      setError('Could not load matches. Check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleMatchSelect = async (match) => {
    await loadMatchState(match.id);
    if (match.status === 'UPCOMING') {
      navigation.navigate('PreMatchSetup', { matchId: match.id });
    } else {
      navigation.navigate('ScoringDashboard');
    }
  };

  const deleteMatch = (item) => {
    Alert.alert('Delete Match', `Delete ${item.homeTeam?.name || '?'} vs ${item.awayTeam?.name || '?'}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try { await api.delete(`/api/matches/${item.id}`); loadMatches(); }
        catch { Alert.alert('Error', 'Failed to delete match.'); }
      }},
    ]);
  };

  const renderItem = ({ item }) => {
    return (
      <TouchableOpacity style={styles.card} onPress={() => handleMatchSelect(item)}
        onLongPress={() => {
          Alert.alert(`${item.homeTeam?.name || '?'} vs ${item.awayTeam?.name || '?'}`, 'Choose action', [
            { text: 'Edit', onPress: () => navigation.navigate('EditMatch', { matchId: item.id }) },
            { text: 'Delete', style: 'destructive', onPress: () => deleteMatch(item) },
            { text: 'Cancel', style: 'cancel' },
          ]);
        }}>
        <View style={styles.headerRow}>
          <Text style={styles.status(item.status)}>{item.status.replace('_', ' ')}</Text>
          <Text style={styles.date}>{new Date(item.matchDate).toLocaleDateString()}</Text>
        </View>
        
        <View style={styles.teamsRow}>
          <View style={styles.team}>
            <View style={[styles.colorDot, { backgroundColor: item.homeTeam?.color || '#CBD5E1' }]} />
            <Text style={styles.teamName}>{item.homeTeam?.name || '?'}</Text>
          </View>
          <Text style={styles.vs}>vs</Text>
          <View style={styles.team}>
            <Text style={styles.teamName}>{item.awayTeam?.name || '?'}</Text>
            <View style={[styles.colorDot, { backgroundColor: item.awayTeam?.color || '#CBD5E1' }]} />
          </View>
        </View>
        
        <Text style={styles.venue}>{item.venue || 'TBA'}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ErrorBanner message={error} onRetry={loadMatches} visible={!!error} />
      {loading ? (
        <ActivityIndicator size="large" color="#005EB8" style={styles.loader} />
      ) : (
        <FlatList
          data={matches}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.empty}>No matches scheduled.</Text>}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F5F9' },
  loader: { marginTop: 50 },
  list: { padding: 16 },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: '#CBD5E1'
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  status: (state) => ({
    fontSize: 12,
    fontWeight: 'bold',
    color: state === 'LIVE' ? '#DC2626' : (state === 'COMPLETED' ? '#16A34A' : '#64748B'),
    backgroundColor: state === 'LIVE' ? '#FEE2E2' : (state === 'COMPLETED' ? '#DCFCE7' : '#F1F5F9'),
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    overflow: 'hidden'
  }),
  date: { fontSize: 12, color: '#94A3B8' },
  teamsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  team: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  teamName: { fontSize: 16, fontWeight: '700', color: '#1E293B', marginHorizontal: 8 },
  colorDot: { width: 12, height: 12, borderRadius: 6 },
  vs: { fontSize: 14, color: '#94A3B8', fontWeight: '500' },
  venue: { fontSize: 13, color: '#64748B', textAlign: 'center' },
  empty: { textAlign: 'center', marginTop: 40, color: '#94A3B8' }
});
