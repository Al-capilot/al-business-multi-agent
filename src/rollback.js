function rollbackState(task) {
  return {
    status: "rolled-back",
    message: `Task "${task.prompt}" failed quality gate. Previous stable state restored.`,
    task
  };
}

module.exports = { rollbackState };
