import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import ProductCard from '../components/ProductCard';

const CATEGORIES = ['Todas', 'Alimentos', 'Artesanías', 'Tecnología', 'Agro'];

const INITIAL_PRODUCTS = [
  {
    id: 'miel-organica',
    title: 'Miel orgánica del monte',
    description: 'Miel pura cosechada en apiarios familiares de Laguna Naineck.',
    category: 'Alimentos',
    price: 7500,
    tags: ['Miel', 'Regional', 'Orgánico'],
  },
  {
    id: 'cajon-bananas',
    title: 'Cajón de bananas',
    description: 'Bananas frescas de producción formoseña, ideales para comercios.',
    category: 'Agro',
    price: 18000,
    tags: ['Frutas', 'Mayorista', 'Fresco'],
  },
  {
    id: 'mate-palo-santo',
    title: 'Mate de madera de palo santo',
    description: 'Pieza artesanal terminada a mano con cera natural.',
    category: 'Artesanías',
    price: 14500,
    tags: ['Mate', 'Palo Santo', 'Artesanal'],
  },
  {
    id: 'canasto-chaguar',
    title: 'Canasto tejido de chaguar',
    description: 'Canasto decorativo tejido con técnicas tradicionales de la región.',
    category: 'Artesanías',
    price: 18500,
    tags: ['Chaguar', 'Decoración', 'Regional'],
  },
  {
    id: 'soporte-notebook',
    title: 'Soporte para notebook 3D',
    description: 'Soporte liviano y resistente, impreso en PLA reforzado.',
    category: 'Tecnología',
    price: 12500,
    tags: ['Impresión 3D', 'Oficina', 'PLA'],
  },
  {
    id: 'mandioca-fresca',
    title: 'Mandioca fresca',
    description: 'Mandioca recién cosechada, disponible por bolsa o por mayor.',
    category: 'Agro',
    price: 4200,
    tags: ['Hortalizas', 'Local', 'Fresco'],
  },
];

export default function HomeScreen() {
  const [allProducts] = useState(INITIAL_PRODUCTS);
  const [filteredProducts, setFilteredProducts] = useState(INITIAL_PRODUCTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Todas');

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
      <FlatList
        contentContainerStyle={styles.feedContent}
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No encontramos productos</Text>
            <Text style={styles.emptyText}>Probá con otra búsqueda o categoría.</Text>
          </View>
        }
        ListHeaderComponent={
          <View>
            <Text style={styles.brand}>🌱 Tachyon Dream FORMOSA</Text>
            <Text style={styles.heroTitle}>Lo mejor de nuestra tierra, cerca tuyo.</Text>
            <Text style={styles.heroSubtitle}>
              Descubrí productos auténticos de productores formoseños.
            </Text>
            <TextInput
              accessibilityLabel="Buscar productos"
              onChangeText={setSearchQuery}
              placeholder="Buscar productos, tags o descripciones..."
              placeholderTextColor="#718096"
              style={styles.searchInput}
              value={searchQuery}
            />
            <Text style={styles.sectionTitle}>Explorá por categoría</Text>
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
            <Text style={styles.productDescription}>{item.description}</Text>
          </View>
        )}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7F6',
  },
  feedContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 28,
  },
  brand: {
    color: '#2D7A4F',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  heroTitle: {
    maxWidth: 360,
    marginTop: 10,
    color: '#172033',
    fontSize: 28,
    fontWeight: '800',
    lineHeight: 34,
  },
  heroSubtitle: {
    maxWidth: 380,
    marginTop: 8,
    color: '#667085',
    fontSize: 15,
    lineHeight: 22,
  },
  searchInput: {
    height: 50,
    marginTop: 20,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#D9E1DC',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    color: '#172033',
    fontSize: 15,
  },
  sectionTitle: {
    marginTop: 24,
    color: '#172033',
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
    borderWidth: 1,
    borderColor: '#D9E1DC',
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
  },
  activeCategoryChip: {
    borderColor: '#2D7A4F',
    backgroundColor: '#2D7A4F',
  },
  categoryText: {
    color: '#52605A',
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
  },
  resultCount: {
    marginTop: 24,
    color: '#667085',
    fontSize: 12,
  },
  cardWrapper: {
    alignItems: 'center',
    marginTop: 14,
  },
  productDescription: {
    width: 270,
    marginTop: 7,
    color: '#667085',
    fontSize: 13,
    lineHeight: 19,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyTitle: {
    color: '#172033',
    fontSize: 17,
    fontWeight: '800',
  },
  emptyText: {
    marginTop: 7,
    color: '#667085',
    fontSize: 14,
  },
});
