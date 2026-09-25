const { GoogleGenAI } = require('@google/genai');

const getGeminiApiKey = () => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === 'tu_clave_de_gemini_aqui') {
    throw new Error('GEMINI_API_KEY is missing or still contains the example value.');
  }

  return apiKey;
};

const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

const generateJson = async ({ model, systemInstruction, contents }) => {
  const ai = new GoogleGenAI({ apiKey: getGeminiApiKey() });
  const config = { systemInstruction, responseMimeType: 'application/json' };

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const response = await ai.models.generateContent({
        model: model || 'gemini-3.8-flash',
        contents,
        config,
      });

      return { text: response.text };
    } catch (error) {
      const isTemporaryUnavailable =
        error.code === 503 || error.status === 503 || error.message.includes('high demand');

      if (!isTemporaryUnavailable || attempt === 2) {
        throw error;
      }

      await wait((attempt + 1) * 1500);
    }
  }
};

module.exports = { generateJson };
