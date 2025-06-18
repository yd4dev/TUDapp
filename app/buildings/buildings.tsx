import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useNavigation, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import buildingsData from '../../assets/buildings.json';


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
  React.useEffect(() => {
    navigation.setOptions({
      title: 'Gebäude und Einrichtungen',
      headerBackTitle: 'Zurück', // Custom back button label
      headerTitleStyle: { fontSize: 20, fontWeight: 'bold' },
      headerStyle: { backgroundColor: 'none' }, // Transparent header
      headerTintColor: '#fff', // White back button and title
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

  return (
    <ThemedView style={{ flex: 1, padding: 0, backgroundColor: 'transparent' }}>
      <TextInput
        style={styles.input}
        placeholder="Suche Gebäude, Adresse, ..."
        value={search}
        onChangeText={setSearch}
        placeholderTextColor="#888"
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
            <ThemedText type="title" style={styles.geb}>{item.Gebäude}</ThemedText>
            <ThemedText type="title" style={styles.name}>{item.Name}</ThemedText>
            <ThemedText type="default" style={styles.address}>{item.Adresse}</ThemedText>
            <ThemedText type="default" style={styles.plz}>{item.PLZ_Ort}</ThemedText>
          </TouchableOpacity>
        )}
        contentContainerStyle={{ padding: 12, paddingBottom: 32 }}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 12,
    margin: 12,
    fontSize: 16,
    backgroundColor: '#fafbfc',
    color: '#222',
    marginBottom: 0
  },
  card: {
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    // Use ThemedView background for card
    backgroundColor: 'transparent'
  },
  geb: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#e0e0e0', // brighter
    marginBottom: 2
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
    color: '#fff' // brightest
  },
  address: {
    fontSize: 15,
    color: '#f0f0f0', // brighter
    marginBottom: 1
  },
  plz: {
    fontSize: 14,
    color: '#cccccc', // brighter
  }
});