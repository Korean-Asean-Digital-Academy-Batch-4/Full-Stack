const env = require('../config/env');

function aiFailure(message) {
  const error = new Error(message);
  error.isAiFailure = true;
  return error;
}

async function generateText(prompt, { temperature = 0.4, maxOutputTokens = 500, thinkingLevel = 'minimal' } = {}) {
  if (!env.geminiApiKey) throw aiFailure('AI belum dikonfigurasi (GEMINI_API_KEY kosong)');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), env.aiRequestTimeoutMs);
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${env.aiModel}:generateContent`;
    const generationConfig = { temperature, maxOutputTokens };
    if (/^gemini-3(?:\.|-)/i.test(env.aiModel)) {
      generationConfig.thinkingConfig = { thinkingLevel };
    }
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-goog-api-key': env.geminiApiKey,
      },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig,
        store: false,
      }),
      signal: controller.signal,
    });
    if (!response.ok) throw aiFailure(`AI provider error: ${response.status}`);

    const data = await response.json();
    const text = (data.candidates?.[0]?.content?.parts || [])
      .map((part) => part.text || '')
      .join('\n')
      .trim();
    if (!text) throw aiFailure('AI tidak menghasilkan teks');
    return text;
  } catch (error) {
    error.isAiFailure = true;
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

module.exports = { generateText };
