import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import Toast from 'react-native-toast-message';

// Context
import { MatchProvider } from './src/context/MatchContext';

// ── Core Screens ──
import DashboardScreen         from './src/screens/DashboardScreen';
import TournamentsScreen       from './src/screens/TournamentsScreen';
import MatchesScreen           from './src/screens/MatchesScreen';
import PreMatchSetupScreen     from './src/screens/PreMatchSetupScreen';
import ScoringDashboardScreen  from './src/screens/ScoringDashboardScreen';
import InningsBreakScreen      from './src/screens/InningsBreakScreen';
import MatchSummaryScreen      from './src/screens/MatchSummaryScreen';

// ── Management Screens ──
import CreateTournamentScreen  from './src/screens/management/CreateTournamentScreen';
import CreateTeamScreen        from './src/screens/management/CreateTeamScreen';
import AddPlayerScreen         from './src/screens/management/AddPlayerScreen';
import CreateMatchScreen       from './src/screens/management/CreateMatchScreen';
import EditTournamentScreen    from './src/screens/management/EditTournamentScreen';
import EditMatchScreen         from './src/screens/management/EditMatchScreen';
import TeamsListScreen          from './src/screens/management/TeamsListScreen';

const Stack = createNativeStackNavigator();

const NAV_HEADER_STYLE = {
  headerStyle: { backgroundColor: '#005EB8' },
  headerTintColor: '#fff',
  headerTitleStyle: { fontWeight: 'bold' },
};

export default function App() {
  return (
    <>
      <MatchProvider>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Dashboard" screenOptions={NAV_HEADER_STYLE}>

            {/* ── Home ── */}
            <Stack.Screen
              name="Dashboard"
              component={DashboardScreen}
              options={{ title: 'CricCast 🏏', headerShown: false }}
            />

            {/* ── Browsing ── */}
            <Stack.Screen
              name="Tournaments"
              component={TournamentsScreen}
              options={{ title: 'Tournaments' }}
            />
            <Stack.Screen
              name="Matches"
              component={MatchesScreen}
              // title set dynamically inside MatchesScreen
            />

            {/* ── Match Flow ── */}
            <Stack.Screen
              name="PreMatchSetup"
              component={PreMatchSetupScreen}
              options={{ title: 'Pre-Match Setup' }}
            />
            <Stack.Screen
              name="ScoringDashboard"
              component={ScoringDashboardScreen}
              options={{ title: 'Live Scoring Engine', headerBackVisible: false }}
            />
            <Stack.Screen
              name="InningsBreak"
              component={InningsBreakScreen}
              options={{ title: 'Innings Break', headerBackVisible: false }}
            />
            <Stack.Screen
              name="MatchSummary"
              component={MatchSummaryScreen}
              options={{ title: 'Match Summary', headerBackVisible: false }}
            />

            {/* ── Management ── */}
            <Stack.Screen
              name="CreateTournament"
              component={CreateTournamentScreen}
              options={{ title: 'New Tournament' }}
            />
            <Stack.Screen
              name="CreateTeam"
              component={CreateTeamScreen}
              options={{ title: 'New Team' }}
            />
            <Stack.Screen
              name="AddPlayer"
              component={AddPlayerScreen}
              options={{ title: 'Add Players' }}
            />
            <Stack.Screen
              name="CreateMatch"
              component={CreateMatchScreen}
              options={{ title: 'New Match' }}
            />
            <Stack.Screen
              name="EditTournament"
              component={EditTournamentScreen}
              options={{ title: 'Edit Tournament' }}
            />
            <Stack.Screen
              name="EditMatch"
              component={EditMatchScreen}
              options={{ title: 'Edit Match' }}
            />
            <Stack.Screen
              name="TeamsList"
              component={TeamsListScreen}
              options={{ title: 'All Teams' }}
            />

          </Stack.Navigator>
          <StatusBar style="light" />
        </NavigationContainer>
      </MatchProvider>
      <Toast />
    </>
  );
}
