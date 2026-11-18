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


// Original cinematic space-ambient soundtrack. Starts only after visitor opt-in.
(() => {
  const toggle = document.querySelector(".music-toggle");
  if (!toggle) return;

  let context = null;
  let master = null;
  let timer = null;
  let step = 0;
  let active = false;

  // Slow, wistful progression: D minor -> Bb major -> F -> C.
  // The added ninths and suspended notes give it an open, weightless feeling.
  const progression = [
    { notes: [146.83, 174.61, 220.00, 261.63, 329.63], bass: 73.42 },
    { notes: [116.54, 146.83, 174.61, 220.00, 261.63], bass: 58.27 },
    { notes: [87.31, 130.81, 174.61, 196.00, 261.63], bass: 43.65 },
    { notes: [130.81, 164.81, 196.00, 220.00, 293.66], bass: 65.41 }
  ];

  function makeReverb(ctx) {
    const convolver = ctx.createConvolver();
    const length = ctx.sampleRate * 4.5;
    const impulse = ctx.createBuffer(2, length, ctx.sampleRate);
    for (let channel = 0; channel < 2; channel++) {
      const data = impulse.getChannelData(channel);
      for (let i = 0; i < length; i++) {
        const fade = Math.pow(1 - i / length, 3.2);
        data[i] = (Math.random() * 2 - 1) * fade;
      }
    }
    convolver.buffer = impulse;
    return convolver;
  }

  function voice(frequency, start, duration, volume, type, destination, options = {}) {
    const osc = context.createOscillator();
    const gain = context.createGain();
    const filter = context.createBiquadFilter();
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, start);
    if (options.detune) osc.detune.setValueAtTime(options.detune, start);
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(options.cutoff || 1500, start);
    filter.Q.value = options.resonance || 0.35;
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + (options.attack || 1.2));
    gain.gain.setValueAtTime(volume, start + duration * 0.72);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(destination);
    osc.start(start);
    osc.stop(start + duration + 0.08);
  }

  function playBar() {
    if (!active || !context || context.state !== "running") return;
    const now = context.currentTime + 0.08;
    const chord = progression[step % progression.length];

    // Wide, slowly blooming pad.
    chord.notes.forEach((note, index) => {
      const level = index === 0 ? 0.038 : 0.025;
      voice(note, now, 7.8, level, "triangle", reverbBus, { cutoff: 1050, attack: 2.1 });
      voice(note * 2, now, 7.5, level * 0.22, "sine", reverbBus, { detune: index % 2 ? -7 : 7, cutoff: 1900, attack: 2.8 });
    });

    // Deep, gentle sub-bass — more felt than heard.
    voice(chord.bass, now, 7.7, 0.105, "sine", master, { cutoff: 180, attack: 2.4 });

    // A sparse, floating sequence of distant star-like notes.
    const pattern = [chord.notes[3], chord.notes[4], chord.notes[2] * 2, chord.notes[1] * 2,
      chord.notes[4], chord.notes[2] * 2, chord.notes[3] * 2, chord.notes[1] * 2];
    pattern.forEach((note, index) => {
      const when = now + index * 0.92 + (index % 2) * 0.12;
      voice(note, when, 1.65, 0.027, "sine", echoBus, { cutoff: 2600, attack: 0.035 });
    });

    // A very quiet upper shimmer, like light moving across a distant surface.
    voice(chord.notes[4] * 4, now + 3.6, 3.2, 0.006, "sine", reverbBus, { cutoff: 4200, attack: 1.5 });
    step++;
  }

  let reverbBus = null;
  let echoBus = null;

  async function stopMusic() {
    active = false;
    if (timer) window.clearInterval(timer);
    timer = null;
    const oldContext = context;
    context = null;
    master = null;
    reverbBus = null;
    echoBus = null;
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
    master.gain.value = 0.72;
    master.connect(context.destination);

    const reverb = makeReverb(context);
    const reverbLevel = context.createGain();
    reverbLevel.gain.value = 0.24;
    reverb.connect(reverbLevel);
    reverbLevel.connect(master);
    reverbBus = reverb;

    const delay = context.createDelay(1.5);
    delay.delayTime.value = 0.42;
    const feedback = context.createGain();
    feedback.gain.value = 0.24;
    const echoLevel = context.createGain();
    echoLevel.gain.value = 0.34;
    delay.connect(feedback);
    feedback.connect(delay);
    delay.connect(echoLevel);
    echoLevel.connect(master);
    echoBus = delay;

    active = true;
    step = 0;
    playBar();
    timer = window.setInterval(playBar, 8000);
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
