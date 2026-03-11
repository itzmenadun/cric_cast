import React, { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { api, apiWithRetry } from '../services/api';
import { useMatch } from '../context/MatchContext';
import ErrorBanner from '../components/ErrorBanner';
import { YStack, XStack, ScrollView, Card, Paragraph, Text, Button, Spinner, Theme } from 'tamagui';

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
    // If toss decisions haven't been made or match isn't officially started, always go to setup first.
    if (match.status === 'UPCOMING' || match.status === 'TOSS') {
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

  const renderItem = (item) => {
    const status = item.status;
    const isLive = status === 'LIVE';
    const isCompleted = status === 'COMPLETED';
    const statusLabel = status.replace('_', ' ');

    return (
      <Card
        key={item.id}
        elevate
        bordered
        br="$md"
        mb="$3"
        padding="$3"
        backgroundColor="$bgCard"
        pressStyle={{ scale: 0.98 }}
        onPress={() => handleMatchSelect(item)}
        onLongPress={() => {
          Alert.alert(`${item.homeTeam?.name || '?'} vs ${item.awayTeam?.name || '?'}`, 'Choose action', [
            { text: 'Edit', onPress: () => navigation.navigate('EditMatch', { matchId: item.id }) },
            { text: 'Delete', style: 'destructive', onPress: () => deleteMatch(item) },
            { text: 'Cancel', style: 'cancel' },
          ]);
        }}
      >
        <XStack jc="space-between" ai="center" mb="$2">
          <Paragraph
            size="$1"
            fontWeight="700"
            px="$2"
            py="$1"
            br="$xs"
            backgroundColor={
              isLive ? '$danger' : isCompleted ? '$primarySoft' : '$primarySoft'
            }
            color={isLive ? '$white' : '$primary'}
          >
            {statusLabel}
          </Paragraph>
          <Paragraph size="$1" color="$textMuted">
            {item.matchDate ? new Date(item.matchDate).toLocaleDateString() : 'TBA'}
          </Paragraph>
        </XStack>

        <XStack jc="space-between" ai="center" mb="$3">
          <XStack ai="center" space="$2" flex={1}>
            <YStack
              width={14}
              height={14}
              br={999}
              backgroundColor={item.homeTeam?.color || '$slate300'}
            />
            <Paragraph size="$3" fontWeight="700" color="$text">
              {item.homeTeam?.name || '?'}
            </Paragraph>
          </XStack>
          <Paragraph size="$2" color="$textMuted">
            vs
          </Paragraph>
          <XStack ai="center" space="$2" flex={1} jc="flex-end">
            <Paragraph size="$3" fontWeight="700" color="$text">
              {item.awayTeam?.name || '?'}
            </Paragraph>
            <YStack
              width={14}
              height={14}
              br={999}
              backgroundColor={item.awayTeam?.color || '$slate300'}
            />
          </XStack>
        </XStack>

        <Paragraph size="$2" color="$textMuted" ta="center">
          {item.venue || 'Venue TBA'}
        </Paragraph>
      </Card>
    );
  };

  return (
    <Theme name="light">
      <YStack f={1} bg="$bg" pt="$3">
        <ErrorBanner message={error} onRetry={loadMatches} visible={!!error} />
        {loading ? (
          <YStack f={1} jc="center" ai="center">
            <Spinner size="large" color="$primary" />
          </YStack>
        ) : (
          <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}>
            {matches.length === 0 ? (
              <YStack f={1} jc="center" ai="center" mt="$6">
                <Text color="$textMuted">No matches scheduled.</Text>
              </YStack>
            ) : (
              matches.map(renderItem)
            )}
          </ScrollView>
        )}
      </YStack>
    </Theme>
  );
}
