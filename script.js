document.addEventListener("DOMContentLoaded", () => {
  const taskInput = document.getElementById("taskInput");
  const runBtn = document.getElementById("runBtn");
  const selfHealBtn = document.getElementById("selfHealBtn");
  const logPanel = document.getElementById("logPanel");

  const appendLog = (agent, message) => {
    const item = document.createElement("div");
    item.className = "log-item";
    item.textContent = `${agent}: ${message}`;
    logPanel.prepend(item);
  };

  const runWorkflow = async (endpoint = "/api/run-workflow") => {
    const prompt = taskInput.value.trim();
    if (!prompt) return;

    logPanel.innerHTML = "";
    appendLog("SYSTEM", "Task agent orkestrasına göndərildi.");

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Workflow failed");
      }

      if (data.logs) {
        data.logs.forEach((entry) => {
          appendLog(entry.agent, entry.message);
        });
      }

      if (data.score) {
        appendLog("SYSTEM", `Status: ${data.status || "unknown"} | Score: ${data.score}`);
      } else {
        appendLog("SYSTEM", `Status: ${data.status || "completed"}`);
      }

      if (data.rollback) {
        appendLog("ROLLBACK", data.rollback.message);
      }
      if (data.improved) {
        appendLog("IMPROVEMENT", data.improved);
      }
      if (data.patch) {
        appendLog("PATCH", `Patch created at: ${data.patch}`);
      }
    } catch (error) {
      appendLog("ERROR", error.message);
    }
  };

  if (runBtn) {
    runBtn.addEventListener("click", () => runWorkflow("/api/run-workflow"));
  }

  if (selfHealBtn) {
    selfHealBtn.addEventListener("click", () => runWorkflow("/api/run-workflow"));
  }
});
