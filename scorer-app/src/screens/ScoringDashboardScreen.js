import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, SafeAreaView, ActivityIndicator } from 'react-native';
import uuid from 'react-native-uuid';
import { useMatch } from '../context/MatchContext';
import { Undo2 } from 'lucide-react-native';
import WicketModal from './WicketModal';
import BowlerChangeModal from './BowlerChangeModal';

export default function ScoringDashboardScreen({ navigation }) {
  const { matchState, submitDelivery, undoLastDelivery, startBowlerOver, isLoading } = useMatch();
  const [submitting, setSubmitting]             = useState(false);
  const [wicketModalVisible, setWicketModal]    = useState(false);
  const [bowlerModalVisible, setBowlerModal]    = useState(false);
  const [pendingExtras, setPendingExtras]       = useState(null); // { type, runs }

  if (isLoading || !matchState) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#005EB8" />
        <Text style={{ marginTop: 10, color: '#64748B' }}>Loading Live State...</Text>
      </View>
    );
  }

  // Detect innings break / end of match from matchState
  const liveInnings = matchState.innings?.find(inn => inn.status === 'IN_PROGRESS');
  if (!liveInnings && matchState.innings?.length === 1) {
    navigation.replace('InningsBreak');
    return null;
  }
  if (!liveInnings && matchState.innings?.length >= 2) {
    navigation.replace('MatchSummary');
    return null;
  }

  const { batting_team, current_strikers, current_bowler, crr, rrr, target, current_over_balls } = matchState;

  const onStrike   = current_strikers?.find(s => s.on_strike) || current_strikers?.[0];
  const offStrike  = current_strikers?.find(s => !s.on_strike) || current_strikers?.[1];
  const bowler     = current_bowler;
  const overBalls  = current_over_balls || [];

  // Squad of bowling team for BowlerChangeModal
  const bowlingSquad = matchState.innings?.[0]?.bowlerInnings?.map(bi => ({
    id: bi.player?.id,
    name: `${bi.player?.firstName} ${bi.player?.lastName}`,
    role: bi.player?.role,
    stats: { overs: bi.oversBowled, wickets: bi.wickets, runs: bi.runsConceded },
  })) || [];

  const handleScore = async (runs, extrasType = 'NONE', extrasRuns = 0, isWicket = false, extra = {}) => {
    if (!onStrike || !bowler) return alert('Missing active batsman or bowler. Please check state.');
    setSubmitting(true);
    await submitDelivery({
      matchId: matchState.match_id,
      batsmanId: onStrike.id,
      bowlerId: bowler.id,
      runsScored: runs,
      extrasType,
      extrasRuns,
      isWicket,
      idempotencyKey: uuid.v4(),
      ...extra,
    });
    setSubmitting(false);
  };

  const handleWicketConfirm = async (wicketDetails) => {
    setWicketModal(false);
    await handleScore(wicketDetails.runsScored || 0, 'NONE', 0, true, {
      wicketType: wicketDetails.wicketType,
      dismissedPlayerId: wicketDetails.dismissedPlayerId,
      fielderId: wicketDetails.fielderId,
    });
  };

  const handleBowlerSelected = async (bowlerId) => {
    setBowlerModal(false);
    await startBowlerOver(bowlerId);
  };

  // Check if current over is complete (6 legal balls) → prompt bowler change
  const legalBalls = overBalls.filter(b => b !== 'WD' && b !== 'NB').length;
  const overCompleted = legalBalls >= 6;

  // Render current over ball-by-ball dots
  const BallIndicator = ({ ball }) => {
    const isWicket = ball === 'W';
    const isFour   = ball === '4';
    const isSix    = ball === '6';
    const isExtra  = ball === 'WD' || ball === 'NB';
    return (
      <View style={[
        styles.ballDot,
        isWicket && styles.ballDotWicket,
        isFour && styles.ballDotFour,
        isSix && styles.ballDotSix,
        isExtra && styles.ballDotExtra,
      ]}>
        <Text style={[styles.ballDotText, (isWicket || isFour || isSix) && styles.ballDotTextLight]}>
          {ball === '0' ? '·' : ball}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* SCOREBUG */}
      <View style={styles.scorebug}>
        <View style={styles.scoreRow}>
          <Text style={styles.teamAbbr}>{batting_team?.abbr ?? '???'}</Text>
          <Text style={styles.mainScore}>{batting_team?.score}/{batting_team?.wickets}</Text>
          <Text style={styles.overs}>({batting_team?.overs})</Text>
        </View>
        <View style={styles.ratesRow}>
          <Text style={styles.rateText}>CRR: {crr ?? '—'}</Text>
          {rrr   && <Text style={styles.rateText}>RRR: {rrr}</Text>}
          {target && <Text style={styles.targetText}>Target: {target}</Text>}
        </View>
        {/* Current over ball tracker */}
        <View style={styles.overDots}>
          {overBalls.map((b, i) => <BallIndicator key={i} ball={b} />)}
          {overBalls.length === 0 && <Text style={styles.newOverText}>New Over</Text>}
        </View>
      </View>

      <ScrollView style={styles.mid} contentContainerStyle={{ paddingBottom: 260 }}>
        {/* Active Players */}
        <View style={styles.playersSection}>
          {/* Batsmen */}
          <View style={styles.table}>
            <View style={styles.tableHeaderRow}>
              <Text style={[styles.th, { flex: 3 }]}>Batter</Text>
              <Text style={styles.th}>R</Text><Text style={styles.th}>B</Text>
              <Text style={styles.th}>4s</Text><Text style={styles.th}>6s</Text>
              <Text style={[styles.th, { flex: 1.5 }]}>SR</Text>
            </View>
            {[onStrike, offStrike].filter(Boolean).map((bat) => (
              <View key={bat.id} style={styles.tableRow}>
                <Text style={[styles.td, { flex: 3 }, bat.on_strike && styles.activePlayer]}>
                  {bat.name}{bat.on_strike ? ' *' : ''}
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
          <View style={[styles.table, { marginTop: 12 }]}>
            <View style={styles.tableHeaderRow}>
              <Text style={[styles.th, { flex: 3 }]}>Bowler</Text>
              <Text style={styles.th}>O</Text><Text style={styles.th}>M</Text>
              <Text style={styles.th}>R</Text><Text style={styles.th}>W</Text>
              <Text style={[styles.th, { flex: 1.5 }]}>ECO</Text>
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
      </ScrollView>

      {/* KEYPAD */}
      <View style={styles.keypad}>
        {submitting && (
          <View style={styles.overlay}>
            <ActivityIndicator size="large" color="#FFF" />
          </View>
        )}

        {/* Over complete banner */}
        {overCompleted && (
          <TouchableOpacity style={styles.overCompleteBanner} onPress={() => setBowlerModal(true)}>
            <Text style={styles.overCompleteBannerText}>⚾ Over Complete — Tap to Select Next Bowler</Text>
          </TouchableOpacity>
        )}

        {/* Runs */}
        <View style={styles.keyRow}>
          {[0, 1, 2, 3, 4, 6].map(run => (
            <TouchableOpacity key={run} style={styles.key} onPress={() => handleScore(run)} disabled={overCompleted || submitting}>
              <Text style={[styles.keyText, (overCompleted || submitting) && styles.keyDisabled]}>{run}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Extras */}
        <View style={styles.keyRow}>
          {[
            { label: 'WD', type: 'WIDE',   runs: 1 },
            { label: 'NB', type: 'NO_BALL',runs: 1 },
            { label: 'B',  type: 'BYE',    runs: 1 },
            { label: 'LB', type: 'LEG_BYE',runs: 1 },
          ].map(({ label, type, runs }) => (
            <TouchableOpacity key={label} style={[styles.key, styles.keyExtra]} onPress={() => handleScore(0, type, runs)} disabled={submitting}>
              <Text style={styles.keyExtraText}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Action Row */}
        <View style={styles.keyRow}>
          <TouchableOpacity
            style={[styles.key, styles.keyWicket]}
            onPress={() => setWicketModal(true)}
            disabled={overCompleted || submitting}
          >
            <Text style={styles.keyWicketText}>WICKET</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.key, styles.keyUndo]} onPress={() => { setSubmitting(true); undoLastDelivery().finally(() => setSubmitting(false)); }}>
            <Undo2 size={24} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Modals */}
      <WicketModal
        visible={wicketModalVisible}
        onConfirm={handleWicketConfirm}
        onCancel={() => setWicketModal(false)}
        batsmen={[onStrike, offStrike].filter(Boolean)}
        fielders={bowlingSquad}
        bowler={bowler}
      />
      <BowlerChangeModal
        visible={bowlerModalVisible || overCompleted}
        onConfirm={handleBowlerSelected}
        players={bowlingSquad}
        lastBowlerId={bowler?.id}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F5F9' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 10, justifyContent: 'center', alignItems: 'center', borderRadius: 16 },

  scorebug: { backgroundColor: '#005EB8', paddingTop: 16, paddingBottom: 12, paddingHorizontal: 20, alignItems: 'center' },
  scoreRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  teamAbbr: { color: '#FFF', fontSize: 22, fontWeight: '800' },
  mainScore: { color: '#FFF', fontSize: 42, fontWeight: '900' },
  overs: { color: '#93C5FD', fontSize: 18, fontWeight: '600' },
  ratesRow: { flexDirection: 'row', gap: 16, marginTop: 4 },
  rateText: { color: '#BAE6FD', fontSize: 13, fontWeight: '600' },
  targetText: { color: '#FDE047', fontSize: 13, fontWeight: '800' },

  overDots: { flexDirection: 'row', gap: 6, marginTop: 10 },
  ballDot: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#1D4ED8', justifyContent: 'center', alignItems: 'center' },
  ballDotWicket: { backgroundColor: '#DC2626' },
  ballDotFour: { backgroundColor: '#16A34A' },
  ballDotSix: { backgroundColor: '#7C3AED' },
  ballDotExtra: { backgroundColor: '#D97706' },
  ballDotText: { fontSize: 12, fontWeight: '800', color: '#93C5FD' },
  ballDotTextLight: { color: '#FFF' },
  newOverText: { color: '#93C5FD', fontSize: 13, fontStyle: 'italic' },

  mid: { flex: 1 },
  playersSection: { padding: 12 },
  table: { backgroundColor: '#FFF', borderRadius: 12, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 },
  tableHeaderRow: { flexDirection: 'row', backgroundColor: '#E2E8F0', paddingVertical: 7, paddingHorizontal: 12 },
  th: { flex: 1, fontSize: 11, color: '#475569', fontWeight: '700', textAlign: 'right' },
  tableRow: { flexDirection: 'row', paddingVertical: 11, paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  td: { flex: 1, fontSize: 13, color: '#1E293B', textAlign: 'right' },
  bold: { fontWeight: 'bold' },
  activePlayer: { color: '#0369A1', fontWeight: '700', textAlign: 'left' },

  keypad: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 10, paddingBottom: 20, backgroundColor: '#FFF', borderTopLeftRadius: 22, borderTopRightRadius: 22, shadowColor: '#000', shadowOffset: { height: -4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 15 },
  overCompleteBanner: { backgroundColor: '#FEF3C7', borderRadius: 10, padding: 12, marginBottom: 8, alignItems: 'center' },
  overCompleteBannerText: { color: '#D97706', fontWeight: '700', fontSize: 14 },
  keyRow: { flexDirection: 'row', gap: 7, marginBottom: 7 },
  key: { flex: 1, height: 62, backgroundColor: '#F1F5F9', borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  keyText: { fontSize: 22, fontWeight: '800', color: '#1E293B' },
  keyDisabled: { color: '#CBD5E1' },
  keyExtra: { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' },
  keyExtraText: { fontSize: 16, fontWeight: '700', color: '#1D4ED8' },
  keyWicket: { flex: 4, backgroundColor: '#DC2626', borderColor: '#B91C1C' },
  keyWicketText: { fontSize: 19, fontWeight: '900', color: '#FFF', letterSpacing: 1.5 },
  keyUndo: { flex: 1, backgroundColor: '#475569', borderColor: '#334155' },
});
