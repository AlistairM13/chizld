import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { SQLiteProvider } from 'expo-sqlite';
import * as SplashScreen from 'expo-splash-screen';
import * as ScreenOrientation from 'expo-screen-orientation';
import { setStatusBarHidden } from 'expo-status-bar';
import { useFonts } from '@expo-google-fonts/chakra-petch';
import {
  ChakraPetch_700Bold,
  ChakraPetch_600SemiBold,
  ChakraPetch_400Regular,
} from '@expo-google-fonts/chakra-petch';
import {
  BarlowCondensed_600SemiBold,
  BarlowCondensed_500Medium,
  BarlowCondensed_400Regular,
} from '@expo-google-fonts/barlow-condensed';
import {
  JetBrainsMono_700Bold,
  JetBrainsMono_400Regular,
} from '@expo-google-fonts/jetbrains-mono';
import { RootNavigator } from './navigation/RootNavigator';
import { initDatabase } from './db/database';
import { initMMKVDefaults } from './services/storage';

// Keep the native splash screen visible while fonts are loading
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    ChakraPetch_700Bold,
    ChakraPetch_600SemiBold,
    ChakraPetch_400Regular,
    BarlowCondensed_600SemiBold,
    BarlowCondensed_500Medium,
    BarlowCondensed_400Regular,
    JetBrainsMono_700Bold,
    JetBrainsMono_400Regular,
  });

  // Lock to landscape and hide status bar on mount
  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    setStatusBarHidden(true, 'none');
  }, []);

  // Initialize MMKV defaults on mount
  useEffect(() => {
    initMMKVDefaults();
  }, []);

  // Hide splash when fonts are ready (or on error to prevent indefinite splash)
  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // Return null while fonts loading — keeps native splash visible (no white flash)
  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SQLiteProvider databaseName="chizld.db" onInit={initDatabase}>
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      </SQLiteProvider>
    </GestureHandlerRootView>
  );
}
