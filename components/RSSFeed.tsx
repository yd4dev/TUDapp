import { useThemeColor } from '@/hooks/useThemeColor';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, LayoutAnimation, Linking, Platform, StyleSheet, Text, TouchableOpacity, UIManager, View } from 'react-native';
import { useLanguage } from '../constants/LanguageContext';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Simple RSS parser for React Native (regex-based)
async function fetchRSS(url: string) {
  const res = await fetch(url);
  const text = await res.text();
  const items: any[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;
  // Helper to strip CDATA
  const stripCDATA = (str: string) =>
    str.replace(/^<!\[CDATA\[(.*)\]\]>$/s, '$1');
  while ((match = itemRegex.exec(text))) {
    const itemXML = match[1];
    const getTag = (tag: string) => {
      const tagMatch = itemXML.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`));
      return tagMatch ? stripCDATA(tagMatch[1].trim()) : '';
    };
    items.push({
      title: getTag('title'),
      description: getTag('description'),
      link: getTag('link'),
      pubDate: getTag('pubDate'),
      guid: getTag('guid') || Math.random().toString(),
      author: getTag('author'),
    });
  }
  return items;
}

export function RSSFeed() {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<{ [key: string]: boolean }>({});
  const { strings } = useLanguage();

  // Theme colors
  const backgroundColor = useThemeColor({}, 'background');
  const cardBorderColor = useThemeColor({}, 'tabIconDefault');
  const titleColor = useThemeColor({}, 'text');
  const dateColor = useThemeColor({}, 'icon');
  const authorColor = useThemeColor({}, 'icon');
  const descColor = useThemeColor({}, 'text');
  const iconColor = useThemeColor({}, 'tint');

  // Generate styles with theme colors
  const styles = rssStyles({
    backgroundColor,
    cardBorderColor,
    titleColor,
    dateColor,
    authorColor,
    descColor,
  });

  useEffect(() => {
    // Example RSS feed (replace with your own)
    const url = 'https://www.d120.de/rss/feed.de.rss';
    fetchRSS(url)
      .then(setEntries)
      .finally(() => setLoading(false));
  }, []);

  const handlePress = (guid: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(prev => ({ ...prev, [guid]: !prev[guid] }));
  };

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor }]}>
        <ActivityIndicator size="large" color={iconColor} />
      </View>
    );
  }

  return (
    <FlatList
      data={entries}
      keyExtractor={item => item.guid}
      contentContainerStyle={{ padding: 16, paddingBottom: 94, backgroundColor }}
      renderItem={({ item }) => (
        <TouchableOpacity onPress={() => handlePress(item.guid)} style={styles.card}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.date}>{item.pubDate}</Text>
          {item.author ? (
            <Text style={styles.author}>{strings.by} {item.author}</Text>
          ) : null}
          {expanded[item.guid] && (
            <>
              <Text style={styles.desc}>{item.description.replace(/<[^>]+>/g, '')}</Text>
              <TouchableOpacity
                style={styles.linkIconButton}
                onPress={() => Linking.openURL(item.link)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="open-outline" size={20} color={iconColor} />
              </TouchableOpacity>
            </>
          )}
        </TouchableOpacity>
      )}
      ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
    />
  );
}

// rssStyles is now a function that takes theme colors and returns the styles
const rssStyles = ({
  backgroundColor,
  cardBorderColor,
  titleColor,
  dateColor,
  authorColor,
  descColor,
}: {
  backgroundColor: string;
  cardBorderColor: string;
  titleColor: string;
  dateColor: string;
  authorColor: string;
  descColor: string;
}) =>
  StyleSheet.create({
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    card: {
      borderRadius: 14,
      padding: 16,
      borderWidth: 1,
      borderColor: cardBorderColor,
      backgroundColor: 'transparent',
    },
    title: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 2,
      color: titleColor,
    },
    date: {
      fontSize: 15,
      marginBottom: 1,
      color: dateColor,
    },
    author: {
      fontSize: 14,
      marginBottom: 2,
      color: authorColor,
    },
    desc: {
      fontSize: 15,
      marginTop: 8,
      color: descColor,
    },
    linkIconButton: {
      marginTop: 6,
      alignSelf: 'flex-end',
      padding: 4,
      borderRadius: 16,
      backgroundColor: 'transparent',
    },
  });