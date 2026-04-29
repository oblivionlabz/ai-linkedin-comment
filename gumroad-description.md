**Source code for a working Chrome extension that drafts thoughtful LinkedIn comments using your own AI key. MIT licensed. Fork, rebrand, resell.**

---

### What's in the zip

- Full Manifest V3 Chrome extension source — vanilla JS, no build step
- Three LLM providers wired: Anthropic (`claude-haiku-4-5`), OpenAI (`gpt-4o-mini`), Ollama (local, $0/draft)
- Five tone presets — Curious, Building-on, Disagreeing, Concise, Anecdote
- Options page, popup toggle, keyboard shortcut
- 12-page Setup Guide PDF — install, configure, fork, rebrand, ship to Chrome Web Store
- README with the 30-second install path
- LICENSE — MIT
- Total: ~600 lines of clean source code

---

### Why a senior dev built this

Most LinkedIn AI-comment extensions are cloud SaaS that pipe your post text + your private API key through their servers. That's two trust boundaries you don't need.

This one runs entirely in your browser. Your API key stays in `chrome.storage.local`. The post text goes directly from your browser to your chosen LLM provider. Zero middleman. Zero telemetry. Zero monthly subscription.

Source-code-as-product means you own the result. Modify the prompts. Change the icons. Add custom tones for your industry. Ship your fork to the Chrome Web Store under your own brand. The MIT license permits all of it.

---

### What it does NOT do

- Does NOT auto-post comments. The extension drafts into the textarea; you edit and click Send. ToS-clean by design.
- Does NOT scrape profiles, harvest contact info, or iterate connections.
- Does NOT phone home. No analytics. Verifiable in Chrome DevTools → Network tab.
- Does NOT bundle a build step. You can fork it without touching `npm install`.

---

### Who this is for

- **Indie devs** who want to save the $5-30/mo recurring cost of hosted alternatives
- **Founders building "AI-for-LinkedIn" products** who want a working starting point instead of a 2-week scaffold
- **Resellers** who want to rebrand and ship their own version on the Chrome Web Store

---

### Cost to run (after you buy)

- Anthropic: ~$0.0007 per draft (~$1 per 1,400 drafts)
- OpenAI GPT-4o-mini: ~$0.0003 per draft
- Ollama (local): $0/draft, $0/month, runs on your laptop

---

### Resell + license

MIT. You may fork, rebrand, redistribute, and charge for your version. Keep the MIT copyright notice in the source. You may NOT resell this exact unmodified zip as your own.

For a fully white-labeled commercial license without the MIT notice: <dan.vermillion@oblivionlabz.net>.

---

### Support policy

The source is sold as-is. Bug fixes and new features are pushed to the public GitHub repo at <https://github.com/oblivionlabz/ai-linkedin-comment> — buyers get every future update for free by re-cloning. Open an issue or PR if you find something.

The Setup Guide covers the most common DOM-update breakage path so you can patch the selectors yourself in 5 minutes when LinkedIn ships a redesign.

---

### What you get

- `ai-linkedin-comment-v1.0.0.zip` — full extension source, ready to load unpacked
- `SETUP_GUIDE.pdf` — 12-page deeper guide

One-time payment. Lifetime access via this Gumroad receipt. Free updates via GitHub.
