import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useLanguage } from '../../constants/LanguageContext';

export default function TabLayout() {
  const { strings } = useLanguage();
  // Use useThemeColor for the active tab tint color
  const tabBarActiveTintColor = useThemeColor({}, 'tint');

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: 'absolute',
          },
          default: {},
        }),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: strings.home,
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="myStudies"
        options={{
          title: strings.myStudies,
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="graduationcap.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: strings.settings,
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="gearshape.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}
