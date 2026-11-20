// Pages CMS stores bookmarks in data/bookmarks.json. This static JSON avoids
// GitHub API rate limits and is published atomically with the site.
(() => {
  const list = document.getElementById("bookmark-list");
  if (!list) return;

  const searchInput = document.getElementById("bookmark-search");
  const categoriesEl = document.getElementById("bookmark-categories");
  const countEl = document.getElementById("bookmark-count");
  const featuredEl = document.getElementById("bookmark-featured");
  let bookmarks = [];
  let activeTag = "";

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
  const tagColors = new Map();
  const buildTagColors = () => {
    tagColors.clear();
    const tags = [...new Set(bookmarks.flatMap(item => Array.isArray(item.tags) ? item.tags.map(tag => String(tag).trim()).filter(Boolean) : []))]
      .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
    const usedHues = [];
    tags.forEach(tag => {
      let hash = 2166136261;
      for (const char of tag.toLowerCase()) {
        hash ^= char.charCodeAt(0);
        hash = Math.imul(hash, 16777619);
      }
      let hue = (hash >>> 0) % 360;
      // Resolve hue collisions against all tags in the current collection.
      while (usedHues.some(existing => Math.abs(existing - hue) < 13 || 360 - Math.abs(existing - hue) < 13)) {
        hue = (hue + 23) % 360;
      }
      usedHues.push(hue);
      tagColors.set(tag.toLowerCase(), hue);
    });
  };
  const applyTagColor = (element, tag) => {
    const hue = tagColors.get(String(tag).toLowerCase()) ?? 72;
    element.style.setProperty("--bookmark-tag-hue", String(hue));
  };
  const makeTag = (tag, active = false) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "bookmark-tag" + (active ? " is-active" : "");
    applyTagColor(button, tag);
    button.textContent = tag;
    button.setAttribute("aria-pressed", String(active));
    button.addEventListener("click", () => {
      activeTag = activeTag === tag ? "" : tag;
      renderFilters();
      render();
    });
    return button;
  };
  const makeCard = (bookmark, index) => {
    const card = document.createElement("article");
    card.className = "bookmark-entry";
    const number = document.createElement("span");
    number.className = "bookmark-number mono";
    number.textContent = String(index + 1).padStart(2, "0");
    const content = document.createElement("div");
    content.className = "bookmark-entry-content";
    const meta = document.createElement("p");
    meta.className = "bookmark-meta mono";
    meta.textContent = formatDate(bookmark.date);
    const heading = document.createElement("h3");
    heading.textContent = bookmark.title || "Untitled bookmark";
    const destination = safeExternalUrl(bookmark.url);
    content.append(meta, heading);
    const tagRow = document.createElement("div");
    tagRow.className = "bookmark-entry-tags";
    (Array.isArray(bookmark.tags) ? bookmark.tags : []).forEach(tag => tagRow.append(makeTag(String(tag), activeTag === tag)));
    if (tagRow.childElementCount) content.append(tagRow);
    card.append(number, content);
    const imageUrl = safeImageUrl(bookmark.image);
    if (imageUrl) {
      const image = document.createElement("img");
      image.className = "bookmark-image";
      image.src = imageUrl;
      image.alt = "";
      image.loading = "lazy";
      image.decoding = "async";
      card.append(image);
    }
    if (destination) {
      const open = document.createElement("a");
      open.className = "bookmark-open mono";
      open.href = destination;
      open.target = "_blank";
      open.rel = "noopener noreferrer";
      open.textContent = "Visit website ↗";
      open.setAttribute("aria-label", "Visit " + (bookmark.title || "bookmark"));
      card.append(open);
    }
    return card;
  };
  const renderFeatured = () => {
    featuredEl.replaceChildren();
    const featured = bookmarks.find(item => item.featured === true);
    if (!featured) return;
    const destination = safeExternalUrl(featured.url);
    const panel = document.createElement("article");
    panel.className = "bookmark-featured-card";

    const topbar = document.createElement("div");
    topbar.className = "bookmark-featured-topbar bookmark-drag-handle mono";
    topbar.title = "Click and drag to move";
    topbar.setAttribute("aria-label", "Drag featured bookmark card to move");
    const topLabel = document.createElement("span");
    topLabel.textContent = "↕  MOVE CARD";
    const topIndex = document.createElement("span");
    topIndex.textContent = "FEATURED / 01";
    topbar.append(topLabel, topIndex);

    const copy = document.createElement("div");
    copy.className = "bookmark-featured-copy";
    const eyebrow = document.createElement("p");
    eyebrow.className = "bookmark-featured-eyebrow mono";
    eyebrow.textContent = "CURRENTLY SAVED";
    const heading = document.createElement("h2");
    heading.textContent = featured.title || "Untitled bookmark";
    const meta = document.createElement("p");
    meta.className = "bookmark-featured-date mono";
    meta.textContent = formatDate(featured.date);
    const tags = document.createElement("div");
    tags.className = "bookmark-entry-tags";
    (Array.isArray(featured.tags) ? featured.tags : []).forEach(tag => tags.append(makeTag(String(tag), activeTag === tag)));
    copy.append(eyebrow, heading, meta);
    if (tags.childElementCount) copy.append(tags);

    const footer = document.createElement("div");
    footer.className = "bookmark-featured-footer";
    const footerLabel = document.createElement("span");
    footerLabel.className = "mono";
    footerLabel.textContent = "A FIND WORTH KEEPING";
    footer.append(footerLabel);
    if (destination) {
      const open = document.createElement("a");
      open.className = "bookmark-open btn btn-primary mono";
      open.href = destination;
      open.target = "_blank";
      open.rel = "noopener noreferrer";
      open.textContent = "visit website ↗";
      footer.append(open);
    }
    const imageUrl = safeImageUrl(featured.image);
    if (imageUrl) {
      const image = document.createElement("img");
      image.className = "bookmark-featured-image";
      image.src = imageUrl;
      image.alt = "";
      image.loading = "eager";
      image.decoding = "async";
      panel.append(image);
    }
    panel.append(topbar, copy, footer);
    featuredEl.append(panel);
  };
  const render = () => {
    const query = (searchInput.value || "").trim().toLowerCase();
    const filtered = bookmarks.filter(item => {
      const tags = Array.isArray(item.tags) ? item.tags : [];
      const tagMatch = !activeTag || tags.some(tag => String(tag).toLowerCase() === activeTag.toLowerCase());
      return tagMatch && [item.title, ...tags].join(" ").toLowerCase().includes(query);
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
    const tags = [...new Set(bookmarks.flatMap(item => Array.isArray(item.tags) ? item.tags.map(String) : []))]
      .sort((a,b) => a.localeCompare(b));
    categoriesEl.replaceChildren();
    const all = document.createElement("button");
    all.type = "button";
    all.className = "bookmark-filter" + (!activeTag ? " is-active" : "");
    all.textContent = "All";
    all.setAttribute("aria-pressed", String(!activeTag));
    all.addEventListener("click", () => { activeTag = ""; renderFilters(); render(); });
    categoriesEl.append(all);
    tags.forEach(tag => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "bookmark-filter" + (activeTag === tag ? " is-active" : "");
      applyTagColor(button, tag);
      button.textContent = tag;
      button.setAttribute("aria-pressed", String(activeTag === tag));
      button.addEventListener("click", () => { activeTag = activeTag === tag ? "" : tag; renderFilters(); render(); });
      categoriesEl.append(button);
    });
  };
  const showError = () => {
    list.replaceChildren();
    const message = document.createElement("p");
    message.className = "bookmark-state mono";
    message.textContent = "Bookmarks could not be loaded right now. Please try again shortly.";
    list.append(message);
    countEl.textContent = "Collection unavailable";
    list.setAttribute("aria-busy", "false");
  };

  // Homepage-style pointer dragging for the featured bookmark card.
  let drag = null;
  let dragZ = 10;
  const cssNumber = (element, property) => parseFloat(getComputedStyle(element).getPropertyValue(property)) || 0;
  featuredEl.addEventListener("pointerdown", event => {
    if ((event.button !== undefined && event.button !== 0) || event.target.closest("a, button")) return;
    const card = event.target.closest(".bookmark-featured-card");
    if (!card) return;
    drag = { card, pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, originX: cssNumber(card, "--drag-x"), originY: cssNumber(card, "--drag-y"), moved: false };
    card.classList.add("is-dragging");
    card.style.zIndex = String(++dragZ);
    try { featuredEl.setPointerCapture(event.pointerId); } catch (_) {}
    event.preventDefault();
  });
  featuredEl.addEventListener("pointermove", event => {
    if (!drag || drag.pointerId !== event.pointerId) return;
    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;
    if (Math.abs(dx) + Math.abs(dy) > 3) drag.moved = true;
    drag.card.style.setProperty("--drag-x", (drag.originX + dx) + "px");
    drag.card.style.setProperty("--drag-y", (drag.originY + dy) + "px");
  });
  const finishDrag = event => {
    if (!drag || drag.pointerId !== event.pointerId) return;
    const card = drag.card;
    const moved = drag.moved;
    drag = null;
    card.classList.remove("is-dragging");
    if (moved) { card.dataset.justDragged = "true"; setTimeout(() => delete card.dataset.justDragged, 180); }
    try { if (featuredEl.hasPointerCapture(event.pointerId)) featuredEl.releasePointerCapture(event.pointerId); } catch (_) {}
  };
  ["pointerup", "pointercancel", "lostpointercapture"].forEach(name => featuredEl.addEventListener(name, finishDrag));
  featuredEl.addEventListener("click", event => {
    const card = event.target.closest(".bookmark-featured-card");
    if (card && card.dataset.justDragged === "true" && !event.target.closest("a, button")) { event.preventDefault(); event.stopPropagation(); }
  });
  featuredEl.addEventListener("dragstart", event => { if (event.target.closest(".bookmark-featured-card")) event.preventDefault(); });

  searchInput.addEventListener("input", render);
  (async () => {
    try {
      const response = await fetch("data/bookmarks.json?v=20261120-2", { cache: "no-store" });
      if (!response.ok) throw new Error("Could not load bookmarks.json (" + response.status + ")");
      const data = await response.json();
      if (!Array.isArray(data)) throw new Error("Bookmarks data must be a JSON array");
      // Pages CMS keeps collection entries in submission order (new entries are appended).
      // Reverse that order so the most recently submitted bookmark is always first,
      // even when several entries share the same saved date.
      bookmarks = data.filter(item => item && item.visible !== false && safeExternalUrl(item.url)).reverse();
      buildTagColors();
      renderFeatured();
      renderFilters();
      render();
      list.setAttribute("aria-busy", "false");
    } catch (error) {
      console.error("Unable to load bookmarks:", error);
      showError();
    }
  })();
})();
