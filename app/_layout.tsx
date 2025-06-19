import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider
} from '@react-navigation/native'
import { useFonts } from 'expo-font'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import 'react-native-reanimated'

import { useColorScheme } from '@/hooks/useColorScheme'
import { useThemeColor } from '@/hooks/useThemeColor'
import React from 'react'
import { LanguageProvider } from '../constants/LanguageContext'

export default function RootLayout () {
  const colorScheme = useColorScheme()
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf')
  })

  const headerBackgroundColor = useThemeColor({}, 'background')
  const headerTextColor = useThemeColor({}, 'text')

  if (!loaded) {
    // Async font loading only occurs in development.
    return null
  }

  // Wrap navigation in ThemeProvider to restore navigation theming and background handling
  return (
    <LanguageProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: headerBackgroundColor },
            headerTintColor: headerTextColor,
            headerTitleStyle: { fontSize: 20, fontWeight: 'bold' },
            headerBackTitle: '' // We'll set this dynamically in screens
          }}
        >
          <Stack.Screen name='(tabs)' options={{ headerShown: true }} />
          <Stack.Screen name='+not-found' />
        </Stack>
        <StatusBar style='auto' />
      </ThemeProvider>
    </LanguageProvider>
  )
}
