import React, { useEffect, useState } from 'react';
import { View, Text, Switch, TouchableOpacity, ScrollView, ActivityIndicator, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { api } from '../services/api';
import { useMatch } from '../context/MatchContext';

export default function PreMatchSetupScreen({ route, navigation }) {
  const { matchId } = route.params;
  const { matchState, loadMatchState } = useMatch();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Toss State
  const [tossWinnerId, setTossWinnerId] = useState(null);
  const [tossDecision, setTossDecision] = useState('BAT');
  
  // Lineup State (Array of selected player IDs)
  const [homeXI, setHomeXI] = useState([]);
  const [awayXI, setAwayXI] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    await loadMatchState(matchId);
    setLoading(false);
  };

  useEffect(() => {
    if (matchState) {
      if (matchState.tossWinnerId) setTossWinnerId(matchState.tossWinnerId);
      if (matchState.tossDecision) setTossDecision(matchState.tossDecision);
      
      // Select first 11 players automatically for quick setup
      if (homeXI.length === 0) {
        setHomeXI(matchState.homeTeam?.players?.slice(0, 11).map(p => p.playerId) || []);
      }
      if (awayXI.length === 0) {
        setAwayXI(matchState.awayTeam?.players?.slice(0, 11).map(p => p.playerId) || []);
      }
    }
  }, [matchState]);

  const togglePlayer = (teamId, playerId) => {
    if (teamId === matchState.homeTeamId) {
      setHomeXI(prev => prev.includes(playerId) ? prev.filter(id => id !== playerId) : [...prev, playerId]);
    } else {
      setAwayXI(prev => prev.includes(playerId) ? prev.filter(id => id !== playerId) : [...prev, playerId]);
    }
  };

  const startMatch = async () => {
    if (!tossWinnerId) return Alert.alert('Validation Error', 'Please select a toss winner.');
    if (homeXI.length === 0 || awayXI.length === 0) return Alert.alert('Validation Error', 'Please select playing XIs.');

    setSubmitting(true);
    try {
      // 1. Record Toss
      await api.post(`/api/matches/${matchId}/toss`, { tossWinnerId, tossDecision });

      // 2. Submit Lineup
      const lineupPayload = [
        ...homeXI.map((id, index) => ({ playerId: id, teamId: matchState.homeTeamId, battingOrder: index + 1 })),
        ...awayXI.map((id, index) => ({ playerId: id, teamId: matchState.awayTeamId, battingOrder: index + 1 }))
      ];
      await api.post(`/api/matches/${matchId}/lineup`, { players: lineupPayload });

      // 3. Start Innings
      const battingTeamId = (tossWinnerId === matchState.homeTeamId && tossDecision === 'BAT') || 
                            (tossWinnerId === matchState.awayTeamId && tossDecision === 'BOWL') 
                            ? matchState.homeTeamId : matchState.awayTeamId;
      
      const bowlingTeamId = battingTeamId === matchState.homeTeamId ? matchState.awayTeamId : matchState.homeTeamId;

      await api.post(`/api/matches/${matchId}/start-innings`, {
        battingTeamId,
        bowlingTeamId,
        inningsNumber: 1
      });

      // Navigate to scoring
      await loadMatchState(matchId);
      navigation.replace('ScoringDashboard');
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to start match.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !matchState) {
    return <ActivityIndicator size="large" color="#005EB8" style={{ marginTop: 50 }} />;
  }

  // Determine batting/bowling team based on current toss state for UI clarity
  const predictedBatting = (tossWinnerId === matchState.homeTeamId && tossDecision === 'BAT') || 
                           (tossWinnerId === matchState.awayTeamId && tossDecision === 'BOWL') 
                           ? matchState.homeTeam.name : matchState.awayTeam.name;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        
        {/* TOSS SECTION */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Toss Setup</Text>
          
          <Text style={styles.label}>Toss Winner</Text>
          <View style={styles.row}>
            <TouchableOpacity 
              style={[styles.tossBtn, tossWinnerId === matchState.homeTeamId && styles.tossBtnActive]}
              onPress={() => setTossWinnerId(matchState.homeTeamId)}
            >
              <Text style={styles.tossBtnText}>{matchState.homeTeam.shortName}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tossBtn, tossWinnerId === matchState.awayTeamId && styles.tossBtnActive]}
              onPress={() => setTossWinnerId(matchState.awayTeamId)}
            >
              <Text style={styles.tossBtnText}>{matchState.awayTeam.shortName}</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Decision</Text>
          <View style={styles.row}>
            <TouchableOpacity 
              style={[styles.tossBtn, tossDecision === 'BAT' && styles.tossBtnActive]}
              onPress={() => setTossDecision('BAT')}
            >
              <Text style={styles.tossBtnText}>Bat First</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tossBtn, tossDecision === 'BOWL' && styles.tossBtnActive]}
              onPress={() => setTossDecision('BOWL')}
            >
              <Text style={styles.tossBtnText}>Bowl First</Text>
            </TouchableOpacity>
          </View>

          {tossWinnerId && (
            <Text style={styles.summary}>
              {predictedBatting} will bat first.
            </Text>
          )}
        </View>

        {/* LINEUP SECTION */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Playing XI Selection</Text>
          
          {/* Home Team */}
          <View style={styles.teamHeader}>
            <Text style={styles.teamName}>{matchState.homeTeam.name}</Text>
            <Text style={styles.count}>{homeXI.length}/11</Text>
          </View>
          {matchState.homeTeam.players?.map(tp => (
            <TouchableOpacity 
              key={tp.playerId} 
              style={styles.playerRow}
              onPress={() => togglePlayer(matchState.homeTeamId, tp.playerId)}
            >
              <Text style={styles.playerName}>{tp.player.firstName} {tp.player.lastName}</Text>
              <Switch 
                value={homeXI.includes(tp.playerId)} 
                onValueChange={() => togglePlayer(matchState.homeTeamId, tp.playerId)}
              />
            </TouchableOpacity>
          ))}

          {/* Away Team */}
          <View style={[styles.teamHeader, { marginTop: 20 }]}>
            <Text style={styles.teamName}>{matchState.awayTeam.name}</Text>
            <Text style={styles.count}>{awayXI.length}/11</Text>
          </View>
          {matchState.awayTeam.players?.map(tp => (
            <TouchableOpacity 
              key={tp.playerId} 
              style={styles.playerRow}
              onPress={() => togglePlayer(matchState.awayTeamId, tp.playerId)}
            >
              <Text style={styles.playerName}>{tp.player.firstName} {tp.player.lastName}</Text>
              <Switch 
                value={awayXI.includes(tp.playerId)} 
                onValueChange={() => togglePlayer(matchState.awayTeamId, tp.playerId)}
              />
            </TouchableOpacity>
          ))}

        </View>

      </ScrollView>

      {/* START MATCH BUTTON */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.startBtn} onPress={startMatch} disabled={submitting}>
          {submitting ? <ActivityIndicator color="#FFF" /> : <Text style={styles.startBtnText}>Start Match & Innings 1</Text>}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F5F9' },
  scroll: { padding: 16, paddingBottom: 100 },
  card: {
    backgroundColor: '#FFF', borderRadius: 12, padding: 16, marginBottom: 16,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2,
  },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1E293B', marginBottom: 16 },
  label: { fontSize: 14, color: '#64748B', marginBottom: 8, fontWeight: '500' },
  row: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  tossBtn: { 
    flex: 1, paddingVertical: 12, borderRadius: 8, borderWidth: 1, 
    borderColor: '#CBD5E1', alignItems: 'center' 
  },
  tossBtnActive: { backgroundColor: '#005EB8', borderColor: '#005EB8' },
  tossBtnText: { fontWeight: '600', color: '#1E293B' },
  summary: { marginTop: 8, padding: 12, backgroundColor: '#EFF6FF', color: '#1D4ED8', borderRadius: 8, fontWeight: '500' },
  teamHeader: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#E2E8F0', paddingBottom: 8, marginBottom: 8 },
  teamName: { fontSize: 16, fontWeight: '600', color: '#0F172A' },
  count: { fontSize: 14, color: '#64748B' },
  playerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  playerName: { fontSize: 15, color: '#334155' },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FFF', padding: 16, borderTopWidth: 1, borderTopColor: '#E2E8F0' },
  startBtn: { backgroundColor: '#DC2626', padding: 16, borderRadius: 12, alignItems: 'center' },
  startBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' }
});
