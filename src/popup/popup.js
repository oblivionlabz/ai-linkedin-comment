function $(id) { return document.getElementById(id); }

async function load() {
  const cfg = await chrome.storage.local.get(["enabled", "defaultTone", "provider"]);
  $("enabled").checked = cfg.enabled !== false;
  $("enabledLabel").textContent = $("enabled").checked ? "Enabled" : "Paused";
  $("defaultTone").value = cfg.defaultTone || "curious";
  $("provider").textContent = (cfg.provider || "anthropic").toUpperCase();
}

$("enabled").addEventListener("change", async (e) => {
  await chrome.storage.local.set({ enabled: e.target.checked });
  $("enabledLabel").textContent = e.target.checked ? "Enabled" : "Paused";
});

$("defaultTone").addEventListener("change", async (e) => {
  await chrome.storage.local.set({ defaultTone: e.target.value });
});

$("open-options").addEventListener("click", () => {
  chrome.runtime.openOptionsPage();
});

$("test").addEventListener("click", async () => {
  $("status").textContent = "Testing…";
  const res = await chrome.runtime.sendMessage({ type: "PING" });
  $("status").textContent = res?.ok ? "Connection OK." : "Connection failed.";
});

load();
