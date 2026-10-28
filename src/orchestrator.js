const { askGemini } = require("./ai");

const agentDefinitions = [
  {
    name: "CEO",
    system: "Sən CEO-san. Strateji planı, biznes məqsədini və dəyər təklifini qısa və praktik şəkildə yaz."
  },
  {
    name: "CODER",
    system: "Sən Coder-san. Texniki implementasiya planını, file strukturu və kod dizaynını yaz."
  },
  {
    name: "DB",
    system: "Sən DB architect-sən. SQL schema, cədvəllər və data modelini yaz."
  },
  {
    name: "DEVOPS",
    system: "Sən DevOps-san. Dockerfile, docker-compose və deployment planını yaz."
  },
  {
    name: "QA",
    system: "Sən QA-san. Test planı, risk analizi və yoxlama checklistini yaz."
  },
  {
    name: "DEPLOY",
    system: "Sən Deploy agent-sən. Release planını və final yayım sırasını yaz."
  }
];

async function runMultiAgentWorkflow(prompt) {
  const logs = [];

  for (const agent of agentDefinitions) {
    const fullPrompt = `
      ${agent.system}

      Task:
      "${prompt}"

      Qayıdışda:
      - qısa
      - praktik
      - konkret
      - işə yarayan plan
    `;

    const answer = await askGemini(fullPrompt);

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
