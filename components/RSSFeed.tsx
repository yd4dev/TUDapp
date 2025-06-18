import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, LayoutAnimation, Linking, Platform, StyleSheet, Text, TouchableOpacity, UIManager, View } from 'react-native';

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
      <View style={rssStyles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <FlatList
      data={entries}
      keyExtractor={item => item.guid}
      contentContainerStyle={{ padding: 16, paddingBottom: 94 }} // Increased bottom padding
      renderItem={({ item }) => (
        <TouchableOpacity onPress={() => handlePress(item.guid)} style={rssStyles.card}>
          <Text style={rssStyles.title}>{item.title}</Text>
          <Text style={rssStyles.date}>{item.pubDate}</Text>
          {item.author ? (
            <Text style={rssStyles.author}>By {item.author}</Text>
          ) : null}
          {expanded[item.guid] && (
            <>
              <Text style={rssStyles.desc}>{item.description.replace(/<[^>]+>/g, '')}</Text>
              <TouchableOpacity
                style={rssStyles.linkIconButton}
                onPress={() => Linking.openURL(item.link)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="open-outline" size={20} color="#3b82f6" />
              </TouchableOpacity>
            </>
          )}
        </TouchableOpacity>
      )}
      ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
    />
  );
}

const rssStyles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: {
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    backgroundColor: 'transparent',
    // Removed marginBottom for consistent FlatList spacing
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  date: {
    color: '#e0e0e0',
    fontSize: 15,
    marginBottom: 1,
  },
  author: {
    color: '#cccccc',
    fontSize: 14,
    marginBottom: 2,
  },
  desc: {
    color: '#f0f0f0',
    fontSize: 15,
    marginTop: 8,
  },
  linkIconButton: {
    marginTop: 6,
    alignSelf: 'flex-end',
    padding: 4,
    borderRadius: 16,
    backgroundColor: 'transparent',
  },
});