const { GoogleGenAI } = require('@google/genai');
const mongoose = require('mongoose');
const Product = require('../models/Product');

const FALLBACK_PRODUCER_ID = new mongoose.Types.ObjectId('000000000000000000000001');

const SYSTEM_PROMPT =
  'Eres un experto en extracción de datos estructurados para una plataforma de comercio local de Formosa. Analiza el texto coloquial del productor y extrae lo que desea vender. Devuelve EXCLUSIVAMENTE un objeto JSON con esta estructura: {"title": "String", "price": Number | "Consultar", "tags": ["String"], "metadata": {}}. No incluyas saludos ni bloques markdown.';

const generateProductFromText = async (req, res) => {
  const { text } = req.body;

  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'The text field is required.' });
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: text,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: 'application/json',
      },
    });

    const generatedText = response.text;
    const extractedProduct = JSON.parse(generatedText);
    const createdProduct = await Product.create({
      producerId: req.body.producerId || FALLBACK_PRODUCER_ID,
      title: extractedProduct.title,
      price: extractedProduct.price,
      tags: extractedProduct.tags,
      metadata: extractedProduct.metadata,
      imageUrl: 'https://picsum.photos/400/300',
    });

    return res.status(201).json(createdProduct);
  } catch (error) {
    console.error('Product generation failed:', error.message);
    return res.status(500).json({ error: 'Unable to generate product data.' });
  }
};

const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ _id: -1 }).limit(20);
    return res.status(200).json(products);
  } catch (error) {
    console.error('Product retrieval failed:', error.message);
    return res.status(500).json({ error: 'Unable to retrieve products.' });
  }
};

module.exports = { generateProductFromText, getAllProducts };
