import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet, SafeAreaView } from 'react-native';
import { api } from '../services/api';
import { Trophy } from 'lucide-react-native';

export default function TournamentsScreen({ navigation }) {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTournaments();
  }, []);

  const loadTournaments = async () => {
    try {
      const { data } = await api.get('/api/tournaments');
      setTournaments(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => navigation.navigate('Matches', { tournamentId: item.id, tournamentName: item.name })}
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
      {loading ? (
        <ActivityIndicator size="large" color="#005EB8" style={styles.loader} />
      ) : (
        <FlatList
          data={tournaments}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.empty}>No tournaments found.</Text>}
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
  empty: { textAlign: 'center', marginTop: 40, color: '#94A3B8' }
});
