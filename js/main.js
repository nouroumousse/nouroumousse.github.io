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


// Site-wide music player: the single MP3 stored in the repository's media folder.
// Playback starts only after the visitor presses the music control.
(() => {
  const toggle = document.querySelector(".music-toggle");
  if (!toggle) return;

  const audio = new Audio(encodeURI("media/Tasuta Nimal Fadma ⴼⴰⴹⵎⴰ Karaoke 🎤.mp3"));
  audio.preload = "none";
  audio.loop = true;
  audio.volume = 0.42;

  function updateButton(playing) {
    toggle.setAttribute("aria-pressed", String(playing));
    toggle.setAttribute("aria-label", playing ? "Turn background music off" : "Turn background music on");
    toggle.title = playing ? "Turn background music off" : "Turn background music on";
  }

  toggle.addEventListener("click", async () => {
    if (toggle.disabled) return;
    toggle.disabled = true;
    try {
      if (audio.paused) {
        await audio.play();
        updateButton(true);
      } else {
        audio.pause();
        updateButton(false);
      }
    } catch (error) {
      console.error("Background music could not start:", error);
      updateButton(false);
      toggle.title = "Music could not start — try again";
    } finally {
      toggle.disabled = false;
    }
  });

  audio.addEventListener("ended", () => updateButton(false));
  window.addEventListener("pagehide", () => {
    audio.pause();
    audio.removeAttribute("src");
    audio.load();
  });
})();


// Persistent site-wide light/dark theme switch.
(() => {
  const root = document.documentElement;
  const toggle = document.querySelector(".theme-toggle");
  if (!toggle) return;

  let savedTheme = null;
  try { savedTheme = localStorage.getItem("nour-theme"); } catch {}
  const initialTheme = ["dark", "light", "sage"].includes(savedTheme) ? savedTheme : "dark";
  const themes = ["dark", "light", "sage"];
  const labels = {
    dark: { next: "light", icon: "☾" },
    light: { next: "sage", icon: "☼" },
    sage: { next: "dark", icon: "◐" }
  };

  function applyTheme(theme) {
    root.dataset.theme = theme;
    const settings = labels[theme];
    toggle.setAttribute("aria-pressed", String(theme !== "dark"));
    toggle.setAttribute("aria-label", "Switch to " + settings.next + " mode");
    toggle.title = "Switch to " + settings.next + " mode";
    toggle.querySelector("span").textContent = settings.icon;
  }

  applyTheme(initialTheme);
  toggle.addEventListener("click", () => {
    const currentIndex = themes.indexOf(root.dataset.theme);
    const nextTheme = themes[(currentIndex + 1) % themes.length];
    applyTheme(nextTheme);
    try { localStorage.setItem("nour-theme", nextTheme); } catch {}
  });
})();
