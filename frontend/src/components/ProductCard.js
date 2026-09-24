import React from 'react';
import { Linking, Pressable, StyleSheet, Text, View, Image } from 'react-native';

const WHATSAPP_URL = 'whatsapp://send?phone=5493704000000&text=Hola';

export default function ProductCard({ product }) {
  const imageId = product.id || encodeURIComponent(product.title || 'producto');

  const handleContact = async () => {
    try {
      await Linking.openURL(WHATSAPP_URL);
    } catch (error) {
      console.warn('No se pudo abrir WhatsApp.', error);
    }
  };

  return (
    <View style={styles.card}>
      <Image
        accessibilityLabel={`Imagen de ${product.title}`}
        source={{ uri: `https://picsum.photos/seed/${imageId}/640/360` }}
        style={styles.image}
      />
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {product.title}
        </Text>
        <Text style={styles.price}>
          {typeof product.price === 'number'
            ? `$${product.price.toLocaleString('es-AR')}`
            : product.price || 'Consultar'}
        </Text>
        <View style={styles.tagsContainer}>
          {(product.tags || []).map((tag) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Contactar por WhatsApp"
          onPress={handleContact}
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
        >
          <Text style={styles.buttonText}>Contactar por WhatsApp</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 270,
    marginRight: 14,
    overflow: 'hidden',
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 7,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 132,
    backgroundColor: '#E5E7EB',
  },
  content: {
    padding: 14,
  },
  title: {
    color: '#172033',
    fontSize: 17,
    fontWeight: '700',
  },
  price: {
    marginTop: 6,
    color: '#16794A',
    fontSize: 16,
    fontWeight: '700',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 10,
    minHeight: 26,
  },
  tag: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: '#E8F5EE',
  },
  tagText: {
    color: '#17633F',
    fontSize: 12,
    fontWeight: '600',
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 42,
    marginTop: 14,
    borderRadius: 9,
    backgroundColor: '#18864B',
    paddingHorizontal: 10,
  },
  buttonPressed: {
    backgroundColor: '#12683A',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
