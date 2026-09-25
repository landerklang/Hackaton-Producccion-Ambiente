import React from 'react';
import { Platform } from 'react-native';

let NativeMapView;
let Marker;

if (Platform.OS !== 'web') {
  const maps = require('react-native-maps');
  NativeMapView = maps.default;
  Marker = maps.Marker;
}

export { Marker };

export default function MapView(props) {
  if (Platform.OS === 'web') {
    return null;
  }

  const NativeComponent = NativeMapView;
  return <NativeComponent {...props} />;
}
