const { generateJson: generateWithGemini } = require('./providers/geminiProvider');
const { generateJson: generateWithOllama } = require('./providers/ollamaProvider');

const PRODUCT_SYSTEM_PROMPT =
  'Eres un experto en extracción de datos estructurados para una plataforma de comercio local de Formosa. Analiza el texto coloquial del productor y extrae lo que desea vender. Devuelve EXCLUSIVAMENTE un objeto JSON con esta estructura: {"title": "String", "price": Number | "Consultar", "tags": ["String"], "metadata": {}}. No inventes datos. No incluyas saludos ni bloques markdown.';

const PROFILE_SYSTEM_PROMPT =
  'Eres un asistente para crear perfiles de productores locales de Formosa. A partir de una conversación, identifica la información disponible y devuelve EXCLUSIVAMENTE un objeto JSON con esta estructura: {"name": "String", "category": "String", "description": "String", "products": ["String"], "locationText": "String", "whatsappNumber": "String", "instagram": "String", "missingFields": ["String"], "profileText": "String", "guidance": {"orientationGeneral": "String", "nextStep": "String", "officialSource": "String", "warning": "String"}}. No inventes nombres de usuario, enlaces, categorias, precios, ubicaciones ni datos de contacto. Usa cadenas vacias cuando falte información. En missingFields indica solo datos importantes que todavía falten. profileText debe ser una presentación breve y atractiva usando únicamente los datos proporcionados. guidance.orientationGeneral debe explicar brevemente cómo posicionar el emprendimiento, guidance.nextStep debe indicar los próximos pasos para vender localmente, guidance.officialSource debe referenciar una fuente oficial general y guidance.warning debe aclarar que no reemplaza asesoramiento profesional. No incluyas saludos ni bloques markdown.';

const ENTREPRENEUR_GUIDANCE_PROMPT =
  'Eres un coach de emprendimiento local para Formosa y la región. Tu trabajo es ayudar a una persona a convertir una idea, producción o servicio en una oferta concreta y viable, con foco en vender localmente. Responde SOLO con un JSON válido con esta estructura exacta: {"businessProfile": {"name": "String", "category": "String", "location": "String", "description": "String", "customer": "String", "offer": "String", "channels": ["String"]}, "plan": {"valueProposition": "String", "firstOffer": "String", "pricingStrategy": "String", "first30DaysPlan": ["String"], "risks": ["String"]}, "legalChecklist": ["String"], "officialSources": ["String"], "warning": "String"}. Reglas estrictas: 1) no inventes información legal, fiscal ni oficial; usa lenguaje general y práctico; 2) la respuesta debe ser concreta, orientada a acción y pensada para un emprendedor con recursos limitados; 3) businessProfile.name debe ser un nombre razonable para el emprendimiento; 4) businessProfile.description debe ser una descripción breve para usar como perfil de plataforma; 5) businessProfile.customer debe describir claramente a quién le vendería; 6) plan.firstOffer debe sugerir una oferta mínima viable o primer producto para vender; 7) plan.pricingStrategy debe explicar cómo fijar precio o validar precios; 8) plan.first30DaysPlan debe incluir 4 a 6 pasos accionables para validar la demanda en 30 días; 9) legalChecklist debe incluir 5 a 7 puntos concretos y orientativos para Argentina, con foco en Formosa y el tipo de negocio. Ejemplos válidos: registro y forma jurídica, actividad/producto y permisos locales, impuestos/monotributo, seguridad o responsabilidad civil, contratos y condiciones de venta, datos fiscales y CUIT si aplica, y requisitos sanitarios o de funcionamiento según la actividad; 10) officialSources debe incluir solo nombres de fuentes generales y confiables, sin enlaces inventados; 11) warning debe aclarar que esto es orientación general y no reemplaza asesoramiento profesional ni legal. No incluyas saludos, markdown ni texto extra fuera del JSON.';

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

const generateEntrepreneurGuide = async (req, res) => {
  const { idea, category, location, experience, availability, budget } = req.body;

  if (!idea || typeof idea !== 'string' || !idea.trim()) {
    return res.status(400).json({ error: 'idea is required.' });
  }

  try {
    const contents = [
      `Idea o producción: ${idea.trim()}`,
      `Categoría sugerida: ${category || 'no especificada'}`,
      `Localidad: ${location || 'Formosa'}`,
      `Experiencia o conocimientos: ${experience || 'no especificado'}`,
      `Tiempo disponible: ${availability || 'no especificado'}`,
      `Presupuesto inicial: ${budget || 'no especificado'}`,
    ].join('\n');

    const guide = await generateStructuredResponse({
      systemInstruction: ENTREPRENEUR_GUIDANCE_PROMPT,
      contents,
    });

    return res.status(200).json(guide);
  } catch (error) {
    console.error('Entrepreneur guidance generation failed:', error.message);
    return res.status(500).json({ error: `No se pudo generar la guía: ${error.message}` });
  }
};

module.exports = { generateProductDraft, generateProducerProfile, generateEntrepreneurGuide };
