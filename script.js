document.addEventListener("DOMContentLoaded", () => {
  const taskInput = document.getElementById("taskInput");
  const runBtn = document.getElementById("runBtn");
  const logPanel = document.getElementById("logPanel");

  const appendLog = (agent, message) => {
    const item = document.createElement("div");
    item.className = "log-item";
    item.textContent = `${agent}: ${message}`;
    logPanel.prepend(item);
  };

  runBtn.addEventListener("click", async () => {
    const prompt = taskInput.value.trim();
    if (!prompt) return;

    logPanel.innerHTML = "";
    appendLog("SYSTEM", "Task agent orkestrasına göndərildi.");

    try {
      const response = await fetch("/api/run-workflow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Workflow failed");
      }

      data.logs.forEach((entry) => {
        appendLog(entry.agent, entry.message);
      });

      appendLog("SYSTEM", "İş tamamlandı.");
    } catch (error) {
      appendLog("ERROR", error.message);
    }
  });
});
