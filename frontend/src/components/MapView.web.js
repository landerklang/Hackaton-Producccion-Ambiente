import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export function Marker() {
  return null;
}

export default function MapView({ children, style }) {
  return (
    <View style={[styles.mapFallback, style]}>
      <Text style={styles.title}>Mapa disponible en la app móvil</Text>
      <Text style={styles.coordinates}>Formosa, Argentina</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  mapFallback: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DDEDE3',
  },
  title: {
    color: '#17633F',
    fontSize: 16,
    fontWeight: '800',
  },
  coordinates: {
    marginTop: 6,
    color: '#557164',
    fontSize: 14,
  },
});
