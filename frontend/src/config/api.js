import Constants from 'expo-constants';
import { Platform } from 'react-native';

const metroHost = Constants.expoConfig?.hostUri?.split(':')[0]
  || Constants.manifest?.debuggerHost?.split(':')[0];
const apiHost = Platform.OS === 'web'
  ? 'localhost'
  : metroHost || (Platform.OS === 'android' ? '10.0.2.2' : 'localhost');

export const API_BASE_URL = `http://${apiHost}:3000`;
