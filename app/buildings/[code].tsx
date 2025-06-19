import { useThemeColor } from '@/hooks/useThemeColor';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import React from 'react';
import { ActionSheetIOS, Alert, Linking, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import buildingsData from '../../assets/buildings.json';
import { t } from '../../constants/i18n';

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

  // Theme colors
  const backgroundColor = useThemeColor({}, 'background');
  const titleColor = useThemeColor({}, 'text');
  const gebColor = useThemeColor({}, 'icon');
  const addressColor = useThemeColor({}, 'tabIconDefault');
  const mapButtonColor = useThemeColor({}, 'tint');
  const mapButtonTextColor = useThemeColor({}, 'background');
  const deptHeaderColor = useThemeColor({}, 'text');
  const deptItemColor = useThemeColor({}, 'text');
  const deptLinkColor = useThemeColor({}, 'tint');
  const styles = getStyles({ backgroundColor, titleColor, gebColor, addressColor, mapButtonColor, mapButtonTextColor, deptHeaderColor, deptItemColor, deptLinkColor });

  React.useEffect(() => {
    if (building) {
      navigation.setOptions({
         title: building.Name,
        });
    }
  }, [building, navigation]);

  if (!building) {
    return (
      <View style={styles.center}><Text style={styles.title}>{t.notFound}</Text></View>
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
        <Text style={styles.mapButtonText}>{t.openInMap}</Text>
      </TouchableOpacity>
      {building.Departments && building.Departments.length > 0 && (
        <View style={styles.deptSection}>
          <Text style={styles.deptHeader}>{t.departmentsHeader}</Text>
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

// Styles as a function of theme colors
const getStyles = ({ backgroundColor, titleColor, gebColor, addressColor, mapButtonColor, mapButtonTextColor, deptHeaderColor, deptItemColor, deptLinkColor }: {
  backgroundColor: string;
  titleColor: string;
  gebColor: string;
  addressColor: string;
  mapButtonColor: string;
  mapButtonTextColor: string;
  deptHeaderColor: string;
  deptItemColor: string;
  deptLinkColor: string;
}) => StyleSheet.create({
  container: {
    padding: 20,
    flexGrow: 1,
    backgroundColor,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
    color: titleColor,
  },
  geb: {
    fontSize: 16,
    color: gebColor,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  address: {
    fontSize: 16,
    color: addressColor,
    marginBottom: 2,
  },
  mapButton: {
    backgroundColor: mapButtonColor,
    borderRadius: 8,
    padding: 12,
    marginVertical: 16,
    alignItems: 'center',
  },
  mapButtonText: {
    color: mapButtonTextColor,
    fontWeight: 'bold',
    fontSize: 16,
  },
  deptSection: {
    marginTop: 16,
  },
  deptHeader: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 8,
    color: deptHeaderColor,
  },
  deptItem: {
    fontSize: 16,
    marginBottom: 6,
    color: deptItemColor,
  },
  deptLink: {
    color: deptLinkColor,
    textDecorationLine: 'underline',
  },
});
