import { useThemeColor } from '@/hooks/useThemeColor';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as WebBrowser from 'expo-web-browser';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, LayoutAnimation, Modal, Platform, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, UIManager, View } from 'react-native';
import { feedSettingsEmitter } from '../app/(tabs)/settings';
import { useLanguage } from '../constants/LanguageContext';
import { FEEDS } from '../constants/feeds';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Simple RSS parser for React Native (regex-based)
async function fetchRSS(url: string) {
  const res = await fetch(url);
  const text = await res.text();
  // Extract <image><url>, <title>, <description>, <link> from <channel>
  let feedImage = '';
  let feedTitle = '';
  let feedDescription = '';
  let feedLink = '';
  const channelMatch = text.match(/<channel>([\s\S]*?)<\/channel>/);
  if (channelMatch) {
    const channelXML = channelMatch[1];
    const imageMatch = channelXML.match(/<image>[\s\S]*?<url>([\s\S]*?)<\/url>[\s\S]*?<\/image>/);
    if (imageMatch) feedImage = imageMatch[1].trim();
    const titleMatch = channelXML.match(/<title>([\s\S]*?)<\/title>/);
    if (titleMatch) feedTitle = titleMatch[1].trim();
    const descMatch = channelXML.match(/<description>([\s\S]*?)<\/description>/);
    if (descMatch) feedDescription = descMatch[1].trim();
    const linkMatch = channelXML.match(/<link>([\s\S]*?)<\/link>/);
    if (linkMatch) feedLink = linkMatch[1].trim();
  }
  const items: any[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;
  // Helper to strip CDATA
  const stripCDATA = (str: string) =>
    str.replace(/^<!\[CDATA\[(.*)\]\]>$/s, '$1');
  while ((match = itemRegex.exec(text))) {
    const itemXML = match[1];
    const getTag = (tag: string) => {
      const tagMatch = itemXML.match(new RegExp(`<${tag}>([\\s\\S]*?)<\/${tag}>`));
      return tagMatch ? stripCDATA(tagMatch[1].trim()) : '';
    };
    items.push({
      title: getTag('title'),
      description: getTag('description'),
      link: getTag('link'),
      pubDate: getTag('pubDate'),
      guid: getTag('guid') || Math.random().toString(),
      author: getTag('author'),
      feedImage, // from <channel><image><url>
    });
  }
  // Return items and feed meta
  return { items, feedMeta: { feedImage, feedTitle, feedDescription, feedLink } };
}

function formatFeedDate(dateString: string, language: string) {
  if (!dateString) return '';
  // Remove timezone info (e.g., ' +0200' or ' GMT')
  const cleaned = dateString.replace(/([+-]\d{4}| GMT| UTC|Z)$/i, '').trim();
  const date = new Date(cleaned);
  if (isNaN(date.getTime())) return dateString;
  // Check if time is 00:00:00
  const showTime = !(date.getHours() === 0 && date.getMinutes() === 0 && date.getSeconds() === 0);
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...(showTime ? { hour: '2-digit', minute: '2-digit' } : {}),
  };
  // Use 'de-DE' for German, 'en-US' for English, fallback to 'en-US'
  const locale = language === 'de' ? 'de-DE' : 'en-US';
  return new Intl.DateTimeFormat(locale, options).format(date);
}

