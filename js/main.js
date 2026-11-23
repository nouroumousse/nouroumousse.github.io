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


// Persistent site-wide four-theme switch. Dusk is the default for new visitors.
(() => {
  const root = document.documentElement;
  const toggle = document.querySelector(".theme-toggle");
  if (!toggle) return;

  let savedTheme = null;
  try { savedTheme = localStorage.getItem("nour-theme"); } catch {}
  const initialTheme = ["dark", "light", "dusk"].includes(savedTheme) ? savedTheme : "dusk";
  const themes = ["dark", "light", "dusk"];
  const labels = {
    dark: { next: "light", icon: "☾" },
    light: { next: "dusk", icon: "☼" },
    dusk: { next: "dark", icon: "◐" }
  };

  function applyTheme(theme) {
    root.dataset.theme = theme;
    const settings = labels[theme];
    toggle.setAttribute("aria-pressed", String(theme !== "dark"));
    toggle.setAttribute("aria-label", "Switch to " + settings.next + " mode");
    toggle.title = "Switch to " + settings.next + " mode";
    toggle.querySelector("span").textContent = settings.icon;

    // Match the favicon to the active palette, including saved preferences.
    const favicon = document.querySelector('link[rel~="icon"]');
    if (favicon) {
      const palettes = {
        dark: { background: "#0a0a0b", foreground: "#d4ff3f" },
        light: { background: "#f5f5f1", foreground: "#668500" },
        dusk: { background: "#252b33", foreground: "#f0bd72" }
      };
      const colors = palettes[theme];
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="6" fill="${colors.background}"/><text x="16" y="22" font-family="monospace" font-size="16" font-weight="700" fill="${colors.foreground}" text-anchor="middle">N</text></svg>`;
      favicon.href = "data:image/svg+xml," + encodeURIComponent(svg);
    }
  }

  applyTheme(initialTheme);
  toggle.addEventListener("click", () => {
    const currentIndex = themes.indexOf(root.dataset.theme);
    const nextTheme = themes[(currentIndex + 1) % themes.length];
    applyTheme(nextTheme);
    try { localStorage.setItem("nour-theme", nextTheme); } catch {}
  });
})();
