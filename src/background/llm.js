// Provider abstraction. Three backends, one interface.
// All calls are made directly from the service worker with the user's own
// credentials. Nothing transits a server we operate.

import { buildPrompt } from "../common/prompts.js";

const ANTHROPIC_MODEL = "claude-haiku-4-5";
const OPENAI_MODEL = "gpt-4o-mini";

export async function callLlm({ provider, key, endpoint, model, postText, tone, maxWords, signature }) {
  const { system, user } = buildPrompt({ postText, tone, maxWords, signature });
  if (provider === "anthropic") return callAnthropic({ key, system, user, maxWords });
  if (provider === "openai") return callOpenAI({ key, system, user, maxWords });
  if (provider === "ollama") return callOllama({ endpoint, model, system, user, maxWords });
  throw new Error(`unknown provider: ${provider}`);
}

async function callAnthropic({ key, system, user, maxWords }) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: ANTHROPIC_MODEL,
      max_tokens: Math.max(256, maxWords * 4),
      system,
      messages: [{ role: "user", content: user }],
    }),
  });
  if (!res.ok) throw new Error(`Anthropic ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data?.content?.[0]?.text?.trim() ?? "";
}

async function callOpenAI({ key, system, user, maxWords }) {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      max_tokens: Math.max(256, maxWords * 4),
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });
  if (!res.ok) throw new Error(`OpenAI ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data?.choices?.[0]?.message?.content?.trim() ?? "";
}

async function callOllama({ endpoint, model, system, user }) {
  const url = `${endpoint.replace(/\/+$/, "")}/api/chat`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      model: model || "qwen2.5:3b",
      stream: false,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });
  if (!res.ok) throw new Error(`Ollama ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data?.message?.content?.trim() ?? "";
}

export async function ping({ provider, key, endpoint, model }) {
  const probe = { postText: "Test.", tone: "concise", maxWords: 10 };
  if (provider === "anthropic") {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: ANTHROPIC_MODEL,
        max_tokens: 8,
        messages: [{ role: "user", content: "ok" }],
      }),
    });
    return r.ok;
  }
  if (provider === "openai") {
    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "content-type": "application/json" },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        max_tokens: 8,
        messages: [{ role: "user", content: "ok" }],
      }),
    });
    return r.ok;
  }
  if (provider === "ollama") {
    const url = `${endpoint.replace(/\/+$/, "")}/api/tags`;
    const r = await fetch(url);
    return r.ok;
  }
  return false;
}
