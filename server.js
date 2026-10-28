require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const { runMultiAgentWorkflow } = require("./src/orchestrator");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ ok: true, status: "running" });
});

app.post("/api/run-workflow", async (req, res) => {
  const { prompt } = req.body || {};
  if (!prompt || !prompt.trim()) {
    return res.status(400).json({ error: "Prompt is required" });
  }

  try {
    const result = await runMultiAgentWorkflow(prompt.trim());
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Workflow failed", detail: error.message });
  }
});

app.get("/api/memory", (req, res) => {
  const { getMemory } = require("./src/memory");
  res.json({ memory: getMemory() });
});

app.use(express.static(path.join(__dirname)));

app.get("*", (req, res) => {
  const indexPath = path.join(__dirname, "index.html");
  res.sendFile(indexPath);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
