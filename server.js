require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const { runMultiAgentWorkflow } = require("./src/orchestrator");
const { askGemini } = require("./src/ai");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: "1mb" }));

function getPrompt(body = {}) {
  if (typeof body.prompt === "string") return body.prompt.trim();
  if (typeof body.message === "string") return body.message.trim();
  if (Array.isArray(body.messages)) {
    return body.messages
      .filter((item) => item && typeof item.content === "string")
      .map((item) => `${item.role || "user"}: ${item.content}`)
      .join("\n")
      .trim();
  }
  return "";
}

function handleError(res, error) {
  const status = error.statusCode || (error.code === "API_KEY_MISSING" ? 503 : 502);
  res.status(status).json({ error: error.message || "AI service request failed." });
}

app.get(["/health", "/api/health"], (req, res) => {
  res.json({ ok: true, status: "running", geminiConfigured: Boolean(process.env.GEMINI_API_KEY) });
});

app.post(["/run", "/api/chat"], async (req, res) => {
  const prompt = getPrompt(req.body);
  if (!prompt) return res.status(400).json({ error: "A non-empty prompt, message, or messages array is required." });
  try {
    const answer = await askGemini(prompt);
    res.json({ answer, response: answer });
  } catch (error) {
    handleError(res, error);
  }
});

app.post(["/run-multi", "/api/run-workflow"], async (req, res) => {
  const prompt = getPrompt(req.body);
  if (!prompt) return res.status(400).json({ error: "A non-empty prompt, message, or messages array is required." });
  try {
    const result = await runMultiAgentWorkflow(prompt);
    res.json(result);
  } catch (error) {
    handleError(res, error);
  }
});

app.get("/api/memory", (req, res) => {
  const { getMemory } = require("./src/memory");
  res.json({ memory: getMemory() });
});

app.use(express.static(path.join(__dirname)));
app.get("*", (req, res) => res.sendFile(path.join(__dirname, "index.html")));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}; Gemini API key ${process.env.GEMINI_API_KEY ? "configured" : "missing"}.`);
});
