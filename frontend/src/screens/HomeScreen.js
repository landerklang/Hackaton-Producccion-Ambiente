import React from 'react';
import { FlatList, StyleSheet, Text, TextInput, View } from 'react-native';
import MapView, { Marker } from '../components/MapView';
import ProductCard from '../components/ProductCard';

const FORMOSA_REGION = {
  latitude: -26.1849,
  longitude: -58.1731,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

const MOCK_PRODUCTS = [
  { id: 'tomates', title: 'Tomates perita', price: 15000, tags: ['Hortalizas', 'Fresco'] },
  { id: 'miel', title: 'Miel artesanal', price: 8500, tags: ['Artesanal', 'Regional'] },
  { id: 'mandioca', title: 'Mandioca de Formosa', price: 'Consultar', tags: ['Raíces', 'Local'] },
  { id: 'zapallo', title: 'Zapallo anco', price: 12000, tags: ['Hortalizas', 'Mayorista'] },
];

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.headerContent}>
        <Text style={styles.greeting}>Mercado local</Text>
        <Text style={styles.heading}>Productos de Formosa</Text>
        <TextInput
          accessibilityLabel="Buscar productos"
          placeholder="Buscar productos, productores..."
          placeholderTextColor="#718096"
          style={styles.searchInput}
        />
      </View>

      <MapView initialRegion={FORMOSA_REGION} style={styles.map}>
        <Marker coordinate={FORMOSA_REGION} title="Formosa" description="Producción local" />
      </MapView>

      <View style={styles.productsSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Productos destacados</Text>
          <Text style={styles.sectionCount}>{MOCK_PRODUCTS.length} disponibles</Text>
        </View>
        <FlatList
          contentContainerStyle={styles.listContent}
          data={MOCK_PRODUCTS}
          horizontal
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ProductCard product={item} />}
          showsHorizontalScrollIndicator={false}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7F6',
  },
  headerContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 14,
  },
  greeting: {
    color: '#18864B',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  heading: {
    marginTop: 5,
    color: '#172033',
    fontSize: 25,
    fontWeight: '800',
  },
  searchInput: {
    height: 48,
    marginTop: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#D9E1DC',
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    color: '#172033',
    fontSize: 15,
  },
  map: {
    width: '100%',
    height: '40%',
  },
  productsSection: {
    flex: 1,
    paddingTop: 18,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  sectionTitle: {
    color: '#172033',
    fontSize: 18,
    fontWeight: '800',
  },
  sectionCount: {
    color: '#667085',
    fontSize: 12,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 18,
  },
});
