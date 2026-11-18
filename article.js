// Render a Pages CMS Markdown article inside the portfolio design.
(() => {
  const state = document.getElementById("article-state");
  const panel = document.getElementById("article-panel");
  const titleElement = document.getElementById("article-title");
  const dateElement = document.getElementById("article-date");
  const contentElement = document.getElementById("article-content");

  const repository = "nouroumousse/nouroumousse.github.io";
  const params = new URLSearchParams(window.location.search);
  const filename = params.get("file") || "";
  const tick = String.fromCharCode(96);

  const showError = (message) => {
    state.textContent = message;
    state.hidden = false;
  };

  const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;"
  })[character]);

  const safeUrl = (value) => {
    const url = String(value || "").trim().replace(/^<|>$/g, "");
    if (/^(https?:|mailto:)/i.test(url)) return url;
    if (/^(\/|\.\/|\.\.\/|media\/)/i.test(url) && !/^\/\//.test(url)) return url;
    return "";
  };

  const inlineMarkdown = (source) => {
    const tokens = [];
    const hold = (html) => {
      const marker = "\u0000" + tokens.length + "\u0000";
      tokens.push(html);
      return marker;
    };

    let text = String(source);
    const codeSpan = new RegExp(tick + "([^" + tick + "]+)" + tick, "g");
    text = text.replace(codeSpan, (_, code) =>
      hold("<code>" + escapeHtml(code) + "</code>")
    );

    text = text.replace(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g, (_, alt, rawUrl) => {
      const url = safeUrl(rawUrl);
      if (!url) return escapeHtml(alt);
      return hold('<img src="' + escapeHtml(url) + '" alt="' + escapeHtml(alt) + '" loading="lazy">');
    });

    text = text.replace(/\[([^\]]+)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g, (_, label, rawUrl) => {
      const url = safeUrl(rawUrl);
      if (!url) return escapeHtml(label);
      const external = /^https?:/i.test(url);
      const target = external ? ' target="_blank" rel="noopener noreferrer"' : "";
      return hold('<a href="' + escapeHtml(url) + '"' + target + ">" + escapeHtml(label) + "</a>");
    });

    text = escapeHtml(text);
    text = text.replace(/\*\*(.+?)\*\*|__(.+?)__/g, "<strong>$1$2</strong>");
    text = text.replace(/\*(.+?)\*|_(.+?)_/g, "<em>$1$2</em>");
    text = text.replace(/\u0000(\d+)\u0000/g, (_, index) => tokens[Number(index)] || "");
    return text;
  };

  const renderBlocks = (markdown) => {
    const lines = String(markdown).replace(/\r/g, "").split("\n");
    const output = [];
    let index = 0;
    const fencePattern = new RegExp("^ {0,3}(" + tick + "{3,}|~{3,})");

    const isBlockStart = (line) =>
      /^ {0,3}(#{1,6}\s|>\s?|\s*[-*+]\s+|\s*\d+\.\s+|---+\s*$|\*\*\*+\s*$)/.test(line) ||
      fencePattern.test(line);

    while (index < lines.length) {
      const line = lines[index];

      if (!line.trim()) {
        index += 1;
        continue;
      }

      const fence = line.match(fencePattern);
      if (fence) {
        const marker = fence[1][0];
        index += 1;
        const codeLines = [];
        const closeFence = new RegExp("^ {0,3}" + marker + "{3,}");
        while (index < lines.length && !closeFence.test(lines[index])) {
          codeLines.push(lines[index]);
          index += 1;
        }
        if (index < lines.length) index += 1;
        output.push("<pre><code>" + escapeHtml(codeLines.join("\n")) + "</code></pre>");
        continue;
      }

      const heading = line.match(/^ {0,3}(#{1,6})\s+(.*)$/);
      if (heading) {
        const level = heading[1].length;
        output.push("<h" + level + ">" + inlineMarkdown(heading[2]) + "</h" + level + ">");
        index += 1;
        continue;
      }

      if (/^\s*(---+|\*\*\*+|___+)\s*$/.test(line)) {
        output.push("<hr>");
        index += 1;
        continue;
      }

      if (/^ {0,3}>\s?/.test(line)) {
        const quoteLines = [];
        while (index < lines.length && /^ {0,3}>\s?/.test(lines[index])) {
          quoteLines.push(lines[index].replace(/^ {0,3}>\s?/, ""));
          index += 1;
        }
        output.push("<blockquote>" + renderBlocks(quoteLines.join("\n")) + "</blockquote>");
        continue;
      }

      const unordered = line.match(/^ {0,3}[-*+]\s+(.*)$/);
      const ordered = line.match(/^ {0,3}\d+\.\s+(.*)$/);
      if (unordered || ordered) {
        const isOrdered = Boolean(ordered);
        const items = [];
        while (index < lines.length) {
          const item = lines[index].match(isOrdered
            ? /^ {0,3}\d+\.\s+(.*)$/
            : /^ {0,3}[-*+]\s+(.*)$/);
          if (!item) break;
          items.push("<li>" + inlineMarkdown(item[1]) + "</li>");
          index += 1;
        }
        const tag = isOrdered ? "ol" : "ul";
        output.push("<" + tag + ">" + items.join("") + "</" + tag + ">");
        continue;
      }

      const paragraph = [];
      while (index < lines.length && lines[index].trim() &&
        (paragraph.length === 0 || !isBlockStart(lines[index]))) {
        paragraph.push(lines[index].trim());
        index += 1;
      }
      if (paragraph.length) {
        output.push("<p>" + inlineMarkdown(paragraph.join(" ")) + "</p>");
      } else {
        index += 1;
      }
    }

    return output.join("\n");
  };

  const parseFrontmatter = (markdown) => {
    const match = markdown.match(/^---\s*\r?\n([\s\S]*?)\r?\n---\s*(?:\r?\n|$)/);
    const metadata = match ? match[1] : "";
    const body = match ? markdown.slice(match[0].length).trim() : markdown.trim();
    const titleMatch = metadata.match(/^title\s*:\s*(.*?)\s*$/m);
    const dateMatch = metadata.match(/^date\s*:\s*["']?(\d{4}-\d{2}-\d{2})/m);
    const filenameDate = filename.match(/^(\d{4}-\d{2}-\d{2})-/);
    const dateString = dateMatch?.[1] || filenameDate?.[1] || "";
    let dateLabel = "";

    if (dateString) {
      const date = new Date(dateString + "T00:00:00Z");
      if (!Number.isNaN(date.getTime())) {
        dateLabel = new Intl.DateTimeFormat("en", {
          day: "numeric",
          month: "long",
          year: "numeric",
          timeZone: "UTC"
        }).format(date);
      }
    }

    const title = titleMatch
      ? titleMatch[1].replace(/^["']|["']$/g, "").trim()
      : filename.replace(/\.md$/i, "").replace(/^\d{4}-\d{2}-\d{2}-/, "").replace(/[-_]/g, " ");

    return { title, dateLabel, body };
  };

  const loadArticle = async () => {
    if (!/^[a-zA-Z0-9][a-zA-Z0-9._-]*\.md$/i.test(filename) || filename.includes("..")) {
      showError("This article link is invalid. Please return to the Blog.");
      return;
    }

    try {
      // Read the published Markdown directly from GitHub Pages' raw content host.
      // This avoids the GitHub Contents API rate limit and its base64 response format.
      const rawUrl = "https://raw.githubusercontent.com/" + repository +
        "/main/docs/" + encodeURIComponent(filename);
      const response = await fetch(rawUrl, { cache: "no-store" });
      if (!response.ok) throw new Error("Article file returned " + response.status);

      const markdown = await response.text();
      if (!markdown.trim()) throw new Error("The article file is empty.");
      const article = parseFrontmatter(markdown);

      titleElement.textContent = article.title;
      document.title = article.title + " — Nour Oumousse";

      const plainDescription = article.body
        .replace(/!\\[([^\\]]*)\\]\\([^)]*\\)/g, "$1")
        .replace(/\\[([^\\]]+)\\]\\([^)]*\\)/g, "$1")
        .replace(/^\\s{0,3}#{1,6}\\s+/gm, "")
        .replace(/[>*_~`#]/g, " ")
        .replace(/<[^>]*>/g, " ")
        .replace(/\\s+/g, " ")
        .trim()
        .slice(0, 155);
      const description = plainDescription || "An article by Nour Oumousse.";
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
      dateElement.textContent = article.dateLabel;
      dateElement.hidden = !article.dateLabel;
      contentElement.innerHTML = renderBlocks(article.body);

      state.hidden = true;
      panel.hidden = false;
    } catch (error) {
      console.error("Unable to load article:", error);
      showError("This article could not be loaded right now. Please return to the Blog and try again.");
    }
  };

  loadArticle();
})();
