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


// Four original, procedurally generated 10-second music scenes.
// Starts only after visitor opt-in. The melodies are original and use broad genre
// characteristics rather than recreating any existing soundtrack or song.
(() => {
  const toggle = document.querySelector(".music-toggle");
  if (!toggle) return;

  let context = null;
  let master = null;
  let timer = null;
  let trackIndex = 0;
  let active = false;
  let reverbBus = null;
  let echoBus = null;

  // Track 1: preserve the original wistful, weightless space-ambient harmony.
  const spaceProgression = [
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
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 3.2);
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
    if (options.slideTo) {
      osc.frequency.setValueAtTime(frequency, start);
      osc.frequency.exponentialRampToValueAtTime(options.slideTo, start + Math.min(0.22, duration * 0.35));
    }
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(options.cutoff || 1800, start);
    filter.Q.value = options.resonance || 0.35;
    const attack = Math.min(options.attack || 0.08, duration * 0.45);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(Math.max(volume, 0.0002), start + attack);
    gain.gain.setValueAtTime(Math.max(volume, 0.0002), start + duration * 0.72);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(destination);
    osc.start(start);
    osc.stop(start + duration + 0.04);
  }

  function playSpace(now) {
    const chord = spaceProgression[Math.floor(trackIndex / 4) % spaceProgression.length];
    chord.notes.forEach((note, index) => {
      const level = index === 0 ? 0.038 : 0.025;
      voice(note, now, 9.6, level, "triangle", reverbBus, { cutoff: 1050, attack: 2.1 });
      voice(note * 2, now, 9.4, level * 0.22, "sine", reverbBus, { detune: index % 2 ? -7 : 7, cutoff: 1900, attack: 2.8 });
    });
    voice(chord.bass, now, 9.5, 0.105, "sine", master, { cutoff: 180, attack: 2.4 });
    const pattern = [chord.notes[3], chord.notes[4], chord.notes[2] * 2, chord.notes[1] * 2,
      chord.notes[4], chord.notes[2] * 2, chord.notes[3] * 2, chord.notes[1] * 2];
    pattern.forEach((note, index) => {
      voice(note, now + index * 1.08, 1.7, 0.027, "sine", echoBus, { cutoff: 2600, attack: 0.035 });
    });
    voice(chord.notes[4] * 4, now + 4.2, 4.2, 0.006, "sine", reverbBus, { cutoff: 4200, attack: 1.5 });
  }

  // Track 2: ancient-epic cinematic atmosphere — broad low strings, brass-like
  // harmonics and a rising original motif.
  function playEpic(now) {
    const chords = [
      [110, 164.81, 220, 261.63],
      [98, 146.83, 196, 246.94],
      [130.81, 196, 261.63, 329.63],
      [87.31, 130.81, 174.61, 220]
    ];
    const chord = chords[Math.floor(trackIndex / 4) % chords.length];
    chord.forEach((n, i) => {
      voice(n, now, 9.5, 0.035, "sawtooth", reverbBus, { cutoff: 720 + i * 160, attack: 1.4 });
      voice(n * 2, now, 9.2, 0.012, "triangle", reverbBus, { detune: i % 2 ? -5 : 5, cutoff: 1700, attack: 1.8 });
    });
    voice(chord[0] / 2, now, 9.5, 0.13, "sine", master, { cutoff: 150, attack: 1.8 });
    const motif = [chord[2], chord[3], chord[2] * 1.5, chord[1] * 2, chord[2] * 1.5, chord[3] * 2];
    motif.forEach((n, i) => {
      voice(n, now + 1.0 + i * 1.35, 1.25, 0.035, "sawtooth", echoBus, { cutoff: 2400, attack: 0.18 });
    });
    [0, 3.2, 6.4].forEach((t) => {
      voice(chord[0] / 2, now + t, 0.55, 0.045, "triangle", master, { cutoff: 300, attack: 0.08 });
    });
  }

  // Track 3: bright, high-register blues-rock lead with a clean, plucked edge.
  // It uses an original phrase and does not quote a guitar solo.
  function playGuitar(now) {
    const bassNotes = [110, 130.81, 146.83, 130.81];
    const scale = [440, 523.25, 587.33, 659.25, 783.99, 880, 783.99, 659.25,
      587.33, 523.25, 493.88, 523.25, 659.25, 783.99, 880, 1046.5];
    bassNotes.forEach((n, i) => {
      voice(n, now + i * 2.35, 2.25, 0.075, "triangle", master, { cutoff: 420, attack: 0.025 });
      voice(n / 2, now + i * 2.35, 2.2, 0.065, "sine", master, { cutoff: 180, attack: 0.04 });
    });
    scale.forEach((n, i) => {
      const when = now + 0.18 + i * 0.58;
      const bend = i === 4 || i === 13;
      voice(n, when, 0.48, 0.052, "sawtooth", echoBus, {
        cutoff: 3600, attack: 0.012, detune: bend ? -9 : 0,
        slideTo: bend ? n * 1.045 : undefined
      });
      voice(n * 2, when, 0.34, 0.012, "triangle", reverbBus, { cutoff: 5200, attack: 0.01, detune: i % 2 ? 4 : -4 });
    });
  }

  // Track 4: gentle, whimsical pastoral chamber sound — bell-like piano tones,
  // warm harmony and a lilting original melody.
  function playWhimsy(now) {
    const chords = [
      [261.63, 329.63, 392, 493.88],
      [220, 261.63, 329.63, 440],
      [196, 246.94, 293.66, 392],
      [174.61, 220, 261.63, 349.23]
    ];
    const chord = chords[Math.floor(trackIndex / 4) % chords.length];
    chord.forEach((n, i) => {
      voice(n / 2, now, 9.3, 0.027, "triangle", reverbBus, { cutoff: 1400, attack: 1.1 });
      voice(n, now, 8.9, 0.012, "sine", reverbBus, { cutoff: 3200, attack: 1.4, detune: i % 2 ? 3 : -3 });
    });
    const melody = [chord[2], chord[3], chord[1] * 2, chord[2] * 2,
      chord[3], chord[2] * 2, chord[1] * 2, chord[0] * 2,
      chord[2], chord[3], chord[1] * 2, chord[2] * 2];
    melody.forEach((n, i) => {
      const when = now + i * 0.76;
      voice(n, when, 0.62, 0.038, "sine", echoBus, { cutoff: 4200, attack: 0.018 });
      if (i % 3 === 0) voice(n / 2, when, 0.85, 0.018, "triangle", reverbBus, { cutoff: 2200, attack: 0.08 });
    });
    voice(chord[0] / 2, now, 9.2, 0.065, "sine", master, { cutoff: 240, attack: 1.4 });
  }

  const tracks = [playSpace, playEpic, playGuitar, playWhimsy];

  function playNextTrack() {
    if (!active || !context || context.state !== "running") return;
    const now = context.currentTime + 0.08;
    tracks[trackIndex](now);
    trackIndex = (trackIndex + 1) % tracks.length;
  }

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
    trackIndex = 0;
    playNextTrack();
    timer = window.setInterval(playNextTrack, 10000);
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


// Persistent site-wide light/dark theme switch.
(() => {
  const root = document.documentElement;
  const toggle = document.querySelector(".theme-toggle");
  if (!toggle) return;

  let savedTheme = null;
  try { savedTheme = localStorage.getItem("nour-theme"); } catch {}
  const initialTheme = savedTheme === "light" ? "light" : "dark";

  function applyTheme(theme) {
    root.dataset.theme = theme;
    const light = theme === "light";
    toggle.setAttribute("aria-pressed", String(light));
    toggle.setAttribute("aria-label", light ? "Switch to dark mode" : "Switch to light mode");
    toggle.title = light ? "Switch to dark mode" : "Switch to light mode";
    toggle.querySelector("span").textContent = light ? "☾" : "☼";
  }

  applyTheme(initialTheme);
  toggle.addEventListener("click", () => {
    const nextTheme = root.dataset.theme === "light" ? "dark" : "light";
    applyTheme(nextTheme);
    try { localStorage.setItem("nour-theme", nextTheme); } catch {}
  });
})();
