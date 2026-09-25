const generateJson = async ({ model, systemInstruction, contents }) => {
  const response = await fetch(process.env.OLLAMA_URL || 'http://localhost:11434/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: model || process.env.OLLAMA_MODEL || 'qwen2.5:3b',
      stream: false,
      format: 'json',
      messages: [
        { role: 'system', content: systemInstruction },
        { role: 'user', content: contents },
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
    text: data.message.content,
    promptTokens: data.prompt_eval_count || 0,
    responseTokens: data.eval_count || 0,
  };
};

module.exports = { generateJson };
