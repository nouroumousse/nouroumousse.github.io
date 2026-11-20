// Pages CMS-managed experience timeline. Static HTML remains as a fallback.
(() => {
  const list = document.getElementById("experience-list");
  if (!list) return;

  const safeText = value => String(value ?? "").trim();
  const makeEntry = (item, index) => {
    const entry = document.createElement("li");
    entry.className = "visible";

    const date = document.createElement("span");
    date.className = "tl-date mono";
    date.textContent = safeText(item.date);

    const details = document.createElement("div");
    const role = document.createElement("h3");
    role.textContent = safeText(item.role) || "Untitled role";

    details.append(role);
    const organizationText = safeText(item.organization);
    if (organizationText) {
      const organization = document.createElement("p");
      organization.className = "tl-org";
      organization.textContent = organizationText;
      details.append(organization);
    }
    const descriptionText = safeText(item.description);
    if (descriptionText) {
      const description = document.createElement("p");
      description.textContent = descriptionText;
      details.append(description);
    }
    entry.append(date, details);
    return entry;
  };

  fetch("data/experience.json", { cache: "no-store" })
    .then(response => {
      if (!response.ok) throw new Error("Experience collection unavailable");
      return response.json();
    })
    .then(items => {
      if (!Array.isArray(items)) throw new Error("Invalid experience collection");
      const visible = items
        .filter(item => item && item.visible !== false)
        .sort((a, b) => {
          const orderA = Number.isFinite(Number(a.order)) ? Number(a.order) : Number.MAX_SAFE_INTEGER;
          const orderB = Number.isFinite(Number(b.order)) ? Number(b.order) : Number.MAX_SAFE_INTEGER;
          return orderA - orderB;
        });
      if (!visible.length) {
        list.replaceChildren();
        return;
      }
      const fragment = document.createDocumentFragment();
      visible.forEach((item, index) => fragment.append(makeEntry(item, index)));
      list.replaceChildren(fragment);
    })
    .catch(error => {
      console.warn("Could not load Pages CMS experience collection; keeping the embedded timeline.", error);
    });
})();
