(() => {
  const workspace = document.getElementById("floating-workspace");
  if (!workspace) return;

  const cards = [...workspace.querySelectorAll(".floating-project")];
  let topZ = 10;

  cards.forEach((card) => {
    const handle = card.querySelector(".project-drag-handle");
    if (!handle) return;

    let pointerId = null;
    let startX = 0;
    let startY = 0;
    let originX = 0;
    let originY = 0;
    let moved = false;

    const readOffset = (name) => {
      const value = getComputedStyle(card).getPropertyValue(name).trim();
      return Number.parseFloat(value) || 0;
    };

    handle.addEventListener("pointerdown", (event) => {
      if (event.button !== undefined && event.button !== 0) return;
      pointerId = event.pointerId;
      startX = event.clientX;
      startY = event.clientY;
      originX = readOffset("--drag-x");
      originY = readOffset("--drag-y");
      moved = false;
      card.classList.add("is-dragging");
      card.style.zIndex = String(++topZ);
      handle.setPointerCapture(pointerId);
      event.preventDefault();
    });

    handle.addEventListener("pointermove", (event) => {
      if (pointerId !== event.pointerId) return;
      const dx = event.clientX - startX;
      const dy = event.clientY - startY;
      if (Math.abs(dx) + Math.abs(dy) > 3) moved = true;
      card.style.setProperty("--drag-x", (originX + dx) + "px");
      card.style.setProperty("--drag-y", (originY + dy) + "px");
    });

    const finish = (event) => {
      if (pointerId !== event.pointerId) return;
      pointerId = null;
      card.classList.remove("is-dragging");
      if (moved) {
        card.dataset.justDragged = "true";
        window.setTimeout(() => delete card.dataset.justDragged, 120);
      }
    };

    handle.addEventListener("pointerup", finish);
    handle.addEventListener("pointercancel", finish);
    handle.addEventListener("lostpointercapture", finish);
  });

  workspace.addEventListener("click", (event) => {
    if (event.target.closest(".project-drag-handle")) return;
    const card = event.target.closest(".floating-project");
    if (card && card.dataset.justDragged === "true") event.preventDefault();
  });
})();