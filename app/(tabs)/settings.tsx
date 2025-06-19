import { useThemeColor } from '@/hooks/useThemeColor';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { useFocusEffect, useNavigation } from 'expo-router';
import React from 'react';
import { Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useLanguage } from '../../constants/LanguageContext';

const GITHUB_URL = 'https://github.com/yd4dev/tudapp';

export default function SettingsScreen() {

  const { language, setLanguage, strings } = useLanguage();
  const themeText = useThemeColor({}, 'text');
  const themeBackground = useThemeColor({}, 'background');
  const themeIcon = useThemeColor({}, 'icon');
  const themeTint = useThemeColor({}, 'tint');

  const navigation = useNavigation();

  useFocusEffect(() => {
    navigation.getParent()?.setOptions({
      title: strings.settings,
    });
  });

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
        <TouchableOpacity style={styles.linkRow} onPress={() => Linking.openURL(GITHUB_URL)}>
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
