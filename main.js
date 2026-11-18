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


// Optional original ambient synthwave loop. Starts only after visitor opt-in.
(() => {
  const toggle = document.querySelector(".music-toggle");
  if (!toggle) return;

  let context = null;
  let master = null;
  let timer = null;
  let step = 0;
  let active = false;

  const progression = [
    [110.00, 164.81, 220.00, 261.63],
    [98.00, 146.83, 196.00, 246.94],
    [130.81, 196.00, 261.63, 329.63],
    [87.31, 130.81, 174.61, 220.00]
  ];

  function tone(frequency, start, duration, volume, type) {
    const oscillator = context.createOscillator();
    const envelope = context.createGain();
    const filter = context.createBiquadFilter();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, start);
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(type === "triangle" ? 1200 : 850, start);
    envelope.gain.setValueAtTime(0.0001, start);
    envelope.gain.exponentialRampToValueAtTime(volume, start + 0.25);
    envelope.gain.setValueAtTime(volume, start + Math.max(0.3, duration - 0.45));
    envelope.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    oscillator.connect(filter);
    filter.connect(envelope);
    envelope.connect(master);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.05);
  }

  function playBar() {
    if (!active || !context || context.state !== "running") return;
    const now = context.currentTime + 0.04;
    const chord = progression[step % progression.length];
    chord.forEach((note, index) => tone(note, now, 3.55, index === 0 ? 0.12 : 0.055, "sine"));
    const melody = [chord[2] * 2, chord[1] * 2, chord[3] * 2, chord[2] * 2];
    melody.forEach((note, index) => tone(note, now + index * 0.82, 0.78, 0.035, "triangle"));
    tone(chord[0] / 2, now, 3.4, 0.13, "triangle");
    step++;
  }

  async function stopMusic() {
    active = false;
    if (timer) window.clearInterval(timer);
    timer = null;
    const oldContext = context;
    context = null;
    master = null;
    if (oldContext && oldContext.state !== "closed") await oldContext.close();
    toggle.setAttribute("aria-pressed", "false");
    toggle.setAttribute("aria-label", "Turn background music on");
    toggle.title = "Turn background music on";
  }

  async function startMusic() {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) throw new Error("Web Audio is not supported in this browser");
    context = new AudioContextClass();
    if (context.state === "suspended") await context.resume();
    if (context.state !== "running") throw new Error("Audio could not be started");
    master = context.createGain();
    master.gain.value = 0.65;
    master.connect(context.destination);
    active = true;
    step = 0;
    playBar();
    timer = window.setInterval(playBar, 3600);
    toggle.setAttribute("aria-pressed", "true");
    toggle.setAttribute("aria-label", "Turn background music off");
    toggle.title = "Turn background music off";
  }

  toggle.addEventListener("click", async () => {
    if (toggle.disabled) return;
    toggle.disabled = true;
    try {
      if (active) await stopMusic();
      else await startMusic();
    } catch (error) {
      console.error("Background music could not start:", error);
      await stopMusic();
      toggle.title = "Music could not start — try again";
    } finally {
      toggle.disabled = false;
    }
  });

  window.addEventListener("pagehide", () => {
    if (context && context.state !== "closed") context.close();
  });
})();
