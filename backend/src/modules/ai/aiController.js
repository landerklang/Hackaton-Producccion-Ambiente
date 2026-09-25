const { generateJson: generateWithGemini } = require('./providers/geminiProvider');
const { generateJson: generateWithOllama } = require('./providers/ollamaProvider');

const PRODUCT_SYSTEM_PROMPT =
  'Eres un experto en extracción de datos estructurados para una plataforma de comercio local de Formosa. Analiza el texto coloquial del productor y extrae lo que desea vender. Devuelve EXCLUSIVAMENTE un objeto JSON con esta estructura: {"title": "String", "price": Number | "Consultar", "tags": ["String"], "metadata": {}}. No inventes datos. No incluyas saludos ni bloques markdown.';

const PROFILE_SYSTEM_PROMPT =
  'Eres un asistente para crear perfiles de productores locales de Formosa. A partir de una conversación, identifica la información disponible y devuelve EXCLUSIVAMENTE un objeto JSON con esta estructura: {"name": "String", "category": "String", "description": "String", "products": ["String"], "locationText": "String", "whatsappNumber": "String", "instagram": "String", "missingFields": ["String"], "profileText": "String"}. No inventes nombres de usuario, enlaces, categorias, precios, ubicaciones ni datos de contacto. Usa cadenas vacias cuando falte información. En missingFields indica solo datos importantes que todavía falten. profileText debe ser una presentación breve y atractiva usando únicamente los datos proporcionados. No incluyas saludos ni bloques markdown.';

const getProvider = () => (process.env.AI_PROVIDER || 'gemini').toLowerCase() === 'ollama' ? generateWithOllama : generateWithGemini;

const generateStructuredResponse = async ({ systemInstruction, contents }) => {
  const provider = process.env.AI_PROVIDER || 'gemini';
  const generate = getProvider();
  const response = await generate({ systemInstruction, contents });

  console.log(`[AI] Provider: ${provider}`);
  if (response.promptTokens !== undefined) {
    console.log(`[AI] Ollama tokens: ${response.promptTokens} prompt + ${response.responseTokens} response`);
  }
  console.log(`[AI] Raw response:\n${response.text}`);

  return JSON.parse(response.text);
};

const generateProductDraft = async (req, res) => {
  const { text } = req.body;

  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'The text field is required.' });
  }

  try {
    const product = await generateStructuredResponse({
      systemInstruction: PRODUCT_SYSTEM_PROMPT,
      contents: text,
    });

    return res.status(200).json(product);
  } catch (error) {
    console.error('Product generation failed:', error.message);
    return res.status(500).json({ error: `Unable to generate product data: ${error.message}` });
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
    const systemInstruction = profile
      ? `${PROFILE_SYSTEM_PROMPT} Actualizá el perfil existente según la última instrucción del productor. Conservá los datos que no se solicite cambiar y devolvé siempre el perfil completo. Perfil existente: ${JSON.stringify(profile)}`
      : PROFILE_SYSTEM_PROMPT;
    const generatedProfile = await generateStructuredResponse({ systemInstruction, contents: conversation });

    return res.status(200).json(generatedProfile);
  } catch (error) {
    console.error('Producer profile generation failed:', error.message);
    return res.status(500).json({ error: `No se pudo generar el perfil: ${error.message}` });
  }
};

module.exports = { generateProductDraft, generateProducerProfile };
