const { askGemini } = require("./ai");
const { safeAgentWrite } = require("./agent-safeguard");

const agentDefinitions = [
  { name: "CEO", system: "Assess the goal, constraints, and desired outcome. Give a concise direction." },
  { name: "RESEARCH", system: "Identify relevant facts, assumptions, and unknowns. Do not invent sources or facts." },
  { name: "ARCHITECT", system: "Design a practical approach and note important trade-offs." },
  { name: "CODER", system: "For software tasks, provide a focused implementation or code example. For other tasks, provide the relevant specialist contribution." },
  { name: "QA", system: "Review the preceding work for correctness, gaps, risks, and test ideas." },
  { name: "SUMMARY", system: "Give the user a clear, useful final answer based on the preceding agent work. Do not claim tests or actions that were not performed." }
];

function extractCodeBlock(text) {
  const match = text.match(/```(?:javascript|js|mjs|cjs)?\s*\n([\s\S]*?)```/i);
  return match ? match[1].trim() : "";
}

async function runMultiAgentWorkflow(prompt) {
  const logs = [];
  let previousWork = "";
  let answer = "";

  for (const agent of agentDefinitions) {
    const fullPrompt = [
      `Role: ${agent.name}`,
      agent.system,
      "Answer in the user's language when practical.",
      `User task:\n${prompt}`,
      previousWork ? `Contributions so far:\n${previousWork}` : ""
    ].filter(Boolean).join("\n\n");

    try {
      const message = await askGemini(fullPrompt);
      const code = agent.name === "CODER" ? extractCodeBlock(message) : "";
      let validation = null;
      if (code) {
        validation = safeAgentWrite(code, { agent: agent.name });
      }

      const entry = {
        time: new Date().toISOString(),
        agent: agent.name,
        status: validation && !validation.accepted ? "warning" : "ok",
        message: validation && !validation.accepted
          ? `${message}\n\nCode validation warning: ${validation.reason}`
          : message
      };
      logs.push(entry);
      previousWork += `\n\n[${agent.name}]\n${entry.message}`;
      if (agent.name === "SUMMARY") answer = message;
    } catch (error) {
      if (error.code === "API_KEY_MISSING") throw error;
      logs.push({ time: new Date().toISOString(), agent: agent.name, status: "error", message: error.message || "Agent failed." });
    }
  }

  if (!answer) {
    const successful = logs.filter((entry) => entry.status === "ok" || entry.status === "warning");
    answer = successful.length
      ? successful[successful.length - 1].message
      : "Agentlər cavab yarada bilmədi. Servis qeydlərini yoxlayıb yenidən cəhd edin.";
  }

  return {
    status: logs.some((entry) => entry.status === "error") ? "completed_with_errors" : "completed",
    answer,
    logs
  };
}

module.exports = { runMultiAgentWorkflow };
