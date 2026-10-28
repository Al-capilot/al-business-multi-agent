const { validateGeneratedCode } = require("./code-lib-validator");

function safeAgentWrite(candidateCode, context = {}) {
  const result = validateGeneratedCode(candidateCode);

  if (!result.ok) {
    return {
      accepted: false,
      reason: result.error,
      stage: result.stage,
      context
    };
  }

  return {
    accepted: true,
    message: "Code passed validation library. Safe to write.",
    context
  };
}

module.exports = { safeAgentWrite };
