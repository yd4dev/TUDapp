// OilSticker.tsx
import { DeviceMotion } from 'expo-sensors';
import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, Text, View } from 'react-native';

const { width: SCREEN_W } = Dimensions.get('window');
const STICKER_W = SCREEN_W * 0.3;
const STICKER_H = STICKER_W * 0.3;
const BIG = STICKER_W * 2;
const MAX_OFF = (BIG - STICKER_W) / 2;

export default function ValidBadge() {
  const pan = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;

  useEffect(() => {
    DeviceMotion.setUpdateInterval(16);
    const sub = DeviceMotion.addListener(({ rotation }) => {
      if (!rotation) return;
      const normX = rotation.gamma / (Math.PI/2);
      const normY = rotation.beta  / (Math.PI/2);
      Animated.spring(pan, {
        toValue: { x: -normX * MAX_OFF, y: -normY * MAX_OFF },
        useNativeDriver: true,
        speed: 30,
        bounciness: 0,
      }).start();
    });
    return () => sub.remove();
  }, [pan]);

  return (
    <View style={styles.container}>
      <View style={styles.mask}>
        <Animated.Image
          source={require('@/assets/images/oil.jpg')}
          style={[
            styles.oil,
            { transform: pan.getTranslateTransform() },
          ]}
          resizeMode="cover"
        />
      </View>
      <View style={styles.label}>
        <Text style={styles.text}>VALID</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: STICKER_W,
    height: STICKER_H,
    alignSelf: 'center',
    marginTop: 0,
  },
  mask: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#222',
  },
  oil: {
    width: BIG,
    height: BIG,
    marginLeft: -MAX_OFF,
    marginTop: -MAX_OFF,
  },
  label: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
    textShadowColor: '#0008',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
});
