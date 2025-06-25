import { useThemeColor } from '@/hooks/useThemeColor';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { EventEmitter } from 'events';
import Constants from 'expo-constants';
import { useFocusEffect, useNavigation } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { FEEDS } from '../../constants/feeds';
import { useLanguage } from '../../constants/LanguageContext';

const GITHUB_URL = 'https://github.com/yd4dev/tudapp';
const FEED_PREFS_KEY = 'enabled_feeds';

export const feedSettingsEmitter = new EventEmitter();

export default function SettingsScreen() {

  const { language, setLanguage, strings } = useLanguage();
  const themeText = useThemeColor({}, 'text');
  const themeBackground = useThemeColor({}, 'background');
  const themeIcon = useThemeColor({}, 'icon');
  const themeTint = useThemeColor({}, 'tint');

  const navigation = useNavigation();
  const [enabledFeeds, setEnabledFeeds] = useState<string[]>([]);

  useFocusEffect(() => {
    navigation.getParent()?.setOptions({
      title: strings.settings,
    });
  });

  // Load enabled feeds from storage
  useEffect(() => {
    (async () => {
      const stored = await AsyncStorage.getItem(FEED_PREFS_KEY);
      if (stored) setEnabledFeeds(JSON.parse(stored));
      else setEnabledFeeds(FEEDS.map(f => f.id)); // default: all enabled
    })();
  }, []);

  // Save enabled feeds to storage
  const toggleFeed = (feedId: string) => {
    setEnabledFeeds(prev => {
      const next = prev.includes(feedId)
        ? prev.filter(id => id !== feedId)
        : [...prev, feedId];
      AsyncStorage.setItem(FEED_PREFS_KEY, JSON.stringify(next));
      feedSettingsEmitter.emit('feedsChanged', next);
      return next;
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: themeBackground }]}>  
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: themeText }]}>{strings.language}</Text>
        <View style={styles.languageRow}>
          <TouchableOpacity
            style={[styles.languageButton, language === 'de' && { backgroundColor: themeTint }]}
            onPress={() => setLanguage('de')}
          >
            <Text style={{ color: language === 'de' ? themeBackground : themeText }}>Deutsch</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.languageButton, language === 'en' && { backgroundColor: themeTint }]}
            onPress={() => setLanguage('en')}
          >
            <Text style={{ color: language === 'en' ? themeBackground : themeText }}>English</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: themeText }]}>Feeds</Text>
        {FEEDS.map(feed => (
          <TouchableOpacity
            key={feed.id}
            style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}
            onPress={() => toggleFeed(feed.id)}
          >
            <Ionicons
              name={enabledFeeds.includes(feed.id) ? 'checkbox-outline' : 'square-outline'}
              size={22}
              color={enabledFeeds.includes(feed.id) ? themeTint : themeIcon}
              style={{ marginRight: 10 }}
            />
            <Text style={{ color: themeText, fontSize: 16 }}>{feed.name[language] || feed.name.default}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.section}>
        <TouchableOpacity style={styles.linkRow} onPress={() => WebBrowser.openBrowserAsync(GITHUB_URL)}>
          <Ionicons name="logo-github" size={22} color={themeIcon} style={{ marginRight: 8 }} />
          <Text style={[styles.linkText, { color: themeTint }]}>GitHub</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.bottom}>
        <Text style={{ color: themeIcon, fontSize: 13, textAlign: 'center' }}>
          Made with <Ionicons name="heart" size={13} color="#e74c3c" style={{ top: 1 }} /> in Germany
        </Text>
        <Text style={{ color: themeIcon, fontSize: 12, textAlign: 'center', marginTop: 2 }}>
          v{Constants.expoConfig?.version ?? (Constants as any).manifest?.version ?? (Constants as any).manifest2?.version ?? '1.0.0'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'flex-start',
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  languageRow: {
    flexDirection: 'row',
    gap: 12,
  },
  languageButton: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    marginRight: 8,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  linkText: {
    fontSize: 16,
    fontWeight: '500',
  },
  bottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 24,
    alignItems: 'center',
  },
});
