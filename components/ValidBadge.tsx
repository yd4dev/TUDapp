import { DeviceMotion } from 'expo-sensors';
import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, Text, View } from 'react-native';

const { width: SCREEN_W } = Dimensions.get('window');
const STICKER_W = SCREEN_W * 0.25;
const STICKER_H = STICKER_W * 0.4;
const BIG = STICKER_W * 2;
const MAX_OFF = (BIG - STICKER_W) / 2;

export default function ValidBadge() {
  const pan = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;

  useEffect(() => {
    DeviceMotion.setUpdateInterval(16);
    const sub = DeviceMotion.addListener(({ rotation }) => {
      if (!rotation) return;
      // Calculate normalized values in [0, 1]
      const normX = ((rotation.gamma * 1.5 / (Math.PI/2)) + 1) / 2;
      const normY = ((rotation.beta * 1.5 / (Math.PI/2)) + 1) / 2;
      // Looping offset using modulo and mapping to [-MAX_OFF, MAX_OFF]
      const loopX = ((normX % 1) + 1) % 1; // ensure positive
      const loopY = ((normY % 1) + 1) % 1;
      const x = -MAX_OFF + loopX * (2 * MAX_OFF);
      const y = -MAX_OFF + loopY * (2 * MAX_OFF);
      Animated.spring(pan, {
        toValue: { x, y },
        useNativeDriver: false,
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