function getRelativeTime(dateString: string, language: string) {
  if (!dateString) return '';
  const cleaned = dateString.replace(/([+-]\d{4}| GMT| UTC|Z)$/i, '').trim();
  const date = new Date(cleaned);
  if (isNaN(date.getTime())) return dateString;
  const now = new Date();
  const diff = (now.getTime() - date.getTime()) / 1000; // seconds

  const units = [
    { limit: 60, name: { en: 'second', de: 'Sekunde' }, plural: { en: 'seconds', de: 'Sekunden' }, divisor: 1 },
    { limit: 3600, name: { en: 'minute', de: 'Minute' }, plural: { en: 'minutes', de: 'Minuten' }, divisor: 60 },
    { limit: 86400, name: { en: 'hour', de: 'Stunde' }, plural: { en: 'hours', de: 'Stunden' }, divisor: 3600 },
    { limit: 2592000, name: { en: 'day', de: 'Tag' }, plural: { en: 'days', de: 'Tagen' }, divisor: 86400 },
    { limit: 31536000, name: { en: 'month', de: 'Monat' }, plural: { en: 'months', de: 'Monaten' }, divisor: 2592000 },
    { limit: Infinity, name: { en: 'year', de: 'Jahr' }, plural: { en: 'years', de: 'Jahren' }, divisor: 31536000 },
  ];

  for (const unit of units) {
    if (diff < unit.limit) {
      const value = Math.round(diff / unit.divisor);
      if (value <= 1) {
        return language === 'de'
          ? `vor 1 ${unit.name.de}`
          : `1 ${unit.name.en} ago`;
      } else {
        return language === 'de'
          ? `vor ${value} ${unit.plural.de}`
          : `${value} ${unit.plural.en} ago`;
      }
    }
  }
  return '';
}

