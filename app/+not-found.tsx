import { Link, Stack } from 'expo-router';
import React from 'react';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useLanguage } from '../constants/LanguageContext';

export default function NotFoundScreen() {
  const { strings } = useLanguage();
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <ThemedView style={styles.container}>
        <ThemedText type="title">{strings.notFound}</ThemedText>
        <Link href="/" style={styles.link}>
          <ThemedText type="link">{strings.home}</ThemedText>
        </Link>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
});
