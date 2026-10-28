const memory = [];

function addMemory(entry) {
  memory.push({
    ...entry,
    timestamp: new Date().toISOString()
  });
}

function getMemory() {
  return memory;
}

module.exports = { addMemory, getMemory };
