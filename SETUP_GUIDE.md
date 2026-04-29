---
title: AI Comment Drafter for LinkedIn — Setup Guide
author: OblivionLabz
date: 2026-04-28
---

# Setup Guide

A deeper companion to the README. Read this if you're setting up beyond the 30-second install, or if you bought this pack to fork and resell it.

---

## 1. Install — Load Unpacked

The extension ships as source. There is no published Chrome Web Store listing for the unmodified version. You install it as an unpacked extension during development, and ship your own forked version to the Web Store if you want a polished distribution path.

**Steps:**

1. Unzip the source pack into a folder you control. Suggested path: `~/projects/ai-linkedin-comment/`.
2. In Chrome, visit `chrome://extensions`.
3. Toggle **Developer mode** to ON (top-right of the page).
4. Click **Load unpacked** and select the folder containing `manifest.json`.
5. Confirm the extension card appears with a black "AI" icon and the name "AI Comment Drafter for LinkedIn."

If you change source files, click the reload icon on the extension card to pick up changes.

---

## 2. Configure Anthropic

Anthropic is the recommended provider for production drafting. Best quality-to-cost ratio at the time of writing.

1. Sign in at <https://console.anthropic.com>.
2. Visit **Settings → API Keys**, click **Create Key**, name it (e.g. `linkedin-drafter`), copy.
3. In the extension, click the icon → **Options**.
4. Under **Provider**, click **Anthropic**.
5. Paste the key (starts with `sk-ant-...`) into **Anthropic API key**.
6. Click **Test connection**. You want **Connection OK**.
7. Click **Save**.

Cost notes:
- Default model: `claude-haiku-4-5`. Roughly 200 input tokens + 120 output tokens per draft.
- At Anthropic Haiku pricing (subject to change), expect ~$0.0007 per draft, or roughly **$1 per 1,400 drafts**. Your mileage will vary.

If you want a different Claude model, edit the constant `ANTHROPIC_MODEL` in `src/background/llm.js`.

---

## 3. Configure OpenAI

1. Sign in at <https://platform.openai.com>.
2. Visit **API keys**, create a new key, copy.
3. Options page → **OpenAI** → paste key (starts with `sk-...`).
4. Test → Save.

Default model: `gpt-4o-mini`. Edit `OPENAI_MODEL` in `src/background/llm.js` to upgrade.

Cost notes: GPT-4o-mini lands at roughly **$0.0003 per draft**. Cheaper than Anthropic Haiku per call, slightly worse at the "concise" and "anecdote" tones in our testing.

---

## 4. Configure Ollama

Ollama runs models on your own machine. Zero per-call cost. Slower first-token than the cloud APIs but plenty fast for comment drafting once the model is warm.

### macOS

```bash
brew install ollama
ollama serve &       # or run as a background service via launchd
ollama pull qwen2.5:3b
```

### Linux

```bash
curl -fsSL https://ollama.com/install.sh | sh
ollama pull qwen2.5:3b
# Ollama installs as a systemd unit on most distros. Verify:
systemctl status ollama
```

### Windows + WSL

Native Windows installer: <https://ollama.com/download/windows>. Or use WSL2 + the Linux instructions above.

If running in WSL, Chrome on Windows won't see `localhost:11434` by default. Add a Windows host-side port forward:

```powershell
netsh interface portproxy add v4tov4 listenport=11434 listenaddress=127.0.0.1 connectport=11434 connectaddress=$(wsl hostname -I)
```

### Configure in the extension

1. Options page → **Ollama (local)**.
2. **Endpoint** stays `http://localhost:11434`.
3. **Model**: `qwen2.5:3b` is a good default. Other strong picks: `llama3.2:3b` (similar size, different style), `qwen2.5:7b` (better quality, ~2x slower on commodity laptops).
4. Test → Save.

If the test fails, run `curl http://localhost:11434/api/tags` from your terminal. If that fails, Ollama isn't reachable from your browser.

---

## 5. Tone Presets — When to Use Which

Each tone is a system prompt that shapes the draft. Pick based on the *post you're commenting on* and the *signal you want to send*.

