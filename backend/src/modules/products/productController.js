const Product = require('../../models/Product');
const Producer = require('../../models/Producer');

const createProduct = async (req, res) => {
  const { producerId, title, description, price, currency, imageUrl, tags, metadata, status } = req.body;

  if (!producerId || !title || typeof title !== 'string') {
    return res.status(400).json({ error: 'producerId and title are required.' });
  }

  if (tags !== undefined && !Array.isArray(tags)) {
    return res.status(400).json({ error: 'tags must be an array.' });
  }

  try {
    const producer = await Producer.findById(producerId).select('_id');

    if (!producer) {
      return res.status(404).json({ error: 'Producer not found.' });
    }

    const product = await Product.create({
      producerId,
      title: title.trim(),
      description,
      price: price ?? 'Consultar',
      currency,
      imageUrl,
      tags: tags || [],
      metadata,
      status: status || 'draft',
    });

    return res.status(201).json(product);
  } catch (error) {
    console.error('Product creation failed:', error.message);
    return res.status(500).json({ error: 'Unable to create product.' });
  }
};

const listProducts = async (req, res) => {
  const filter = req.query.producerId ? { producerId: req.query.producerId } : {};

  try {
    const products = await Product.find(filter).sort({ createdAt: -1 }).lean();
    return res.status(200).json(products);
  } catch (error) {
    console.error('Product listing failed:', error.message);
    return res.status(500).json({ error: 'Unable to list products.' });
  }
};

module.exports = { createProduct, listProducts };
