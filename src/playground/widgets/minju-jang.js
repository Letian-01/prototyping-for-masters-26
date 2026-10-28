const defaultNotes = [
  "Hello from the canvas! May your prototypes be bold, your bugs few, and your ideas endless. ✉️✨ — Minju",
  "Prototyping principle: Build it quick, test it with real hands, and let surprise guide the next revision.",
  "Canvas secret: You can drag any widget around, zoom with scroll, and reset view anytime.",
  "Leave a secret note! Click 'Write' below to pen your own message on this card.",
];

const storage = {
  get(key, fallback) {
    try {
      const val = localStorage.getItem(`mj_env_${key}`);
      return val !== null ? val : fallback;
    } catch {
      return fallback;
    }
  },
  set(key, val) {
    try {
      localStorage.setItem(`mj_env_${key}`, val);
    } catch {
      // ignore
    }
  },
};

export default {
  student: "Minju Jang",
  title: "Interactive Envelope",
  width: 320,
  height: 260,
  mount(root) {
    const savedTo = storage.get("to", "Fellow Prototyper");
    const savedEnvNote = storage.get("env_note", "Special Delivery ✦");
    const savedCustomNote = storage.get("custom_note", "");

    const notes = [...defaultNotes];
    if (savedCustomNote) {
      notes.push(savedCustomNote);
    }

    const style = document.createElement("style");
    style.textContent = `
      :host {
        --env-bg: color-mix(in srgb, var(--paper) 90%, var(--ink) 10%);
        --env-lining: color-mix(in srgb, var(--paper) 80%, var(--ink) 20%);
        --env-flap-side: color-mix(in srgb, var(--paper) 87%, var(--ink) 13%);
        --env-flap-bottom: color-mix(in srgb, var(--paper) 83%, var(--ink) 17%);
        --env-flap-top: color-mix(in srgb, var(--paper) 85%, var(--ink) 15%);
        --card-bg: color-mix(in srgb, var(--paper) 97%, var(--ink) 3%);
        --card-border: color-mix(in srgb, var(--ink) 14%, transparent);
        --seal-red: #c93b2b;
        --seal-shadow: color-mix(in srgb, var(--ink) 24%, transparent);
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        user-select: none;
        font-family: "IBM Plex Mono", monospace;
        color: var(--ink);
      }

      .scene {
        position: relative;
        width: 250px;
        height: 220px;
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        align-items: center;
        perspective: 900px;
      }

      .envelope {
        position: relative;
        width: 250px;
        height: 136px;
        background: var(--env-bg);
        border-radius: 4px;
        box-shadow: 0 8px 20px var(--seal-shadow);
        cursor: pointer;
      }

      .envelope.is-open {
        cursor: default;
      }

      /* Inner envelope lining pattern */
      .env-lining {
        position: absolute;
        inset: 4px;
        background: var(--env-lining);
        border-radius: 3px;
        background-image: repeating-linear-gradient(
          -45deg,
          transparent,
          transparent 6px,
          color-mix(in srgb, var(--ink) 5%, transparent) 6px,
          color-mix(in srgb, var(--ink) 5%, transparent) 12px
        );
      }

      /* Letter card */
      .letter {
        position: absolute;
        left: 10px;
        top: 6px;
        width: 230px;
        height: 122px;
        background: var(--card-bg);
        border: 1px solid var(--card-border);
        border-radius: 4px;
        box-shadow: 0 2px 8px var(--seal-shadow);
        z-index: 2;
        transform: translateY(0);
        transition: transform 440ms cubic-bezier(0.34, 1.25, 0.64, 1) 180ms, z-index 0ms 220ms;
        display: flex;
        flex-direction: column;
        padding: 8px 10px;
        box-sizing: border-box;
      }

      @media (prefers-reduced-motion: reduce) {
        .letter {
          transition: transform 150ms ease;
        }
      }

      .envelope.is-open .letter {
        transform: translateY(-78px);
        z-index: 7;
        transition: transform 520ms cubic-bezier(0.34, 1.25, 0.64, 1) 180ms, z-index 0ms 220ms;
      }

      .letter-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-bottom: 1px dashed var(--card-border);
        padding-bottom: 4px;
        margin-bottom: 6px;
        font-size: 9px;
        letter-spacing: 0.05em;
        text-transform: uppercase;
        opacity: 0.75;
      }

      .postmark-badge {
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .note-counter {
        font-weight: 500;
      }

      .letter-body {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;
        min-height: 0;
      }

      .note-text {
        margin: 0;
        font-size: 11px;
        line-height: 1.35;
        font-family: "Faculty Glyphic", sans-serif;
        color: var(--ink);
        overflow: hidden;
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
      }

      .custom-editor {
        display: none;
        width: 100%;
        height: 100%;
      }

      .custom-editor.is-active {
        display: block;
      }

      .custom-input {
        width: 100%;
        height: 48px;
        resize: none;
        font-family: "Faculty Glyphic", sans-serif;
        font-size: 11px;
        line-height: 1.3;
        border: 1px solid var(--card-border);
        background: color-mix(in srgb, var(--paper) 95%, transparent);
        color: var(--ink);
        padding: 4px 6px;
        border-radius: 3px;
        box-sizing: border-box;
        outline: none;
      }

      .custom-input:focus {
        border-color: var(--ink);
        box-shadow: 0 0 0 1px var(--ink);
      }

      .letter-actions {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding-top: 4px;
        border-top: 1px dashed var(--card-border);
        margin-top: 4px;
        gap: 4px;
      }

      .btn-action {
        border: 1px solid var(--card-border);
        background: transparent;
        color: var(--ink);
        font: inherit;
        font-size: 9px;
        padding: 2px 6px;
        border-radius: 2px;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 3px;
        transition: background-color 150ms ease;
      }

      .btn-action:hover {
        background: color-mix(in srgb, var(--ink) 10%, transparent);
      }

      .btn-action:focus-visible {
        outline: 2px solid var(--ink);
        outline-offset: 1px;
      }

      /* Front pocket SVG */
      .env-pocket {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 3;
        filter: drop-shadow(0 -1px 3px var(--seal-shadow));
      }

      .flap-left { fill: var(--env-flap-side); }
      .flap-right { fill: var(--env-flap-side); }
      .flap-bottom { fill: var(--env-flap-bottom); }

      /* Envelope front ornaments */
      .env-postmark {
        position: absolute;
        top: 8px;
        left: 10px;
        font-size: 7.5px;
        letter-spacing: 0.06em;
        opacity: 0.6;
        font-weight: 600;
        pointer-events: none;
        z-index: 4;
        transition: opacity 250ms ease;
      }

      .env-stamp {
        position: absolute;
        top: 6px;
        right: 8px;
        z-index: 4;
        display: flex;
        align-items: center;
        gap: 3px;
        pointer-events: none;
        transition: opacity 250ms ease;
      }

      .stamp-wavy {
        font-size: 8px;
        letter-spacing: 1px;
        opacity: 0.4;
        font-family: monospace;
      }

      .stamp-badge {
        width: 22px;
        height: 25px;
        background: color-mix(in srgb, var(--paper) 88%, var(--ink) 12%);
        border: 1px dashed color-mix(in srgb, var(--ink) 35%, transparent);
        border-radius: 2px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
      }

      .stamp-icon {
        font-size: 9px;
        line-height: 1;
      }

      .stamp-denom {
        font-size: 6.5px;
        font-weight: 700;
        opacity: 0.75;
      }

      /* Envelope front address & writing area */
      .env-address-card {
        position: absolute;
        bottom: 8px;
        left: 10px;
        right: 10px;
        z-index: 4;
        display: flex;
        flex-direction: column;
        gap: 3px;
        transition: opacity 250ms ease;
      }

      .envelope.is-open .env-postmark,
      .envelope.is-open .env-stamp,
      .envelope.is-open .env-address-card {
        opacity: 0;
        pointer-events: none;
      }

      .address-row {
        display: flex;
        align-items: center;
        gap: 4px;
        background: color-mix(in srgb, var(--paper) 65%, transparent);
        border-bottom: 1px dashed color-mix(in srgb, var(--ink) 25%, transparent);
        padding: 1px 4px;
        border-radius: 2px;
      }

      .address-tag {
        font-size: 8px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        opacity: 0.65;
        flex-shrink: 0;
      }

      .env-to-input,
      .env-note-input {
        flex: 1;
        width: 100%;
        background: transparent;
        border: none;
        outline: none;
        font-family: "Faculty Glyphic", cursive, sans-serif;
        font-size: 10.5px;
        line-height: 1.2;
        color: var(--ink);
        padding: 0;
        min-width: 0;
      }

      .env-to-input::placeholder,
      .env-note-input::placeholder {
        color: color-mix(in srgb, var(--ink) 45%, transparent);
        font-style: italic;
      }

      .env-to-input:focus,
      .env-note-input:focus {
        background: color-mix(in srgb, var(--paper) 95%, transparent);
        box-shadow: 0 0 0 1px color-mix(in srgb, var(--ink) 30%, transparent);
        border-radius: 1px;
      }

      .env-hint {
        font-size: 7.5px;
        text-align: center;
        opacity: 0.65;
        margin-top: 1px;
        letter-spacing: 0.03em;
        pointer-events: none;
      }

      /* Top Flap */
      .top-flap-container {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 78px;
        transform-origin: top center;
        transform-style: preserve-3d;
        z-index: 5;
        transition: transform 420ms cubic-bezier(0.4, 0, 0.2, 1);
      }

      @media (prefers-reduced-motion: reduce) {
        .top-flap-container {
          transition: transform 150ms ease;
        }
      }

      .envelope.is-open .top-flap-container {
        transform: rotateX(180deg);
        z-index: 1;
      }

      .top-flap-svg {
        width: 100%;
        height: 100%;
        display: block;
        filter: drop-shadow(0 2px 4px var(--seal-shadow));
      }

      .flap-top {
        fill: var(--env-flap-top);
      }

      /* Wax Seal */
      .wax-seal {
        position: absolute;
        bottom: -15px;
        left: 50%;
        transform: translateX(-50%);
        width: 34px;
        height: 34px;
        border-radius: 50%;
        background: radial-gradient(circle at 35% 35%, #e65241, var(--seal-red) 70%, #942418);
        box-shadow: 0 3px 8px rgba(0, 0, 0, 0.35), inset 0 1px 1px rgba(255, 255, 255, 0.35);
        border: 0;
        padding: 0;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
        transition: transform 180ms cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 180ms ease;
        z-index: 6;
      }

      .wax-seal:hover {
        transform: translateX(-50%) scale(1.08);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.45), inset 0 1px 1px rgba(255, 255, 255, 0.45);
      }

      .wax-seal:focus-visible {
        outline: 2px solid var(--ink);
        outline-offset: 3px;
      }

      .seal-monogram {
        font-family: "Faculty Glyphic", sans-serif;
        font-size: 13px;
        font-weight: bold;
        letter-spacing: -0.05em;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
      }

      .envelope.is-open .wax-seal {
        pointer-events: none;
      }

      /* Floating heart bursts */
      .sparkle {
        position: absolute;
        pointer-events: none;
        font-size: 14px;
        z-index: 10;
        animation: float-up 750ms cubic-bezier(0.2, 0.8, 0.3, 1) forwards;
      }

      @keyframes float-up {
        0% {
          opacity: 1;
          transform: translate(0, 0) scale(0.6);
        }
        100% {
          opacity: 0;
          transform: translate(var(--tx), -50px) scale(1.2);
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .sparkle {
          animation: none;
          display: none;
        }
      }
    `;

    root.append(style);

    const scene = document.createElement("div");
    scene.className = "scene";

    scene.innerHTML = `
      <div class="envelope" role="region" aria-label="Interactive letter envelope">
        <div class="env-lining"></div>

        <div class="letter" aria-live="polite">
          <div class="letter-header">
            <div class="postmark-badge">
              <span aria-hidden="true">✉</span>
              <span>AIR MAIL • NYC</span>
            </div>
            <span class="note-counter" aria-label="Note 1 of ${notes.length}">1/${notes.length}</span>
          </div>

          <div class="letter-body">
            <p class="note-text">${notes[0]}</p>
            <div class="custom-editor">
              <textarea class="custom-input" placeholder="Write your note here..." maxlength="140" data-no-drag aria-label="Custom note message"></textarea>
            </div>
          </div>

          <div class="letter-actions">
            <button type="button" class="btn-action btn-next" data-no-drag aria-label="Next note">
              <span aria-hidden="true">↻</span> Next
            </button>
            <button type="button" class="btn-action btn-write" data-no-drag aria-label="Write your own note">
              <span aria-hidden="true">✎</span> Write
            </button>
            <button type="button" class="btn-action btn-close" data-no-drag aria-label="Close and seal envelope">
              Seal
            </button>
          </div>
        </div>

        <svg class="env-pocket" viewBox="0 0 250 136" preserveAspectRatio="none" aria-hidden="true">
          <polygon points="0,0 125,74 0,136" class="flap-left" />
          <polygon points="250,0 125,74 250,136" class="flap-right" />
          <polygon points="0,136 125,64 250,136" class="flap-bottom" />
        </svg>

        <div class="env-postmark" aria-hidden="true">
          <span>FROM: MINJU</span>
        </div>

        <div class="env-stamp" aria-hidden="true">
          <span class="stamp-wavy">≈≈</span>
          <div class="stamp-badge">
            <span class="stamp-icon">💌</span>
            <span class="stamp-denom">26¢</span>
          </div>
        </div>

        <div class="env-address-card" data-no-drag>
          <div class="address-row to-row">
            <label class="address-tag" for="env-to-field">To:</label>
            <input
              id="env-to-field"
              type="text"
              class="env-to-input"
              value="${savedTo.replace(/"/g, "&quot;")}"
              placeholder="Recipient name..."
              maxlength="26"
              data-no-drag
              aria-label="Recipient on envelope"
            />
          </div>
          <div class="address-row note-row">
            <label class="address-tag" for="env-note-field">Note:</label>
            <input
              id="env-note-field"
              type="text"
              class="env-note-input"
              value="${savedEnvNote.replace(/"/g, "&quot;")}"
              placeholder="Write on envelope..."
              maxlength="30"
              data-no-drag
              aria-label="Note on envelope"
            />
          </div>
          <div class="env-hint" aria-hidden="true">✦ Click seal to open ✦</div>
        </div>

        <div class="top-flap-container">
          <svg class="top-flap-svg" viewBox="0 0 250 78" preserveAspectRatio="none" aria-hidden="true">
            <polygon points="0,0 125,78 250,0" class="flap-top" />
          </svg>
          <button type="button" class="wax-seal" data-no-drag aria-label="Open envelope">
            <span class="seal-monogram">MJ</span>
          </button>
        </div>
      </div>
    `;

    root.append(scene);

    const envelope = scene.querySelector(".envelope");
    const waxSeal = scene.querySelector(".wax-seal");
    const noteText = scene.querySelector(".note-text");
    const noteCounter = scene.querySelector(".note-counter");
    const btnNext = scene.querySelector(".btn-next");
    const btnWrite = scene.querySelector(".btn-write");
    const btnClose = scene.querySelector(".btn-close");
    const customEditor = scene.querySelector(".custom-editor");
    const customInput = scene.querySelector(".custom-input");
    const envToInput = scene.querySelector(".env-to-input");
    const envNoteInput = scene.querySelector(".env-note-input");

    let currentNoteIndex = 0;
    let isEditing = false;

    // Persist envelope front writing
    const setupEnvelopeInput = (input, storageKey) => {
      input.addEventListener("pointerdown", (e) => e.stopPropagation());
      input.addEventListener("click", (e) => e.stopPropagation());
      input.addEventListener("keydown", (e) => {
        e.stopPropagation();
        if (e.key === "Enter") {
          input.blur();
        }
      });
      input.addEventListener("input", () => {
        storage.set(storageKey, input.value);
      });
    };

    setupEnvelopeInput(envToInput, "to");
    setupEnvelopeInput(envNoteInput, "env_note");

    const createBurst = () => {
      const symbols = ["✨", "💛", "✦", "💌", "✧"];
      for (let i = 0; i < 5; i++) {
        const sparkle = document.createElement("span");
        sparkle.className = "sparkle";
        sparkle.textContent = symbols[i % symbols.length];
        const tx = `${(Math.random() - 0.5) * 80}px`;
        sparkle.style.setProperty("--tx", tx);
        sparkle.style.left = `calc(50% + ${(Math.random() - 0.5) * 40}px)`;
        sparkle.style.bottom = "60px";
        scene.append(sparkle);
        sparkle.addEventListener("animationend", () => sparkle.remove());
      }
    };

    const openEnvelope = () => {
      if (envelope.classList.contains("is-open")) return;
      envelope.classList.add("is-open");
      createBurst();
    };

    const updateNoteDisplay = () => {
      noteText.textContent = notes[currentNoteIndex];
      noteCounter.textContent = `${currentNoteIndex + 1}/${notes.length}`;
      noteCounter.setAttribute("aria-label", `Note ${currentNoteIndex + 1} of ${notes.length}`);
    };

    const finishEditing = () => {
      if (!isEditing) return;
      isEditing = false;
      customEditor.classList.remove("is-active");
      noteText.style.display = "-webkit-box";

      const val = customInput.value.trim();
      if (val) {
        storage.set("custom_note", val);
        const existingIdx = notes.indexOf(val);
        if (existingIdx !== -1) {
          currentNoteIndex = existingIdx;
        } else {
          notes.push(val);
          currentNoteIndex = notes.length - 1;
        }
        createBurst();
      }
      btnWrite.innerHTML = '<span aria-hidden="true">✎</span> Write';
      updateNoteDisplay();
    };

    const closeEnvelope = () => {
      if (!envelope.classList.contains("is-open")) return;
      if (isEditing) {
        finishEditing();
      }
      envelope.classList.remove("is-open");
    };

    waxSeal.addEventListener("click", (e) => {
      e.stopPropagation();
      openEnvelope();
    });

    btnClose.addEventListener("click", (e) => {
      e.stopPropagation();
      closeEnvelope();
    });

    btnNext.addEventListener("click", (e) => {
      e.stopPropagation();
      if (isEditing) {
        finishEditing();
      }
      currentNoteIndex = (currentNoteIndex + 1) % notes.length;
      updateNoteDisplay();
    });

    btnWrite.addEventListener("click", (e) => {
      e.stopPropagation();
      if (isEditing) {
        finishEditing();
      } else {
        isEditing = true;
        noteText.style.display = "none";
        customEditor.classList.add("is-active");
        customInput.value = notes[currentNoteIndex] || "";
        btnWrite.innerHTML = '<span aria-hidden="true">✓</span> Done';
        noteCounter.textContent = "write";
        customInput.focus();
        customInput.select();
      }
    });

    customInput.addEventListener("keydown", (e) => {
      e.stopPropagation();
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        finishEditing();
      }
    });

    // Clicking the envelope body when closed opens it
    envelope.addEventListener("click", (e) => {
      if (!envelope.classList.contains("is-open")) {
        openEnvelope();
      }
    });
  },
};
