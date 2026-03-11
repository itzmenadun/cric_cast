import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { useMatch } from '../context/MatchContext';
import { Trophy } from 'lucide-react-native';

export default function MatchSummaryScreen({ navigation }) {
  const { matchState } = useMatch();

  if (!matchState) return null;

  const inn1 = matchState.innings?.[0];
  const inn2 = matchState.innings?.[1];
  const battingTeam1 = matchState.homeTeam?.id === inn1?.battingTeamId ? matchState.homeTeam : matchState.awayTeam;
  const battingTeam2 = matchState.homeTeam?.id === inn2?.battingTeamId ? matchState.homeTeam : matchState.awayTeam;

  // Determine winner
  let result = '';
  if (inn1 && inn2) {
    if (inn2.totalRuns > inn1.totalRuns) {
      const wicketsLeft = 10 - inn2.totalWickets;
      result = `${battingTeam2.name} won by ${wicketsLeft} wicket${wicketsLeft !== 1 ? 's' : ''}`;
    } else if (inn2.totalRuns < inn1.totalRuns) {
      const runDiff = inn1.totalRuns - inn2.totalRuns;
      result = `${battingTeam1.name} won by ${runDiff} run${runDiff !== 1 ? 's' : ''}`;
    } else {
      result = 'Match Tied!';
    }
  }

  const ScorecardTable = ({ inningsData, battingTeamName }) => {
    const batsmen = inningsData?.batsmanInnings?.filter(b => b.status !== 'DID_NOT_BAT') || [];
    const bowlers = inningsData?.bowlerInnings || [];
    return (
      <View style={styles.inningsBlock}>
        <Text style={styles.inningsTitle}>{battingTeamName} · {inningsData?.totalRuns}/{inningsData?.totalWickets} ({inningsData?.totalOvers} ov)</Text>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.th, { flex: 3 }]}>Batsman</Text>
            <Text style={styles.th}>R</Text><Text style={styles.th}>B</Text>
            <Text style={styles.th}>4s</Text><Text style={styles.th}>6s</Text><Text style={styles.th}>SR</Text>
          </View>
          {batsmen.map((b, i) => (
            <View key={i} style={[styles.tableRow, i % 2 === 0 && styles.tableRowAlt]}>
              <Text style={[styles.td, { flex: 3 }]} numberOfLines={1}>
                {b.player?.firstName} {b.player?.lastName}
                {(b.status === 'NOT_OUT' || b.status === 'BATTING') ? ' *' : ''}
              </Text>
              <Text style={[styles.td, styles.bold]}>{b.runs}</Text>
              <Text style={styles.td}>{b.ballsFaced}</Text>
              <Text style={styles.td}>{b.fours}</Text>
              <Text style={styles.td}>{b.sixes}</Text>
              <Text style={styles.td}>{b.strikeRate?.toFixed(1)}</Text>
            </View>
          ))}
        </View>

        <View style={[styles.table, { marginTop: 10 }]}>
          <View style={styles.tableHeader}>
            <Text style={[styles.th, { flex: 3 }]}>Bowler</Text>
            <Text style={styles.th}>O</Text><Text style={styles.th}>M</Text>
            <Text style={styles.th}>R</Text><Text style={styles.th}>W</Text><Text style={styles.th}>ECO</Text>
          </View>
          {bowlers.map((b, i) => (
            <View key={i} style={[styles.tableRow, i % 2 === 0 && styles.tableRowAlt]}>
              <Text style={[styles.td, { flex: 3 }]} numberOfLines={1}>{b.player?.firstName} {b.player?.lastName}</Text>
              <Text style={styles.td}>{b.oversBowled}</Text>
              <Text style={styles.td}>{b.maidens}</Text>
              <Text style={styles.td}>{b.runsConceded}</Text>
              <Text style={[styles.td, b.wickets > 0 && styles.wicketHighlight]}>{b.wickets}</Text>
              <Text style={styles.td}>{b.economy?.toFixed(2)}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>

        <View style={styles.resultBanner}>
          <Trophy size={32} color="#FDE047" />
          <Text style={styles.resultText}>{result || 'Match Completed'}</Text>
          <Text style={styles.resultSub}>
            {matchState.tournament?.name} · {matchState.venue || 'Venue TBA'}
          </Text>
        </View>

        {inn1 && <ScorecardTable inningsData={inn1} battingTeamName={battingTeam1?.name} />}
        {inn2 && <ScorecardTable inningsData={inn2} battingTeamName={battingTeam2?.name} />}

      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.doneBtn} onPress={() => navigation.navigate('Dashboard')}>
          <Text style={styles.doneBtnText}>Back to Dashboard</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F5F9' },
  scroll: { paddingBottom: 100 },
  resultBanner: { backgroundColor: '#1E293B', paddingVertical: 32, alignItems: 'center', gap: 8 },
  resultText: { color: '#FFF', fontSize: 22, fontWeight: '900', textAlign: 'center', paddingHorizontal: 20 },
  resultSub: { color: '#94A3B8', fontSize: 13 },
  inningsBlock: { padding: 16 },
  inningsTitle: { fontSize: 14, fontWeight: '800', color: '#005EB8', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  table: { backgroundColor: '#FFF', borderRadius: 12, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.04, elevation: 1 },
  tableHeader: { flexDirection: 'row', backgroundColor: '#E2E8F0', paddingVertical: 8, paddingHorizontal: 12 },
  th: { flex: 1, fontSize: 10, fontWeight: '700', color: '#475569', textAlign: 'right', textTransform: 'uppercase' },
  tableRow: { flexDirection: 'row', paddingVertical: 9, paddingHorizontal: 12 },
  tableRowAlt: { backgroundColor: '#F8FAFC' },
  td: { flex: 1, fontSize: 12, color: '#1E293B', textAlign: 'right' },
  bold: { fontWeight: '800' },
  wicketHighlight: { fontWeight: '800', color: '#DC2626' },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FFF', padding: 16, borderTopWidth: 1, borderTopColor: '#E2E8F0' },
  doneBtn: { backgroundColor: '#005EB8', padding: 16, borderRadius: 12, alignItems: 'center' },
  doneBtnText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
});