// Helper to decode basic HTML entities (e.g., &#34;)
function decodeEntities(str: string) {
  if (!str) return '';
  return str
    .replace(/&#(\d+);/g, (m, code) => String.fromCharCode(code))
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function stripHtmlTags(str: string) {
  if (!str) return '';
  // Replace <p> and </p> with newlines, then strip all other tags, then trim whitespace/newlines
  return str
    .replace(/<\/?p>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/[ \t]+$/gm, '') // trim trailing spaces on each line
    .replace(/^\s+|\s+$/g, ''); // trim leading/trailing whitespace/newlines
}

const FEED_PREFS_KEY = 'enabled_feeds';

export function RSSFeed() {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<{ [key: string]: boolean }>({});
  const [selectedFeed, setSelectedFeed] = useState<null | { id: string; name: string; image: string; info?: string }>(null);
  const { strings, language } = useLanguage();
  const [enabledFeeds, setEnabledFeeds] = useState<string[] | null>(null);
  const [refreshing, setRefreshing] = useState(false);

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

  // Get feed info for modal
  const getFeedInfo = (feedId: string) => {
    const feed = FEEDS.find(f => f.id === feedId);
    if (!feed) return null;
    return {
      id: feed.id,
      name: feed.name[language] || feed.name.default,
      image: feed.image || '',
    };
  };

  const [feedMetas, setFeedMetas] = useState<{ [feedId: string]: { feedImage: string; feedTitle: string; feedDescription: string; feedLink: string } }>({});

  // Load enabled feeds from storage
  useEffect(() => {
    (async () => {
      const stored = await AsyncStorage.getItem(FEED_PREFS_KEY);
      if (stored) setEnabledFeeds(JSON.parse(stored));
      else setEnabledFeeds(FEEDS.map(f => f.id)); // default: all enabled
    })();
    // Listen for live changes
    const handler = (feeds: string[]) => setEnabledFeeds(feeds);
    feedSettingsEmitter.on('feedsChanged', handler);
    return () => { feedSettingsEmitter.off('feedsChanged', handler); };
  }, []);

  async function loadFeeds(isRefresh = false) {
    if (!isRefresh) setLoading(true);
    // Get all feed URLs for the current language
    const feedTasks = FEEDS.map(feed => {
      const url = feed.urls[language] || feed.urls.default;
      return fetchRSS(url).then(({ items, feedMeta }) => {
        // Use feed.image from config if set, otherwise use the RSS <image><url>
        const feedImage = feed.image || feedMeta.feedImage || '';
        return {
          feedId: feed.id,
          feedMeta: {
            ...feedMeta,
            feedImage,
          },
          items: items.map((item: any) => ({
            ...item,
            feedId: feed.id,
            feedName: feed.name[language] || feed.name.default,
            feedImage,
          })),
        };
      });
    });
    // Fetch all feeds in parallel
    const allFeeds = await Promise.all(feedTasks);
    // Flatten and sort by pubDate (descending)
    const allEntries = allFeeds.flatMap(f => f.items).sort((a, b) => {
      const dateA = new Date(a.pubDate).getTime();
      const dateB = new Date(b.pubDate).getTime();
      return dateB - dateA;
    });
    setEntries(allEntries);
    setFeedMetas(Object.fromEntries(allFeeds.map(f => [f.feedId, f.feedMeta])));
    if (!isRefresh) setLoading(false);
    setRefreshing(false);
  }

  useEffect(() => {
    loadFeeds();
  }, [language]);

  const handlePress = (guid: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(prev => ({ ...prev, [guid]: !prev[guid] }));
  };

  // Filter feeds and entries by enabledFeeds
  const filteredFeeds = enabledFeeds ? FEEDS.filter(f => enabledFeeds.includes(f.id)) : FEEDS;
  const filteredEntries = enabledFeeds ? entries.filter(e => enabledFeeds.includes(e.feedId)) : entries;

  // Get unique feeds with image
  const uniqueFeeds = filteredFeeds.map(feed => ({
    id: feed.id,
    name: feed.name[language] || feed.name.default,
    image: feed.image,
  }));

  // Filtered entries for modal
  const modalEntries = selectedFeed
    ? filteredEntries.filter(e => e.feedId === selectedFeed.id)
    : filteredEntries;

  if ((loading && !refreshing) || enabledFeeds === null) {
    return (
      <View style={[styles.centered, { backgroundColor }]}>
        <ActivityIndicator size="large" color={iconColor} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {/* Horizontal feed icon list */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingVertical: 8, paddingLeft: 8 }}>
        {uniqueFeeds.map(feed => (
          <Pressable
            key={feed.id}
            onPress={() => setSelectedFeed(getFeedInfo(feed.id))}
            style={{ alignItems: 'center', marginRight: 6 }}
          >
            <Image source={{ uri: feed.image }} style={{ width: 38, height: 38, borderRadius: 8, marginBottom: 2, borderWidth: 2, borderColor: '#ccc' }} />
            <Text style={{ fontSize: 12, width: 60, textAlign: 'center', color: titleColor }} numberOfLines={1}>{feed.name}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Feed detail modal */}
      <Modal
        visible={!!selectedFeed}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelectedFeed(null)}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor }}>
          <View style={{ alignItems: 'center', padding: 24, borderBottomWidth: 1, borderColor: cardBorderColor }}>
            {selectedFeed && (
              <>
                <Image source={{ uri: selectedFeed.image }} style={{ width: 64, height: 64, borderRadius: 16, marginBottom: 8 }} />
                <Text style={{ fontSize: 22, fontWeight: 'bold', color: titleColor }}>{feedMetas[selectedFeed.id]?.feedTitle || selectedFeed.name}</Text>
                {feedMetas[selectedFeed.id]?.feedDescription ? (
                  <Text style={{ fontSize: 15, color: descColor, marginTop: 8, textAlign: 'center' }}>{stripHtmlTags(decodeEntities(feedMetas[selectedFeed.id]?.feedDescription))}</Text>
                ) : null}
                {feedMetas[selectedFeed.id]?.feedLink ? (
                  <TouchableOpacity onPress={() => WebBrowser.openBrowserAsync(feedMetas[selectedFeed.id]?.feedLink)}>
                    <Text style={{ color: iconColor, marginTop: 8, textDecorationLine: 'underline' }} numberOfLines={1}>
                      {feedMetas[selectedFeed.id]?.feedLink}
                    </Text>
                  </TouchableOpacity>
                ) : null}
              </>
            )}
            <TouchableOpacity onPress={() => setSelectedFeed(null)} style={{ position: 'absolute', right: 24, top: 24 }}>
              <Ionicons name="close" size={28} color={iconColor} />
            </TouchableOpacity>
          </View>
          <FlatList
            data={modalEntries}
            keyExtractor={item => item.guid}
            contentContainerStyle={{ padding: 16, paddingBottom: 94, backgroundColor }}
            renderItem={({ item }) => {
              const isExpanded = expanded[item.guid];
              return (
                <TouchableOpacity onPress={() => setExpanded(prev => ({ ...prev, [item.guid]: !prev[item.guid] }))} style={styles.card}>
                  <View style={styles.feedHeader}>
                    <Image source={{ uri: item.feedImage }} style={styles.feedImage} />
                    <Text style={styles.feedName}>{item.feedName}</Text>
                    <View style={{ flex: 1 }} />
                    <Text style={styles.timeRight}>
                      {isExpanded
                        ? formatFeedDate(item.pubDate, language)
                        : getRelativeTime(item.pubDate, language)}
                    </Text>
                  </View>
                  {item.title ? (
                    <Text style={styles.title}>{stripHtmlTags(decodeEntities(item.title))}</Text>
                  ) : (
                    <Text style={[styles.title, styles.noTitle]}>
                      {strings.noTitle || (language === 'de' ? 'Kein Titel' : 'No title')}
                    </Text>
                  )}
                  {isExpanded && (
                    <>
                      {item.author ? (
                        <Text style={styles.author}>{strings.by} {item.author}</Text>
                      ) : null}
                      <Text style={styles.desc}>{stripHtmlTags(decodeEntities(item.description))}</Text>
                      <TouchableOpacity
                        style={styles.linkIconButton}
                        onPress={() => WebBrowser.openBrowserAsync(item.link)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Ionicons name="open-outline" size={20} color={iconColor} />
                      </TouchableOpacity>
                    </>
                  )}
                </TouchableOpacity>
              );
            }}
            ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          />
        </SafeAreaView>
      </Modal>

      {/* Main feed list */}
      <FlatList
        data={filteredEntries}
        keyExtractor={item => item.guid}
        contentContainerStyle={{ padding: 16, paddingBottom: 94, backgroundColor }}
        renderItem={({ item }) => {
          const isExpanded = expanded[item.guid];
          return (
            <TouchableOpacity onPress={() => handlePress(item.guid)} style={styles.card}>
              <View style={styles.feedHeader}>
                <Image source={{ uri: item.feedImage }} style={styles.feedImage} />
                <Text style={styles.feedName}>{item.feedName}</Text>
                <View style={{ flex: 1 }} />
                <Text style={styles.timeRight}>
                  {isExpanded
                    ? formatFeedDate(item.pubDate, language)
                    : getRelativeTime(item.pubDate, language)}
                </Text>
              </View>
              {item.title ? (
                <Text style={styles.title}>{stripHtmlTags(decodeEntities(item.title))}</Text>
              ) : (
                <Text style={[styles.title, styles.noTitle]}>
                  {strings.noTitle || (language === 'de' ? 'Kein Titel' : 'No title')}
                </Text>
              )}
              {isExpanded && (
                <>
                  {item.author ? (
                    <Text style={styles.author}>{strings.by} {item.author}</Text>
                  ) : null}
                  <Text style={styles.desc}>{stripHtmlTags(decodeEntities(item.description))}</Text>
                  <TouchableOpacity
                    style={styles.linkIconButton}
                    onPress={() => WebBrowser.openBrowserAsync(item.link)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons name="open-outline" size={20} color={iconColor} />
                  </TouchableOpacity>
                </>
              )}
            </TouchableOpacity>
          );
        }}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        refreshing={refreshing}
        onRefresh={() => {
          setRefreshing(true);
          loadFeeds(true);
        }}
      />
    </View>
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
    feedHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 4,
    },
    feedImage: {
      width: 20,
      height: 20,
      borderRadius: 4,
      marginRight: 8,
    },
    feedName: {
      fontSize: 15,
      fontWeight: '600',
      color: titleColor,
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
    noTitle: {
      fontStyle: 'italic',
      opacity: 0.7,
    },
    timeRight: {
      marginLeft: 8,
      fontSize: 13,
      color: dateColor,
      alignSelf: 'flex-start',
      flexShrink: 0,
    },
  });