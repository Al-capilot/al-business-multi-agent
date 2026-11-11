const fs = require("fs");
const path = require("path");
const acorn = require("acorn");

const DEFAULT_RULES = {
  requiredFunctions: [],
  forbiddenPatterns: ["eval(", "document.write(", "while(true)"],
  requiredImports: []
};

function loadRules() {
  const rulesPath = path.join(__dirname, "..", "library", "code-rules.json");
  try {
    const rules = JSON.parse(fs.readFileSync(rulesPath, "utf8"));
    return {
      requiredFunctions: Array.isArray(rules.requiredFunctions) ? rules.requiredFunctions : DEFAULT_RULES.requiredFunctions,
      forbiddenPatterns: Array.isArray(rules.forbiddenPatterns) ? rules.forbiddenPatterns : DEFAULT_RULES.forbiddenPatterns,
      requiredImports: Array.isArray(rules.requiredImports) ? rules.requiredImports : DEFAULT_RULES.requiredImports
    };
  } catch {
    return DEFAULT_RULES;
  }
}

function validateSyntax(code) {
  try {
    acorn.parse(code, { ecmaVersion: "latest", sourceType: "module" });
    return { ok: true };
  } catch (error) {
    return { ok: false, error: `Syntax error: ${error.message}` };
  }
}

function validateGeneratedCode(code) {
  if (typeof code !== "string" || !code.trim()) {
    return { ok: false, stage: "input", error: "No code was provided." };
  }

  const rules = loadRules();
  const syntaxCheck = validateSyntax(code);
  if (!syntaxCheck.ok) return { ok: false, stage: "syntax", error: syntaxCheck.error };

  const missingFunctions = rules.requiredFunctions.filter((name) => !code.includes(name));
  if (missingFunctions.length) {
    return { ok: false, stage: "required-functions", error: `Missing required functions: ${missingFunctions.join(", ")}` };
  }

  const violations = rules.forbiddenPatterns.filter((pattern) => code.includes(pattern));
  if (violations.length) {
    return { ok: false, stage: "forbidden-patterns", error: `Forbidden patterns found: ${violations.join(", ")}` };
  }

  const missingImports = rules.requiredImports.filter((item) => !code.includes(item));
  if (missingImports.length) {
    return { ok: false, stage: "required-imports", error: `Missing imports: ${missingImports.join(", ")}` };
  }

  return { ok: true, message: "Code passed configured syntax and pattern checks." };
}

module.exports = { validateGeneratedCode };