- **Curious** — best on data/research/announcement posts. The implicit value: you read carefully and have a follow-up question. Highest reply rate from authors.
- **Building-on** — best on opinion or playbook posts. You're saying "yes, and here's the next layer." Builds your reputation as a peer.
- **Disagreeing** — best when you genuinely disagree and have a specific counter. Higher engagement than agreement, but only when the counter is concrete. Use sparingly.
- **Concise** — best for high-volume drive-by commenting where you need to be authentic but fast.
- **Anecdote** — best on emotional or values-driven posts. The personal story signals authenticity. Caveat: the model invents the anecdote, so always edit it to fit your actual life before sending.

**Rule of thumb:** the LLM gives you the structure. You bring the truth. Edit every draft.

---

## 6. Keyboard Shortcuts

Default: `Ctrl+Shift+L` (Windows/Linux) / `Cmd+Shift+L` (Mac) drafts a comment for the focused comment box.

Rebind:
1. Open `chrome://extensions/shortcuts`.
2. Find **AI Comment Drafter for LinkedIn → Draft an AI comment**.
3. Click the input, press your preferred chord.

If the shortcut conflicts with another extension, Chrome will warn you on save.

---

## 7. Forking + Rebranding (the value-add for resellers)

This is why most buyers pick up this pack: they want their own LinkedIn-comment extension under their brand. The MIT license permits this in full.

**Minimal rebrand checklist:**

1. **`manifest.json`**
   - `name` — your brand
   - `description` — your positioning
   - `commands.draft-comment.suggested_key` — change shortcut if you want
2. **Icons** — replace `icons/icon-{16,48,128}.png` with your brand. Keep PNG, keep the size names. Use ImageMagick:
   ```bash
   magick -size 128x128 xc:'#YOURBG' -fill '#YOURFG' \
     -font 'YourFont' -pointsize 42 -gravity center -annotate +0+0 'AI' \
     icons/icon-128.png
   ```
3. **`README.md`** — replace OblivionLabz / Dan Vermillion / dan.vermillion@oblivionlabz.net with your equivalents.
4. **`LICENSE`** — keep the MIT notice; you can ADD your own copyright line below ours.
5. **`src/content/styles.css`** — change the button background to your brand color.
6. **`src/options/options.html`** — change `--accent` and `--bg` CSS variables to your palette.
7. **`src/popup/popup.html`** — same — palette tokens at the top.
8. **Optional:** add a custom tone preset specific to your audience. Edit `src/common/prompts.js`.

**Bigger rebrand opportunities** (worth more, take longer):
- Industry-specific tone library (e.g., "VC-style", "founder-letter", "scientific-paper-tone")
- Add streaming token-by-token rendering (UX upgrade)
- Add CRM hooks — "log this comment + post URL to my Notion / Airtable / Sheets"
- Add a free-tier rate limit + paid tier auth via ExtensionPay

---

## 8. Submitting Your Fork to Chrome Web Store

You will need a Chrome Web Store developer account ($5 one-time fee).

