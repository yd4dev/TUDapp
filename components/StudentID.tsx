import ValidBadge from '@/components/ValidBadge';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';
import * as Brightness from 'expo-brightness';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import { Animated, Image as RNImage, StyleSheet, Text, View } from 'react-native';

export function StudentID() {
  const leftAnim = useRef(new Animated.Value(0)).current;

  useFocusEffect(
    React.useCallback(() => {
      let prevBrightness: number | null = null;
      let permissionGranted = false;
      let active = true;

      const setBrightnessOnFocus = async () => {
        const { status } = await Brightness.requestPermissionsAsync();
        if (status === 'granted' && active) {
          permissionGranted = true;
          prevBrightness = await Brightness.getBrightnessAsync();
          await Brightness.setBrightnessAsync(1.0);
        } else if (status !== 'granted') {
          console.warn('Brightness permission not granted');
        }
      };

      setBrightnessOnFocus();

      return () => {
        active = false;
        if (permissionGranted && prevBrightness !== null) {
          Brightness.setBrightnessAsync(prevBrightness);
        }
      };
    }, [])
  );

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(leftAnim, {
          toValue: 100,
          duration: 1500,
          useNativeDriver: false,
        }),
        Animated.timing(leftAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, [leftAnim]);

  return (
    <LinearGradient
      colors={['#F53148', '#D50B21']}
      style={styles.cardContainer}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <Animated.Image
        source={require('@/assets/images/tuda_logo_RGB.png')}
        style={[styles.animatedTudaLogo, { left: leftAnim }]}
        resizeMode="contain"
      />
      <View style={styles.cardRow}>
        <View style={styles.leftColumn}>
          <RNImage
            source={require('@/assets/images/tuda_logo.png')}
            style={styles.tudLogo}
            resizeMode="contain"
          />
          <View style={styles.profilePic}>
            <Image
              source={require('@/assets/images/profile_pic.png')}
              style={styles.profilePic}
              contentFit="cover"
            />
          </View>
        </View>
        <View style={styles.rightColumn}>
          <Text style={styles.semesterLabel}>Semester</Text>
          <Text style={styles.semesterValue}>SoSe 2025</Text>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Info label="Nachname" value="Mustermann" />
              <Info label="Vorname" value="Max" />
              <Info label="Geburtsdatum" value="01.01.2000" />
            </View>
            <View style={{ flex: 1 }}>
              <Info label="Gültig bis" value="30.09.2025" />
              <Info label="Matrikelnummer" value="1234567" />
            </View>
          </View>
        </View>
      </View>
      <View style={styles.infoRow}>
        <Ionicons name="information-circle" size={20} color="#fff" />
        <Text style={styles.infoText}>
          Ist ordnungsgemäß an der TU Darmstadt im oben genannten Semester immatrikuliert
        </Text>
        <ValidBadge />
      </View>
    </LinearGradient>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cardContainer: {
    borderRadius: 20,
    paddingRight: 18,
    paddingVertical: 18,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    width: '95%',
    alignSelf: 'center',
  },
  cardRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  leftColumn: {
    width: 100,
    marginRight: 16,
  },
  tudLogo: {
    width: 100,
    height: 40,
    marginBottom: 28,
    backgroundColor: '#fff',
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },
  profilePic: {
    width: 100,
    height: 120,
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
    backgroundColor: '#eee',
    marginBottom: 8,
    marginLeft: 0,
  },
  rightColumn: {
    flex: 1,
    flexWrap: 'wrap',
  },
  semesterLabel: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 2,
  },
  semesterValue: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 20,
    marginBottom: 8,
    paddingBottom: 8,
  },
  label: {
    color: '#fff',
    fontSize: 12,
    marginTop: 4,
  },
  value: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    justifyContent: 'space-between',
    marginLeft: 8,
  },
  infoText: {
    color: '#fff',
    fontSize: 12,
    flex: 1,
    marginRight: 8,
    marginLeft: 8,
  },
  animatedTudaLogo: {
    position: 'absolute',
    opacity: 0.12,
    width: 320,
    height: 320,
    top: 10,
    left: 0,
    zIndex: 0,
  },
});
