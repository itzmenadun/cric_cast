import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet, SafeAreaView } from 'react-native';
import { api } from '../services/api';
import { Calendar, Users } from 'lucide-react-native';
import { useMatch } from '../context/MatchContext';

export default function MatchesScreen({ route, navigation }) {
  const { tournamentId, tournamentName } = route.params;
  const { loadMatchState } = useMatch();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    navigation.setOptions({ title: tournamentName });
    loadMatches();
  }, []);

  const loadMatches = async () => {
    try {
      const { data } = await api.get(`/api/matches?tournamentId=${tournamentId}`);
      setMatches(data);
    } catch (e) {
      console.error(e);
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

  const renderItem = ({ item }) => {
    const isLive = item.status === 'LIVE';
    return (
      <TouchableOpacity style={styles.card} onPress={() => handleMatchSelect(item)}>
        <View style={styles.headerRow}>
          <Text style={styles.status(item.status)}>{item.status.replace('_', ' ')}</Text>
          <Text style={styles.date}>{new Date(item.matchDate).toLocaleDateString()}</Text>
        </View>
        
        <View style={styles.teamsRow}>
          <View style={styles.team}>
            <View style={[styles.colorDot, { backgroundColor: item.homeTeam.color }]} />
            <Text style={styles.teamName}>{item.homeTeam.name}</Text>
          </View>
          <Text style={styles.vs}>vs</Text>
          <View style={styles.team}>
            <Text style={styles.teamName}>{item.awayTeam.name}</Text>
            <View style={[styles.colorDot, { backgroundColor: item.awayTeam.color }]} />
          </View>
        </View>
        
        <Text style={styles.venue}>{item.venue || 'TBA'}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
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
