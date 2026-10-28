function evaluateWorkflow(logs) {
  let score = 0;

  if (!logs || logs.length === 0) return 0;

  if (logs.length >= 6) score += 30;
  if (logs.some((entry) => entry.agent === "CEO")) score += 15;
  if (logs.some((entry) => entry.agent === "CODER")) score += 15;
  if (logs.some((entry) => entry.agent === "DB")) score += 15;
  if (logs.some((entry) => entry.agent === "DEVOPS")) score += 15;
  if (logs.some((entry) => entry.agent === "QA")) score += 10;

  return score;
}

module.exports = { evaluateWorkflow };
