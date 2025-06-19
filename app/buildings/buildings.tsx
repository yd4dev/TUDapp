import { useColorScheme } from '@/hooks/useColorScheme';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useNavigation, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import buildingsData from '../../assets/buildings.json';
import { Colors } from '../../constants/Colors';


type Building = {
  Gebäude: string;
  Name: string;
  Adresse: string;
  PLZ_Ort: string;
  Departments?: { name: string; link: string | null }[];
};

export default function BuildingsList() {
  const [search, setSearch] = useState('');
  const router = useRouter();
  const navigation = useNavigation();
  const colorScheme = useColorScheme() ?? 'light';
  React.useEffect(() => {
    navigation.setOptions({
      title: 'Gebäude und Einrichtungen',
    });
  }, [navigation]);
  const prefixOrder = ['S', 'L', 'B', 'H', 'W'];
  const normalizeGeb = (geb: string) => geb.replace(/\s|\|/g, '').toLowerCase();
  const normalizeSearch = (s: string) => s.replace(/\s|\|/g, '').toLowerCase();
  const filtered = (buildingsData as Building[])
    .filter(b => {
      const nameMatch = b.Name && b.Name.toLowerCase().includes(search.toLowerCase());
      const addressMatch = b.Adresse && b.Adresse.toLowerCase().includes(search.toLowerCase());
      const gebMatch = b.Gebäude && (
        b.Gebäude.toLowerCase().includes(search.toLowerCase()) ||
        normalizeGeb(b.Gebäude).includes(normalizeSearch(search))
      );
      return nameMatch || addressMatch || gebMatch;
    })
    .sort((a, b) => {
      const getPrefixIndex = (geb: string) => {
        const match = geb.match(/^[A-Z]/);
        return match ? prefixOrder.indexOf(match[0]) : prefixOrder.length;
      };
      const prefixA = getPrefixIndex(a.Gebäude);
      const prefixB = getPrefixIndex(b.Gebäude);
      if (prefixA !== prefixB) return prefixA - prefixB;
      // If same prefix, sort by Gebäude number (numeric)
      const numA = parseInt(a.Gebäude.replace(/^[A-Z]+/, '')) || 0;
      const numB = parseInt(b.Gebäude.replace(/^[A-Z]+/, '')) || 0;
      return numA - numB;
    });

  // Theme colors
  const backgroundColor = useThemeColor({}, 'background');
  // For a beautiful search bar: glassy in dark, slightly elevated in light
  const inputBackground = colorScheme === 'dark'
    ? 'rgba(40,40,50,0.7)'
    : Colors.light.background;
  const inputText = useThemeColor({}, 'text');
  const inputBorder = colorScheme === 'dark' ? 'rgba(255,255,255,0.12)' : Colors.light.icon;
  const placeholderColor = useThemeColor({}, 'icon');
  const cardBorder = useThemeColor({}, 'tabIconDefault');
  const gebColor = useThemeColor({}, 'icon');
  const nameColor = useThemeColor({}, 'text');
  const addressColor = useThemeColor({}, 'tabIconDefault');
  const plzColor = useThemeColor({}, 'icon');
  const styles = getStyles({ backgroundColor, inputBackground, inputText, inputBorder, placeholderColor, cardBorder, gebColor, nameColor, addressColor, plzColor, colorScheme });

  return (
    <View style={[styles.container]}>
      <TextInput
        style={styles.input}
        placeholder="Suche Gebäude, Adresse, ..."
        value={search}
        onChangeText={setSearch}
        placeholderTextColor={placeholderColor}
      />
      <FlatList
        data={filtered}
        keyExtractor={b => b.Gebäude}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push(`/buildings/${encodeURIComponent(item.Gebäude)}`)}
            activeOpacity={0.8}
          >
            <Text style={styles.geb}>{item.Gebäude}</Text>
            <Text style={styles.name}>{item.Name}</Text>
            <Text style={styles.address}>{item.Adresse}</Text>
            <Text style={styles.plz}>{item.PLZ_Ort}</Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={{ padding: 12, paddingBottom: 32 }}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      />
    </View>
  );
}

// Styles as a function of theme colors
const getStyles = ({ backgroundColor, inputBackground, inputText, inputBorder, placeholderColor, cardBorder, gebColor, nameColor, addressColor, plzColor, colorScheme }: {
  backgroundColor: string;
  inputBackground: string;
  inputText: string;
  inputBorder: string;
  placeholderColor: string;
  cardBorder: string;
  gebColor: string;
  nameColor: string;
  addressColor: string;
  plzColor: string;
  colorScheme: string;
}) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor,
    padding: 0,
  },
  input: {
    borderWidth: 1,
    borderColor: inputBorder,
    borderRadius: 14,
    padding: 14,
    margin: 12,
    fontSize: 16,
    backgroundColor: inputBackground,
    color: inputText,
    marginBottom: 0,
    shadowColor: colorScheme === 'dark' ? '#000' : '#222',
    shadowOpacity: colorScheme === 'dark' ? 0.5 : 0.08,
    shadowRadius: colorScheme === 'dark' ? 12 : 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: colorScheme === 'dark' ? 8 : 2,
  },
  card: {
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: cardBorder,
    backgroundColor: 'transparent',
  },
  geb: {
    fontSize: 15,
    fontWeight: 'bold',
    color: gebColor,
    marginBottom: 2,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
    color: nameColor,
  },
  address: {
    fontSize: 15,
    color: addressColor,
    marginBottom: 1,
  },
  plz: {
    fontSize: 14,
    color: plzColor,
  },
});