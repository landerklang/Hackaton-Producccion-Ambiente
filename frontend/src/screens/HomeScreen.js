import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import ProductCard from '../components/ProductCard';
import WebMapView, { Marker as WebMarker } from '../components/MapView.web';
import NativeMapView, { Marker as NativeMapMarker } from '../components/MapView.native';

const MapComponent = Platform.OS === 'web' ? WebMapView : NativeMapView;
const MarkerComponent = Platform.OS === 'web' ? WebMarker : NativeMapMarker;

const CATEGORIES = ['Todas', 'Alimentos', 'Artesanías', 'Tecnología', 'Agro'];

const INITIAL_PRODUCTS = [
  {
    id: 'miel-organica',
    title: 'Miel orgánica del monte',
    description: 'Miel pura cosechada en apiarios familiares de Laguna Naineck.',
    category: 'Alimentos',
    price: 7500,
    tags: ['Miel', 'Regional', 'Orgánico'],
    coordinate: { latitude: -26.180, longitude: -58.175 },
  },
  {
    id: 'cajon-bananas',
    title: 'Cajón de bananas',
    description: 'Bananas frescas de producción formoseña, ideales para comercios.',
    category: 'Agro',
    price: 18000,
    tags: ['Frutas', 'Mayorista', 'Fresco'],
    coordinate: { latitude: -26.175, longitude: -58.170 },
  },
  {
    id: 'mate-palo-santo',
    title: 'Mate de madera de palo santo',
    description: 'Pieza artesanal terminada a mano con cera natural.',
    category: 'Artesanías',
    price: 14500,
    tags: ['Mate', 'Palo Santo', 'Artesanal'],
    coordinate: { latitude: -26.185, longitude: -58.180 },
  },
  {
    id: 'canasto-chaguar',
    title: 'Canasto tejido de chaguar',
    description: 'Canasto decorativo tejido con técnicas tradicionales de la región.',
    category: 'Artesanías',
    price: 18500,
    tags: ['Chaguar', 'Decoración', 'Regional'],
    coordinate: { latitude: -26.188, longitude: -58.168 },
  },
  {
    id: 'soporte-notebook',
    title: 'Soporte para notebook 3D',
    description: 'Soporte liviano y resistente, impreso en PLA reforzado.',
    category: 'Tecnología',
    price: 12500,
    tags: ['Impresión 3D', 'Oficina', 'PLA'],
    coordinate: { latitude: -26.191, longitude: -58.176 },
  },
  {
    id: 'mandioca-fresca',
    title: 'Mandioca fresca',
    description: 'Mandioca recién cosechada, disponible por bolsa o por mayor.',
    category: 'Agro',
    price: 4200,
    tags: ['Hortalizas', 'Local', 'Fresco'],
    coordinate: { latitude: -26.178, longitude: -58.182 },
  },
];

const NAV_ITEMS = [
  { label: 'Explorar', icon: '🔎' },
  { label: 'Publicar', icon: '✦', primary: true },
  { label: 'Perfil', icon: '👤' },
];

