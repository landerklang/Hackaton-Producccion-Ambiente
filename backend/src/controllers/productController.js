const { GoogleGenAI } = require('@google/genai');

const SYSTEM_PROMPT =
  'Eres un experto en extracción de datos estructurados para una plataforma de comercio local de Formosa. Analiza el texto coloquial del productor y extrae lo que desea vender. Devuelve EXCLUSIVAMENTE un objeto JSON con esta estructura: {"title": "String", "price": Number | "Consultar", "tags": ["String"], "metadata": {}}. No incluyas saludos ni bloques markdown.';

const PROFILE_SYSTEM_PROMPT =
  'Eres un asistente para crear perfiles de productores locales de Formosa. A partir de una conversación, identifica la información disponible y devuelve EXCLUSIVAMENTE un objeto JSON con esta estructura: {"name": "String", "category": "String", "description": "String", "products": ["String"], "locationText": "String", "whatsappNumber": "String", "instagram": "String", "missingFields": ["String"], "profileText": "String"}. No inventes datos. Usa cadenas vacías cuando falte información. En missingFields indica solo datos importantes que todavía falten. profileText debe ser una presentación breve y atractiva usando únicamente los datos proporcionados. No incluyas saludos ni bloques markdown.';

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
    const product = JSON.parse(generatedText);

    return res.status(200).json(product);
  } catch (error) {
    console.error('Product generation failed:', error.message);
    return res.status(500).json({ error: 'Unable to generate product data.' });
  }
};

const generateProducerProfile = async (req, res) => {
  const { messages } = req.body;

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
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: conversation,
      config: {
        systemInstruction: PROFILE_SYSTEM_PROMPT,
        responseMimeType: 'application/json',
      },
    });

    return res.status(200).json(JSON.parse(response.text));
  } catch (error) {
    console.error('Producer profile generation failed:', error.message);
    return res.status(500).json({ error: 'Unable to generate producer profile.' });
  }
};

module.exports = { generateProductFromText, generateProducerProfile };
