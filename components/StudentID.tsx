import ValidBadge from '@/components/ValidBadge';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Animated, Image as RNImage, StyleSheet, Text, View } from 'react-native';

import { useEffect, useRef } from 'react';

export function StudentID() {

      const leftAnim = useRef(new Animated.Value(0)).current;
    
      useEffect(() => {
        Animated.loop(
          Animated.sequence([
            Animated.timing(leftAnim, {
              toValue: 100, // move right by 100
              duration: 1500,
              useNativeDriver: false,
            }),
            Animated.timing(leftAnim, {
              toValue: 0, // move back to left
              duration: 1500,
              useNativeDriver: false,
            }),
          ])
        ).start();
      }, [leftAnim]);

    return (
    <LinearGradient
            colors={['#d32b2f', '#b71c1c']}
            style={styles.cardContainer}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            
          >
             <Animated.Image
              source={require('@/assets/images/tuda_logo_RGB.png')}
              style={[
                styles.animatedTudaLogo,
                { left: leftAnim }
              ]}
              resizeMode="contain"
            />
            <View style={styles.cardRow}>
              <View style={styles.leftColumn}>
                <RNImage
                  source={require('@/assets/images/tuda_logo_RGB.png')}
                  style={styles.tudLogo}
                  resizeMode="contain"
                />
                <View style={styles.profilePic} >
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
                <Text style={styles.label}>Nachname</Text>
                <Text style={styles.value}>Mustermann</Text>
                <Text style={styles.label}>Vorname</Text>
                <Text style={styles.value}>Max</Text>
                <Text style={styles.label}>Geburtsdatum</Text>
                <Text style={styles.value}>01.01.2000</Text>
                <Text style={styles.label}>Gültig bis</Text>
                <Text style={styles.value}>30.09.2025</Text>
                <Text style={styles.label}>Matrikelnummer</Text>
                <Text style={styles.value}>1234567</Text>
              </View>
            </View>
            <View style={styles.infoRow}>
          <Text style={styles.infoText}>
            Ist ordnungsgemäß an der TU Darmstadt im oben genannten Semester immatrikuliert
          </Text>
          <ValidBadge />
          </View>
          </LinearGradient>
    )
}

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: 20,
    padding: 18,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    width: '110%',
    alignSelf: 'center',
  },
  cardRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  leftColumn: {
    width: 100,
    alignItems: 'center',
    marginRight: 16,
  },
  tudLogo: {
    width: 60,
    height: 60,
    marginBottom: 8,
  },
  profilePic: {
    width: 70,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#eee',
    marginBottom: 8,
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
  },
  infoText: {
    color: '#fff',
    fontSize: 12,
    flex: 1,
    marginRight: 8,
  },
  validBadge: {
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  validText: {
    color: '#7b61ff',
    fontWeight: 'bold',
    fontSize: 18,
    letterSpacing: 1,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
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
  shineOverlay: {
  ...StyleSheet.absoluteFillObject,
  zIndex: 1,
  justifyContent: 'center',
  alignItems: 'center',
},
shineGradient: {
  width: '220%',
  height: '220%',
  borderRadius: 40,
  opacity: 0.8,
},
});