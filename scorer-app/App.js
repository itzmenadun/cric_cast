import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';

// Context
import { MatchProvider } from './src/context/MatchContext';

// Screens
import TournamentsScreen from './src/screens/TournamentsScreen';
import MatchesScreen from './src/screens/MatchesScreen';
import PreMatchSetupScreen from './src/screens/PreMatchSetupScreen';
import ScoringDashboardScreen from './src/screens/ScoringDashboardScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <MatchProvider>
      <NavigationContainer>
        <Stack.Navigator 
          initialRouteName="Tournaments"
          screenOptions={{
            headerStyle: { backgroundColor: '#005EB8' },
            headerTintColor: '#fff',
            headerTitleStyle: { fontWeight: 'bold' },
          }}
        >
          <Stack.Screen 
            name="Tournaments" 
            component={TournamentsScreen} 
            options={{ title: 'Select Tournament' }}
          />
          <Stack.Screen 
            name="Matches" 
            component={MatchesScreen} 
            // title is set dynamically in the component
          />
          <Stack.Screen 
            name="PreMatchSetup" 
            component={PreMatchSetupScreen} 
            options={{ title: 'Pre-Match Setup' }}
          />
          <Stack.Screen 
            name="ScoringDashboard" 
            component={ScoringDashboardScreen} 
            options={{ 
              title: 'Live Scoring Engine',
              headerBackVisible: false, // Prevent swiping back out of live scoring accidentally
            }}
          />
        </Stack.Navigator>
        <StatusBar style="light" />
      </NavigationContainer>
    </MatchProvider>
  );
}
