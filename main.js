// Nour Oumousse — static portfolio (no build step, vanilla JS)

// Current year in footer
document.getElementById("year").textContent = new Date().getFullYear();

// Copy-email button
const copyBtn = document.getElementById("copy-btn");
if (copyBtn) {
  copyBtn.addEventListener("click", async () => {
    const email = copyBtn.dataset.email;
    try {
      await navigator.clipboard.writeText(email);
    } catch {
      // Fallback for older browsers / non-secure contexts
      const ta = document.createElement("textarea");
      ta.value = email;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    const original = copyBtn.textContent;
    copyBtn.textContent = "copied ✓";
    copyBtn.style.borderColor = "var(--accent)";
    copyBtn.style.color = "var(--accent)";
    setTimeout(() => {
      copyBtn.textContent = original;
      copyBtn.style.borderColor = "";
      copyBtn.style.color = "";
    }, 1600);
  });
}

// Reveal-on-scroll animation (progressive enhancement)
const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if (!prefersReduced && "IntersectionObserver" in window) {
  const targets = document.querySelectorAll(".card, .timeline li, .section-head, .contact-box");
  targets.forEach((el) => el.classList.add("reveal"));
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("visible");
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  targets.forEach((el) => io.observe(el));
}
