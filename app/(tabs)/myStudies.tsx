import { Entypo, Feather, FontAwesome5, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';
import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const DATA = [
  { key: '1', label: 'Ausweis', icon: <MaterialCommunityIcons name="card-account-details-outline" size={24} color="#fff" />, route: 'id' },
  { key: '2', label: 'Moodle TU-Darmstadt', icon: <MaterialCommunityIcons name="compass-outline" size={24} color="#fff" /> },
  { key: '3', label: 'Bibliothek', icon: <FontAwesome5 name="book-open" size={22} color="#fff" /> },
  { key: '4', label: 'Mensa', icon: <MaterialCommunityIcons name="food-apple" size={24} color="#fff" /> },
  { key: '5', label: 'Gebäude und Einrichtungen', icon: <Entypo name="map" size={24} color="#fff" /> },
  { key: '6', label: 'Links', icon: <Feather name="link" size={24} color="#fff" /> },
  { key: '7', label: 'Skills Portal', icon: <Feather name="zap" size={24} color="#fff" /> },
  { key: '8', label: 'book-n-park', icon: <MaterialIcons name="directions-car" size={24} color="#fff" /> },
];

export default function Studies() {
  const navigation = useNavigation<any>();

  return (
    <View style={styles.container}>
      <FlatList
        data={DATA}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.row}
            onPress={() => item.route && navigation.navigate(item.route)}
          >
            <View style={styles.icon}>{item.icon}</View>
            <Text style={styles.label}>{item.label}</Text>
            <MaterialIcons name="chevron-right" size={24} color="#aaa" style={styles.chevron} />
          </TouchableOpacity>
        )}
        keyExtractor={item => item.key}
        contentContainerStyle={{ paddingVertical: 16 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 40,
    flex: 1,
    paddingHorizontal: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
    backgroundColor: 'transparent',
  },
  icon: {
    width: 32,
    alignItems: 'center',
    marginRight: 16,
  },
  label: {
    flex: 1,
    color: '#fff',
    fontSize: 18,
  },
  chevron: {
    marginLeft: 8,
  },
  separator: {
    height: 1,
    backgroundColor: '#232325',
    marginLeft: 72,
  },
});