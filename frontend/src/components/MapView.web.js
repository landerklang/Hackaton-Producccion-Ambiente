import React from 'react';
import { StyleSheet, View } from 'react-native';

export function Marker() {
  return null;
}

export default function MapView({ initialRegion, style }) {
  const latitude = initialRegion?.latitude ?? -26.1849;
  const longitude = initialRegion?.longitude ?? -58.1731;
  const zoom = initialRegion?.latitudeDelta ? 12 : 11;
  const mapUrl = `https://www.google.com/maps?q=${latitude},${longitude}&z=${zoom}&output=embed`;

  return (
    <View style={[styles.container, style]}>
      <iframe
        title="Google Map"
        src={mapUrl}
        style={styles.iframe}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111111',
    overflow: 'hidden',
  },
  iframe: {
    width: '100%',
    height: '100%',
    border: 0,
    backgroundColor: '#111111',
  },
});
