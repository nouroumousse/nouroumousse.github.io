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


// Original 30-second 1950s-inspired small-combo jazz loop.
// Web Audio only: warm sax-like lead, walking upright bass, brushed snare,
// ride-cymbal ticks and soft piano chords. Starts only after visitor opt-in.
(() => {
  const toggle = document.querySelector(".music-toggle");
  if (!toggle) return;

  let context = null;
  let master = null;
  let timer = null;
  let active = false;

  const bpm = 116;
  const beat = 60 / bpm;
  const bar = beat * 4;
  const total = 30;

  function envelope(gain, start, peak, attack, hold, release) {
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(Math.max(peak, 0.0002), start + attack);
    gain.gain.setValueAtTime(Math.max(peak, 0.0002), start + attack + hold);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + attack + hold + release);
  }

  function saxNote(freq, start, duration, level = 0.055) {
    const voiceGain = context.createGain();
    const filter = context.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(1900, start);
    filter.Q.value = 0.8;
    voiceGain.connect(filter);
    filter.connect(master);
    envelope(voiceGain, start, level, 0.055, duration * 0.58, duration * 0.34);

    // A soft, slightly nasal harmonic stack gives the lead a reed-like tone.
    [1, 2, 3, 4].forEach((harmonic, index) => {
      const osc = context.createOscillator();
      const partial = context.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq * harmonic, start);
      partial.gain.value = [1, 0.34, 0.16, 0.055][index];
      osc.connect(partial);
      partial.connect(voiceGain);
      osc.start(start);
      osc.stop(start + duration + 0.05);
    });

    const vibrato = context.createOscillator();
    const vibratoDepth = context.createGain();
    vibrato.type = "sine";
    vibrato.frequency.value = 5.2;
    vibratoDepth.gain.setValueAtTime(0, start);
    vibratoDepth.gain.linearRampToValueAtTime(3.2, start + 0.18);
    vibrato.connect(vibratoDepth);
    // Tiny pitch movement on the fundamental adds a breathy, played feel.
    const pitch = context.createOscillator();
    pitch.frequency.setValueAtTime(freq, start);
    vibratoDepth.connect(pitch.detune);
    pitch.connect(voiceGain);
    pitch.start(start);
    pitch.stop(start + duration + 0.05);
    vibrato.start(start);
    vibrato.stop(start + duration + 0.05);
  }

  function bassNote(freq, start, duration) {
    const osc = context.createOscillator();
    const gain = context.createGain();
    const filter = context.createBiquadFilter();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(freq, start);
    filter.type = "lowpass";
    filter.frequency.value = 320;
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(master);
    envelope(gain, start, 0.13, 0.012, duration * 0.48, duration * 0.42);
    osc.start(start);
    osc.stop(start + duration + 0.04);
  }

  function pianoChord(notes, start) {
    notes.forEach((freq) => {
      const osc = context.createOscillator();
      const gain = context.createGain();
      osc.type = "triangle";
      osc.frequency.value = freq;
      osc.connect(gain);
      gain.connect(master);
      envelope(gain, start, 0.018, 0.008, 0.12, 0.48);
      osc.start(start);
      osc.stop(start + 0.68);
    });
  }

  function noiseHit(start, duration, level, highpass, lowpass = 9000) {
    const length = Math.ceil(context.sampleRate * duration);
    const buffer = context.createBuffer(1, length, context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) {
      const fade = 1 - i / length;
      data[i] = (Math.random() * 2 - 1) * fade;
    }
    const source = context.createBufferSource();
    const filter = context.createBiquadFilter();
    const gain = context.createGain();
    source.buffer = buffer;
    filter.type = "highpass";
    filter.frequency.value = highpass;
    filter.connect(gain);
    gain.connect(master);
    gain.gain.setValueAtTime(level, start);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    source.connect(filter);
    source.start(start);
  }

  function playThirtySeconds() {
    if (!active || !context || context.state !== "running") return;
    const start = context.currentTime + 0.08;
    const progression = [
      { bass: 110, chord: [261.63, 329.63, 392, 466.16], scale: [523.25, 587.33, 659.25, 783.99, 698.46, 659.25, 587.33, 523.25] },
      { bass: 146.83, chord: [293.66, 349.23, 440, 523.25], scale: [587.33, 659.25, 783.99, 880, 783.99, 698.46, 659.25, 587.33] },
      { bass: 98, chord: [246.94, 293.66, 369.99, 440], scale: [493.88, 587.33, 659.25, 739.99, 698.46, 659.25, 587.33, 493.88] },
      { bass: 130.81, chord: [261.63, 329.63, 392, 493.88], scale: [523.25, 659.25, 783.99, 880, 783.99, 659.25, 587.33, 523.25] }
    ];

    // 15 bars at 116 BPM = just over 31 seconds; last bar is shortened to 30s.
    for (let barIndex = 0; barIndex < 15; barIndex++) {
      const chord = progression[barIndex % progression.length];
      const barStart = start + barIndex * bar;
      pianoChord(chord.chord, barStart + beat * 0.02);
      pianoChord(chord.chord, barStart + beat * 2.02);

      for (let beatIndex = 0; beatIndex < 4; beatIndex++) {
        const when = barStart + beatIndex * beat;
        const bassFreq = chord.bass * [1, 1.5, 1.25, 1.5][beatIndex];
        bassNote(bassFreq, when, beat * 0.72);
        // Ride cymbal keeps a light swing pulse; softer offbeat brush accents.
        noiseHit(when, 0.075, beatIndex === 0 ? 0.014 : 0.009, 5200);
        noiseHit(when + beat * 0.5, 0.055, 0.0035, 1800, 6500);
      }

      // Original melodic phrase with rests and occasional syncopation.
      const phrase = [
        [0.18, 0, 0.72], [0.92, 2, 0.48], [1.48, 3, 0.62],
        [2.42, 4, 0.42], [2.96, 3, 0.5], [3.48, 1, 0.42]
      ];
      phrase.forEach(([offset, noteIndex, length], phraseIndex) => {
        const note = chord.scale[noteIndex];
        const octave = (barIndex % 3 === 2 && phraseIndex === 2) ? 2 : 1;
        saxNote(note * octave, barStart + beat * offset, beat * length, 0.048);
      });
    }
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
    master.gain.value = 0.62;
    const compressor = context.createDynamicsCompressor();
    compressor.threshold.value = -20;
    compressor.knee.value = 18;
    compressor.ratio.value = 3;
    compressor.attack.value = 0.008;
    compressor.release.value = 0.22;
    master.connect(compressor);
    compressor.connect(context.destination);

    active = true;
    playThirtySeconds();
    timer = window.setInterval(playThirtySeconds, total * 1000);
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
