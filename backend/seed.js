require('dotenv').config();

const mongoose = require('mongoose');
const connectDB = require('./src/config/db');
const Producer = require('./src/models/Producer');
const Product = require('./src/models/Product');

const IMAGE_URL = 'https://picsum.photos/400';

const producerData = [
  {
    name: 'Finca Naineck',
    category: 'Agro',
    status: 'published',
    whatsappNumber: '5493704123456',
    addressText: 'Colonia La Primavera, Laguna Naineck, Formosa',
    location: {
      type: 'Point',
      coordinates: [-58.1165, -25.2334],
    },
  },
  {
    name: 'Artesanías del Monte',
    category: 'Artesanía',
    status: 'published',
    whatsappNumber: '5493704234567',
    addressText: 'Barrio San Francisco, Formosa Capital',
    location: {
      type: 'Point',
      coordinates: [-58.1812, -26.1775],
    },
  },
  {
    name: 'Impresiones 3D Norte',
    category: 'Tecnología',
    status: 'published',
    whatsappNumber: '5493704345678',
    addressText: 'Av. Gutnisky 1850, Formosa Capital',
    location: {
      type: 'Point',
      coordinates: [-58.1643, -26.1901],
    },
  },
];

const productData = [
  {
    producerIndex: 0,
    title: 'Cajón de Bananas',
    status: 'published',
    price: 18000,
    tags: ['Frutas', 'Agro', 'Mayorista'],
    metadata: { weight: '18 kg', stock: 24, origin: 'Laguna Naineck' },
  },
  {
    producerIndex: 0,
    title: 'Miel Orgánica de Monte',
    status: 'published',
    price: 7500,
    tags: ['Miel', 'Orgánico', 'Regional'],
    metadata: { weight: '500 g', stock: 36, harvest: 'Primavera 2026' },
  },
  {
    producerIndex: 0,
    title: 'Mandioca Fresca',
    status: 'published',
    price: 4200,
    tags: ['Hortalizas', 'Fresco', 'Local'],
    metadata: { weight: '5 kg', stock: 50, harvestDate: '2026-09-20' },
  },
  {
    producerIndex: 0,
    title: 'Bolsa de Batatas Criollas',
    status: 'published',
    price: 6800,
    tags: ['Hortalizas', 'Agro', 'Familiar'],
    metadata: { weight: '10 kg', stock: 18, packaging: 'Bolsa de arpillera' },
  },
  {
    producerIndex: 1,
    title: 'Mate de Madera de Palo Santo',
    status: 'published',
    price: 14500,
    tags: ['Artesanía', 'Palo Santo', 'Mate'],
    metadata: { dimensions: '12 x 9 cm', stock: 8, finish: 'Cera natural' },
  },
  {
    producerIndex: 1,
    title: 'Tabla de Asado Artesanal',
    status: 'published',
    price: 22000,
    tags: ['Madera', 'Cocina', 'Artesanía'],
    metadata: { dimensions: '45 x 25 x 2 cm', stock: 5, wood: 'Algarrobo' },
  },
  {
    producerIndex: 1,
    title: 'Canasto Tejido de Chaguar',
    status: 'published',
    price: 18500,
    tags: ['Chaguar', 'Decoración', 'Regional'],
    metadata: { dimensions: '30 x 25 cm', stock: 11, technique: 'Tejido artesanal' },
  },
  {
    producerIndex: 2,
    title: 'Soporte para Notebook 3D',
    status: 'published',
    price: 12500,
    tags: ['Impresión 3D', 'Oficina', 'Tecnología'],
    metadata: { dimensions: '28 x 24 x 12 cm', stock: 14, material: 'PLA reforzado' },
  },
  {
    producerIndex: 2,
    title: 'Maceta Geométrica Personalizada',
    status: 'published',
    price: 6500,
    tags: ['Impresión 3D', 'Hogar', 'Personalizado'],
    metadata: { dimensions: '14 x 14 x 13 cm', stock: 20, material: 'PLA biodegradable' },
  },
  {
    producerIndex: 2,
    title: 'Organizador de Cables Modular',
    status: 'published',
    price: 4800,
    tags: ['Accesorios', 'Oficina', 'Impresión 3D'],
    metadata: { dimensions: '18 x 7 x 3 cm', stock: 30, material: 'PETG', colors: ['Negro', 'Blanco', 'Verde'] },
  },
];

const seedDatabase = async () => {
  try {
    await connectDB();

    await Product.deleteMany({});
    await Producer.deleteMany({});

    const producers = await Producer.create(producerData);

    const products = await Product.create(
      productData.map(({ producerIndex, ...product }) => ({
        ...product,
        producerId: producers[producerIndex]._id,
        imageUrl: IMAGE_URL,
      }))
    );

    console.log(`Seed completed: ${producers.length} producers and ${products.length} products created.`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error.message);
    await mongoose.connection.close();
    process.exit(1);
  }
};

seedDatabase();
