(() => {
  const root = document.getElementById("hero-project-preview");
  const nextButton = document.getElementById("hero-next-card");
  if (!root || !nextButton) return;

  const safe = value => {
    const url = String(value || "").trim();
    return /^https?:\/\//i.test(url) || /^\/(media|assets)\//i.test(url) ? url : "";
  };
  const makeHeader = (label, number) => {
    const header = document.createElement("div");
    header.className = "project-drag-handle mono";
    header.append(document.createTextNode("↕ "));
    const move = document.createElement("span");
    move.textContent = "MOVE CARD";
    const count = document.createElement("span");
    count.textContent = label + " / " + String(number).padStart(2, "0");
    header.append(move, count);
    return header;
  };
  const makeBase = (label, number, tilt) => {
    const card = document.createElement("article");
    card.className = "floating-project hero-rotating-card";
    card.style.setProperty("--tilt", tilt + "deg");
    card.style.setProperty("--float-delay", "-1.2s");
    card.style.setProperty("--card-width", "340px");
    card.append(makeHeader(label, number));
    return card;
  };
  const makeProject = (item, number) => {
    const card = makeBase("PROJECT", number, -3);
    const image = document.createElement("img");
    image.className = "floating-project-image";
    image.src = safe(item.image);
    image.alt = item.title || "";
    image.draggable = false;
    image.decoding = "async";
    const info = document.createElement("div");
    info.className = "floating-project-info";
    const category = document.createElement("p");
    category.className = "mono";
    category.textContent = item.category || "PROJECT";
    const title = document.createElement("h3");
    title.textContent = item.title || "Untitled project";
    const bottom = document.createElement("div");
    bottom.className = "floating-project-bottom";
    const year = document.createElement("span");
    year.className = "mono";
    year.textContent = item.year || "";
    bottom.append(year);
    const href = safe(item.link);
    if (href) {
      const link = document.createElement("a");
      link.className = "floating-open mono";
      link.href = href;
      link.target = "_blank";
      link.rel = "noopener";
      link.textContent = "open ↗";
      bottom.append(link);
    }
    info.append(category, title, bottom);
    card.append(image, info);
    return card;
  };
  const makeJam = (item, number) => {
    const kind = String(item.kind || "book").toUpperCase();
    const card = makeBase(kind, number, 2);
    card.classList.add("hero-jam-card", "jam-card--" + kind.toLowerCase());
    const visual = document.createElement("div");
    visual.className = "jam-card-visual hero-jam-visual";
    if (safe(item.image)) {
      const image = document.createElement("img");
      image.src = safe(item.image);
      image.alt = "";
      image.draggable = false;
      image.decoding = "async";
      visual.append(image);
      card.classList.add("has-artwork");
    } else {
      const motif = document.createElement("span");
      motif.className = "jam-card-motif";
      motif.textContent = kind === "SONG" ? "♫" : kind === "MOVIE" ? "▶" : "Aa";
      visual.append(motif);
    }
    const stamp = document.createElement("span");
    stamp.className = "jam-card-stamp mono";
    stamp.textContent = kind === "BOOK" ? "THE READING LIST" : kind === "SONG" ? "NOW PLAYING" : "THE WATCHLIST";
    visual.append(stamp);

    const body = document.createElement("div");
    body.className = "jam-card-body";
    const eyebrow = document.createElement("p");
    eyebrow.className = "jam-card-kind mono";
    eyebrow.textContent = kind.toLowerCase();
    const title = document.createElement("h3");
    title.textContent = item.title || "Untitled";
    body.append(eyebrow, title);
    if (item.creator) {
      const creator = document.createElement("p");
      creator.className = "jam-card-creator";
      creator.textContent = item.creator;
      body.append(creator);
    }
    if (item.detail) {
      const detail = document.createElement("p");
      detail.className = "jam-card-detail";
      detail.textContent = item.detail;
      body.append(detail);
    }

    const footer = document.createElement("div");
    footer.className = "jam-card-footer mono";
    const year = document.createElement("span");
    year.textContent = item.year || "A RECENT FIND";
    footer.append(year);
    if (safe(item.link)) {
      const link = document.createElement("a");
      link.className = "jam-card-link";
      link.href = safe(item.link);
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = "OPEN ↗";
      footer.append(link);
    }
    card.append(visual, body, footer);
    return card;
  };

  const makeBookmark = (item, number) => {
    const card = makeBase("BOOKMARK", number, -2);
    card.classList.add("hero-bookmark-card");
    const copy = document.createElement("div");
    copy.className = "hero-bookmark-copy";
    const eyebrow = document.createElement("p");
    eyebrow.className = "bookmark-featured-eyebrow mono";
    eyebrow.textContent = "CURRENTLY SAVED";
    const heading = document.createElement("h3");
    heading.textContent = item.title || "Untitled bookmark";
    const date = document.createElement("p");
    date.className = "hero-bookmark-date mono";
    if (item.date) {
      const parsed = new Date(item.date + "T00:00:00Z");
      date.textContent = Number.isNaN(parsed.getTime()) ? "" : new Intl.DateTimeFormat("en", {
        day:"numeric", month:"short", year:"numeric", timeZone:"UTC"
      }).format(parsed);
    }
    const tags = document.createElement("div");
    tags.className = "hero-bookmark-tags";
    (Array.isArray(item.tags) ? item.tags : []).forEach(tag => {
      const chip = document.createElement("span");
      chip.className = "bookmark-tag";
      chip.textContent = String(tag);
      tags.append(chip);
    });
    copy.append(eyebrow, heading, date);
    if (tags.childElementCount) copy.append(tags);
    const footer = document.createElement("div");
    footer.className = "hero-bookmark-footer";
    const label = document.createElement("span");
    label.className = "mono";
    label.textContent = "A FIND WORTH KEEPING";
    footer.append(label);
    if (safe(item.url)) {
      const link = document.createElement("a");
      link.className = "floating-open mono";
      link.href = safe(item.url);
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = "visit website ↗";
      footer.append(link);
    }
    card.append(copy, footer);
    if (safe(item.image)) {
      const image = document.createElement("img");
      image.className = "hero-bookmark-image";
      image.src = safe(item.image);
      image.alt = "";
      image.draggable = false;
      image.decoding = "async";
      card.append(image);
    }
    return card;
  };
  const makeQuote = number => {
    const card = makeBase("FIELD NOTES", number, -2);
    card.classList.add("hero-quote-rotating");
    const paper = document.createElement("div");
    paper.className = "blog-quote-paper";
    const kicker = document.createElement("span");
    kicker.className = "blog-quote-kicker mono";
    kicker.textContent = "A NOTE TO SELF";
    const quote = document.createElement("blockquote");
    quote.textContent = "“Strive to know, don't settle for beliefs.”";
    const footer = document.createElement("div");
    footer.className = "blog-quote-footer mono";
    const left = document.createElement("span");
    left.textContent = "QUESTION · LEARN · UNDERSTAND";
    const right = document.createElement("span");
    right.textContent = "NO. 001";
    footer.append(left, right);
    paper.append(kicker, quote, footer);
    card.append(paper);
    return card;
  };

  let cards = [];
  let current = 0;
  let loadGeneration = 0;
  const render = index => {
    if (!cards.length) return;
    current = (index + cards.length) % cards.length;
    const card = cards[current];
    card.style.setProperty("--drag-x", "0px");
    card.style.setProperty("--drag-y", "0px");
    card.style.zIndex = "10";
    root.replaceChildren(card);
    nextButton.disabled = cards.length < 2;
    nextButton.setAttribute("aria-label", "Show next featured card (" + (current + 1) + " of " + cards.length + ")");
  };
  nextButton.addEventListener("click", () => render(current + 1));

  Promise.all([
    fetch("data/projects.json", { cache: "no-store" }).then(r => r.ok ? r.json() : []),
    fetch("data/recent-jams.json", { cache: "no-store" }).then(r => r.ok ? r.json() : []),
    fetch("data/bookmarks.json", { cache: "no-store" }).then(r => r.ok ? r.json() : [])
  ]).then(([projects, jams, bookmarks]) => {
    const projectCards = (Array.isArray(projects) ? projects : [])
      .filter(x => x && x.visible !== false && x.title && safe(x.image))
      .sort((a,b) => (Number(a.order)||0) - (Number(b.order)||0))
      .map((item,i) => makeProject(item,i+1));
    const jamCards = (Array.isArray(jams) ? jams : [])
      .filter(x => x && x.visible !== false && x.title)
      .sort((a,b) => (Number(a.order)||999) - (Number(b.order)||999))
      .map((item,i) => makeJam(item, i+1));
    const featuredBookmark = (Array.isArray(bookmarks) ? bookmarks : [])
      .find(item => item && item.visible !== false && item.featured === true);
    const bookmarkCards = featuredBookmark ? [makeBookmark(featuredBookmark, 1)] : [];
    cards = [...projectCards, ...jamCards, ...bookmarkCards, makeQuote(1)];
    if (cards.length) render(0);
  }).catch(error => console.warn("Hero card collection could not load:", error));

  let drag = null, z = 10;
  const read = (card, name) => parseFloat(getComputedStyle(card).getPropertyValue(name)) || 0;
  root.addEventListener("pointerdown", event => {
    if ((event.button !== undefined && event.button !== 0) || event.target.closest("a,button")) return;
    const card = event.target.closest(".floating-project");
    if (!card) return;
    drag = { card, id:event.pointerId, x:event.clientX, y:event.clientY,
      ox:read(card,"--drag-x"), oy:read(card,"--drag-y"), moved:false };
    card.classList.add("is-dragging");
    card.style.zIndex = String(++z);
    try { root.setPointerCapture(event.pointerId); } catch (_) {}
    event.preventDefault();
  });
  root.addEventListener("pointermove", event => {
    if (!drag || drag.id !== event.pointerId) return;
    const dx=event.clientX-drag.x, dy=event.clientY-drag.y;
    if (Math.abs(dx)+Math.abs(dy)>3) drag.moved=true;
    drag.card.style.setProperty("--drag-x",(drag.ox+dx)+"px");
    drag.card.style.setProperty("--drag-y",(drag.oy+dy)+"px");
  });
  const finish = event => {
    if (!drag || drag.id !== event.pointerId) return;
    const {card,moved}=drag; drag=null; card.classList.remove("is-dragging");
    if(moved){card.dataset.justDragged="true";window.setTimeout(()=>delete card.dataset.justDragged,180);}
    try{if(root.hasPointerCapture(event.pointerId))root.releasePointerCapture(event.pointerId);}catch(_){}
  };
  ["pointerup","pointercancel","lostpointercapture"].forEach(name=>root.addEventListener(name,finish));
  root.addEventListener("click",event=>{
    const card=event.target.closest(".floating-project");
    if(card&&card.dataset.justDragged==="true"&&!event.target.closest("a,button")){event.preventDefault();event.stopPropagation();}
  });
  root.addEventListener("dragstart",event=>{if(event.target.closest(".floating-project"))event.preventDefault();});
})();
