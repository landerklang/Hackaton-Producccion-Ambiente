import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Linking,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import axios from 'axios';
import WebMapView, { Marker as WebMarker } from '../components/MapView.web';
import NativeMapView, { Marker as NativeMapMarker } from '../components/MapView.native';

const API_HOST = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
const PRODUCERS_API_URL = `http://${API_HOST}:3000/api/producers`;
const MapComponent = Platform.OS === 'web' ? WebMapView : NativeMapView;
const MarkerComponent = Platform.OS === 'web' ? WebMarker : NativeMapMarker;

const CATEGORIES = ['Todas', 'Alimentos', 'Artesanías', 'Tecnología', 'Agro'];

const normalizeProducer = (producer) => {
  const coordinates = producer.location?.coordinates;
  const location = Array.isArray(coordinates) && coordinates.length === 2
    ? { latitude: coordinates[1], longitude: coordinates[0] }
    : undefined;
  const keywordSource = [producer.category, producer.name, producer.description, producer.profileText]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
    .split(/\s+/)
    .filter((word) => word.length > 3);

  return {
    ...producer,
    id: producer._id || producer.id,
    description: producer.description || producer.profileText || 'Sin descripción disponible.',
    keywords: [...new Set(keywordSource)].slice(0, 4),
    phone: producer.whatsappNumber,
    image: producer.image,
    location,
  };
};

const NAV_ITEMS = [
  { label: 'Explorar', icon: '🔎' },
  { label: 'Publicar', icon: '✦', primary: true },
  { label: 'Perfil', icon: '👤' },
];

