import { useLocalSearchParams, useNavigation } from 'expo-router';
import React from 'react';
import { ActionSheetIOS, Alert, Linking, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import buildingsData from '../../assets/buildings.json';

type Department = { name: string; link: string | null };
type Building = {
  Gebäude: string;
  Name: string;
  Adresse: string;
  PLZ_Ort: string;
  Departments?: Department[];
};

export default function BuildingDetail() {
  const { code } = useLocalSearchParams<{ code: string }>();
  const navigation = useNavigation();
  const building: Building | undefined = (buildingsData as Building[]).find(b => b.Gebäude === code);

  React.useEffect(() => {
    if (building) {
      navigation.setOptions({
         title: building.Name,
        });
    }
  }, [building, navigation]);

  if (!building) {
    return (
      <View style={styles.center}><Text>Gebäude nicht gefunden.</Text></View>
    );
  }

  const openMap = () => {
    const address = `${building.Adresse}, ${building.PLZ_Ort}`;
    const encodedAddress = encodeURIComponent(address);
    const options = [
      'Google Maps',
      'Apple Maps',
      'OpenStreetMap',
      'Abbrechen'
    ];
    const cancelButtonIndex = 3;
    const openInGoogleMaps = () => {
      Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`);
    };
    const openInAppleMaps = () => {
      Linking.openURL(`http://maps.apple.com/?q=${encodedAddress}`);
    };
    const openInOSM = () => {
      Linking.openURL(`https://www.openstreetmap.org/search?query=${encodedAddress}`);
    };
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          cancelButtonIndex,
        },
        (buttonIndex) => {
          if (buttonIndex === 0) openInGoogleMaps();
          else if (buttonIndex === 1) openInAppleMaps();
          else if (buttonIndex === 2) openInOSM();
        }
      );
    } else {
      Alert.alert(
        'Karte öffnen',
        'Mit welcher App möchtest du die Adresse öffnen?',
        [
          { text: 'Google Maps', onPress: openInGoogleMaps },
          { text: 'OpenStreetMap', onPress: openInOSM },
          { text: 'Abbrechen', style: 'cancel' },
        ]
      );
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{building.Name}</Text>
      <Text style={styles.geb}>{building.Gebäude}</Text>
      <Text style={styles.address}>{building.Adresse}</Text>
      <Text style={styles.address}>{building.PLZ_Ort}</Text>
      <TouchableOpacity style={styles.mapButton} onPress={openMap}>
        <Text style={styles.mapButtonText}>In Karte öffnen</Text>
      </TouchableOpacity>
      {building.Departments && building.Departments.length > 0 && (
        <View style={styles.deptSection}>
          <Text style={styles.deptHeader}>Abteilungen / Einrichtungen:</Text>
          {building.Departments.map((item, idx) => (
            <TouchableOpacity
              key={item.name + idx}
              disabled={!item.link}
              onPress={() => item.link && Linking.openURL(item.link)}
            >
              <Text style={[styles.deptItem, item.link && styles.deptLink]}>{item.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flexGrow: 1
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#fff', // Make title bright for dark backgrounds
  },
  geb: {
    fontSize: 16,
    color: '#bbb',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  address: {
    fontSize: 16,
    color: '#555',
    marginBottom: 2
  },
  mapButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 12,
    marginVertical: 16,
    alignItems: 'center'
  },
  mapButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16
  },
  deptSection: {
    marginTop: 16
  },
  deptHeader: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 8
  },
  deptItem: {
    fontSize: 16,
    marginBottom: 6,
    color: '#fff' // Ensure visibility for unlinked departments in dark mode
  },
  deptLink: {
    color: '#007AFF',
    textDecorationLine: 'underline'
  }
});
