const { GoogleGenAI } = require("@google/genai");

const DEFAULT_MODEL = "gemini-2.5-flash";
let client;

function getClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    const error = new Error("GEMINI_API_KEY is not configured. Add it to the service's environment variables.");
    error.code = "API_KEY_MISSING";
    error.statusCode = 503;
    throw error;
  }

  if (!client) client = new GoogleGenAI({ apiKey });
  return client;
}

async function askGemini(prompt) {
  const ai = getClient();
  const model = process.env.GEMINI_MODEL || DEFAULT_MODEL;
  const response = await ai.models.generateContent({ model, contents: prompt });
  const text = response.text?.trim();
  if (!text) throw new Error("Gemini returned an empty response.");
  return text;
}

module.exports = { askGemini };