export default function HomeScreen({ navigation, currentUser }) {
  const [producers, setProducers] = useState([]);
  const [filteredProducers, setFilteredProducers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Todas');
  const [isMapModalVisible, setMapModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const visibleNavItems = NAV_ITEMS.filter(
    (item) => item.label !== 'Publicar' || (currentUser?.role === 'productor' && currentUser.hasBusiness === true),
  );

  useEffect(() => {
    const loadProducers = async () => {
      try {
        const response = await axios.get(`${PRODUCERS_API_URL}?status=published`);
        const nextProducers = Array.isArray(response.data)
          ? response.data.map(normalizeProducer)
          : [];
        setProducers(nextProducers);
        setLoadError('');
      } catch (error) {
        console.error('Error loading producers:', error);
        setLoadError('No pudimos cargar los emprendimientos. Revisá que el backend esté activo.');
      } finally {
        setIsLoading(false);
      }
    };

    loadProducers();
  }, []);

  const handleWhatsApp = (phone, producerName) => {
    if (!phone) return;

    const message = `Hola ${producerName}, vi su perfil en el Hub Productivo Formosa y me gustaría consultar por sus productos.`;
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

    Linking.openURL(url).catch((error) => console.error('Error opening WhatsApp', error));
  };

  useEffect(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    const nextProducers = producers.filter((producer) => {
      const matchesCategory = activeCategory === 'Todas' || producer.category === activeCategory;
      const searchableText = [producer.name, producer.description, ...producer.keywords]
        .join(' ')
        .toLowerCase();
      const matchesSearch = !normalizedQuery || searchableText.includes(normalizedQuery);

      return matchesCategory && matchesSearch;
    });

    setFilteredProducers(nextProducers);
  }, [activeCategory, producers, searchQuery]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.shell}>
        <View style={styles.header}>
          <Text numberOfLines={1} style={styles.brand}>🌱 TACHYON DREAM FORMOSA</Text>

          <View style={styles.headerActions}>
            {visibleNavItems.map((item) => (
              <Pressable
                accessibilityRole="button"
                key={item.label}
                onPress={() => {
                  if (item.label === 'Perfil') {
                    navigation.navigate('Profile');
                  } else if (item.label === 'Publicar') {
                    navigation.navigate('AddProduct');
                  }
                }}
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
          data={filteredProducers}
          keyExtractor={(item) => item.id.toString()}
          numColumns={Platform.OS === 'web' ? 3 : 1}
          columnWrapperStyle={Platform.OS === 'web' ? styles.columnWrapper : null}
          ListEmptyComponent={isLoading ? (
            <View style={styles.emptyState}>
              <ActivityIndicator color="#74ACDF" size="large" />
              <Text style={styles.emptyText}>Cargando emprendimientos...</Text>
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>{loadError || 'No encontramos productores'}</Text>
              {!loadError ? <Text style={styles.emptyText}>Probá con otra búsqueda o categoría.</Text> : null}
            </View>
          )}
          ListHeaderComponent={
            <View style={styles.headerSection}>
              <Text style={styles.heroTitle}>Lo mejor de nuestra tierra, cerca tuyo.</Text>
              <Text style={styles.heroSubtitle}>
                Descubrí emprendimientos auténticos de productores formoseños.
              </Text>

              <View style={styles.searchBox}>
                <TextInput
                  accessibilityLabel="Buscar productores"
                  onChangeText={setSearchQuery}
                  placeholder="Buscar productores, rubros o palabras clave..."
                  placeholderTextColor="#6C757D"
                  style={styles.searchInput}
                  value={searchQuery}
                />

                <Pressable
                  accessibilityRole="button"
                  onPress={() => setMapModalVisible(true)}
                  style={({ hovered, pressed }) => [
                    styles.mapButton,
                    hovered && styles.interactiveHovered,
                    pressed && styles.interactivePressed,
                  ]}
                >
                  <Text style={styles.mapButtonText}>🗺️</Text>
                </Pressable>
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
                      style={({ hovered, pressed }) => [
                        styles.categoryChip,
                        isActive && styles.activeCategoryChip,
                        hovered && styles.interactiveHovered,
                        pressed && styles.interactivePressed,
                      ]}
                    >
                      <Text style={[styles.categoryText, isActive && styles.activeCategoryText]}>
                        {category}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>

              <View style={styles.resultsHeader}>
                <Text style={styles.sectionTitle}>Emprendimientos Destacados</Text>
                <Text style={styles.resultCount}>{filteredProducers.length} disponibles</Text>
              </View>
            </View>
          }
          renderItem={({ item: producer }) => (
            <View style={styles.cardWrapper}>
              <View style={styles.producerCard}>
                <Image
                  accessibilityLabel={`Imagen de ${producer.name}`}
                  source={{ uri: producer.image || 'https://picsum.photos/400/200' }}
                  style={styles.producerImage}
                />
                <View style={styles.producerContent}>
                  <Text numberOfLines={2} style={styles.producerName}>{producer.name}</Text>
                  <Text numberOfLines={2} style={styles.producerDescription}>{producer.description}</Text>
                  <View style={styles.producerTags}>
                    <View style={styles.categoryTag}>
                      <Text style={styles.categoryTagText}>{producer.category}</Text>
                    </View>
                    {producer.keywords.slice(0, 2).map((keyword) => (
                      <View key={keyword} style={styles.keywordTag}>
                        <Text style={styles.keywordTagText}>{keyword}</Text>
                      </View>
                    ))}
                  </View>
                    <Pressable
                      accessibilityLabel={`Contactar a ${producer.name} por WhatsApp`}
                      accessibilityRole="button"
                      onPress={() => handleWhatsApp(producer.phone, producer.name)}
                      style={({ hovered, pressed }) => [
                        styles.whatsappButton,
                        hovered && styles.interactiveHovered,
                        pressed && styles.whatsappButtonPressed,
                      ]}
                    >
                      <Text style={styles.whatsappButtonText}>Contactar por WhatsApp</Text>
                    </Pressable>
                </View>
              </View>
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

          <MapComponent
            initialRegion={{
              latitude: -26.1849,
              longitude: -58.1731,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            }}
            style={styles.map}
          >
            {filteredProducers.map((producer) => {
              if (!producer.location) {
                return null;
              }

              return (
                <MarkerComponent
                  coordinate={producer.location}
                  key={producer.id}
                  title={producer.name}
                  description={producer.category}
                />
              );
            })}
          </MapComponent>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F2F5',
  },
  shell: {
    flex: 1,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#74ACDF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  brand: {
    flexShrink: 1,
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 0.2,
  },
  headerActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 10,
  },
  headerButton: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: 'transparent',
  },
  primaryHeaderButton: {
    backgroundColor: '#74ACDF',
  },
  headerButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  primaryHeaderButtonText: {
    color: '#FFFFFF',
  },
  headerSection: {
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 8,
  },
  heroTitle: {
    color: '#2D2D2D',
    fontSize: 30,
    fontWeight: '800',
    lineHeight: 36,
    maxWidth: 440,
  },
  heroSubtitle: {
    marginTop: 10,
    color: '#6C757D',
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
    borderColor: '#CED4DA',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    color: '#2D2D2D',
    fontSize: 15,
  },
  mapButton: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  mapButtonText: {
    fontSize: 20,
  },
  sectionTitle: {
    marginTop: 24,
    color: '#2D2D2D',
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
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#CED4DA',
  },
  activeCategoryChip: {
    backgroundColor: '#74ACDF',
    borderColor: '#74ACDF',
  },
  categoryText: {
    color: '#6C757D',
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
    color: '#6C757D',
    fontSize: 12,
    fontWeight: '600',
  },
  feedContent: {
    backgroundColor: '#F0F2F5',
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
    minWidth: 280,
    maxWidth: 320,
    margin: 10,
  },
  producerCard: {
    width: '100%',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderColor: '#CED4DA',
    borderWidth: 1.5,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  producerImage: {
    width: '100%',
    height: 140,
    resizeMode: 'cover',
  },
  producerContent: {
    padding: 16,
  },
  producerName: {
    color: '#2D2D2D',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  producerDescription: {
    color: '#6C757D',
    fontSize: 14,
    marginBottom: 12,
  },
  producerTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  interactiveHovered: {
    borderColor: '#74ACDF',
    shadowColor: '#74ACDF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
  interactivePressed: {
    opacity: 0.85,
  },
  categoryTag: {
    borderRadius: 6,
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  categoryTagText: {
    color: '#1565C0',
    fontSize: 12,
    fontWeight: 'bold',
  },
  keywordTag: {
    borderRadius: 6,
    backgroundColor: '#E9ECEF',
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  keywordTagText: {
    color: '#495057',
    fontSize: 12,
    fontWeight: '700',
  },
  whatsappButton: {
    alignItems: 'center',
    backgroundColor: '#25D366',
    borderRadius: 8,
    marginTop: 16,
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  whatsappButtonPressed: {
    backgroundColor: '#1DA851',
  },
  whatsappButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#74ACDF',
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
    color: '#74ACDF',
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
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 24,
  },
  mapFallbackTitle: {
    color: '#2D2D2D',
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
  },
  mapFallbackText: {
    marginTop: 8,
    color: '#6C757D',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyTitle: {
    color: '#2D2D2D',
    fontSize: 17,
    fontWeight: '800',
  },
  emptyText: {
    marginTop: 7,
    color: '#6C757D',
    fontSize: 14,
  },
});
