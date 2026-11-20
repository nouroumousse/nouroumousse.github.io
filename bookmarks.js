// Pages CMS-managed bookmarks. Each visible Markdown entry in /bookmarks becomes a bookmark.
(() => {
  const list = document.getElementById("bookmark-list");
  if (!list) return;

  const repository = "nouroumousse/nouroumousse.github.io";
  const apiUrl = `https://api.github.com/repos/${repository}/contents/bookmarks?ref=main`;
  const searchInput = document.getElementById("bookmark-search");
  const categoriesEl = document.getElementById("bookmark-categories");
  const tagsEl = document.getElementById("bookmark-tags");
  const countEl = document.getElementById("bookmark-count");

  let bookmarks = [];
  let activeTag = "";

  const unquote = value => value.replace(/^["']|["']$/g, "").trim();
  const parseEntry = (file, markdown) => {
    const match = markdown.match(/^---\s*\r?\n([\s\S]*?)\r?\n---\s*(?:\r?\n|$)/);
    const frontmatter = match ? match[1] : "";
    const read = key => {
      const field = frontmatter.match(new RegExp("^" + key + "\\s*:\\s*(.*?)\\s*$", "m"));
      return field ? unquote(field[1]) : "";
    };
    const readList = key => {
      const field = frontmatter.match(new RegExp("^" + key + "\\s*:\\s*\\r?\\n((?:[ \\t]+-.*(?:\\r?\\n|$))*)", "m"));
      if (!field) return [];
      return [...field[1].matchAll(/^\s+-\s*(.*?)\s*$/gm)].map(item => unquote(item[1])).filter(Boolean);
    };
    const date = read("date") || file.name.match(/\d{4}-\d{2}-\d{2}/)?.[0] || "";
    const timestamp = date ? new Date(date + "T00:00:00Z").getTime() : 0;
    return {
      title: read("title") || file.name.replace(/\.md$/i, "").replace(/[-_]/g, " "),
      url: read("url"),
      tags: [...new Set([...readList("tags"), ...(read("category") ? [read("category")] : [])])],
      date,
      timestamp: Number.isNaN(timestamp) ? 0 : timestamp,
      image: read("image"),
      featured: read("featured").toLowerCase() === "true",
      visible: read("visible").toLowerCase() !== "false"
    };
  };

  const safeExternalUrl = value => {
    try {
      const url = new URL(value);
      return ["http:", "https:"].includes(url.protocol) ? url.href : "";
    } catch { return ""; }
  };
  const safeImageUrl = value => {
    if (!value) return "";
    if (/^https:\/\//i.test(value)) return value;
    if (/^(?:\/?media\/)[\w .()@+-]+\.(?:avif|gif|jpe?g|png|svg|webp)$/i.test(value)) {
      return value.startsWith("/") ? value : "/" + value;
    }
    return "";
  };
  const formatDate = value => {
    if (!value) return "";
    const parsed = new Date(value + "T00:00:00Z");
    return Number.isNaN(parsed.getTime()) ? "" : new Intl.DateTimeFormat("en", {
      day: "numeric", month: "short", year: "numeric", timeZone: "UTC"
    }).format(parsed);
  };
  const makeTag = (tag, active = false) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "bookmark-tag" + (active ? " is-active" : "");
    button.textContent = tag;
    button.setAttribute("aria-pressed", String(active));
    button.addEventListener("click", () => {
      activeTag = activeTag === tag ? "" : tag;
      render();
    });
    return button;
  };
  const makeCard = (bookmark, index) => {
    const card = document.createElement("article");
    card.className = "bookmark-entry" + (bookmark.featured ? " is-featured" : "");
    const number = document.createElement("span");
    number.className = "bookmark-number mono";
    number.textContent = String(index + 1).padStart(2, "0");
    const content = document.createElement("div");
    content.className = "bookmark-entry-content";
    const meta = document.createElement("p");
    meta.className = "bookmark-meta mono";
    meta.textContent = [formatDate(bookmark.date), bookmark.featured ? "FEATURED" : ""].filter(Boolean).join("  /  ");
    const heading = document.createElement("h3");
    const link = document.createElement("a");
    const destination = safeExternalUrl(bookmark.url);
    heading.textContent = bookmark.title;
    if (destination) {
      link.href = destination;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.append(heading);
    } else {
      heading.classList.add("bookmark-invalid-link");
      link.append(heading);
      link.removeAttribute("href");
    }
    const tagRow = document.createElement("div");
    tagRow.className = "bookmark-entry-tags";
    bookmark.tags.forEach(tag => tagRow.append(makeTag(tag, activeTag === tag)));
    content.append(meta, link);
    if (bookmark.tags.length) content.append(tagRow);
    const imageUrl = safeImageUrl(bookmark.image);
    let previewImage = null;
    if (imageUrl) {
      const image = document.createElement("img");
      image.className = "bookmark-image";
      image.src = imageUrl;
      image.alt = "";
      image.loading = "lazy";
      image.decoding = "async";
      previewImage = image;
    }
    card.append(number, content);
    if (previewImage) card.append(previewImage);
    if (destination) {
      const open = document.createElement("a");
      open.className = "bookmark-open mono";
      open.href = destination;
      open.target = "_blank";
      open.rel = "noopener noreferrer";
      open.textContent = "VISIT ↗";
      open.setAttribute("aria-label", "Visit " + bookmark.title);
      card.append(open);
    }
    return card;
  };

  const render = () => {
    const query = (searchInput.value || "").trim().toLowerCase();
    const filtered = bookmarks.filter(item => {
      const tagMatch = !activeTag || item.tags.some(tag => tag.toLowerCase() === activeTag.toLowerCase());
      const searchable = [item.title, ...item.tags].join(" ").toLowerCase();
      return tagMatch && searchable.includes(query);
    });
    countEl.textContent = filtered.length + (filtered.length === 1 ? " bookmark" : " bookmarks");
    list.replaceChildren();
    if (!filtered.length) {
      const empty = document.createElement("p");
      empty.className = "bookmark-state mono";
      empty.textContent = bookmarks.length ? "No bookmarks match those filters." : "No bookmarks have been added yet.";
      list.append(empty);
      return;
    }
    filtered.forEach((item, index) => list.append(makeCard(item, index)));
  };

  const renderFilters = () => {
    const categories = [...new Set(bookmarks.flatMap(item => item.tags))].sort((a,b) => a.localeCompare(b));
    categoriesEl.replaceChildren();
    const all = document.createElement("button");
    all.type = "button";
    all.className = "bookmark-filter" + (!activeTag ? " is-active" : "");
    all.dataset.category = "all";
    all.textContent = "All";
    all.setAttribute("aria-pressed", String(!activeTag));
    all.addEventListener("click", () => { activeTag = ""; renderFilters(); render(); });
    categoriesEl.append(all);
    categories.forEach(category => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "bookmark-filter" + (activeTag === category ? " is-active" : "");
      button.dataset.category = category;
      button.textContent = category;
      button.setAttribute("aria-pressed", String(activeTag === category));
      button.addEventListener("click", () => { activeTag = activeTag === category ? "" : category; renderFilters(); render(); });
      categoriesEl.append(button);
    });
    tagsEl.replaceChildren();
  };

  searchInput.addEventListener("input", render);
  const showError = () => {
    list.replaceChildren();
    const message = document.createElement("p");
    message.className = "bookmark-state mono";
    message.textContent = "Bookmarks could not be loaded right now. Please try again shortly.";
    list.append(message);
    countEl.textContent = "Collection unavailable";
    list.setAttribute("aria-busy", "false");
  };

  (async () => {
    try {
      const response = await fetch(apiUrl, { headers: { Accept: "application/vnd.github+json" } });
      if (!response.ok) throw new Error("GitHub returned " + response.status);
      const files = await response.json();
      const markdownFiles = files.filter(file => file.type === "file" && file.name.toLowerCase().endsWith(".md"));
      const entries = await Promise.all(markdownFiles.map(async file => {
        const response = await fetch(file.download_url);
        if (!response.ok) throw new Error("Could not read " + file.name);
        return parseEntry(file, await response.text());
      }));
      bookmarks = entries.filter(item => item.visible && safeExternalUrl(item.url))
        .sort((a,b) => Number(b.featured) - Number(a.featured) || b.timestamp - a.timestamp || a.title.localeCompare(b.title));
      renderFilters();
      render();
      list.setAttribute("aria-busy", "false");
    } catch (error) {
      console.error("Unable to load Pages CMS bookmarks:", error);
      showError();
    }
  })();
})();
