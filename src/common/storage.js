// Thin wrappers over chrome.storage.local. Everything is local-only;
// nothing is ever sent to a server we operate.

const DEFAULTS = {
  provider: "anthropic",
  anthropicKey: "",
  openaiKey: "",
  ollamaEndpoint: "http://localhost:11434",
  ollamaModel: "qwen2.5:3b",
  defaultTone: "curious",
  maxWords: 80,
  signature: "",
  enabled: true,
};

export async function loadConfig() {
  const stored = await chrome.storage.local.get(Object.keys(DEFAULTS));
  return { ...DEFAULTS, ...stored };
}

export async function saveConfig(patch) {
  await chrome.storage.local.set(patch);
}

export async function getKey(provider) {
  const cfg = await loadConfig();
  if (provider === "anthropic") return cfg.anthropicKey;
  if (provider === "openai") return cfg.openaiKey;
  return null;
}
