(() => {
  const workspace = document.getElementById("floating-workspace");
  if (!workspace) return;

  const cards = [...workspace.querySelectorAll(".floating-project")];
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

  cards.forEach((card) => {
    card.addEventListener("dragstart", (event) => event.preventDefault());
  });
})();