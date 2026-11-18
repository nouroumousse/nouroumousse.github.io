(() => {
  const workspace = document.getElementById("floating-workspace");
  if (!workspace) return;

  const cards = [...workspace.querySelectorAll(".floating-project")];
  let activeDrag = null;
  let suppressClick = false;

  const readOffset = (card, name) => {
    const value = getComputedStyle(card).getPropertyValue(name).trim();
    return Number.parseFloat(value) || 0;
  };

  const closeExpanded = () => {
    const expanded = workspace.querySelector(".floating-project.is-expanded");
    if (!expanded) return;
    expanded.classList.remove("is-expanded");
    expanded.querySelector(".project-expanded-details")?.setAttribute("aria-hidden", "true");
    workspace.classList.remove("has-expanded-card");
  };

  const toggleExpanded = (card) => {
    if (card.classList.contains("is-expanded")) {
      closeExpanded();
      return;
    }
    closeExpanded();
    card.classList.add("is-expanded");
    card.querySelector(".project-expanded-details")?.setAttribute("aria-hidden", "false");
    workspace.classList.add("has-expanded-card");
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
  });

  window.addEventListener("pointermove", (event) => {
    if (!activeDrag || activeDrag.pointerId !== event.pointerId) return;
    const drag = activeDrag;
    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;
    if (!drag.moved && Math.abs(dx) + Math.abs(dy) > 6) {
      drag.moved = true;
      drag.card.classList.add("is-dragging");
    }
    if (!drag.moved) return;
    drag.card.style.setProperty("--drag-x", (drag.originX + dx) + "px");
    drag.card.style.setProperty("--drag-y", (drag.originY + dy) + "px");
    event.preventDefault();
  }, { passive: false });

  const finishDrag = (event) => {
    if (!activeDrag || activeDrag.pointerId !== event.pointerId) return;
    const { card, moved } = activeDrag;
    activeDrag = null;
    card.classList.remove("is-dragging");
    if (moved) {
      suppressClick = true;
      window.setTimeout(() => { suppressClick = false; }, 250);
    }
  };
  window.addEventListener("pointerup", finishDrag);
  window.addEventListener("pointercancel", finishDrag);

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

  // Clicking the dimmed area closes the selected card.
  workspace.addEventListener("click", (event) => {
    if (event.target === workspace && workspace.classList.contains("has-expanded-card")) {
      closeExpanded();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeExpanded();
  });

  cards.forEach((card) => {
    card.addEventListener("dragstart", (event) => event.preventDefault());
  });
})();