# Multi-agent app with validation library

This project prevents unsafe generated code from being accepted by validating generated output before it is written.

## How it works

- Agent generates JavaScript code.
- `validateGeneratedCode()` runs syntax checks.
- It checks required functions and imports.
- It rejects forbidden patterns like `eval(`, `innerHTML =`, and `while(true)`.
- Only validated code is accepted.

## Install

```bash
npm install
cp .env.example .env
# add your Gemini key to .env
npm start
```
