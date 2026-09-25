import React from 'react';
import {
  FlatList,
  Image,
  Linking,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const mockProducts = [
  {
    id: 'product-1',
    title: 'Miel orgánica de monte',
    price: 7500,
    imageUrl: 'https://picsum.photos/seed/miel-organica/640/480',
  },
  {
    id: 'product-2',
    title: 'Cera natural artesanal',
    price: 4200,
    imageUrl: 'https://picsum.photos/seed/cera-natural/640/480',
  },
  {
    id: 'product-3',
    title: 'Jalea real familiar',
    price: 9800,
    imageUrl: 'https://picsum.photos/seed/jalea-real/640/480',
  },
  {
    id: 'product-4',
    title: 'Pack degustación regional',
    price: 12500,
    imageUrl: 'https://picsum.photos/seed/pack-regional/640/480',
  },
];

export default function PublicStoreScreen({ navigation, route }) {
  const producer = route?.params?.producer || {};
  const phone = producer.whatsappNumber || producer.phone;

  const handleWhatsApp = () => {
    if (!phone) return;

    const message = `Hola ${producer.name || 'productor'}, vi su tienda en el Hub Productivo Formosa y me gustaría consultar por sus productos.`;
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

    Linking.openURL(url).catch((error) => console.error('Error opening WhatsApp', error));
  };

  const renderHeader = () => (
    <>
      <View style={styles.bannerWrapper}>
        <Image
          accessibilityLabel={`Portada de ${producer.name || 'la tienda'}`}
          source={{
            uri: producer.coverImage || producer.image || 'https://picsum.photos/seed/public-store-cover/1200/500',
          }}
          style={styles.coverImage}
        />
        <Pressable
          accessibilityLabel="Volver"
          accessibilityRole="button"
          onPress={() => navigation.goBack()}
          style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]}
        >
          <Text style={styles.backButtonText}>←</Text>
        </Pressable>
      </View>

      <View style={styles.businessCard}>
        <Text numberOfLines={2} style={styles.businessName}>{producer.name || 'Emprendimiento'}</Text>
        <View style={styles.categoryTag}>
          <Text style={styles.categoryTagText}>{producer.category || 'Productor local'}</Text>
        </View>
        <Text style={styles.businessDescription}>
          {producer.description || producer.profileText || 'Conocé los productos de este emprendimiento formoseño.'}
        </Text>

        <Pressable
          accessibilityLabel={`Contactar a ${producer.name || 'este productor'} por WhatsApp`}
          accessibilityRole="button"
          onPress={handleWhatsApp}
          style={({ pressed }) => [styles.whatsappButton, pressed && styles.whatsappButtonPressed]}
        >
          <Text style={styles.whatsappButtonText}>Contactar por WhatsApp</Text>
        </Pressable>
      </View>

      <Text style={styles.catalogTitle}>Catálogo de Productos</Text>
    </>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        contentContainerStyle={styles.content}
        data={mockProducts}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        numColumns={2}
        renderItem={({ item }) => (
          <View style={styles.productCardWrapper}>
            <View style={styles.productCard}>
              <Image
                accessibilityLabel={`Imagen de ${item.title}`}
                source={{ uri: item.imageUrl }}
                style={styles.productImage}
              />
              <View style={styles.productContent}>
                <Text numberOfLines={2} style={styles.productTitle}>{item.title}</Text>
                <Text style={styles.productPrice}>${item.price.toLocaleString('es-AR')}</Text>
              </View>
            </View>
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
    backgroundColor: '#F0F2F5',
  },
  content: {
    width: '100%',
    maxWidth: 800,
    alignSelf: 'center',
    paddingBottom: 24,
  },
  bannerWrapper: {
    position: 'relative',
    width: '100%',
  },
  coverImage: {
    width: '100%',
    height: 220,
    resizeMode: 'cover',
  },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 21,
    backgroundColor: 'rgba(45, 45, 45, 0.6)',
  },
  backButtonPressed: {
    backgroundColor: 'rgba(45, 45, 45, 0.8)',
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 24,
    lineHeight: 26,
  },
  businessCard: {
    marginTop: -40,
    marginHorizontal: 16,
    padding: 20,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  businessName: {
    color: '#2D2D2D',
    fontSize: 24,
    fontWeight: 'bold',
  },
  categoryTag: {
    alignSelf: 'flex-start',
    marginTop: 10,
    borderRadius: 6,
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  categoryTagText: {
    color: '#1565C0',
    fontSize: 13,
    fontWeight: '700',
  },
  businessDescription: {
    marginTop: 12,
    color: '#6C757D',
    fontSize: 15,
    lineHeight: 22,
  },
  whatsappButton: {
    width: '100%',
    alignItems: 'center',
    marginTop: 15,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#1EBE5D',
  },
  whatsappButtonPressed: {
    backgroundColor: '#169A4A',
  },
  whatsappButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  catalogTitle: {
    margin: 16,
    color: '#2D2D2D',
    fontSize: 20,
    fontWeight: 'bold',
  },
  productCardWrapper: {
    flex: 1,
    minWidth: 150,
    margin: 8,
  },
  productCard: {
    flex: 1,
    minWidth: 150,
    overflow: 'hidden',
    borderRadius: 8,
    borderColor: '#E0E0E0',
    borderWidth: 1,
    backgroundColor: '#FFFFFF',
  },
  productImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  productContent: {
    padding: 12,
  },
  productTitle: {
    color: '#2D2D2D',
    fontSize: 15,
    fontWeight: 'bold',
    lineHeight: 20,
  },
  productPrice: {
    marginTop: 8,
    color: '#74ACDF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
