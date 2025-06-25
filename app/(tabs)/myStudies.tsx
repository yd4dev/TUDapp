import { useThemeColor } from '@/hooks/useThemeColor';
import { Entypo, FontAwesome5, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useLanguage } from '../../constants/LanguageContext';

export default function Studies() {
  const { strings } = useLanguage();
  const navigation = useNavigation<any>();

  // Theme colors
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const iconColor = useThemeColor({}, 'icon');
  const chevronColor = useThemeColor({}, 'icon');
  const separatorColor = useThemeColor({}, 'tabIconDefault');

  // Styles with theme colors
  const styles = getStyles({ backgroundColor, textColor, iconColor, chevronColor, separatorColor });

  // DATA array with dynamic icon color (only items with a route)
  const DATA = [
    { key: '1', label: strings.idCard, icon: <MaterialCommunityIcons name="card-account-details-outline" size={28} color={iconColor} />, route: 'id' },
    { key: '3', label: strings.library, icon: <FontAwesome5 name="book-open" size={26} color={iconColor} />, route: 'bib/Loans' },
    { key: '5', label: strings.buildings, icon: <Entypo name="map" size={28} color={iconColor} />, route: 'buildings/buildings' },
  ];

  useFocusEffect(() => {
    navigation.getParent()?.setOptions({
      title: strings.myStudies,
    });
  });

  return (
    <View style={styles.container}>
      {DATA.map(item => (
        <TouchableOpacity
          key={item.key}
          style={styles.row}
          onPress={() => item.route && navigation.navigate(item.route)}
          activeOpacity={0.85}
        >
          <View style={styles.icon}>{item.icon}</View>
          <Text style={styles.label}>{item.label}</Text>
          <MaterialIcons name="chevron-right" size={28} color={chevronColor} style={styles.chevron} />
        </TouchableOpacity>
      ))}
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
    marginTop: -150,
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 22,
    paddingHorizontal: 32,
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  icon: {
    width: 40,
    alignItems: 'center',
    marginRight: 20,
  },
  label: {
    flex: 1,
    color: textColor,
    fontSize: 20,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  chevron: {
    marginLeft: 8,
  },
  separator: {
    height: 12,
    backgroundColor: 'transparent',
  },
});