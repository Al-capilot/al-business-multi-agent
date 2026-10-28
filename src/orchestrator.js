const { askGemini } = require("./ai");
const { safeAgentWrite } = require("./agent-safeguard");

const agentDefinitions = [
  {
    name: "CEO",
    system: "Sən CEO-san. Strateji planı və biznes hədəfini yaz."
  },
  {
    name: "CODER",
    system: "Sən Coder-san. Kod yaz. Qəbul etmək üçün validation library-dən keçməlidir."
  }
];

async function runMultiAgentWorkflow(prompt) {
  const logs = [];

  for (const agent of agentDefinitions) {
    const fullPrompt = `
      ${agent.system}

      Task:
      "${prompt}"

      Yalnız JavaScript kodu yaz.
      Kod yazmadan əvvəl validation library-dən keçməlidir.
    `;

    const answer = await askGemini(fullPrompt);
    const safetyCheck = safeAgentWrite(answer, { agent: agent.name, prompt });

    if (!safetyCheck.accepted) {
      logs.push({
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        agent: agent.name,
        message: `Rejected by validation library: ${safetyCheck.reason}`
      });
      continue;
    }

    logs.push({
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      agent: agent.name,
      message: answer
    });
  }

  return {
    status: "completed",
    logs
  };
}

module.exports = { runMultiAgentWorkflow };
