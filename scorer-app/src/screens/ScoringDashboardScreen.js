import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, SafeAreaView, ActivityIndicator } from 'react-native';
import uuid from 'react-native-uuid';
import { useMatch } from '../context/MatchContext';
import { Undo2, RotateCcw } from 'lucide-react-native';

export default function ScoringDashboardScreen() {
  const { matchState, submitDelivery, undoLastDelivery, isLoading } = useMatch();
  const [submitting, setSubmitting] = useState(false);

  if (isLoading || !matchState || !matchState.batting_team) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#005EB8" />
        <Text style={{ textAlign: 'center', marginTop: 10 }}>Loading Live State...</Text>
      </View>
    );
  }

  const { batting_team, current_strikers, current_bowler, crr, rrr, target } = matchState;
  
  // Safe parsing
  const onStrike = current_strikers?.find(s => s.on_strike) || current_strikers?.[0];
  const offStrike = current_strikers?.find(s => !s.on_strike) || current_strikers?.[1];
  const bowler = current_bowler;

  const handleScore = async (runs, extrasType = 'NONE', extrasRuns = 0, isWicket = false) => {
    if (!onStrike || !bowler) return alert('Missing active batsman or bowler.');
    setSubmitting(true);
    
    // Construct the standard payload
    const payload = {
      matchId: matchState.match_id,
      inningsId: batting_team.id, // Usually the batting team ID maps to the innings in state (a simplification for MVP)
      overId: bowler.overId || 'temp-over-uuid', // To be properly fetched from state
      ballNumber: 1, // To be properly computed
      batsmanId: onStrike.id,
      bowlerId: bowler.id,
      runsScored: runs,
      extrasType,
      extrasRuns,
      isWicket,
      idempotencyKey: uuid.v4(),
    };

    if (isWicket) {
      payload.wicketType = 'CAUGHT'; 
      payload.dismissedPlayerId = onStrike.id;
    }

    // Since we simplified the state structure, let's just send the required IDs
    // The backend uses these to do the heavy DB lifting.
    await submitDelivery(payload);
    setSubmitting(false);
  };

  const handleUndo = async () => {
    setSubmitting(true);
    // Hardcoded inningsId fetch logic for MVP brevity
    await undoLastDelivery('current-innings-uuid');
    setSubmitting(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* SCOREBUG HEADER */}
      <View style={styles.scorebug}>
        <View style={styles.scoreRow}>
          <Text style={styles.teamAbbr}>{batting_team.abbr}</Text>
          <Text style={styles.mainScore}>{batting_team.score}/{batting_team.wickets}</Text>
          <Text style={styles.overs}>({batting_team.overs})</Text>
        </View>
        <View style={styles.ratesRow}>
          <Text style={styles.rateText}>CRR: {crr}</Text>
          {rrr && <Text style={styles.rateText}>RRR: {rrr}</Text>}
          {target && <Text style={styles.targetText}>Target: {target}</Text>}
        </View>
      </View>

      {/* ACTIVE PLAYERS */}
      <View style={styles.playersSection}>
        {/* Batsmen */}
        <View style={styles.table}>
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.th, { flex: 3 }]}>Batter</Text>
            <Text style={styles.th}>R</Text>
            <Text style={styles.th}>B</Text>
            <Text style={styles.th}>4s</Text>
            <Text style={styles.th}>6s</Text>
            <Text style={[styles.th, { flex: 1.5 }]}>SR</Text>
          </View>
          
          {[onStrike, offStrike].filter(Boolean).map((bat) => (
            <View key={bat.id} style={styles.tableRow}>
              <Text style={[styles.td, { flex: 3 }, bat.on_strike && styles.activePlayer]}>
                {bat.name} {bat.on_strike ? '*' : ''}
              </Text>
              <Text style={[styles.td, styles.bold]}>{bat.runs}</Text>
              <Text style={styles.td}>{bat.balls}</Text>
              <Text style={styles.td}>{bat.fours}</Text>
              <Text style={styles.td}>{bat.sixes}</Text>
              <Text style={[styles.td, { flex: 1.5 }]}>{bat.strike_rate}</Text>
            </View>
          ))}
        </View>

        {/* Bowler */}
        <View style={[styles.table, { marginTop: 16 }]}>
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.th, { flex: 3 }]}>Bowler</Text>
            <Text style={styles.th}>O</Text>
            <Text style={styles.th}>M</Text>
            <Text style={styles.th}>R</Text>
            <Text style={styles.th}>W</Text>
            <Text style={[styles.th, { flex: 1.5 }]}>ECON</Text>
          </View>
          {bowler && (
            <View style={styles.tableRow}>
              <Text style={[styles.td, { flex: 3 }, styles.activePlayer]}>{bowler.name}</Text>
              <Text style={styles.td}>{bowler.overs}</Text>
              <Text style={styles.td}>{bowler.maidens}</Text>
              <Text style={styles.td}>{bowler.runs_conceded}</Text>
              <Text style={[styles.td, styles.bold]}>{bowler.wickets}</Text>
              <Text style={[styles.td, { flex: 1.5 }]}>{bowler.economy}</Text>
            </View>
          )}
        </View>
      </View>

      {/* KEYPAD */}
      <View style={styles.keypad}>
        {submitting && (
          <View style={styles.overlay}>
            <ActivityIndicator size="large" color="#FFF" />
          </View>
        )}
        
        {/* Runs Row */}
        <View style={styles.keyRow}>
          {[0, 1, 2, 3, 4, 6].map(run => (
            <TouchableOpacity key={run} style={styles.key} onPress={() => handleScore(run)}>
              <Text style={styles.keyText}>{run}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Extras Row */}
        <View style={styles.keyRow}>
          <TouchableOpacity style={[styles.key, styles.keyExtra]} onPress={() => handleScore(0, 'WIDE', 1)}>
            <Text style={styles.keyExtraText}>WD</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.key, styles.keyExtra]} onPress={() => handleScore(0, 'NO_BALL', 1)}>
            <Text style={styles.keyExtraText}>NB</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.key, styles.keyExtra]} onPress={() => handleScore(0, 'BYE', 1)}>
            <Text style={styles.keyExtraText}>B</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.key, styles.keyExtra]} onPress={() => handleScore(0, 'LEG_BYE', 1)}>
            <Text style={styles.keyExtraText}>LB</Text>
          </TouchableOpacity>
        </View>

        {/* Action Row */}
        <View style={styles.keyRow}>
          <TouchableOpacity style={[styles.key, styles.keyWicket]} onPress={() => handleScore(0, 'NONE', 0, true)}>
            <Text style={styles.keyWicketText}>WICKET</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.key, styles.keyUndo]} onPress={handleUndo}>
            <Undo2 size={24} color="#FFF" />
          </TouchableOpacity>
        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F5F9' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 10, justifyContent: 'center', alignItems: 'center', borderRadius: 16 },
  
  // Scorebug
  scorebug: { backgroundColor: '#005EB8', padding: 20, alignItems: 'center', shadowColor: '#000', shadowOffset: { height: 4 }, shadowOpacity: 0.2, shadowRadius: 5, elevation: 5 },
  scoreRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  teamAbbr: { color: '#FFF', fontSize: 24, fontWeight: '800' },
  mainScore: { color: '#FFF', fontSize: 42, fontWeight: '900' },
  overs: { color: '#93C5FD', fontSize: 20, fontWeight: '600' },
  ratesRow: { flexDirection: 'row', gap: 16, marginTop: 8 },
  rateText: { color: '#BAE6FD', fontSize: 14, fontWeight: '600' },
  targetText: { color: '#FDE047', fontSize: 14, fontWeight: '800' },

  // Players
  playersSection: { padding: 16 },
  table: { backgroundColor: '#FFF', borderRadius: 12, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 },
  tableHeaderRow: { flexDirection: 'row', backgroundColor: '#E2E8F0', paddingVertical: 8, paddingHorizontal: 12 },
  th: { flex: 1, fontSize: 12, color: '#475569', fontWeight: '700', textAlign: 'right' },
  tableRow: { flexDirection: 'row', paddingVertical: 12, paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  td: { flex: 1, fontSize: 14, color: '#1E293B', textAlign: 'right' },
  bold: { fontWeight: 'bold' },
  activePlayer: { color: '#0369A1', fontWeight: '700' },

  // Keypad
  keypad: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 12, backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, shadowColor: '#000', shadowOffset: { height: -4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 15 },
  keyRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  key: { flex: 1, height: 65, backgroundColor: '#F1F5F9', borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  keyText: { fontSize: 24, fontWeight: '800', color: '#1E293B' },
  
  keyExtra: { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' },
  keyExtraText: { fontSize: 18, fontWeight: '700', color: '#1D4ED8' },
  
  keyWicket: { flex: 4, backgroundColor: '#DC2626', borderColor: '#B91C1C' },
  keyWicketText: { fontSize: 20, fontWeight: '800', color: '#FFF', letterSpacing: 1 },
  
  keyUndo: { flex: 1, backgroundColor: '#475569', borderColor: '#334155' }
});
