import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet, SafeAreaView, ScrollView, RefreshControl, Alert } from 'react-native';
import { api, apiWithRetry } from '../services/api';
import { Trophy, Zap, Calendar, Plus, Users, CheckCircle } from 'lucide-react-native';
import ErrorBanner from '../components/ErrorBanner';

const STATUS_CONFIG = {
  LIVE:           { label: '🔴 LIVE',      bg: '#FEE2E2', text: '#DC2626' },
  UPCOMING:       { label: '📅 UPCOMING',  bg: '#EFF6FF', text: '#1D4ED8' },
  COMPLETED:      { label: '✅ DONE',      bg: '#DCFCE7', text: '#16A34A' },
  INNINGS_BREAK:  { label: '⏸ BREAK',     bg: '#FEF3C7', text: '#D97706' },
  TOSS:           { label: '🪙 TOSS',      bg: '#F5F3FF', text: '#7C3AED' },
};

export default function DashboardScreen({ navigation }) {
  const [liveMatches, setLiveMatches]     = useState([]);
  const [upcoming, setUpcoming]           = useState([]);
  const [tournaments, setTournaments]     = useState([]);
  const [teams, setTeams]                 = useState([]);
  const [loading, setLoading]             = useState(true);
  const [refreshing, setRefreshing]       = useState(false);
  const [error, setError]                 = useState(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const [matchRes, tRes, teamRes] = await Promise.all([
        apiWithRetry(() => api.get('/api/matches')),
        apiWithRetry(() => api.get('/api/tournaments')),
        apiWithRetry(() => api.get('/api/teams')),
      ]);
      const allMatches = matchRes.data || [];
      setLiveMatches(allMatches.filter(m => m.status === 'LIVE' || m.status === 'INNINGS_BREAK' || m.status === 'TOSS'));
      setUpcoming(allMatches.filter(m => m.status === 'UPCOMING').slice(0, 5));
      setTournaments(tRes.data?.slice(0, 3) || []);
      setTeams(teamRes.data?.slice(0, 5) || []);
    } catch (e) {
      setError('Could not load data. Please check your connection and try again.');
    }
  }, []);

  useEffect(() => { load().finally(() => setLoading(false)); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const goToMatch = (match) => {
    if (match.status === 'UPCOMING') {
      navigation.navigate('PreMatchSetup', { matchId: match.id });
    } else {
      navigation.navigate('ScoringDashboard', { matchId: match.id });
    }
  };

  // ─── CRUD helpers ────────────────────────────────────────
  const deleteTournament = (t) => {
    Alert.alert('Delete Tournament', `Are you sure you want to delete "${t.name}"? All associated matches will be lost.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try { await api.delete(`/api/tournaments/${t.id}`); load(); } catch { Alert.alert('Error', 'Failed to delete tournament.'); }
      }},
    ]);
  };

  const deleteMatch = (m) => {
    Alert.alert('Delete Match', `Delete ${m.homeTeam?.shortName || '?'} vs ${m.awayTeam?.shortName || '?'}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try { await api.delete(`/api/matches/${m.id}`); load(); } catch { Alert.alert('Error', 'Failed to delete match.'); }
      }},
    ]);
  };

  const deleteTeam = (t) => {
    Alert.alert('Delete Team', `Are you sure you want to delete "${t.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try { await api.delete(`/api/teams/${t.id}`); load(); } catch { Alert.alert('Error', 'Failed to delete team.'); }
      }},
    ]);
  };

  const MatchCard = ({ match }) => {
    const cfg = STATUS_CONFIG[match.status] || STATUS_CONFIG.UPCOMING;
    return (
      <View style={styles.matchCard}>
        <View style={styles.matchCardHeader}>
          <View style={[styles.statusPill, { backgroundColor: cfg.bg }]}>
            <Text style={[styles.statusText, { color: cfg.text }]}>{cfg.label}</Text>
          </View>
          <Text style={styles.matchDate}>{match.matchDate ? new Date(match.matchDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : 'TBA'}</Text>
        </View>
        <View style={styles.matchTeams}>
          <Text style={styles.teamNameText}>{match.homeTeam?.shortName || '???'}</Text>
          <Text style={styles.vsText}>vs</Text>
          <Text style={styles.teamNameText}>{match.awayTeam?.shortName || '???'}</Text>
        </View>
        {match.venue ? <Text style={styles.venueText}>{match.venue}</Text> : null}
      </View>
    );
  };

  if (loading) {
    return <View style={styles.centered}><ActivityIndicator size="large" color="#005EB8" /></View>;
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Error Banner */}
      <ErrorBanner message={error} onRetry={load} visible={!!error} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#005EB8" />}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>CricCast 🏏</Text>
          <Text style={styles.headerSub}>Broadcasting Dashboard</Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={[styles.qaBtn, { backgroundColor: '#005EB8' }]} onPress={() => navigation.navigate('CreateTournament')}>
            <Trophy size={18} color="#FFF" />
            <Text style={styles.qaBtnText}>Tournament</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.qaBtn, { backgroundColor: '#16A34A' }]} onPress={() => navigation.navigate('CreateTeam')}>
            <Users size={18} color="#FFF" />
            <Text style={styles.qaBtnText}>Team</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.qaBtn, { backgroundColor: '#DC2626' }]} onPress={() => navigation.navigate('CreateMatch')}>
            <Calendar size={18} color="#FFF" />
            <Text style={styles.qaBtnText}>Match</Text>
          </TouchableOpacity>
        </View>

        {/* Live Matches */}
        {liveMatches.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Zap size={18} color="#DC2626" />
              <Text style={styles.sectionTitle}>Live Now</Text>
            </View>
            {liveMatches.map(m => (
              <TouchableOpacity key={m.id} onPress={() => goToMatch(m)} onLongPress={() => deleteMatch(m)} activeOpacity={0.7}>
                <MatchCard match={m} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Upcoming */}
        {upcoming.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Calendar size={18} color="#005EB8" />
              <Text style={styles.sectionTitle}>Upcoming Matches</Text>
            </View>
            {upcoming.map(m => (
              <TouchableOpacity key={m.id} onPress={() => goToMatch(m)} activeOpacity={0.7}
                onLongPress={() => {
                  Alert.alert(`${m.homeTeam?.shortName || '?'} vs ${m.awayTeam?.shortName || '?'}`, 'Choose action', [
                    { text: 'Edit', onPress: () => navigation.navigate('EditMatch', { matchId: m.id }) },
                    { text: 'Delete', style: 'destructive', onPress: () => deleteMatch(m) },
                    { text: 'Cancel', style: 'cancel' },
                  ]);
                }}>
                <MatchCard match={m} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Tournaments */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Trophy size={18} color="#D97706" />
            <Text style={styles.sectionTitle}>Tournaments</Text>
            <TouchableOpacity style={styles.seeAll} onPress={() => navigation.navigate('Tournaments')}>
              <Text style={styles.seeAllText}>See All →</Text>
            </TouchableOpacity>
          </View>
          {tournaments.map(t => (
            <TouchableOpacity
              key={t.id}
              style={styles.tournamentRow}
              onPress={() => navigation.navigate('Matches', { tournamentId: t.id, tournamentName: t.name })}
              onLongPress={() => {
                Alert.alert(t.name, 'Choose action', [
                  { text: 'Edit', onPress: () => navigation.navigate('EditTournament', { tournamentId: t.id }) },
                  { text: 'Delete', style: 'destructive', onPress: () => deleteTournament(t) },
                  { text: 'Cancel', style: 'cancel' },
                ]);
              }}
            >
              <Trophy size={16} color="#D97706" />
              <Text style={styles.tournamentName}>{t.name}</Text>
              <Text style={styles.tournamentFormat}>{t.format} • {t.oversPerInnings} ov</Text>
            </TouchableOpacity>
          ))}
          {tournaments.length === 0 && (
            <TouchableOpacity style={styles.emptyCreate} onPress={() => navigation.navigate('CreateTournament')}>
              <Plus size={16} color="#005EB8" />
              <Text style={styles.emptyCreateText}>Create your first tournament</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Teams */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Users size={18} color="#16A34A" />
            <Text style={styles.sectionTitle}>Teams</Text>
            <TouchableOpacity style={styles.seeAll} onPress={() => navigation.navigate('TeamsList')}>
              <Text style={styles.seeAllText}>See All →</Text>
            </TouchableOpacity>
          </View>
          {teams.map(t => (
            <TouchableOpacity
              key={t.id}
              style={styles.tournamentRow}
              onPress={() => navigation.navigate('AddPlayer', { teamId: t.id, teamName: t.name })}
              onLongPress={() => {
                Alert.alert(t.name, 'Choose action', [
                  { text: 'Manage Players', onPress: () => navigation.navigate('AddPlayer', { teamId: t.id, teamName: t.name }) },
                  { text: 'Delete', style: 'destructive', onPress: () => deleteTeam(t) },
                  { text: 'Cancel', style: 'cancel' },
                ]);
              }}
            >
              <View style={[styles.teamDot, { backgroundColor: t.color || '#94A3B8' }]} />
              <Text style={styles.tournamentName}>{t.name}</Text>
              <Text style={styles.tournamentFormat}>{t.shortName} • {t._count?.players || t.players?.length || 0} players</Text>
            </TouchableOpacity>
          ))}
          {teams.length === 0 && (
            <TouchableOpacity style={styles.emptyCreate} onPress={() => navigation.navigate('CreateTeam')}>
              <Plus size={16} color="#16A34A" />
              <Text style={styles.emptyCreateText}>Create your first team</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F5F9' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll: { paddingBottom: 32 },

  header: { backgroundColor: '#005EB8', paddingTop: 20, paddingBottom: 24, paddingHorizontal: 20 },
  headerTitle: { color: '#FFF', fontSize: 28, fontWeight: '900', letterSpacing: -0.5 },
  headerSub: { color: '#93C5FD', fontSize: 14, marginTop: 2 },

  quickActions: { flexDirection: 'row', gap: 10, padding: 16, marginTop: -12 },
  qaBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, borderRadius: 10 },
  qaBtnText: { color: '#FFF', fontWeight: '700', fontSize: 13 },

  section: { paddingHorizontal: 16, marginBottom: 8 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1E293B', flex: 1 },
  seeAll: { paddingHorizontal: 4 },
  seeAllText: { color: '#005EB8', fontWeight: '600', fontSize: 13 },

  matchCard: {
    backgroundColor: '#FFF', borderRadius: 12, padding: 14, marginBottom: 10,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  matchCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  statusPill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  statusText: { fontSize: 11, fontWeight: '700' },
  matchDate: { fontSize: 12, color: '#94A3B8' },
  matchTeams: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  teamNameText: { fontSize: 18, fontWeight: '800', color: '#1E293B' },
  vsText: { fontSize: 14, color: '#94A3B8' },
  venueText: { fontSize: 12, color: '#94A3B8', textAlign: 'center' },

  tournamentRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#FFF', padding: 14, borderRadius: 10, marginBottom: 8,
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  tournamentName: { flex: 1, fontSize: 15, fontWeight: '600', color: '#1E293B' },
  tournamentFormat: { fontSize: 12, color: '#64748B' },

  emptyCreate: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#EFF6FF', padding: 14, borderRadius: 10, borderWidth: 1, borderColor: '#BFDBFE', borderStyle: 'dashed' },
  emptyCreateText: { color: '#005EB8', fontWeight: '600', fontSize: 14 },
  teamDot: { width: 14, height: 14, borderRadius: 7 },
});
