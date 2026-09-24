const { GoogleGenAI } = require('@google/genai');

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
    const product = JSON.parse(generatedText);

    return res.status(200).json(product);
  } catch (error) {
    console.error('Product generation failed:', error.message);
    return res.status(500).json({ error: 'Unable to generate product data.' });
  }
};

module.exports = { generateProductFromText };
