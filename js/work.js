(() => {
  const workspace = document.getElementById("floating-workspace");
  if (!workspace) return;

  let topZ = 10;
  let activeDrag = null;

  const readOffset = (card, name) => {
    const value = getComputedStyle(card).getPropertyValue(name).trim();
    return Number.parseFloat(value) || 0;
  };

  workspace.addEventListener("pointerdown", (event) => {
    if (event.button !== undefined && event.button !== 0) return;
    if (event.target.closest("a, button")) return;

    const card = event.target.closest(".floating-project");
    if (!card || !workspace.contains(card)) return;

    activeDrag = {
      card,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: readOffset(card, "--drag-x"),
      originY: readOffset(card, "--drag-y"),
      moved: false
    };

    card.classList.add("is-dragging");
    card.style.zIndex = String(++topZ);
    try { workspace.setPointerCapture(event.pointerId); } catch (_) {}
    event.preventDefault();
  });

  workspace.addEventListener("pointermove", (event) => {
    if (!activeDrag || activeDrag.pointerId !== event.pointerId) return;
    const { card, startX, startY, originX, originY } = activeDrag;
    const dx = event.clientX - startX;
    const dy = event.clientY - startY;
    if (Math.abs(dx) + Math.abs(dy) > 3) activeDrag.moved = true;
    card.style.setProperty("--drag-x", (originX + dx) + "px");
    card.style.setProperty("--drag-y", (originY + dy) + "px");
  });

  const finishDrag = (event) => {
    if (!activeDrag || activeDrag.pointerId !== event.pointerId) return;
    const { card, moved } = activeDrag;
    activeDrag = null;
    card.classList.remove("is-dragging");
    if (moved) {
      card.dataset.justDragged = "true";
      window.setTimeout(() => delete card.dataset.justDragged, 180);
    }
    try {
      if (workspace.hasPointerCapture(event.pointerId)) {
        workspace.releasePointerCapture(event.pointerId);
      }
    } catch (_) {}
  };

  workspace.addEventListener("pointerup", finishDrag);
  workspace.addEventListener("pointercancel", finishDrag);
  workspace.addEventListener("lostpointercapture", finishDrag);

  workspace.addEventListener("click", (event) => {
    const card = event.target.closest(".floating-project");
    if (card && card.dataset.justDragged === "true" && !event.target.closest("a, button")) {
      event.preventDefault();
      event.stopPropagation();
    }
  });

  workspace.addEventListener("dragstart", (event) => {
    if (event.target.closest(".floating-project")) event.preventDefault();
  });

  // Load editable project cards from the Pages CMS-managed JSON file.
  // The original HTML cards remain visible if the data file cannot be loaded.
  const safeImageUrl = (value) => {
    const url = String(value || "").trim();
    if (/^https?:\/\//i.test(url)) return url;
    if (/^\/(media|assets)\//i.test(url)) return url;
    return "";
  };

  const safeProjectLink = (value) => {
    const url = String(value || "").trim();
    if (/^https?:\/\//i.test(url) || /^mailto:/i.test(url)) return url;
    if (/^(?!\/\/)[\/#?]/.test(url)) return url;
    return "";
  };

  const makeProjectCard = (project, index) => {
    const tilts = [-4, 3, 2, -2, 4, -3];
    const delays = ["-1.2s", "-3.1s", "-2s", "-4s", "-2.7s", "-1.8s"];
    const widths = [340, 315, 325, 300, 340, 330];

    const card = document.createElement("article");
    card.className = "floating-project";
    card.style.setProperty("--tilt", tilts[index % tilts.length] + "deg");
    card.style.setProperty("--float-delay", delays[index % delays.length]);
    card.style.setProperty("--card-width", widths[index % widths.length] + "px");

    const handle = document.createElement("div");
    handle.className = "project-drag-handle mono";
    handle.setAttribute("aria-label", "Drag " + project.title + " card");
    handle.title = "Drag to move";
    handle.append(document.createTextNode("↕ "));
    const moveLabel = document.createElement("span");
    moveLabel.textContent = "MOVE CARD";
    const number = document.createElement("span");
    number.textContent = String(index + 1).padStart(2, "0");
    handle.append(moveLabel, number);

    const image = document.createElement("img");
    image.className = "floating-project-image";
    image.src = safeImageUrl(project.image);
    image.alt = project.title;
    image.draggable = false;
    image.decoding = "async";
    image.loading = index === 0 ? "eager" : "lazy";
    if (index === 0) image.setAttribute("fetchpriority", "high");

    const info = document.createElement("div");
    info.className = "floating-project-info";

    const category = document.createElement("p");
    category.className = "mono";
    category.textContent = project.category || "";

    const title = document.createElement("h3");
    title.textContent = project.title || "Untitled project";

    const bottom = document.createElement("div");
    bottom.className = "floating-project-bottom";

    const year = document.createElement("span");
    year.className = "mono";
    year.textContent = project.year || "";
    bottom.appendChild(year);

    const projectLink = safeProjectLink(project.link);
    if (projectLink) {
      const link = document.createElement("a");
      link.className = "floating-open mono";
      link.href = projectLink;
      link.textContent = "open ↗";
      if (/^https?:\/\//i.test(projectLink)) {
        link.target = "_blank";
        link.rel = "noopener";
      }
      bottom.appendChild(link);
    }

    info.append(category, title, bottom);
    card.append(handle, image, info);
    return card;
  };

  const loadCmsProjects = async () => {
    try {
      const response = await fetch("data/projects.json?v=20261118", { cache: "no-store" });
      if (!response.ok) throw new Error("Project data returned " + response.status);
      const projects = await response.json();
      if (!Array.isArray(projects)) throw new Error("Project data is not a list");

      const visibleProjects = projects
        .filter(project => project && project.visible !== false && project.title && safeImageUrl(project.image))
        .sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));

      if (visibleProjects.length) {
        workspace.replaceChildren(...visibleProjects.map(makeProjectCard));
      }
    } catch (error) {
      console.warn("Using the built-in project cards because CMS data could not be loaded:", error);
    }
  };

  loadCmsProjects();
})();

// Toggle between the selected project cards and the shots gallery.
(() => {
  const tabs = [
    { button: document.getElementById("selected-work-tab"), panel: document.getElementById("selected-work-panel") },
    { button: document.getElementById("shots-tab"), panel: document.getElementById("shots-panel") }
  ];
  if (tabs.some(item => !item.button || !item.panel)) return;

  const activate = (index) => {
    tabs.forEach((item, i) => {
      const active = i === index;
      item.button.classList.toggle("is-active", active);
      item.button.setAttribute("aria-selected", String(active));
      item.button.tabIndex = active ? 0 : -1;
      item.panel.hidden = !active;
    });
  };
  tabs.forEach((item, index) => {
    item.button.addEventListener("click", () => activate(index));
    item.button.addEventListener("keydown", (event) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      event.preventDefault();
      const next = event.key === "ArrowRight" ? (index + 1) % tabs.length : (index + tabs.length - 1) % tabs.length;
      activate(next);
      tabs[next].button.focus();
    });
  });
  activate(0);
})();


// Render the Pages CMS-managed Shots collection.
(() => {
  const grid = document.querySelector(".shots-grid");
  if (!grid) return;

  const safeMediaUrl = (value) => {
    const url = String(value || "").trim();
    if (/^https?:\/\//i.test(url)) return url;
    if (/^\/(media|assets)\//i.test(url)) return url;
    return "";
  };

  const makeShot = (shot, index) => {
    const tile = document.createElement("figure");
    const size = ["standard", "tall", "wide", "large"].includes(shot.size) ? shot.size : "standard";
    tile.className = "shot-tile" + (size === "standard" ? "" : " shot-tile-" + size);

    const lottieUrl = safeMediaUrl(shot.lottie);
    const imageUrl = safeMediaUrl(shot.image);
    if (lottieUrl && /\.json(?:$|\?)/i.test(lottieUrl)) {
      const animation = document.createElement("div");
      animation.className = "shot-lottie";
      animation.setAttribute("role", "img");
      animation.setAttribute("aria-label", shot.title || ("Shot " + (index + 1)));
      animation.dataset.animation = lottieUrl;
      tile.appendChild(animation);
    } else if (imageUrl) {
      const image = document.createElement("img");
      image.src = imageUrl;
      image.alt = shot.title || ("Shot " + (index + 1));
      image.loading = "lazy";
      image.decoding = "async";
      tile.appendChild(image);
    } else {
      return null;
    }

    const caption = document.createElement("figcaption");
    caption.className = "shot-caption";
    const title = document.createElement("span");
    title.textContent = shot.title || ("Shot " + (index + 1));
    caption.appendChild(title);
    tile.appendChild(caption);
    return tile;
  };

  const loadShots = async () => {
    try {
      const response = await fetch("data/shots.json?v=20261122", { cache: "no-store" });
      if (!response.ok) throw new Error("Shots data returned " + response.status);
      const shots = await response.json();
      if (!Array.isArray(shots)) throw new Error("Shots data is not a list");
      const visible = shots
        .filter(shot => shot && shot.visible !== false)
        .sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
      const tiles = visible.map(makeShot).filter(Boolean);
      if (tiles.length) {
        grid.replaceChildren(...tiles);
        if (window.lottie) {
          grid.querySelectorAll(".shot-lottie[data-animation]").forEach(node => {
            window.lottie.loadAnimation({
              container: node,
              renderer: "svg",
              loop: true,
              autoplay: true,
              path: node.dataset.animation
            });
          });
        }
      }
    } catch (error) {
      console.warn("Using built-in Shots placeholders because CMS data could not be loaded:", error);
    }
  };

  loadShots();
})();