1. Visit <https://chrome.google.com/webstore/devconsole>. Pay the $5 fee if you haven't.
2. Click **New Item** → upload a zip of your forked extension.
3. Fill in:
   - **Description** — what your fork does, who it's for, BYOK note
   - **Screenshots** — 4-5 screenshots at 1280x800. Use a real LinkedIn post (not a competitor's) plus your options page.
   - **Promotional images** — 440x280 small tile, 920x680 large tile, 1400x560 marquee
   - **Category** — Productivity
   - **Single Purpose Description** — required as of MV3. Sample: *"Drafts AI-generated LinkedIn comments for the user to review and send."*
   - **Permission justifications** — explain why you need `storage` (saving config), `activeTab` (reading post text on click), and the linkedin host permission.
4. **Privacy practices** disclosure — declare that you handle "Authentication info" (the API key) and "Personal communications" (the post text) and that you "do NOT sell or transfer to third parties." This is true if you ship the unmodified BYOK design.
5. Submit. Review takes 1-7 days for a first listing. Be patient.

**Common rejection reasons + fixes:**

- *"Excessive permissions"* — make sure you only request `storage`, `activeTab`, and the LinkedIn host permission. Remove anything else.
- *"Single purpose violation"* — keep the README description focused. Don't pitch it as a multi-tool.
- *"Misleading description"* — be honest about what it does. The "drafts only, never auto-posts" framing is what gets approved.

---

## 9. Pricing Your Fork

You paid for this source. Here's what we learned figuring out what the market pays.

**Three viable pricing models for an extension fork:**

1. **Free + open source** on Web Store, monetize via Sponsorware or "buy me a coffee" links — slow, low-revenue, builds following.
2. **Freemium** — free tier with daily draft limit (~5/day), paid tier ($5-9/mo) for unlimited via ExtensionPay or Stripe. Standard SaaS-on-a-browser-extension play. Realistic ceiling: $200-2,000/mo at modest reach.
3. **Source pack on Gumroad/Lemon Squeezy** — like the pack you bought. $19-49 one-time. Lower ceiling than freemium but **autonomous** — no support burden, no payment processing, no churn analysis.

**Pricing anchors at the time of writing (verify yourself):**

| Product | Model | Price |
|---|---|---|
| MagicReply | Web Store freemium | $5/mo Pro |
| Engage AI | Freemium + team plans | $9.99/mo solo, $24/mo team |
| Helper-AI (the inspiration for this pack) | Gumroad source code | $29 lifetime |
| ChatGPT Writer | Freemium | $5/mo |

If you go freemium, **price below Engage AI but above MagicReply**. If you sell source, **$19-49 is the working range**, with $29 the median based on Gumroad analytics.

---

## 10. Common DOM Update Breakage + How to Fix It

LinkedIn rebuilds its DOM regularly. When the **Draft AI** button stops appearing on posts, here's the fix path.

**Step 1.** Open Chrome DevTools on `linkedin.com`.

**Step 2.** Find a comment textarea by clicking inside one. In the DOM panel, identify the element. As of 2026-Q2 it's:

```html
<div role="textbox" contenteditable="true" ...>
```

If LinkedIn changed this, edit `COMMENT_BOX_SELECTOR` in `src/content/linkedin.js`:

```js
const COMMENT_BOX_SELECTOR = "div[role=textbox][contenteditable=true]";
```

**Step 3.** Find the post container. Walk up the DOM tree from the comment box until you hit a parent that wraps the entire post. Look for class names like `feed-shared-update-v2` or `update-components-text`. Update `POST_SELECTORS` accordingly.

**Step 4.** Find the post text. The visible post body is usually inside a child of the post container with a class like `update-components-text` or `feed-shared-text`. Update `POST_TEXT_SELECTORS`.

**Step 5.** Reload the unpacked extension and verify on a feed page.

The selectors are intentionally a small array of fallbacks so a single LinkedIn rename doesn't break the whole extension — multiple options will still match.

---

## 11. Privacy + LinkedIn ToS Notes

- **No auto-posting.** The extension only writes into the textarea. You always click Send manually. This is the central design decision that keeps the extension on the right side of LinkedIn's ToS.
- **No profile scraping.** The extension reads only the visible post text on the page you're already viewing. It does NOT iterate connections, scrape profile data, or harvest contact info.
- **No data leaves the browser** beyond what your chosen LLM provider receives — and that's only when you click Draft AI.
- **No telemetry.** The extension makes zero network calls except to your chosen LLM provider. Verify by opening Chrome DevTools → Network tab.

LinkedIn's ToS forbid automated posting and bulk profile scraping. This extension does neither. It is the AI equivalent of using Grammarly inside a comment box: a writing assistant the user controls.

---

## 12. License + Redistribution Rules

The full license is MIT. See `LICENSE` in the source pack.

**You may:**
- Modify the source however you want
- Rebrand and redistribute under your own name
- Charge for your distribution (free, freemium, paid)
- Submit your fork to the Chrome Web Store
- Bundle the source with other products you sell

**You may NOT:**
- Resell this exact unmodified zip on Gumroad/Lemon Squeezy as your own work (i.e., don't be a parasite — ship a real fork)
- Remove the MIT copyright notice from the source files

**Commercial relicensing** (e.g., you want to ship this as part of a closed-source enterprise SaaS without the MIT notice): contact <dan.vermillion@oblivionlabz.net>.

---

*End of Setup Guide. Questions: open a GitHub issue at <https://github.com/oblivionlabz/ai-linkedin-comment/issues>.*
