const { askGemini } = require("./ai");

async function retryWithImprovement(prompt, previousLogs = []) {
  let attempts = 0;
  let currentPrompt = prompt;

  while (attempts < 3) {
    const refinedPrompt = `
      Bu task üçün daha yaxşı, daha konkret və daha real plan yaz.
      Əvvəlki cavablar:
      ${previousLogs.map((log) => `${log.agent}: ${log.message}`).join("\n") || "Heç biri yoxdur"}

      Yeni task:
      "${currentPrompt}"
    `;

    const improved = await askGemini(refinedPrompt);

    if (improved && improved.length > 200) {
      return improved;
    }

    attempts += 1;
    currentPrompt = `${prompt}\n\nÖnceki nəticə zəif idi. Daha yaxşı və daha praktik versiya hazırla.`;
  }

  return "Yenidən sınaq düzgün nəticə vermədi. Əvvəlki stabil status bərpa edildi.";
}

module.exports = { retryWithImprovement };
