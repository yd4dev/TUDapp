import { Colors } from '@/constants/Colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, AppState, Button, KeyboardAvoidingView, Modal, Platform, Image as RNImage, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, useColorScheme } from 'react-native';

import ValidBadge from '@/components/ValidBadge';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';
import * as Brightness from 'expo-brightness';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';


// Accept props for all dynamic fields
export function StudentID({
  nachname = "Mustermann",
  vorname = "Max",
  geburtsdatum = "01.01.2000",
  expiry = "30.09.2025",
  matrikelnummer = "1234567",
  profilePicUri,
  onPressProfilePic,
}: {
  nachname?: string;
  vorname?: string;
  geburtsdatum?: string;
  expiry?: string;
  matrikelnummer?: string;
  profilePicUri?: string | null;
  onPressProfilePic?: () => void;
}) {
  const leftAnim = useRef(new Animated.Value(0)).current;

  const appState = useRef(AppState.currentState);

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

      const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        setBrightnessOnFocus();
      } else {
        Brightness.setBrightnessAsync(prevBrightness || 0.5);
      }

      appState.current = nextAppState;
    });

      return () => {
        subscription.remove();
        active = false;
        if (permissionGranted && prevBrightness !== null) {
          //Brightness.restoreSystemBrightnessAsync();
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
            <TouchableOpacity style={{flex: 1}} onPress={onPressProfilePic}>
              {profilePicUri ? (
                <Image
                  source={{ uri: profilePicUri }}
                  style={styles.profilePic}
                  contentFit="cover"
                />
              ) : (
                <Image
                  source={require('@/assets/images/profile_pic.png')}
                  style={styles.profilePic}
                  contentFit="cover"
                />
              )}
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.rightColumn}>
          <Text style={styles.semesterLabel}>Semester</Text>
          <Text style={styles.semesterValue}>SoSe 2025</Text>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Info label="Nachname" value={nachname} />
              <Info label="Vorname" value={vorname} />
              <Info label="Geburtsdatum" value={geburtsdatum} />
            </View>
            <View style={{ flex: 1 }}>
              <Info label="Gültig bis" value={expiry} />
              <Info label="Matrikelnummer" value={matrikelnummer} />
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

export default function ID () {
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState({
    nachname: 'Mustermann',
    vorname: 'Max',
    geburtsdatum: '01.01.2000',
    expiry: '30.09.2025',
    matrikelnummer: '1234567',
  });
  const [editForm, setEditForm] = useState(form);
  const [profilePicUri, setProfilePicUri] = useState<string | null>(null);

  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  // Load saved values on mount
  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem('studentIdForm');
        if (saved) {
          const parsed = JSON.parse(saved);
          setForm(parsed);
          setEditForm(parsed);
          if (parsed.profilePicUri) setProfilePicUri(parsed.profilePicUri);
        }
        const savedPic = await AsyncStorage.getItem('studentIdProfilePic');
        if (savedPic) setProfilePicUri(savedPic);
      } catch {}
    })();
  }, []);

  // Save values whenever form changes
  useEffect(() => {
    AsyncStorage.setItem('studentIdForm', JSON.stringify({ ...form, profilePicUri }));
  }, [form, profilePicUri]);

  // Image picker handler
  const handlePickProfilePic = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [12, 10],
      quality: 1,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      setProfilePicUri(asset.uri);
      await AsyncStorage.setItem('studentIdProfilePic', asset.uri);
    }
  };

  const openModal = () => {
    setEditForm(form);
    setModalVisible(true);
  };

  const handleSave = () => {
    setForm(editForm);
    setModalVisible(false);
  };

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen
        options={{
          title: 'Ausweis',
          headerBackTitle: 'Zurück', // Custom back button label
          headerRight: () => (
            <Button
              title="Edit"
              onPress={openModal}
              color={theme.tint}
            />
          ),
        }}
      />
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <StudentID
          nachname={form.nachname}
          vorname={form.vorname}
          geburtsdatum={form.geburtsdatum}
          expiry={form.expiry}
          matrikelnummer={form.matrikelnummer}
          profilePicUri={profilePicUri}
          onPressProfilePic={handlePickProfilePic}
        />
      </ScrollView>
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <View style={[styles.modalOverlay, { backgroundColor: colorScheme === 'dark' ? '#000b' : '#0006' }]}>
            <View style={[
              styles.sheet,
              { backgroundColor: theme.background, shadowColor: theme.text }
            ]}>
              <View style={[styles.sheetHandle, { backgroundColor: theme.icon }]} />
              <Text style={[styles.modalTitle, { color: theme.text }]}>Ausweis bearbeiten</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.background,
                    color: theme.text,
                    borderColor: theme.icon,
                  }
                ]}
                value={editForm.nachname}
                onChangeText={nachname => setEditForm(f => ({ ...f, nachname }))}
                placeholder="Nachname"
                placeholderTextColor={theme.icon}
                autoCapitalize="words"
              />
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.background,
                    color: theme.text,
                    borderColor: theme.icon,
                  }
                ]}
                value={editForm.vorname}
                onChangeText={vorname => setEditForm(f => ({ ...f, vorname }))}
                placeholder="Vorname"
                placeholderTextColor={theme.icon}
                autoCapitalize="words"
              />
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.background,
                    color: theme.text,
                    borderColor: theme.icon,
                  }
                ]}
                value={editForm.geburtsdatum}
                onChangeText={geburtsdatum => setEditForm(f => ({ ...f, geburtsdatum }))}
                placeholder="Geburtsdatum"
                placeholderTextColor={theme.icon}
              />
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.background,
                    color: theme.text,
                    borderColor: theme.icon,
                  }
                ]}
                value={editForm.expiry}
                onChangeText={expiry => setEditForm(f => ({ ...f, expiry }))}
                placeholder="Gültig bis"
                placeholderTextColor={theme.icon}
              />
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.background,
                    color: theme.text,
                    borderColor: theme.icon,
                  }
                ]}
                value={editForm.matrikelnummer}
                onChangeText={matrikelnummer => setEditForm(f => ({ ...f, matrikelnummer }))}
                placeholder="Matrikelnummer"
                placeholderTextColor={theme.icon}
                keyboardType="numeric"
              />
              <View style={styles.modalButtons}>
                <Button title="Abbrechen" onPress={() => setModalVisible(false)} color={theme.icon} />
                <Button title="Speichern" onPress={handleSave} color={theme.tint} />
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: '#0006',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 32,
    width: '100%',
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
  },
  sheetHandle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#ccc',
    alignSelf: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontWeight: '600',
    fontSize: 18,
    marginBottom: 18,
    textAlign: 'center',
    color: '#222',
  },
  input: {
    borderBottomWidth: 1,
    borderColor: '#eee',
    marginBottom: 18,
    paddingVertical: 8,
    paddingHorizontal: 4,
    fontSize: 16,
    backgroundColor: '#f8f8f8',
    borderRadius: 6,
    color: '#222',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 18,
    gap: 12,
  },
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