export default function HomeScreen() {
  const [allProducts] = useState(INITIAL_PRODUCTS);
  const [filteredProducts, setFilteredProducts] = useState(INITIAL_PRODUCTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Todas');
  const [isMapModalVisible, setMapModalVisible] = useState(false);

  useEffect(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    const nextProducts = allProducts.filter((product) => {
      const matchesCategory = activeCategory === 'Todas' || product.category === activeCategory;
      const searchableText = [product.title, product.description, ...product.tags]
        .join(' ')
        .toLowerCase();
      const matchesSearch = !normalizedQuery || searchableText.includes(normalizedQuery);

      return matchesCategory && matchesSearch;
    });

    setFilteredProducts(nextProducts);
  }, [activeCategory, allProducts, searchQuery]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.shell}>
        <View style={styles.header}>
          <Text style={styles.brand}>🌱 TACHYON DREAM FORMOSA</Text>

          <View style={styles.headerActions}>
            {NAV_ITEMS.map((item) => (
              <Pressable
                accessibilityRole="button"
                key={item.label}
                style={[styles.headerButton, item.primary && styles.primaryHeaderButton]}
              >
                <Text
                  style={[
                    styles.headerButtonText,
                    item.primary && styles.primaryHeaderButtonText,
                  ]}
                >
                  {item.icon} {item.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <FlatList
          contentContainerStyle={styles.feedContent}
          data={filteredProducts}
          keyExtractor={(item) => item.id}
          numColumns={Platform.OS === 'web' ? 3 : 1}
          columnWrapperStyle={Platform.OS === 'web' ? styles.columnWrapper : null}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No encontramos productos</Text>
              <Text style={styles.emptyText}>Probá con otra búsqueda o categoría.</Text>
            </View>
          }
          ListHeaderComponent={
            <View style={styles.headerSection}>
              <Text style={styles.heroTitle}>Lo mejor de nuestra tierra, cerca tuyo.</Text>
              <Text style={styles.heroSubtitle}>
                Descubrí productos auténticos de productores formoseños.
              </Text>

              <View style={styles.searchBox}>
                <TextInput
                  accessibilityLabel="Buscar productos"
                  onChangeText={setSearchQuery}
                  placeholder="Buscar productos, tags o descripciones..."
                  placeholderTextColor="#D0D0D0"
                  style={styles.searchInput}
                  value={searchQuery}
                />

                <TouchableOpacity
                  accessibilityRole="button"
                  activeOpacity={0.8}
                  onPress={() => setMapModalVisible(true)}
                  style={styles.mapButton}
                >
                  <Text style={styles.mapButtonText}>🗺️</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.sectionTitle}>Explorar por categoría</Text>

              <ScrollView
                contentContainerStyle={styles.categoriesContent}
                horizontal
                showsHorizontalScrollIndicator={false}
              >
                {CATEGORIES.map((category) => {
                  const isActive = category === activeCategory;

                  return (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityState={{ selected: isActive }}
                      key={category}
                      onPress={() => setActiveCategory(category)}
                      style={[styles.categoryChip, isActive && styles.activeCategoryChip]}
                    >
                      <Text style={[styles.categoryText, isActive && styles.activeCategoryText]}>
                        {category}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>

              <View style={styles.resultsHeader}>
                <Text style={styles.sectionTitle}>Productos destacados</Text>
                <Text style={styles.resultCount}>{filteredProducts.length} disponibles</Text>
              </View>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.cardWrapper}>
              <ProductCard product={item} />
            </View>
          )}
          showsVerticalScrollIndicator={false}
        />
      </View>

      <Modal
        animationType="slide"
        visible={isMapModalVisible}
        onRequestClose={() => setMapModalVisible(false)}
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Mapa de resultados</Text>
            <Pressable onPress={() => setMapModalVisible(false)} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>Cerrar Mapa</Text>
            </Pressable>
          </View>

          {Platform.OS === 'web' ? (
            <View style={styles.mapFallback}>
              <Text style={styles.mapFallbackTitle}>Mapa disponible en la app móvil</Text>
              <Text style={styles.mapFallbackText}>
                Abrí esta vista en Android o iOS para ver los puntos geográficos.
              </Text>
            </View>
          ) : (
            <MapComponent
              initialRegion={{
                latitude: -26.1849,
                longitude: -58.1731,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
              }}
              style={styles.map}
            >
              {filteredProducts.map((product) => {
                if (!product.coordinate) {
                  return null;
                }

                return (
                  <MarkerComponent
                    coordinate={product.coordinate}
                    key={product.id}
                    title={product.title}
                    description={product.category}
                  />
                );
              })}
            </MapComponent>
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#242424',
  },
  shell: {
    flex: 1,
    width: '100%',
    maxWidth: 1000,
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#C89F7A',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  brand: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 0.2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerButton: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: 'transparent',
  },
  primaryHeaderButton: {
    backgroundColor: '#FFFFFF',
  },
  headerButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  primaryHeaderButtonText: {
    color: '#C89F7A',
  },
  headerSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 8,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '800',
    lineHeight: 36,
    maxWidth: 440,
  },
  heroSubtitle: {
    marginTop: 10,
    color: '#D0D0D0',
    fontSize: 15,
    lineHeight: 22,
    maxWidth: 420,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    height: 50,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#555555',
    borderRadius: 12,
    backgroundColor: '#3A3A3A',
    color: '#FFFFFF',
    fontSize: 15,
  },
  mapButton: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: '#3A3A3A',
    borderWidth: 1,
    borderColor: '#555555',
  },
  mapButtonText: {
    fontSize: 20,
  },
  sectionTitle: {
    marginTop: 24,
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  categoriesContent: {
    paddingVertical: 12,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: '#333333',
    borderWidth: 1,
    borderColor: '#444444',
  },
  activeCategoryChip: {
    backgroundColor: '#C89F7A',
    borderColor: '#C89F7A',
  },
  categoryText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  activeCategoryText: {
    color: '#FFFFFF',
  },
  resultsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  resultCount: {
    color: '#D0D0D0',
    fontSize: 12,
    fontWeight: '600',
  },
  feedContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 28,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    gap: 12,
  },
  cardWrapper: {
    flex: 1,
    alignItems: 'center',
    marginTop: 14,
    minWidth: 220,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#242424',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#C89F7A',
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  closeButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  closeButtonText: {
    color: '#C89F7A',
    fontSize: 13,
    fontWeight: '700',
  },
  map: {
    flex: 1,
    minHeight: 400,
  },
  mapFallback: {
    flex: 1,
    minHeight: 400,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2B2B2B',
    paddingHorizontal: 24,
  },
  mapFallbackTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
  },
  mapFallbackText: {
    marginTop: 8,
    color: '#D0D0D0',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
  },
  emptyText: {
    marginTop: 7,
    color: '#D0D0D0',
    fontSize: 14,
  },
});
