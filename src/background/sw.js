// Service worker: routes messages from content script + popup to llm.js.
// Stateless. No network calls except to the user's chosen LLM provider.

import { callLlm, ping } from "./llm.js";
import { loadConfig } from "../common/storage.js";

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  (async () => {
    try {
      if (msg?.type === "DRAFT") {
        const cfg = await loadConfig();
        if (!cfg.enabled) {
          sendResponse({ ok: false, error: "Extension is paused. Toggle in popup." });
          return;
        }
        const provider = cfg.provider;
        const key = provider === "anthropic" ? cfg.anthropicKey : cfg.openaiKey;
        if (provider !== "ollama" && !key) {
          sendResponse({ ok: false, error: `Set ${provider} API key in options.` });
          return;
        }
        const text = await callLlm({
          provider,
          key,
          endpoint: cfg.ollamaEndpoint,
          model: cfg.ollamaModel,
          postText: msg.postText,
          tone: msg.tone || cfg.defaultTone,
          maxWords: cfg.maxWords,
          signature: cfg.signature,
        });
        sendResponse({ ok: true, text });
        return;
      }
      if (msg?.type === "PING") {
        const cfg = await loadConfig();
        const ok = await ping({
          provider: cfg.provider,
          key: cfg.provider === "anthropic" ? cfg.anthropicKey : cfg.openaiKey,
          endpoint: cfg.ollamaEndpoint,
          model: cfg.ollamaModel,
        });
        sendResponse({ ok });
        return;
      }
      sendResponse({ ok: false, error: `unknown message type: ${msg?.type}` });
    } catch (err) {
      sendResponse({ ok: false, error: String(err.message || err) });
    }
  })();
  return true;
});

chrome.commands.onCommand.addListener(async (command) => {
  if (command !== "draft-comment") return;
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return;
  chrome.tabs.sendMessage(tab.id, { type: "TRIGGER_FOCUSED" });
});
