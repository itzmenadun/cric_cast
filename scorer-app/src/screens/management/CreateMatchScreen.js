import React, { useEffect, useState } from 'react';
import { View, TextInput, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator, Platform } from 'react-native';
import Toast from 'react-native-toast-message';
import DateTimePicker from '@react-native-community/datetimepicker';
import { api } from '../../services/api';
import { YStack, Paragraph, Text, Button, Theme, Card } from 'tamagui';

export default function CreateMatchScreen({ navigation }) {
  const [tournaments, setTournaments] = useState([]);
  const [teams, setTeams]             = useState([]);
  const [selectedTournament, setTournament] = useState(null);
  const [homeTeam, setHomeTeam]       = useState(null);
  const [awayTeam, setAwayTeam]       = useState(null);
  const [venue, setVenue]             = useState('');
  const [matchDate, setMatchDate]     = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading]         = useState(true);
  const [saving, setSaving]           = useState(false);

  useEffect(() => {
    Promise.all([api.get('/api/tournaments'), api.get('/api/teams')])
      .then(([tRes, teamRes]) => {
        setTournaments(tRes.data || []);
        setTeams(teamRes.data || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const submit = async () => {
    if (!selectedTournament) return Toast.show({ type: 'error', text1: 'Validation', text2: 'Select a tournament.' });
    if (!homeTeam || !awayTeam) return Toast.show({ type: 'error', text1: 'Validation', text2: 'Select both teams.' });
    if (homeTeam.id === awayTeam.id) return Toast.show({ type: 'error', text1: 'Validation', text2: 'Home and away team must be different.' });
    setSaving(true);
    try {
      const { data: match } = await api.post('/api/matches', {
        tournamentId: selectedTournament.id,
        homeTeamId: homeTeam.id,
        awayTeamId: awayTeam.id,
        format: selectedTournament.format,
        oversPerInnings: selectedTournament.oversPerInnings,
        venue: venue.trim() || undefined,
        matchDate: matchDate ? matchDate.toISOString() : undefined,
      });
      Toast.show({ type: 'success', text1: 'Match Created!', text2: `${homeTeam.name} vs ${awayTeam.name}` });
      navigation.replace('PreMatchSetup', { matchId: match.id });
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Error', text2: e?.response?.data?.message || 'Failed to create match.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#005EB8" />
      </View>
    );
  }

  const SelectorGroup = ({ label, items, selected, onSelect, exclude }) => (
    <YStack mt="$3">
      <Paragraph size="$2" fontWeight="600" color="$text">
        {label} <Text style={{ color: '#EF4444' }}>*</Text>
      </Paragraph>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hScroll}>
        {items
          .filter(i => !exclude || i.id !== exclude?.id)
          .map(item => {
            const isActive = selected?.id === item.id;
            return (
              <Button
                key={item.id}
                size="$3"
                mr="$2"
                chromeless={!isActive}
                backgroundColor={isActive ? '$primary' : '$bgCard'}
                borderColor={isActive ? '$primary' : '#CBD5E1'}
                borderWidth={1.5}
                br="$xl"
                onPress={() => onSelect(item)}
              >
                <Text style={[styles.selectorText, isActive && styles.selectorTextActive]}>
                  {item.shortName || item.name}
                </Text>
              </Button>
            );
          })}
      </ScrollView>
    </YStack>
  );

  return (
    <Theme name="light">
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <YStack space="$3">
            <SelectorGroup
              label="Tournament"
              items={tournaments}
              selected={selectedTournament}
              onSelect={setTournament}
            />

            {selectedTournament && (
              <Card bordered br="$md" padding="$3" backgroundColor="$primarySoft">
                <Paragraph size="$2" color="$primary">
                  📋 {selectedTournament.format} · {selectedTournament.oversPerInnings} overs
                </Paragraph>
              </Card>
            )}

            <SelectorGroup
              label="Home Team"
              items={teams}
              selected={homeTeam}
              onSelect={setHomeTeam}
              exclude={awayTeam}
            />
            <SelectorGroup
              label="Away Team"
              items={teams}
              selected={awayTeam}
              onSelect={setAwayTeam}
              exclude={homeTeam}
            />

            {homeTeam && awayTeam && (
              <Card br="$lg" padding="$3" backgroundColor="#1E293B">
                <Paragraph
                  size="$3"
                  color="$white"
                  fontWeight="900"
                  textAlign="center"
                  letterSpacing={2}
                >
                  {homeTeam.shortName}  vs  {awayTeam.shortName}
                </Paragraph>
              </Card>
            )}

            <YStack mt="$3">
              <Paragraph size="$2" fontWeight="600" color="$text" mb="$1">
                Venue
              </Paragraph>
              <TextInput
                style={styles.input}
                placeholder="e.g. R. Premadasa Stadium, Colombo"
                placeholderTextColor="#94A3B8"
                value={venue}
                onChangeText={setVenue}
              />
            </YStack>

            <YStack mt="$3">
              <Paragraph size="$2" fontWeight="600" color="$text" mb="$1">
                Match Date
              </Paragraph>
              {Platform.OS === 'web' ? (
                <input
                  type="date"
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: '10px',
                    border: '1px solid #E2E8F0',
                    fontSize: '15px',
                  }}
                  value={matchDate ? matchDate.toISOString().split('T')[0] : ''}
                  onChange={(e) =>
                    setMatchDate(e.target.value ? new Date(e.target.value) : null)
                  }
                />
              ) : (
                <>
                  <Button
                    size="$3"
                    br="$md"
                    backgroundColor="$bgCard"
                    borderColor="#CBD5E1"
                    borderWidth={1}
                    onPress={() => setShowDatePicker(true)}
                  >
                    <Text style={{ color: matchDate ? '#1E293B' : '#94A3B8' }}>
                      {matchDate
                        ? matchDate.toISOString().split('T')[0]
                        : 'Select Date'}
                    </Text>
                  </Button>
                  {showDatePicker && (
                    <DateTimePicker
                      value={matchDate || new Date()}
                      mode="date"
                      display="default"
                      onChange={(event, date) => {
                        setShowDatePicker(false);
                        if (date) setMatchDate(date);
                      }}
                    />
                  )}
                </>
              )}
            </YStack>
          </YStack>
        </ScrollView>

        <View style={styles.footer}>
          <Button
            size="$4"
            br="$md"
            backgroundColor="#DC2626"
            onPress={submit}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.submitText}>Create Match →</Text>
            )}
          </Button>
        </View>
      </SafeAreaView>
    </Theme>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F5F9' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll: { padding: 20, paddingBottom: 100 },
  label: { fontSize: 14, fontWeight: '600', color: '#475569', marginBottom: 6, marginTop: 20 },
  input: { backgroundColor: '#FFF', borderRadius: 10, padding: 14, fontSize: 15, color: '#1E293B', borderWidth: 1, borderColor: '#E2E8F0' },
  hScroll: { gap: 8, paddingBottom: 4 },
  selectorChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20, borderWidth: 1.5, borderColor: '#CBD5E1', backgroundColor: '#FFF' },
  selectorChipActive: { backgroundColor: '#005EB8', borderColor: '#005EB8' },
  selectorText: { fontWeight: '600', color: '#64748B', fontSize: 14 },
  selectorTextActive: { color: '#FFF' },
  colorDot: { width: 10, height: 10, borderRadius: 5 },
  tournamentInfo: { backgroundColor: '#EFF6FF', padding: 10, borderRadius: 8, marginTop: 8 },
  infoText: { color: '#1D4ED8', fontWeight: '500', fontSize: 13 },
  matchPreview: { marginTop: 16, backgroundColor: '#1E293B', padding: 14, borderRadius: 12, alignItems: 'center' },
  matchPreviewText: { color: '#FFF', fontWeight: '900', fontSize: 22, letterSpacing: 2 },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#E2E8F0' },
  submitBtn: { backgroundColor: '#DC2626', padding: 16, borderRadius: 12, alignItems: 'center' },
  submitText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
});
