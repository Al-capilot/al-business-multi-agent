const fs = require("fs");
const path = require("path");
const acorn = require("acorn");

function loadRules() {
  const rulesPath = path.join(process.cwd(), "library", "code-rules.json");
  const raw = fs.readFileSync(rulesPath, "utf8");
  return JSON.parse(raw);
}

function validateSyntax(code) {
  try {
    acorn.parse(code, { ecmaVersion: "latest" });
    return { ok: true };
  } catch (error) {
    return { ok: false, error: `Syntax error: ${error.message}` };
  }
}

function validateRequiredFunctions(code, requiredFunctions) {
  const missing = requiredFunctions.filter((name) => !code.includes(name));
  return {
    ok: missing.length === 0,
    missing
  };
}

function validateForbiddenPatterns(code, patterns) {
  const violations = patterns.filter((pattern) => code.includes(pattern));
  return {
    ok: violations.length === 0,
    violations
  };
}

function validateRequiredImports(code, requiredImports) {
  const missing = requiredImports.filter((imp) => !code.includes(imp));
  return {
    ok: missing.length === 0,
    missing
  };
}

function validateGeneratedCode(code) {
  const rules = loadRules();
  const syntaxCheck = validateSyntax(code);
  if (!syntaxCheck.ok) {
    return {
      ok: false,
      stage: "syntax",
      error: syntaxCheck.error
    };
  }

  const functionCheck = validateRequiredFunctions(code, rules.requiredFunctions);
  if (!functionCheck.ok) {
    return {
      ok: false,
      stage: "required-functions",
      error: `Missing required functions: ${functionCheck.missing.join(", ")}`
    };
  }

  const forbiddenCheck = validateForbiddenPatterns(code, rules.forbiddenPatterns);
  if (!forbiddenCheck.ok) {
    return {
      ok: false,
      stage: "forbidden-patterns",
      error: `Forbidden patterns found: ${forbiddenCheck.violations.join(", ")}`
    };
  }

  const importCheck = validateRequiredImports(code, rules.requiredImports);
  if (!importCheck.ok) {
    return {
      ok: false,
      stage: "required-imports",
      error: `Missing imports: ${importCheck.missing.join(", ")}`
    };
  }

  return {
    ok: true,
    message: "Code passed validation library checks."
  };
}

module.exports = { validateGeneratedCode };
