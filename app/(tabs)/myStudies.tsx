import { useThemeColor } from '@/hooks/useThemeColor';
import { Entypo, Feather, FontAwesome5, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from 'expo-router';
import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function Studies() {
  const navigation = useNavigation<any>();

  // Theme colors
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const iconColor = useThemeColor({}, 'icon');
  const chevronColor = useThemeColor({}, 'icon');
  const separatorColor = useThemeColor({}, 'tabIconDefault');

  // Styles with theme colors
  const styles = getStyles({ backgroundColor, textColor, iconColor, chevronColor, separatorColor });

  // DATA array with dynamic icon color
  const DATA = [
    { key: '1', label: 'Ausweis', icon: <MaterialCommunityIcons name="card-account-details-outline" size={24} color={iconColor} />, route: 'id' },
    { key: '2', label: 'Moodle TU-Darmstadt', icon: <MaterialCommunityIcons name="compass-outline" size={24} color={iconColor} /> },
    { key: '3', label: 'Bibliothek', icon: <FontAwesome5 name="book-open" size={22} color={iconColor} />, route: 'bib/Loans' },
    { key: '4', label: 'Mensa', icon: <MaterialCommunityIcons name="food-apple" size={24} color={iconColor} /> },
    { key: '5', label: 'Gebäude und Einrichtungen', icon: <Entypo name="map" size={24} color={iconColor} />, route: 'buildings/buildings' },
    { key: '6', label: 'Links', icon: <Feather name="link" size={24} color={iconColor} /> },
    { key: '7', label: 'Skills Portal', icon: <Feather name="zap" size={24} color={iconColor} /> },
    { key: '8', label: 'book-n-park', icon: <MaterialIcons name="directions-car" size={24} color={iconColor} /> },
  ];

  useFocusEffect(() => {
    navigation.getParent()?.setOptions({
      title: 'Mein Studium',
    });
  });

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
            <MaterialIcons name="chevron-right" size={24} color={chevronColor} style={styles.chevron} />
          </TouchableOpacity>
        )}
        keyExtractor={item => item.key}
        contentContainerStyle={{ paddingVertical: 16 }}
      />
    </View>
  );
}

// Styles as a function of theme colors
const getStyles = ({ backgroundColor, textColor, iconColor, chevronColor, separatorColor }: {
  backgroundColor: string;
  textColor: string;
  iconColor: string;
  chevronColor: string;
  separatorColor: string;
}) => StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 0,
    backgroundColor,
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
    color: textColor,
    fontSize: 18,
  },
  chevron: {
    marginLeft: 8,
    // color is set via prop
  },
  separator: {
    height: 1,
    backgroundColor: separatorColor,
    marginLeft: 72,
  },
});