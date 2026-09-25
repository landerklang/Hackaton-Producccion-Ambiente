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
  TouchableOpacity,
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

export default function HomeScreen({ navigation }) {
  const [producers, setProducers] = useState([]);
  const [filteredProducers, setFilteredProducers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Todas');
  const [isMapModalVisible, setMapModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

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
            {NAV_ITEMS.map((item) => (
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
              <ActivityIndicator color="#C89F7A" size="large" />
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
                      style={({ pressed }) => [styles.whatsappButton, pressed && styles.whatsappButtonPressed]}
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
    backgroundColor: '#242424',
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
    backgroundColor: '#C89F7A',
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
    backgroundColor: '#FFFFFF',
  },
  headerButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
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
    minWidth: 280,
    maxWidth: 320,
    margin: 10,
  },
  producerCard: {
    width: '100%',
    borderRadius: 8,
    backgroundColor: '#333333',
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
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  producerDescription: {
    color: '#D0D0D0',
    fontSize: 14,
    marginBottom: 12,
  },
  producerTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  categoryTag: {
    borderRadius: 6,
    backgroundColor: '#C89F7A',
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  categoryTagText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  keywordTag: {
    borderRadius: 6,
    backgroundColor: '#444444',
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  keywordTagText: {
    color: '#EAE0D5',
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
