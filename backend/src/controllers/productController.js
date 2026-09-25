const { GoogleGenAI } = require('@google/genai');
const Product = require('../models/Product');
const Producer = require('../models/Producer');

const SYSTEM_PROMPT =
  'Eres un experto en extracción de datos estructurados para una plataforma de comercio local de Formosa. Analiza el texto coloquial del productor y extrae lo que desea vender. Devuelve EXCLUSIVAMENTE un objeto JSON con esta estructura: {"title": "String", "price": Number | "Consultar", "tags": ["String"], "metadata": {}}. No incluyas saludos ni bloques markdown.';

const PROFILE_SYSTEM_PROMPT =
  'Eres un asistente para crear perfiles de productores locales de Formosa. A partir de una conversación, identifica la información disponible y devuelve EXCLUSIVAMENTE un objeto JSON con esta estructura: {"name": "String", "category": "String", "description": "String", "products": ["String"], "locationText": "String", "whatsappNumber": "String", "instagram": "String", "missingFields": ["String"], "profileText": "String"}. No inventes datos. Usa cadenas vacías cuando falte información. En missingFields indica solo datos importantes que todavía falten. profileText debe ser una presentación breve y atractiva usando únicamente los datos proporcionados. No incluyas saludos ni bloques markdown.';

const getGeminiApiKey = () => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === 'tu_clave_de_gemini_aqui') {
    throw new Error('GEMINI_API_KEY is missing or still contains the example value.');
  }

  return apiKey;
};

const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

const generateProfileWithOllama = async (conversation, systemInstruction) => {
  const response = await fetch(process.env.OLLAMA_URL || 'http://localhost:11434/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: process.env.OLLAMA_MODEL || 'qwen2.5:3b',
      stream: false,
      format: 'json',
      messages: [
        { role: 'system', content: systemInstruction },
        { role: 'user', content: conversation },
      ],
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || `Ollama returned HTTP ${response.status}.`);
  }

  if (!data.message?.content) {
    throw new Error('Ollama returned an empty response.');
  }

  return {
    content: data.message.content,
    promptTokens: data.prompt_eval_count || 0,
    responseTokens: data.eval_count || 0,
  };
};

const generateProfileWithRetry = async (ai, conversation, systemInstruction) => {
  const config = {
    systemInstruction,
    responseMimeType: 'application/json',
  };

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      return await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: conversation,
        config,
      });
    } catch (error) {
      const isTemporaryUnavailable =
        error.code === 503 || error.status === 503 || error.message.includes('high demand');

      if (!isTemporaryUnavailable || attempt === 2) {
        throw error;
      }

      console.warn(`[AI profile] Gemini unavailable, retrying (${attempt + 1}/2)...`);
      await wait((attempt + 1) * 1500);
    }
  }
};

const generateProductFromText = async (req, res) => {
  const { text } = req.body;

  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'The text field is required.' });
  }

  try {
    const ai = new GoogleGenAI({ apiKey: getGeminiApiKey() });
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: text,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: 'application/json',
      },
    });

    const generatedText = response.text;
    return res.status(200).json(JSON.parse(generatedText));
  } catch (error) {
    console.error('Product generation failed:', error.message);
    return res.status(500).json({ error: 'Unable to generate product data.' });
  }
};

const generateProducerProfile = async (req, res) => {
  const { messages, profile } = req.body;

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'The messages field must be a non-empty array.' });
  }

  const conversation = messages
    .filter((message) => message && typeof message.content === 'string')
    .map((message) => `${message.role === 'assistant' ? 'Asistente' : 'Productor'}: ${message.content}`)
    .join('\n');

  if (!conversation) {
    return res.status(400).json({ error: 'The conversation does not contain valid messages.' });
  }

  try {
    console.log(`[AI profile] Received ${messages.length} messages.`);
    const provider = process.env.AI_PROVIDER || 'gemini';
    const systemInstruction = profile
      ? `${PROFILE_SYSTEM_PROMPT} Actualizá el perfil existente según la última instrucción del productor. Conservá los datos que no se solicite cambiar y devolvé siempre el perfil completo. Perfil existente: ${JSON.stringify(profile)}`
      : PROFILE_SYSTEM_PROMPT;
    console.log(`[AI profile] Provider: ${provider}`);
    console.log(`[AI profile] Conversation sent to ${provider}:\n${conversation}`);

    if (provider === 'ollama') {
      const ollamaResult = await generateProfileWithOllama(conversation, systemInstruction);
      console.log(
        `[AI profile] Ollama tokens: ${ollamaResult.promptTokens} prompt + ${ollamaResult.responseTokens} response = ${ollamaResult.promptTokens + ollamaResult.responseTokens} total`,
      );
      console.log(`[AI profile] Raw Ollama response:\n${ollamaResult.content}`);
      return res.status(200).json(JSON.parse(ollamaResult.content));
    }

    const ai = new GoogleGenAI({ apiKey: getGeminiApiKey() });
    const response = await generateProfileWithRetry(ai, conversation, systemInstruction);
    console.log(`[AI profile] Raw Gemini response:\n${response.text}`);
    return res.status(200).json(JSON.parse(response.text));
  } catch (error) {
    console.error('Producer profile generation failed:', error.message);
    const isConfigurationError = error.message.includes('GEMINI_API_KEY');
    const publicError = isConfigurationError
      ? 'Gemini no está configurado. Revisá GEMINI_API_KEY en backend/.env.'
      : `No se pudo generar el perfil: ${error.message}`;

    return res.status(500).json({ error: publicError });
  }
};

const createProduct = async (req, res) => {
  const { producerId, title, price, imageUrl, tags, metadata } = req.body;

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
      price: price ?? 'Consultar',
      imageUrl,
      tags: tags || [],
      metadata,
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

module.exports = {
  createProduct,
  generateProductFromText,
  generateProducerProfile,
  listProducts,
};
