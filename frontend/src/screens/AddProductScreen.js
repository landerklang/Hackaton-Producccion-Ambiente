import React, { useState } from 'react';
import {
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

export default function AddProductScreen({ navigation }) {
  const [imageUrl, setImageUrl] = useState('');
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');

  const handleSubmit = () => {
    console.log({ imageUrl, name, price, category, description, tags });
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable
            accessibilityLabel="Volver"
            accessibilityRole="button"
            onPress={() => navigation.goBack()}
            style={({ pressed }) => [styles.backButton, pressed && styles.pressedButton]}
          >
            <Text style={styles.backButtonText}>&lt;- Volver</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Nuevo Artículo</Text>
        </View>

        <Text style={styles.label}>Imagen</Text>
        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          onChangeText={setImageUrl}
          placeholder="Pegá el link de la imagen"
          placeholderTextColor="#888888"
          style={styles.input}
          value={imageUrl}
        />

        {imageUrl.trim() ? (
          <Image
            accessibilityLabel="Vista previa del artículo"
            source={{ uri: imageUrl.trim() }}
            style={styles.imagePreview}
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.imagePlaceholderText}>Vista previa de imagen</Text>
          </View>
        )}

        <Text style={styles.label}>Nombre del artículo</Text>
        <TextInput
          onChangeText={setName}
          placeholder="Ej: Miel orgánica"
          placeholderTextColor="#888888"
          style={styles.input}
          value={name}
        />

        <Text style={styles.label}>Precio</Text>
        <TextInput
          keyboardType="numeric"
          onChangeText={setPrice}
          placeholder="Ej: 7500"
          placeholderTextColor="#888888"
          style={styles.input}
          value={price}
        />

        <Text style={styles.label}>Categoría</Text>
        <TextInput
          onChangeText={setCategory}
          placeholder="Ej: Alimentos"
          placeholderTextColor="#888888"
          style={styles.input}
          value={category}
        />

        <Text style={styles.label}>Palabras clave</Text>
        <TextInput
          onChangeText={setTags}
          placeholder="Ej: miel, orgánico, regional"
          placeholderTextColor="#888888"
          style={styles.input}
          value={tags}
        />

        <Pressable
          accessibilityRole="button"
          onPress={() => {}}
          style={({ pressed }) => [styles.aiButton, pressed && styles.pressedButton]}
        >
          <Text style={styles.aiButtonText}>✨ Autocompletar con IA</Text>
        </Pressable>

        <Text style={styles.label}>Descripción</Text>
        <TextInput
          multiline
          numberOfLines={4}
          onChangeText={setDescription}
          placeholder="Contale a tus clientes sobre este artículo"
          placeholderTextColor="#888888"
          style={[styles.input, styles.descriptionInput]}
          textAlignVertical="top"
          value={description}
        />

        <Pressable
          accessibilityRole="button"
          onPress={handleSubmit}
          style={({ pressed }) => [styles.submitButton, pressed && styles.submitButtonPressed]}
        >
          <Text style={styles.submitButtonText}>Publicar Artículo</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#242424',
  },
  content: {
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  backButton: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  pressedButton: {
    opacity: 0.75,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
  },
  label: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#3A3A3A',
    color: '#FFFFFF',
    borderColor: '#555555',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    resizeMode: 'cover',
    marginBottom: 16,
  },
  imagePlaceholder: {
    width: '100%',
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#333333',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#555555',
    borderStyle: 'dashed',
    marginBottom: 16,
  },
  imagePlaceholderText: {
    color: '#888888',
    fontSize: 14,
  },
  aiButton: {
    alignSelf: 'flex-start',
    borderColor: '#C89F7A',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    marginBottom: 16,
  },
  aiButtonText: {
    color: '#C89F7A',
    fontSize: 13,
    fontWeight: '700',
  },
  descriptionInput: {
    minHeight: 112,
  },
  submitButton: {
    alignItems: 'center',
    backgroundColor: '#C89F7A',
    borderRadius: 8,
    padding: 15,
    marginTop: 4,
  },
  submitButtonPressed: {
    backgroundColor: '#B8885C',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
