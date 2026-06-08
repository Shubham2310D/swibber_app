import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import type { RootStackParamList } from './types';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../hooks/useAuth';
import { StorageService } from '../services/storageService';
import OnboardingScreen from '../screens/onboarding/OnboardingScreen';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import { Colors } from '../theme';

const Stack = createStackNavigator<RootStackParamList>();

// ── Branded loading view shown during auth bootstrap ─────────────────────────

function BootstrapLoader() {
  const { colors } = useTheme();
  return (
    <View style={[styles.loader, { backgroundColor: colors.background }]}>
      <ActivityIndicator size="large" color={Colors.primary} />
    </View>
  );
}

// ── Inner navigator — rendered inside NavigationContainer ────────────────────

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();
  const [onboardingDone, setOnboardingDone] = useState<boolean | null>(null);

  useEffect(() => {
    StorageService.isOnboardingDone().then(setOnboardingDone);
  }, []);

  // While auth is bootstrapping or onboarding flag is unknown — show loader.
  // This prevents a flash of the wrong screen.
  if (isLoading || onboardingDone === null) {
    console.log('[AUTH] Bootstrapping — waiting for auth state and onboarding flag');
    return <BootstrapLoader />;
  }

  console.log('[AUTH] Bootstrap complete — isAuthenticated:', isAuthenticated, '| onboardingDone:', onboardingDone);

  if (isAuthenticated) {
    // User is logged in → go straight to app
    console.log('[NAVIGATING_HOME] Rendering Main stack');
    return (
      <Stack.Navigator screenOptions={{ headerShown: false, animationEnabled: true }}>
        <Stack.Screen name="Main" component={MainNavigator} />
      </Stack.Navigator>
    );
  }

  if (!onboardingDone) {
    // First-time user — show onboarding then auth
    return (
      <Stack.Navigator screenOptions={{ headerShown: false, animationEnabled: true }}>
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Auth" component={AuthNavigator} />
      </Stack.Navigator>
    );
  }

  // Returning user not yet authenticated
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animationEnabled: true }}>
      <Stack.Screen name="Auth" component={AuthNavigator} />
    </Stack.Navigator>
  );
}

// ── Root navigator — owns NavigationContainer ─────────────────────────────────

export default function AppNavigator() {
  const { colors, isDark } = useTheme();

  return (
    <NavigationContainer
      theme={{
        dark: isDark,
        colors: {
          primary: '#4C35E8',
          background: colors.background,
          card: colors.card,
          text: colors.text,
          border: colors.border,
          notification: '#4C35E8',
        },
      }}
    >
      <AppContent />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
