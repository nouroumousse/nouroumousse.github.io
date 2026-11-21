// Pages CMS-managed Recent Jams cards with independent pointer dragging.
(() => {
  const workspace = document.getElementById("recent-jams-workspace");
  if (!workspace) return;

  const text = value => String(value ?? "").trim();
  const safeUrl = value => {
    const url = text(value);
    try {
      const parsed = new URL(url, window.location.href);
      return ["http:", "https:"].includes(parsed.protocol) ? parsed.href : "";
    } catch { return ""; }
  };
  const makeCard = (item, index) => {
    const kind = ["book", "song", "movie"].includes(text(item.kind).toLowerCase())
      ? text(item.kind).toLowerCase() : "book";
    const card = document.createElement("article");
    card.className = "jam-card jam-card--" + kind;
    card.style.setProperty("--jam-tilt", ["-2.2deg", "1.8deg", "-1.2deg"][index % 3]);
    card.style.setProperty("--jam-delay", (-index * 1.15) + "s");

    const handle = document.createElement("div");
    handle.className = "jam-card-handle mono";
    handle.setAttribute("role", "button");
    handle.setAttribute("tabindex", "0");
    handle.setAttribute("aria-label", "Move " + kind + " card");
    handle.title = "Drag to move";
    const grip = document.createElement("span");
    grip.textContent = "↕ MOVE CARD";
    const type = document.createElement("span");
    type.textContent = kind.toUpperCase() + " / 0" + (index + 1);
    handle.append(grip, type);

    const visual = document.createElement("div");
    visual.className = "jam-card-visual";
    const imageUrl = safeUrl(item.image);
    if (imageUrl) {
      const image = document.createElement("img");
      image.src = imageUrl;
      image.alt = "";
      image.loading = "lazy";
      image.draggable = false;
      visual.append(image);
      card.classList.add("has-artwork");
    } else {
      const motif = document.createElement("span");
      motif.className = "jam-card-motif";
      motif.setAttribute("aria-hidden", "true");
      motif.textContent = kind === "book" ? "Aa" : kind === "song" ? "♫" : "▶";
      visual.append(motif);
    }
    const stamp = document.createElement("span");
    stamp.className = "jam-card-stamp mono";
    stamp.textContent = kind === "book" ? "THE READING LIST" : kind === "song" ? "NOW PLAYING" : "THE WATCHLIST";
    visual.append(stamp);

    const body = document.createElement("div");
    body.className = "jam-card-body";
    const eyebrow = document.createElement("p");
    eyebrow.className = "jam-card-kind mono";
    eyebrow.textContent = kind;
    const title = document.createElement("h3");
    title.textContent = text(item.title) || "Untitled";
    const creator = document.createElement("p");
    creator.className = "jam-card-creator";
    creator.textContent = text(item.creator);
    const detail = document.createElement("p");
    detail.className = "jam-card-detail";
    detail.textContent = text(item.detail);
    body.append(eyebrow, title);
    if (creator.textContent) body.append(creator);
    if (detail.textContent) body.append(detail);

    const footer = document.createElement("div");
    footer.className = "jam-card-footer mono";
    const year = document.createElement("span");
    year.textContent = text(item.year) || "A RECENT FIND";
    footer.append(year);
    const href = safeUrl(item.link);
    if (href) {
      const link = document.createElement("a");
      link.className = "jam-card-link";
      link.href = href;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = "OPEN ↗";
      footer.append(link);
    }
    card.append(handle, visual, body, footer);
    return card;
  };

  fetch("data/recent-jams.json", { cache: "no-store" })
    .then(response => {
      if (!response.ok) throw new Error("Recent Jams collection unavailable");
      return response.json();
    })
    .then(items => {
      if (!Array.isArray(items)) throw new Error("Invalid Recent Jams collection");
      const visible = items.filter(item => item && item.visible !== false)
        .sort((a, b) => (Number(a.order) || 999) - (Number(b.order) || 999))
        .slice(0, 3);
      if (!visible.length) {
        workspace.innerHTML = '<p class="recent-jams-empty mono">ADD YOUR BOOK, SONG AND MOVIE IN PAGES CMS.</p>';
        return;
      }
      workspace.replaceChildren(...visible.map(makeCard));
    })
    .catch(error => {
      console.warn("Recent Jams could not load:", error);
      workspace.innerHTML = '<p class="recent-jams-empty mono">RECENT JAMS COULD NOT BE LOADED RIGHT NOW.</p>';
    });

  // Drag from anywhere on a card. A small movement threshold preserves
  // normal clicks on the external link.
  let drag = null;
  let zIndex = 20;
  const DRAG_THRESHOLD = 5;

  const onDown = event => {
    const card = event.target.closest(".jam-card");
    if (!card || !workspace.contains(card) || (event.pointerType === "mouse" && event.button !== 0)) return;
    drag = {
      card,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: parseFloat(card.style.getPropertyValue("--jam-x")) || 0,
      originY: parseFloat(card.style.getPropertyValue("--jam-y")) || 0,
      active: false
    };
  };

  const onMove = event => {
    if (!drag || drag.pointerId !== event.pointerId) return;
    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;
    if (!drag.active && Math.hypot(dx, dy) < DRAG_THRESHOLD) return;

    if (!drag.active) {
      drag.active = true;
      drag.card.classList.add("is-dragging");
      drag.card.style.zIndex = String(++zIndex);
    }
    drag.card.style.setProperty("--jam-x", (drag.originX + dx) + "px");
    drag.card.style.setProperty("--jam-y", (drag.originY + dy) + "px");
    event.preventDefault();
  };

  const finishDrag = event => {
    if (!drag || (event.pointerId !== undefined && drag.pointerId !== event.pointerId)) return;
    const active = drag;
    drag = null;
    if (active.active) {
      active.card.classList.remove("is-dragging");
      // Prevent the click generated at the end of an actual drag, not a tap.
      active.card.addEventListener("click", e => {
        e.preventDefault();
        e.stopPropagation();
      }, { capture: true, once: true });
    }
  };

  workspace.addEventListener("pointerdown", onDown);
  window.addEventListener("pointermove", onMove, { passive: false });
  window.addEventListener("pointerup", finishDrag);
  window.addEventListener("pointercancel", finishDrag);

  workspace.addEventListener("keydown", event => {
    const handle = event.target.closest(".jam-card-handle");
    if (!handle || !["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) return;
    event.preventDefault();
    const card = handle.closest(".jam-card");
    const dx = event.key === "ArrowLeft" ? -16 : event.key === "ArrowRight" ? 16 : 0;
    const dy = event.key === "ArrowUp" ? -16 : event.key === "ArrowDown" ? 16 : 0;
    card.style.setProperty("--jam-x", ((parseFloat(card.style.getPropertyValue("--jam-x")) || 0) + dx) + "px");
    card.style.setProperty("--jam-y", ((parseFloat(card.style.getPropertyValue("--jam-y")) || 0) + dy) + "px");
  });

  workspace.addEventListener("dragstart", event => {
    if (event.target.closest(".jam-card")) event.preventDefault();
  });
})();
