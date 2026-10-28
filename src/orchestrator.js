const { addMemory, getMemory } = require("./memory");
const { evaluateWorkflow } = require("./evaluator");
const { retryWithImprovement } = require("./retry-loop");
const { rollbackState } = require("./rollback");
const { writePatch } = require("./repo-patch");
const {
  ceoAgent,
  coderAgent,
  dbAgent,
  devopsAgent,
  qaAgent,
  deployAgent
} = require("./agents");

async function runMultiAgentWorkflow(prompt) {
  const logs = [];

  const tasks = [
    ceoAgent,
    coderAgent,
    dbAgent,
    devopsAgent,
    qaAgent,
    deployAgent
  ];

  for (const task of tasks) {
    const result = await task(prompt);
    logs.push({
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      agent: result.agent,
      message: result.message
    });

    addMemory({
      agent: result.agent,
      prompt,
      message: result.message
    });
  }

  const score = evaluateWorkflow(logs);

  if (score < 70) {
    const improved = await retryWithImprovement(prompt, logs);
    const patchPath = "generated/fix.txt";
    writePatch(patchPath, improved);

    return {
      status: "retry-needed",
      score,
      logs,
      improved,
      rollback: rollbackState({ prompt }),
      patch: patchPath,
      memory: getMemory()
    };
  }

  return {
    status: "completed",
    score,
    logs,
    memory: getMemory()
  };
}

module.exports = { runMultiAgentWorkflow };
