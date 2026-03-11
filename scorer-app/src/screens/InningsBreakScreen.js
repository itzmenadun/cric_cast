import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, BackHandler } from 'react-native';
import { useMatch } from '../context/MatchContext';

export default function InningsBreakScreen({ navigation }) {
  const { matchState, startSecondInnings } = useMatch();

  // Prevent hardware back button — scorer must explicitly proceed
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => sub.remove();
  }, []);

  if (!matchState) return null;

  const inn = matchState.innings?.[0]; // First innings data
  const batting = matchState.homeTeam?.id === inn?.battingTeamId ? matchState.homeTeam : matchState.awayTeam;
  const bowling = matchState.homeTeam?.id === inn?.bowlingTeamId ? matchState.homeTeam : matchState.awayTeam;

  const handleStartInnings2 = async () => {
    const battingTeamId = inn.bowlingTeamId;  // Team that bowled now bats
    const bowlingTeamId = inn.battingTeamId;
    const target = (inn.totalRuns || 0) + 1;
    await startSecondInnings({ battingTeamId, bowlingTeamId, target });
    navigation.replace('ScoringDashboard', { matchId: matchState.id });
  };

  const batsmen = matchState.innings?.[0]?.batsmanInnings || [];
  const bowlers = matchState.innings?.[0]?.bowlerInnings || [];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>

        {/* Result Banner */}
        <View style={styles.banner}>
          <Text style={styles.bannerTeam}>{batting?.name || '—'}</Text>
          <Text style={styles.bannerScore}>{inn?.totalRuns}/{inn?.totalWickets}</Text>
          <Text style={styles.bannerOvers}>({inn?.totalOvers} overs)</Text>
          <Text style={styles.bannerTarget}>Target for {bowling?.name}: {(inn?.totalRuns || 0) + 1}</Text>
        </View>

        {/* Batting Scorecard */}
        <Text style={styles.sectionTitle}>Batting</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.th, { flex: 3 }]}>Batsman</Text>
            <Text style={styles.th}>R</Text>
            <Text style={styles.th}>B</Text>
            <Text style={styles.th}>4s</Text>
            <Text style={styles.th}>6s</Text>
          </View>
          {batsmen.filter(b => b.status !== 'DID_NOT_BAT').map((b, i) => (
            <View key={i} style={[styles.tableRow, i % 2 === 0 && styles.tableRowAlt]}>
              <Text style={[styles.td, { flex: 3 }]} numberOfLines={1}>
                {b.player?.firstName} {b.player?.lastName}
                {b.status === 'BATTING' || b.status === 'NOT_OUT' ? ' *' : ''}
              </Text>
              <Text style={[styles.td, styles.bold]}>{b.runs}</Text>
              <Text style={styles.td}>{b.ballsFaced}</Text>
              <Text style={styles.td}>{b.fours}</Text>
              <Text style={styles.td}>{b.sixes}</Text>
            </View>
          ))}
        </View>

        {/* Bowling Scorecard */}
        <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Bowling</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.th, { flex: 3 }]}>Bowler</Text>
            <Text style={styles.th}>O</Text>
            <Text style={styles.th}>R</Text>
            <Text style={styles.th}>W</Text>
          </View>
          {bowlers.map((b, i) => (
            <View key={i} style={[styles.tableRow, i % 2 === 0 && styles.tableRowAlt]}>
              <Text style={[styles.td, { flex: 3 }]} numberOfLines={1}>{b.player?.firstName} {b.player?.lastName}</Text>
              <Text style={styles.td}>{b.oversBowled}</Text>
              <Text style={styles.td}>{b.runsConceded}</Text>
              <Text style={[styles.td, b.wickets > 0 && styles.wicketHighlight]}>{b.wickets}</Text>
            </View>
          ))}
        </View>

      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.startBtn} onPress={handleStartInnings2}>
          <Text style={styles.startBtnText}>Start 2nd Innings →</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F5F9' },
  scroll: { paddingBottom: 100 },
  banner: { backgroundColor: '#005EB8', paddingVertical: 28, paddingHorizontal: 20, alignItems: 'center' },
  bannerTeam: { color: '#93C5FD', fontSize: 16, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
  bannerScore: { color: '#FFF', fontSize: 52, fontWeight: '900', lineHeight: 58 },
  bannerOvers: { color: '#93C5FD', fontSize: 18, fontWeight: '600' },
  bannerTarget: { marginTop: 12, color: '#FDE047', fontSize: 16, fontWeight: '800', textAlign: 'center' },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#64748B', marginHorizontal: 16, marginTop: 16, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 },
  table: { marginHorizontal: 16, backgroundColor: '#FFF', borderRadius: 12, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.04, elevation: 1 },
  tableHeader: { flexDirection: 'row', backgroundColor: '#E2E8F0', paddingVertical: 8, paddingHorizontal: 12 },
  th: { flex: 1, fontSize: 11, fontWeight: '700', color: '#475569', textAlign: 'right', textTransform: 'uppercase' },
  tableRow: { flexDirection: 'row', paddingVertical: 10, paddingHorizontal: 12 },
  tableRowAlt: { backgroundColor: '#F8FAFC' },
  td: { flex: 1, fontSize: 13, color: '#1E293B', textAlign: 'right' },
  bold: { fontWeight: '800' },
  wicketHighlight: { fontWeight: '800', color: '#DC2626' },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FFF', padding: 16, borderTopWidth: 1, borderTopColor: '#E2E8F0' },
  startBtn: { backgroundColor: '#DC2626', padding: 18, borderRadius: 14, alignItems: 'center' },
  startBtnText: { color: '#FFF', fontWeight: '900', fontSize: 18 },
});
