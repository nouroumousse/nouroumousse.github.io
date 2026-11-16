// List Markdown articles published through Pages CMS.
(() => {
  const list = document.getElementById("blog-list");
  if (!list) return;

  const repository = "nouroumousse/nouroumousse.github.io";
  const apiUrl = `https://api.github.com/repos/${repository}/contents/docs?ref=main`;

  const cleanMarkdown = (markdown) => markdown
    .replace(/^\s*\`\`\`[\s\S]*?^\s*\`\`\`\s*$/gm, " ")
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/^\s{0,3}#{1,6}\s+/gm, "")
    .replace(/^\s*>\s?/gm, "")
    .replace(/<[^>]*>/g, " ")
    .replace(/[\*_~]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  const parseArticle = (file, markdown) => {
    const frontmatterMatch = markdown.match(/^---\s*\r?\n([\s\S]*?)\r?\n---\s*(?:\r?\n|$)/);
    const frontmatter = frontmatterMatch ? frontmatterMatch[1] : "";
    const body = frontmatterMatch
      ? markdown.slice(frontmatterMatch[0].length).trim()
      : markdown.trim();

    const titleMatch = frontmatter.match(/^title\s*:\s*(.*?)\s*$/m);
    const title = titleMatch
      ? titleMatch[1].replace(/^["']|["']$/g, "").trim()
      : file.name
          .replace(/\.md$/i, "")
          .replace(/^\d{4}-\d{2}-\d{2}-/, "")
          .replace(/[-_]/g, " ");

    const dateInFrontmatter = frontmatter.match(/^date\s*:\s*["']?(\d{4}-\d{2}-\d{2})/m);
    const dateInFilename = file.name.match(/^(\d{4}-\d{2}-\d{2})-/);
    const dateString = dateInFrontmatter?.[1] || dateInFilename?.[1] || "";
    let dateLabel = "Article";
    let timestamp = 0;

    if (dateString) {
      const parsedDate = new Date(dateString + "T00:00:00Z");
      if (!Number.isNaN(parsedDate.getTime())) {
        timestamp = parsedDate.getTime();
        dateLabel = new Intl.DateTimeFormat("en", {
          day: "numeric",
          month: "long",
          year: "numeric",
          timeZone: "UTC"
        }).format(parsedDate);
      }
    }

    return {
      title,
      excerpt: cleanMarkdown(body),
      dateLabel,
      timestamp,
      url: file.html_url
    };
  };

  const showMessage = (message) => {
    const state = document.createElement("p");
    state.className = "blog-state mono";
    state.textContent = message;
    list.replaceChildren(state);
    list.setAttribute("aria-busy", "false");
  };

  const makeArticleCard = (article, index) => {
    const card = document.createElement("article");
    card.className = "blog-entry";

    const content = document.createElement("div");
    content.className = "blog-entry-content";

    const meta = document.createElement("p");
    meta.className = "blog-entry-meta mono";
    meta.textContent = article.dateLabel;

    const heading = document.createElement("h3");
    heading.textContent = article.title;

    const excerpt = document.createElement("p");
    excerpt.className = "blog-entry-excerpt";
    excerpt.textContent = article.excerpt
      ? (article.excerpt.length > 220
          ? article.excerpt.slice(0, 217).trimEnd() + "…"
          : article.excerpt)
      : "Open the article to read more.";

    const link = document.createElement("a");
    link.className = "blog-entry-link mono";
    link.href = article.url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = "read article ↗";
    link.setAttribute("aria-label", "Read " + article.title + " on GitHub");

    content.append(meta, heading, excerpt);
    card.append(content, link);
    card.setAttribute("data-article-number", String(index + 1));
    return card;
  };

  const loadArticles = async () => {
    try {
      const response = await fetch(apiUrl, {
        headers: { Accept: "application/vnd.github+json" }
      });

      if (!response.ok) {
        throw new Error("GitHub returned " + response.status);
      }

      const files = await response.json();
      const markdownFiles = files.filter(file =>
        file.type === "file" && file.name.toLowerCase().endsWith(".md")
      );

      if (markdownFiles.length === 0) {
        showMessage("No articles have been published yet.");
        return;
      }

      const articles = await Promise.all(markdownFiles.map(async file => {
        const response = await fetch(file.download_url);
        if (!response.ok) {
          throw new Error("Could not read " + file.name);
        }
        return parseArticle(file, await response.text());
      }));

      articles.sort((a, b) => b.timestamp - a.timestamp);
      list.replaceChildren(...articles.map(makeArticleCard));
      list.setAttribute("aria-busy", "false");
    } catch (error) {
      console.error("Unable to load Pages CMS articles:", error);
      showMessage("Articles could not be loaded right now. Please try again shortly.");
    }
  };

  loadArticles();
})();
