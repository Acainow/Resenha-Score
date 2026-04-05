import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

const fallbackImage = require('../../assets/images/olholoading.gif');

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
  imageSource?: any;
}

export default function LoadingOverlay({ visible, message = 'Carregando...', imageSource }: LoadingOverlayProps) {
  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.card}>
        <Image
          source={imageSource || fallbackImage}
          style={styles.image}
          resizeMode="contain"
        />
        <Text style={styles.text}>{message}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  card: {
    width: '80%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  text: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    textAlign: 'center',
  },
});
