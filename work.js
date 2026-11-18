(() => {
  const workspace = document.getElementById("floating-workspace");
  if (!workspace) return;

  const cards = [...workspace.querySelectorAll(".floating-project")];
  let topZ = 10;
  let activeDrag = null;
  let suppressClick = false;

  const readOffset = (card, name) => {
    const value = getComputedStyle(card).getPropertyValue(name).trim();
    return Number.parseFloat(value) || 0;
  };

  const closeExpanded = () => {
    const expanded = workspace.querySelector(".floating-project.is-expanded");
    if (expanded) {
      expanded.classList.remove("is-expanded");
      const details = expanded.querySelector(".project-expanded-details");
      if (details) details.setAttribute("aria-hidden", "true");
    }
    workspace.classList.remove("has-expanded-card");
  };

  const toggleExpanded = (card) => {
    const wasExpanded = card.classList.contains("is-expanded");
    closeExpanded();
    if (!wasExpanded) {
      card.classList.add("is-expanded");
      card.style.zIndex = String(++topZ);
      const details = card.querySelector(".project-expanded-details");
      if (details) details.setAttribute("aria-hidden", "false");
      workspace.classList.add("has-expanded-card");
    }
  };

  workspace.addEventListener("pointerdown", (event) => {
    if (event.button !== undefined && event.button !== 0) return;
    if (event.target.closest("a, button")) return;

    const card = event.target.closest(".floating-project");
    if (!card || !workspace.contains(card) || card.classList.contains("is-expanded")) return;

    activeDrag = {
      card,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: readOffset(card, "--drag-x"),
      originY: readOffset(card, "--drag-y"),
      moved: false
    };
    try { workspace.setPointerCapture(event.pointerId); } catch (_) {}
  });

  workspace.addEventListener("pointermove", (event) => {
    if (!activeDrag || activeDrag.pointerId !== event.pointerId) return;
    const { card, startX, startY, originX, originY } = activeDrag;
    const dx = event.clientX - startX;
    const dy = event.clientY - startY;
    if (!activeDrag.moved && Math.abs(dx) + Math.abs(dy) > 5) {
      activeDrag.moved = true;
      card.classList.add("is-dragging");
      card.style.zIndex = String(++topZ);
    }
    if (!activeDrag.moved) return;
    card.style.setProperty("--drag-x", (originX + dx) + "px");
    card.style.setProperty("--drag-y", (originY + dy) + "px");
    event.preventDefault();
  });

  const finishDrag = (event) => {
    if (!activeDrag || activeDrag.pointerId !== event.pointerId) return;
    const { card, moved } = activeDrag;
    activeDrag = null;
    card.classList.remove("is-dragging");
    if (moved) {
      suppressClick = true;
      window.setTimeout(() => { suppressClick = false; }, 220);
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
    if (!card || !workspace.contains(card)) return;
    if (event.target.closest("a, button")) return;
    if (suppressClick) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    toggleExpanded(card);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeExpanded();
  });

  cards.forEach((card) => {
    card.addEventListener("dragstart", (event) => event.preventDefault());
  });
})();