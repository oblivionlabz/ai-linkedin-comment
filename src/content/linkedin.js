// Content script. Injects a "Draft AI" button next to LinkedIn comment
// composers on feed posts and individual post pages. Click → reads the
// post body text → asks the service worker for a draft → inserts it into
// the comment textarea. Never auto-posts.
//
// Selectors target the public LinkedIn DOM as of 2025-Q4 / 2026-Q2.
// LinkedIn rebuilds frequently; if the button stops appearing, see
// SETUP_GUIDE.md → "DOM update breakage" for the 5-line patch path.

(() => {
  const BUTTON_CLASS = "ai-linkedin-comment-btn";
  const POST_SELECTORS = [
    "div.feed-shared-update-v2",
    "div.scaffold-finite-scroll__content article",
    "main article",
  ];
  const COMMENT_BOX_SELECTOR = "div[role=textbox][contenteditable=true]";
  const POST_TEXT_SELECTORS = [
    ".feed-shared-update-v2__description-wrapper .break-words",
    ".update-components-text",
    "div.feed-shared-text",
  ];

  let warned = false;

  function findPostContainer(commentBox) {
    let cur = commentBox;
    for (let i = 0; i < 12 && cur; i++) {
      for (const sel of POST_SELECTORS) {
        if (cur.matches?.(sel)) return cur;
      }
      cur = cur.parentElement;
    }
    return null;
  }

  function getPostText(postEl) {
    for (const sel of POST_TEXT_SELECTORS) {
      const el = postEl.querySelector(sel);
      if (el) {
        const t = el.innerText?.trim();
        if (t && t.length > 4) return t.slice(0, 4000);
      }
    }
    // Last resort: grab the whole article's visible text minus boilerplate.
    const t = postEl.innerText?.trim() || "";
    return t.slice(0, 4000);
  }

  function buildButton() {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = BUTTON_CLASS;
    btn.textContent = "Draft AI";
    btn.title = "Draft an AI comment for this post (edit before sending)";
    btn.setAttribute("aria-label", "Draft AI comment");
    return btn;
  }

  function insertText(box, text) {
    box.focus();
    // LinkedIn uses contentEditable. Use input event for compat with their
    // listener. execCommand('insertText') is deprecated but still the most
    // reliable cross-version path here.
    const ok = document.execCommand?.("insertText", false, text);
    if (!ok) {
      box.textContent = (box.textContent || "") + text;
      box.dispatchEvent(new InputEvent("input", { bubbles: true }));
    }
  }

  async function draft(commentBox, btn) {
    const original = btn.textContent;
    btn.disabled = true;
    btn.textContent = "Drafting…";
    try {
      const postEl = findPostContainer(commentBox);
      const postText = postEl ? getPostText(postEl) : "";
      if (!postText) throw new Error("Could not read post text. Scroll the post fully into view and try again.");
      const res = await chrome.runtime.sendMessage({ type: "DRAFT", postText });
      if (!res?.ok) throw new Error(res?.error || "draft failed");
      insertText(commentBox, res.text);
    } catch (err) {
      console.warn("[ai-linkedin-comment]", err);
      btn.textContent = "Error — see options";
      setTimeout(() => { btn.textContent = original; btn.disabled = false; }, 2500);
      return;
    }
    btn.textContent = "Drafted";
    setTimeout(() => { btn.textContent = original; btn.disabled = false; }, 1200);
  }

  function attach(commentBox) {
    if (commentBox.dataset.aiDrafterAttached === "1") return;
    commentBox.dataset.aiDrafterAttached = "1";
    const btn = buildButton();
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      draft(commentBox, btn);
    });
    // Insert right after the comment box.
    commentBox.parentElement?.appendChild(btn);
  }

  function scan(root) {
    let found = 0;
    root.querySelectorAll(COMMENT_BOX_SELECTOR).forEach((box) => {
      attach(box);
      found++;
    });
    if (found === 0 && !warned && location.hostname.endsWith("linkedin.com")) {
      // Only fires on a fresh page after a render cycle. If we still see
      // zero comment boxes, the selector likely needs an update.
      warned = true;
      setTimeout(() => {
        if (!document.querySelector(`.${BUTTON_CLASS}`)) {
          console.info(
            "[ai-linkedin-comment] no comment composer detected on this page. " +
            "If this is a feed or post page, the LinkedIn DOM may have changed. " +
            "See SETUP_GUIDE.md → DOM update breakage."
          );
        }
      }, 5000);
    }
  }

  scan(document);
  const obs = new MutationObserver((muts) => {
    for (const m of muts) {
      m.addedNodes?.forEach?.((n) => {
        if (n.nodeType === 1) scan(n);
      });
    }
  });
  obs.observe(document.body, { childList: true, subtree: true });

  chrome.runtime.onMessage.addListener((msg) => {
    if (msg?.type === "TRIGGER_FOCUSED") {
      const focused = document.activeElement;
      if (focused?.matches?.(COMMENT_BOX_SELECTOR)) {
        const btn = focused.parentElement?.querySelector(`.${BUTTON_CLASS}`);
        btn?.click();
      }
    }
  });
})();
