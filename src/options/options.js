const FIELDS = ["provider", "anthropicKey", "openaiKey", "ollamaEndpoint", "ollamaModel", "defaultTone", "maxWords", "signature"];

function $(id) { return document.getElementById(id); }

function showProvider(p) {
  $("anthropic-fields").hidden = p !== "anthropic";
  $("openai-fields").hidden = p !== "openai";
  $("ollama-fields").hidden = p !== "ollama";
}

function statusMsg(text, kind) {
  const el = $("status");
  el.textContent = text;
  el.className = "status " + (kind || "");
}

async function load() {
  const cfg = await chrome.storage.local.get(FIELDS);
  $("anthropicKey").value = cfg.anthropicKey || "";
  $("openaiKey").value = cfg.openaiKey || "";
  $("ollamaEndpoint").value = cfg.ollamaEndpoint || "http://localhost:11434";
  $("ollamaModel").value = cfg.ollamaModel || "qwen2.5:3b";
  $("defaultTone").value = cfg.defaultTone || "curious";
  $("maxWords").value = cfg.maxWords || 80;
  $("maxWordsLabel").textContent = cfg.maxWords || 80;
  $("signature").value = cfg.signature || "";

  const provider = cfg.provider || "anthropic";
  document.querySelectorAll('input[name=provider]').forEach((r) => { r.checked = (r.value === provider); });
  showProvider(provider);
}

async function save() {
  const provider = document.querySelector('input[name=provider]:checked')?.value || "anthropic";
  const patch = {
    provider,
    anthropicKey: $("anthropicKey").value.trim(),
    openaiKey: $("openaiKey").value.trim(),
    ollamaEndpoint: $("ollamaEndpoint").value.trim() || "http://localhost:11434",
    ollamaModel: $("ollamaModel").value.trim() || "qwen2.5:3b",
    defaultTone: $("defaultTone").value,
    maxWords: parseInt($("maxWords").value, 10) || 80,
    signature: $("signature").value.trim(),
  };
  await chrome.storage.local.set(patch);
  statusMsg("Saved.", "ok");
}

async function test() {
  await save();
  statusMsg("Testing…");
  const res = await chrome.runtime.sendMessage({ type: "PING" });
  if (res?.ok) statusMsg("Connection OK.", "ok");
  else statusMsg("Connection failed. Check key/endpoint.", "err");
}

document.querySelectorAll('input[name=provider]').forEach((r) => {
  r.addEventListener("change", (e) => showProvider(e.target.value));
});
$("maxWords").addEventListener("input", (e) => { $("maxWordsLabel").textContent = e.target.value; });
$("save").addEventListener("click", save);
$("test").addEventListener("click", test);

load();
