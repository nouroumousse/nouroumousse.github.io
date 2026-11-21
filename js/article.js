// Render a public Substack post inside the portfolio's native article reader.
(() => {
  const state = document.getElementById("article-state");
  const panel = document.getElementById("article-panel");
  const titleElement = document.getElementById("article-title");
  const dateElement = document.getElementById("article-date");
  const publicationElement = document.getElementById("article-publication");
  const contentElement = document.getElementById("article-content");
  const copyLinkButton = document.getElementById("copy-article-link");
  const copyLinkStatus = document.getElementById("copy-article-status");
  const postId = new URLSearchParams(window.location.search).get("id") || "";

  const showError = (message) => {
    state.textContent = message;
    state.hidden = false;
  };

  const copyArticleLink = async () => {
    const shareUrl = window.location.href.split("#")[0];
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const field = document.createElement("textarea");
        field.value = shareUrl;
        field.setAttribute("readonly", "");
        field.style.position = "absolute";
        field.style.left = "-9999px";
        document.body.appendChild(field);
        field.select();
        const copied = document.execCommand("copy");
        field.remove();
        if (!copied) throw new Error("Copy command unavailable");
      }
      copyLinkStatus.textContent = "link copied ✓";
      copyLinkButton.textContent = "copied ✓";
    } catch (error) {
      console.error("Unable to copy article link:", error);
      copyLinkStatus.textContent = "Copy failed — select the page URL to share.";
    }
  };

  copyLinkButton?.addEventListener("click", copyArticleLink);

  // RSS content is remote input. Keep only presentation tags and safe attributes.
  const sanitizeArticleHtml = (source) => {
    const parsed = new DOMParser().parseFromString(String(source || ""), "text/html");
    const allowed = new Set([
      "P","BR","HR","H1","H2","H3","H4","H5","H6","STRONG","B","EM","I",
      "U","S","DEL","BLOCKQUOTE","UL","OL","LI","A","IMG","FIGURE","FIGCAPTION",
      "PRE","CODE","SUB","SUP","TABLE","THEAD","TBODY","TR","TH","TD","DIV","SPAN"
    ]);

    const cleanNode = (node) => {
      [...node.childNodes].forEach(child => {
        if (child.nodeType === Node.COMMENT_NODE) {
          child.remove();
          return;
        }
        if (child.nodeType !== Node.ELEMENT_NODE) return;
        const tag = child.tagName;
        if (!allowed.has(tag)) {
          if (["SCRIPT","STYLE","IFRAME","OBJECT","EMBED","FORM","INPUT","BUTTON","VIDEO","AUDIO"].includes(tag)) {
            child.remove();
          } else {
            child.replaceWith(...child.childNodes);
          }
          return;
        }

        [...child.attributes].forEach(attribute => {
          const name = attribute.name.toLowerCase();
          const value = attribute.value.trim();
          if (name.startsWith("on") || name === "style" || name === "srcset" ||
              !["href","src","alt","title","width","height","colspan","rowspan","class"].includes(name)) {
            child.removeAttribute(attribute.name);
          }
          if ((name === "href" || name === "src") &&
              !/^(https?:|mailto:)/i.test(value)) {
            child.removeAttribute(attribute.name);
          }
        });

        if (tag === "A") {
          child.setAttribute("target", "_blank");
          child.setAttribute("rel", "noopener noreferrer");
        }
        if (tag === "IMG") {
          child.setAttribute("loading", "lazy");
          child.setAttribute("referrerpolicy", "no-referrer");
        }
        cleanNode(child);
      });
    };

    cleanNode(parsed.body);
    return parsed.body.innerHTML;
  };

  const loadArticle = async () => {
    if (!postId || postId.length > 180) {
      showError("This article link is invalid. Please return to the Blog.");
      return;
    }

    try {
      const response = await fetch("data/substack-posts.json", { cache: "no-store" });
      if (!response.ok) throw new Error("Article index returned " + response.status);
      const data = await response.json();
      const post = (data.posts || []).find(item => item.id === postId);
      if (!post) throw new Error("Article not found in the current public feed.");

      titleElement.textContent = post.title;
      document.title = post.title + " — Nour Oumousse";
      dateElement.textContent = post.published
        ? new Intl.DateTimeFormat("en", { day: "numeric", month: "long", year: "numeric" }).format(new Date(post.published))
        : "Article";
      publicationElement.textContent = "FROM " + String(post.publication || "SUBSTACK").toUpperCase();
      contentElement.innerHTML = sanitizeArticleHtml(post.contentHtml);

      const description = (post.summary || "An article by Nour Oumousse.").slice(0, 155);
      const canonicalUrl = window.location.href.split("#")[0];
      const canonical = document.querySelector('link[rel="canonical"]');
      if (canonical) canonical.href = canonicalUrl;
      const ogUrl = document.querySelector('meta[property="og:url"]');
      if (ogUrl) ogUrl.content = canonicalUrl;
      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) ogTitle.content = document.title;
      const twitterTitle = document.querySelector('meta[name="twitter:title"]');
      if (twitterTitle) twitterTitle.content = document.title;
      const descriptionMeta = document.querySelector('meta[name="description"]');
      if (descriptionMeta) descriptionMeta.content = description;
      const ogDescription = document.querySelector('meta[property="og:description"]');
      if (ogDescription) ogDescription.content = description;
      const twitterDescription = document.querySelector('meta[name="twitter:description"]');
      if (twitterDescription) twitterDescription.content = description;

      const original = document.createElement("a");
      original.href = post.url;
      original.target = "_blank";
      original.rel = "noopener noreferrer";
      original.className = "article-original-link mono";
      original.textContent = "view original on " + post.publication + " ↗";
      contentElement.append(original);

      state.hidden = true;
      panel.hidden = false;
    } catch (error) {
      console.error("Unable to load Substack article:", error);
      showError("This article could not be loaded. It may have been removed from its publication. Please return to the Blog.");
    }
  };

  loadArticle();
})();
